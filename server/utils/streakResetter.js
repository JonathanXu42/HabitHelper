import prisma from '../prisma/client.js';
import cron from 'node-cron';
import { DateTime } from 'luxon';
import { emailStreakBroken } from './send_email.js';

//Run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Running hourly streak reset check...`);

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        timezone: true
      }
    });

    // console.log("Users found: ", users)

    for (const user of users) {
      const nowLocal = DateTime.utc().setZone(user.timezone);

      // console.log("localTime in ", user.timezone, " : ", nowLocal)

      // Only run this for users whose current local time is between 00:00 and 00:59
      if (nowLocal.hour !== 0) continue;

      const startOfYesterdayUTC = nowLocal.minus({ days: 1 }).startOf('day').toUTC().toJSDate();
      const endOfYesterdayUTC = nowLocal.minus({ days: 1 }).endOf('day').toUTC().toJSDate();

      // console.log("startOfYesterdayUTC: ", startOfYesterdayUTC)
      // console.log("endOfYesterdayUTC: ", endOfYesterdayUTC)

      const habits = await prisma.habit.findMany({
        where: { userId: user.id }
      });

      for (const habit of habits) {
        // What day of the week was "yesterday" in the user's local time?
        const localYesterday = nowLocal.minus({ days: 1 });
        const weekdayIndex = localYesterday.weekday % 7; // Luxon: Monday = 1, Sunday = 7

        // Only reset streak if yesterday was a scheduled habit day and the habit's current streak is greater than 0
        if (!habit.daysOfWeek.includes(weekdayIndex) || habit.currentStreak === 0) continue;

        const logs = await prisma.habitLog.findMany({
          where: {
            habitId: habit.id,
            completed: true,
            date: {
              gte: startOfYesterdayUTC,
              lte: endOfYesterdayUTC
            }
          }
        });

        if (logs.length === 0) {
          // console.log("found ", logs.length, " logs for ", habit.name)
          await prisma.habit.update({
            where: { id: habit.id },
            data: { currentStreak: 0 }
          });

          try {
            await emailStreakBroken(user.email, habit.name, habit.currentStreak);
          } catch (err) {
            console.error(`Failed to send streak broken email for ${user.email}`, err);
          }
        }
      }
    }

    // console.log(`[${new Date().toISOString()}] Streak check completed.`);
  } catch (err) {
    console.error('Streak reset job failed:', err);
  }
});