import express from 'express';
import prisma from '../prisma/client.js';;

const router = express.Router();

router.post('/', async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' }); // minimal check
  }

  const { name, notes, daysOfWeek } = req.body;

  try {
    const newHabit = await prisma.habit.create({
      data: {
        userId,
        name,
        notes,
        daysOfWeek,
        currentStreak: 0,
        longestStreak: 0,
        emailReminderSettings: { enabled: false, timesOfDay: [] }
      }
    });

    res.json(newHabit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

export default router;