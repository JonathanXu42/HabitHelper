import prisma from '../prisma/client.js';
import cron from 'node-cron';
import { DateTime } from 'luxon';

//Run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Running hourly streak reset check...`);

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        timezone: true
      }
    });

    console.log("Users found: ", users)

    for (const user of users) {
      const nowLocal = DateTime.utc().setZone(user.timezone);

      console.log("localTime in ", user.timezone, " : ", nowLocal)

      // Only run this for users whose current local time is between 00:00 and 00:59
      if (nowLocal.hour !== 0) continue;

      const startOfYesterdayUTC = nowLocal.minus({ days: 1 }).startOf('day').toUTC().toJSDate();
      const endOfYesterdayUTC = nowLocal.minus({ days: 1 }).endOf('day').toUTC().toJSDate();

      console.log("startOfYesterdayUTC: ", startOfYesterdayUTC)
      console.log("endOfYesterdayUTC: ", endOfYesterdayUTC)

      const habits = await prisma.habit.findMany({
        where: { userId: user.id }
      });

      for (const habit of habits) {
        const Logs = await prisma.habitLog.findMany({
          where: {
            habitId: habit.id,
            completed: true,
            date: {
              gte: startOfYesterdayUTC,
              lte: endOfYesterdayUTC
            }
          }
        });

        if (logs.length === 0 && habit.currentStreak !== 0) {
          await prisma.habit.update({
            where: { id: habit.id },
            data: { currentStreak: 0 }
          });

          console.log(`Reset streak for habit "${habit.name}" of user ${user.id}`);
        }
      }
    }

    console.log(`[${new Date().toISOString()}] Streak check completed.`);
  } catch (err) {
    console.error('Streak reset job failed:', err);
  }
});