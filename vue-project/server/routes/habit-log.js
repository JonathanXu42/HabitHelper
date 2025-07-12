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

export default router; 