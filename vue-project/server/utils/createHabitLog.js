// server/createHabitLog.js
import { PrismaClient } from '@prisma/client';
import './configureDotenv.js';

const prisma = new PrismaClient()

async function main() {
  // Replace with actual habit and user ObjectIds
  const habitId = '686919e929f80201a13c7e64'
  const userId = '6869184e763c62688255244f'

  const habitLog = await prisma.habitLog.create({
    data: {
      habitId: habitId,
      userId: userId,
      date: new Date(), // Today
      completed: true,
      progress: 30,
      notes: 'Finished while commuting to work.'
    }
  })

  console.log('✅ HabitLog created:', habitLog)
}

main()
  .catch((e) => {
    console.error('❌ Error creating habit log:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })