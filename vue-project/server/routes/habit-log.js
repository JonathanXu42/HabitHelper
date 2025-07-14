import express from 'express';
import prisma from '../prisma/client.js';;
import { ensureAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/:habitId/logs', ensureAuthenticated, async (req, res) => {
  const { habitId } = req.params;

  try {
    const habitLogs = await prisma.habitLog.findMany({
      where: { habitId },
      orderBy: { date: 'desc' }
    });

    res.json(habitLogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch habit logs' });
  }
});

router.post('/:habitId/logs', ensureAuthenticated, async (req, res) => {
    const { habitId } = req.params;
    const { completed, progress, notes } = req.body;

    try {
        const habit = await prisma.habit.findUnique({
            where: { id: habitId }
        })

        if (!habit) {
          return res.status(404).json({ error: 'Habit not found' });
        }
        
        const userId = habit.userId;
        const now = new Date(); // local time
        const utcYear = now.getUTCFullYear();
        const utcMonth = now.getUTCMonth();
        const utcDate = now.getUTCDate();

        const startOfDayUTC = new Date(Date.UTC(utcYear, utcMonth, utcDate));
        const endOfDayUTC = new Date(Date.UTC(utcYear, utcMonth, utcDate + 1));


        const existingLogToday = await prisma.habitLog.findFirst({
          where: {
            habitId,
            completed: true,
            date: {
              gte: startOfDayUTC,
              lt: endOfDayUTC
            }
          }
        });

        const newHabitLog = await prisma.habitLog.create({
            data: {
                date: new Date(),
                habitId,
                userId,
                completed,
                progress,
                notes
            }
        });

        if (!existingLogToday && completed) {
          const updated = { currentStreak: habit.currentStreak + 1 };
          if (updated.currentStreak > habit.longestStreak) {
            updated.longestStreak = updated.currentStreak;
          }

          await prisma.habit.update({
            where: { id: habitId },
            data: updated
          });
        }        

        res.status(201).json(newHabitLog); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create habit log' });
    }
});

router.patch('/:habitId/logs/:logId', ensureAuthenticated, async (req, res) => {
  const { habitId, logId } = req.params;
  const { completed, progress, notes } = req.body;

  try {
    // 1. Confirm the habit exists and belongs to this user
    const habit = await prisma.habit.findUnique({
      where: {id: habitId }
    });

    if (!habit || habit.userId !== req.user.id) {
      return res.status(404).json({ error: 'Habit not found or not authorized' });
    }

    // 2. Confirm the log exists and belongs to the habit
    const habitLog = await prisma.habitLog.findUnique({
      where: { id: logId }
    });

    if (!habitLog || habitLog.habitId !== habitId) {
      return res.status(404).json({ error: 'Habit log not found or does not belong to this habit' });
    }

    // 3. Update the log
    const updatedHabitLog = await prisma.habitLog.update({
      where: { id: logId },
      data: {
        completed,
        progress,
        notes
      }
    });

    res.json(updatedHabitLog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update habit log' });
  }
});

router.delete('/:habitId/logs/:logId', ensureAuthenticated, async (req, res) => {
  const { habitId, logId } = req.params;

  try {
    // 1. Confirm the habit exists and belongs to this user
    const habit = await prisma.habit.findUnique({
      where: {id: habitId }
    });

    if (!habit || habit.userId !== req.user.id) {
      return res.status(404).json({ error: 'Habit not found or not authorized' });
    }

    // 2. Confirm the log exists and belongs to the habit
    const habitLog = await prisma.habitLog.findUnique({
      where: { id: logId }
    });

    if (!habitLog || habitLog.habitId !== habitId) {
      return res.status(404).json({ error: 'Habit log not found or does not belong to this habit' });
    }

    // 3. Delete habit log
    await prisma.habitLog.delete({ where: { id: logId } });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete habit log' });
  }  
})

export default router; 