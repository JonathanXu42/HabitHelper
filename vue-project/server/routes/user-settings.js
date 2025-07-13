import express from 'express';
import prisma from '../prisma/client.js';
import { ensureAuthenticated } from '../middleware/auth.js';
import { rescheduleRemindersForTimezoneChange } from '../utils/reminderScheduler.js';

const router = express.Router();

router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id; // assumes passport session middleware is in place

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { firstName, lastName, timezone } = req.body;

    if (!timezone) {
      return res.status(400).json({ message: 'Timezone is required' });
    }

    const oldUser = await prisma.user.findUnique({ where: { id: userId } });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        timezone,
      },
    });

    if (timezone !== oldUser.timezone) {
      await rescheduleRemindersForTimezoneChange(userId, timezone);
    }

    res.status(200).json({ message: 'User settings updated', user: updatedUser });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/delete-account', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { email: emailConfirmation } = req.body;

    // Get actual user email from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email !== emailConfirmation) {
      return res.status(400).json({ message: 'Email confirmation does not match' });
    }

    // Delete HabitLogs and ScheduledReminders -> Habits -> User (in that order to satisfy FK constraints)
    await prisma.habitLog.deleteMany({
      where: { userId }
    });

    await prisma.scheduledReminder.deleteMany({
      where: { userId }
    });

    await prisma.habit.deleteMany({
      where: { userId }
    });

    await prisma.user.delete({
      where: { id: userId }
    });

    // Log out the user (clear session)
    req.logout(err => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Account deleted, but logout failed' });
      }
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Account deleted successfully' });
      });
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;