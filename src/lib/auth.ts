import { NextRequest } from 'next/server'
import { verifyToken } from './jwt'
import { prisma } from './prisma'

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.substring(7)
  try {
    const payload = verifyToken(token) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })
    return user
  } catch {
    return null
  }
}