import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET() {
  const posts = await prisma.post.findMany({
    include: {
      author: { select: { id: true, username: true } },
      subreddit: { select: { id: true, name: true } },
      _count: { select: { comments: true, votes: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content, subredditId } = await request.json()
  if (!title || !subredditId) {
    return NextResponse.json({ error: 'Title and subreddit are required' }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: user.id,
      subredditId
    },
    include: {
      author: { select: { id: true, username: true } },
      subreddit: { select: { id: true, name: true } }
    }
  })

  return NextResponse.json(post)
}