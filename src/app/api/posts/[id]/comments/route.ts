import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content, parentId } = await request.json()
  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      authorId: user.id,
      postId: id,
      parentId
    },
    include: {
      author: { select: { id: true, username: true } }
    }
  })

  return NextResponse.json(comment)
}