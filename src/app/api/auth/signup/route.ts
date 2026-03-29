import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  const { username, email, password } = await request.json()

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] }
  })

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword }
  })

  const token = signToken({ userId: user.id })

  return NextResponse.json({ token, user: { id: user.id, username: user.username, email: user.email } })
}