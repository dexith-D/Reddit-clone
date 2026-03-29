import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true } },
      subreddit: { select: { id: true, name: true } },
      comments: {
        where: { parentId: null }, // top-level comments
        include: {
          author: { select: { id: true, username: true } },
          replies: {
            include: {
              author: { select: { id: true, username: true } }
            }
          },
          _count: { select: { votes: true } }
        }
      },
      _count: { select: { votes: true } }
    }
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json(post)
}