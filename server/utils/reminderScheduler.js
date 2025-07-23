import cron from 'node-cron';
import prisma from '../prisma/client.js';
import { emailReminder } from './send_email.js';
import { DateTime } from 'luxon';

export async function scheduleRemindersForHabit(habit, user) {
  const settings = habit.emailReminderSettings; // assumed to be { "5": "08:30", ... }
  const timezone = user.timezone;

  if (!settings.enabled || !settings.timesByDay) {
    return;
  }

  const timesByDay = settings.timesByDay;

  for (const [dayString, times] of Object.entries(timesByDay)) {
    const day = parseInt(dayString); // "5" => 5

    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);
      const now = DateTime.now().setZone(timezone);

      let next = now.set({ hour, minute, second: 0, millisecond: 0 });

      // Advance to the next occurrence of this weekday and time
      while (next.weekday % 7 !== (day % 7) || next <= now) {
        next = next.plus({ days: 1 });
      }

      await prisma.scheduledReminder.upsert({
        where: {
          habitId_userId_sendAt: {
            habitId: habit.id,
            userId: user.id,
            sendAt: next.toUTC().toJSDate()
          }
        },
        update: {}, // Leave existing record as is (you could update here if needed)
        create: {
          habitId: habit.id,
          userId: user.id,
          sendAt: next.toUTC().toJSDate()
        }
      });
    }
  }
}

export async function clearRemindersForHabit(habitId) {
  // console.log("deleting email reminders for habit: ", habitId)
  await prisma.scheduledReminder.deleteMany({ where: { habitId } });
}

export async function rescheduleRemindersForTimezoneChange(userId, oldTimezone, newTimezone) {
  console.log("oldtimezone: ", oldTimezone)
  console.log("newtimezone: ", newTimezone)

  const reminders = await prisma.scheduledReminder.findMany({
    where: { userId }
  });

  for (const reminder of reminders) {
    console.log("reminder: ", reminder)
    // Step 1: Interpret sendAt as time in old timezone
    const oldLocal = DateTime.fromJSDate(reminder.sendAt, { zone: 'utc' }).setZone(oldTimezone);

    // Step 2: Extract local date and time components
    const { year, month, day, hour, minute, second, millisecond } = oldLocal;

    // Step 3: Reconstruct same local wall time in the new timezone
    const newLocal = DateTime.fromObject(
      { year, month, day, hour, minute, second, millisecond },
      { zone: newTimezone }
    );

    // Step 4: Convert back to UTC
    const newSendAt = newLocal.toUTC().toJSDate();

    console.log("oldLocal: ", oldLocal)
    console.log("oldSendAt: ", reminder.sendAt)
    console.log("newLocal: ", newLocal)
    console.log("newSendAt: ", newSendAt)

    // Optional: Avoid unnecessary DB writes
    if (+newSendAt !== +reminder.sendAt) {
      await prisma.scheduledReminder.update({
        where: { id: reminder.id },
        data: { sendAt: newSendAt }
      });
    }
  }
}

cron.schedule('* * * * *', async () => {
  const now = DateTime.utc().toJSDate();
  const dueReminders = await prisma.scheduledReminder.findMany({
    where: {
      sendAt: {
        lte: now
      }
    },
    include: {
      habit: true,
      user: true
    }
  });

  for (const reminder of dueReminders) {
    try {
      await emailReminder(reminder.user.email, reminder.habit.name, reminder.habit.currentStreak);
      await prisma.scheduledReminder.delete({ where: { id: reminder.id } });

      await scheduleRemindersForHabit(reminder.habit, reminder.user);
    } catch (err) {
      console.error(`Failed to send or reschedule reminder for ${user.email}`, err);
    }
  } 
});