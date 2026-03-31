import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type CommentWithVotes = {
  id: string
  content: string
  createdAt: Date
  parentId: string | null
  postId: string
  authorId: string
  author: { id: string; username: string }
  replies: CommentWithVotes[]
  votes: { type: number }[]
  _count: { votes: number }
}

type SerializedComment = Omit<CommentWithVotes, 'votes' | 'replies'> & {
  voteScore: number
  replies: SerializedComment[]
}

function serializeComment(comment: CommentWithVotes): SerializedComment {
  const { votes, replies, ...rest } = comment

  return {
    ...rest,
    voteScore: votes.reduce((total, vote) => total + vote.type, 0),
    replies: replies.map(serializeComment)
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true } },
      subreddit: { select: { id: true, name: true, description: true } },
      votes: { select: { type: true } },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, username: true } },
          votes: { select: { type: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: { select: { id: true, username: true } },
              votes: { select: { type: true } },
              replies: {
                orderBy: { createdAt: 'asc' },
                include: {
                  author: { select: { id: true, username: true } },
                  votes: { select: { type: true } },
                  _count: { select: { votes: true } }
                }
              },
              _count: { select: { votes: true } }
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

  const { votes, comments, ...rest } = post

  return NextResponse.json({
    ...rest,
    voteScore: votes.reduce((total, vote) => total + vote.type, 0),
    comments: comments.map((comment) => serializeComment(comment as CommentWithVotes))
  })
}