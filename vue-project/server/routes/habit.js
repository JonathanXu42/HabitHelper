import express from 'express';
import prisma from '../prisma/client.js';;

const router = express.Router();

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' }); // minimal check
  }

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

    res.json(newHabit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, notes, daysOfWeek, emailReminderSettings } = req.body;

  try {
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

    res.json(updatedHabit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete logs first (if applicable)
    await prisma.habitLog.deleteMany({ where: { habitId: id } });

    // Delete habit
    await prisma.habit.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

export default router;