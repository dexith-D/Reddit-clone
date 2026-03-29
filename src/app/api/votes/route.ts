import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId, commentId, type } = await request.json()
  if (!type || (type !== 1 && type !== -1) || (!postId && !commentId)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const where = postId ? { userId: user.id, postId } : { userId: user.id, commentId }

  const existingVote = await prisma.vote.findFirst({
    where
  })

  if (existingVote) {
    if (existingVote.type === type) {
      await prisma.vote.delete({ where: { id: existingVote.id } })
      return NextResponse.json({ message: 'Vote removed' })
    } else {
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type }
      })
      return NextResponse.json({ message: 'Vote updated' })
    }
  } else {
    await prisma.vote.create({
      data: { userId: user.id, postId, commentId, type }
    })
    return NextResponse.json({ message: 'Vote added' })
  }
}