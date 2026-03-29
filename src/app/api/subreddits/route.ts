import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const subreddits = await prisma.subreddit.findMany({
    include: {
      _count: { select: { posts: true } }
    }
  })
  return NextResponse.json(subreddits)
}

export async function POST(request: NextRequest) {
  const { name, description } = await request.json()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const existing = await prisma.subreddit.findUnique({ where: { name } })
  if (existing) {
    return NextResponse.json({ error: 'Subreddit already exists' }, { status: 400 })
  }

  const subreddit = await prisma.subreddit.create({
    data: { name, description }
  })

  return NextResponse.json(subreddit)
}