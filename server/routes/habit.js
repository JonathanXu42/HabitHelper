import express from 'express';
import prisma from '../prisma/client.js';;
import { ensureAuthenticated } from '../middleware/auth.js';
import { scheduleRemindersForHabit, clearRemindersForHabit } from '../utils/reminderScheduler.js';

const router = express.Router();

router.get('/', ensureAuthenticated, async (req, res) => {
  const userId = req.user.id;

  try {
    const habits = await prisma.habit.findMany({
      where: { userId }
    });

    res.json(habits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});


router.get('/:habitId', ensureAuthenticated, async (req, res) => {
  const { habitId } = req.params;

  try {
    const habit = await prisma.habit.findUnique({
      where: { id: habitId }
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json(habit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
});

router.post('/', ensureAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const { name, notes, daysOfWeek, emailReminderSettings } = req.body;

  try {
    const newHabit = await prisma.habit.create({
      data: {
        userId,
        name,
        notes,
        daysOfWeek,
        currentStreak: 0,
        longestStreak: 0,
        emailReminderSettings
      }
    });

    if (emailReminderSettings && Object.keys(emailReminderSettings).length > 0) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      await scheduleRemindersForHabit(newHabit, user);
    }

    res.json(newHabit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

router.patch('/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, notes, daysOfWeek, emailReminderSettings } = req.body;

  try {
    const habit = await prisma.habit.findUnique({ where: { id } });

    if (!habit || habit.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        name,
        notes,
        daysOfWeek,
        emailReminderSettings,
        updatedAt: new Date()
      }
    });

    // Clear old reminders
    await clearRemindersForHabit(id);

    if (emailReminderSettings && Object.keys(emailReminderSettings).length > 0) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      await scheduleRemindersForHabit(updatedHabit, user);
    }    

    res.json(updatedHabit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const habit = await prisma.habit.findUnique({ where: { id } });

    if (!habit || habit.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Delete logs first (if applicable)
    await prisma.habitLog.deleteMany({ where: { habitId: id } });

    // Delete scheduled reminders
    await clearRemindersForHabit(id);

    // Delete habit
    await prisma.habit.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

export default router;