import cron from 'node-cron';
import prisma from '../prisma/client.js';
import { emailReminder } from './send_email.js';
import { DateTime } from 'luxon';

cron.schedule('* * * * *', async () => {
  console.log('Checking for due reminders...');

  const users = await prisma.user.findMany({
    include: { habits: true }
  });

  console.log("Users found: ", users)

  const nowUtc = DateTime.utc();

  for (const user of users) {
    console.log("Habits belongiing to: ", user.email)
    console.log(user.habits)

    if (user.habits.length === 0) continue;

    const nowInUserTz = nowUtc.setZone(user.timezone);
    const weekday = nowInUserTz.weekday % 7; // Luxon: 1=Mon, ..., 7=Sun. Adjust to 0=Sun..6=Sat
    const timeStr = nowInUserTz.toFormat('HH:mm');

    console.log("weekday is ", weekday);
    console.log("weekday.toString is ", weekday.toString());
    console.log("timeStr is ", timeStr);

    for (const habit of user.habits) {
    const reminderSettings = habit.emailReminderSettings;
        console.log("reminder settings for: ", habit.name);
        console.log(reminderSettings);

        if (!reminderSettings?.enabled) continue;

        const timesToday = reminderSettings.timesByDay?.[weekday.toString()] || [];
        console.log("Reminder times for today:", timesToday);
        if (timesToday.includes(timeStr)) {
            console.log("sending user an email reminder");
            await emailReminder(user.email, habit.name, habit.currentStreak);
        }
    }
  }
});