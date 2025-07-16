import cron from 'node-cron';
import prisma from '../prisma/client.js';
import { emailReminder } from './send_email.js';
import { DateTime } from 'luxon';

export async function scheduleRemindersForHabit(habit, user) {
  const settings = habit.emailReminderSettings; // assumed to be { "5": "08:30", ... }
  const timezone = user.timezone;

  console.log("settings is ", settings)

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

      console.log("scheduling email reminder at:", next.toUTC().toISO(), "for habit:", habit.name, "belonging to user:", user.email);

      await prisma.scheduledReminder.create({
        data: {
          habitId: habit.id,
          userId: user.id,
          sendAt: next.toUTC().toJSDate()
        }
      });
    }
  }
}

export async function clearRemindersForHabit(habitId) {
  console.log("deleting email reminders for habit: ", habitId)
  await prisma.scheduledReminder.deleteMany({ where: { habitId } });
}

export async function rescheduleRemindersForTimezoneChange(userId, newTimezone) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      habits: true
    }
  });

  for (const habit of user.habits) {
    console.log("rescheduling reminders for: ", habit.name)
    const settings = habit.emailReminderSettings;
    if (!settings?.enabled || !settings.timesByDay) continue;

    const timesByDay = settings.timesByDay;

    for (const [dayString, times] of Object.entries(timesByDay)) {
      const day = parseInt(dayString);

      for (const time of times) {
        const [hour, minute] = time.split(':').map(Number);
        const now = DateTime.now().setZone(newTimezone);

        let next = now.set({ hour, minute, second: 0, millisecond: 0 });
        while (next.weekday % 7 !== day % 7 || next <= now) {
          next = next.plus({ days: 1 });
        }

        // Find and update the existing reminder that matches this habitId/userId/day/time
        // Since we don't track the original day/time per reminder, we have to update all
        // future reminders for this habit/user to new time. This is a limitation unless you store extra metadata.
        await prisma.scheduledReminder.updateMany({
          where: {
            habitId: habit.id,
            userId: userId
          },
          data: {
            sendAt: next.toUTC().toJSDate()
          }
        });
      }
    }
  }
}

// cron.schedule('* * * * *', async () => {
//   const now = DateTime.utc().toJSDate();
//   const dueReminders = await prisma.scheduledReminder.findMany({
//     where: {
//       sendAt: {
//         lte: now
//       }
//     },
//     include: {
//       habit: true,
//       user: true
//     }
//   });

//   console.log("checking for scheduled reminders at local time: ", now)
//   console.log("due reminders: ", dueReminders)

//   for (const reminder of dueReminders) {
//     try {
//       await emailReminder(reminder.user.email, reminder.habit.name, reminder.habit.currentStreak);
//       await prisma.scheduledReminder.delete({ where: { id: reminder.id } });

//       await scheduleRemindersForHabit(reminder.habit, reminder.user);
//     } catch (err) {
//       console.error(`Failed to send or reschedule reminder for ${user.email}`, err);
//     }
//   } 
// });