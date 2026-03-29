import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const subreddits = [
    { name: 'general', description: 'General discussion' },
    { name: 'tech', description: 'Technology' },
    { name: 'news', description: 'News' }
  ]

  for (const data of subreddits) {
    try {
      await prisma.subreddit.create({ data })
    } catch (e) {
      // skip if exists
    }
  }
  console.log('Seeded subreddits')
}

main().catch(console.error).finally(() => prisma.$disconnect())