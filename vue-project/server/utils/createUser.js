// server/createUser.js
import { PrismaClient } from '@prisma/client';
import './configureDotenv.js';

const prisma = new PrismaClient()

console.log("Connecting to:", process.env.DATABASE_URL)

async function main() {
  const newUser = await prisma.user.create({
    data: {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      timezone: 'America/New_York'
    }
  })

  console.log('✅ User created:', newUser)
}

main()
  .catch((e) => {
    console.error('❌ Error creating user:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })