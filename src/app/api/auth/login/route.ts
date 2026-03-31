import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  const { username, email, identifier, password } = await request.json()
  const loginValue = (identifier || username || email || '').trim()

  if (!password || !loginValue) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: loginValue }, { email: loginValue }]
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = signToken({ userId: user.id })

  return NextResponse.json({ token, user: { id: user.id, username: user.username, email: user.email } })
}