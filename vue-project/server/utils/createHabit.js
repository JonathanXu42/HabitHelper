// server/createHabit.js
import { PrismaClient } from '@prisma/client';
import './configureDotenv.js';

const prisma = new PrismaClient()

async function main() {
  // Replace with an actual user ID from your database
  const userId = '6869184e763c62688255244f'

  const habit = await prisma.habit.create({
    data: {
      userId: userId,
      name: 'Read for 30 minutes',
      notes: 'Morning reading to start the day right',
      currentStreak: 0,
      longestStreak: 0,
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
      goal: {
        type: 'numeric',
        target: 30,
        unit: 'minutes'
      },
      emailReminderSettings: {
        enabled: true,
        timesOfDay: ['08:00']
      }
    }
  })

  console.log('✅ Habit created:', habit)
}

main()
  .catch((e) => {
    console.error('❌ Error creating habit:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
