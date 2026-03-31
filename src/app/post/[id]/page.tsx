'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import RedditLogo from '@/components/RedditLogo'

interface User {
  id: string
  username: string
  email: string
}

interface PostComment {
  id: string
  content: string
  createdAt: string
  author: { username: string }
  replies: PostComment[]
  _count: { votes: number }
  voteScore?: number
}

interface Post {
  id: string
  title: string
  content?: string | null
  createdAt: string
  author: { username: string }
  subreddit: { name: string; description?: string | null }
  comments: PostComment[]
  _count: { votes: number }
  voteScore?: number
}

function formatRelativeTime(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return new Date(date).toLocaleDateString()
}

export default function PostPage() {
  const params = useParams<{ id: string }>()
  const postId = params.id
  const [post, setPost] = useState<Post | null>(null)
  const [token, setToken] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Unable to load this post.')
        setPost(null)
        return
      }

      setPost(data)
      setError('')
    } catch {
      setError('Unable to load this post right now.')
      setPost(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      setToken(storedToken)
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    void fetchPost()
  }, [postId])

  const handleVote = async (type: 1 | -1, targetPostId?: string, commentId?: string) => {
    if (!token) {
      alert('Log in from the home page to vote on posts and comments.')
      return
    }

    await fetch('/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ postId: targetPostId, commentId, type })
    })

    void fetchPost()
  }

  const handleComment = async (content: string, parentId?: string) => {
    if (!token) {
      alert('Log in from the home page to join the discussion.')
      return
    }

    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content, parentId })
    })

    void fetchPost()
  }

  if (loading) {
    return <div className="min-h-screen bg-[#dae0e6] px-4 py-10 text-center text-slate-600">Loading thread...</div>
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#dae0e6] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Thread unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">{error || 'This post could not be found.'}</p>
          <Link href="/" className="mt-4 inline-flex rounded-full bg-[#0079d3] px-4 py-2 text-sm font-semibold text-white">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const score = post.voteScore ?? post._count.votes

  return (
    <div className="min-h-screen bg-[#dae0e6] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <RedditLogo subtitle="thread view" />
          </Link>
          <div className="ml-auto text-sm text-slate-500">{user ? `Signed in as u/${user.username}` : 'Browsing anonymously'}</div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            ← Back to Home
          </Link>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex">
              <div className="flex w-14 flex-col items-center gap-2 bg-slate-50 py-4 text-slate-500">
                <button onClick={() => void handleVote(1, post.id)} className="text-sm hover:text-[#ff4500]">
                  ▲
                </button>
                <span className="text-sm font-bold text-slate-800">{score}</span>
                <button onClick={() => void handleVote(-1, post.id)} className="text-sm hover:text-[#7193ff]">
                  ▼
                </button>
              </div>

              <div className="flex-1 p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">r/{post.subreddit.name}</span>
                  <span>Posted by u/{post.author.username}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                </div>

                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">{post.title}</h1>
                {post.content && <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.content}</p>}

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">💬 {post.comments.length} comments</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">🔗 Share</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">💾 Save</span>
                </div>
              </div>
            </div>
          </article>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Comments</h2>
                <p className="text-sm text-slate-500">Join the discussion below.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {post.comments.length} total
              </span>
            </div>

            {token ? (
              <CommentForm onSubmit={(content) => void handleComment(content)} />
            ) : (
              <div className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Log in from the home page to reply, upvote, and keep the thread going.
              </div>
            )}

            {post.comments.length > 0 ? (
              <div className="space-y-3">
                {post.comments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    onVote={handleVote}
                    onReply={handleComment}
                    canReply={Boolean(token)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                No comments yet. Be the first to reply.
              </div>
            )}
          </section>
        </section>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-16 bg-linear-to-r from-sky-500 via-blue-500 to-indigo-500" />
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">About community</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">r/{post.subreddit.name}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {post.subreddit.description || 'A place for this community to share posts, comments, and discussion.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Thread rules</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Keep the conversation civil.</li>
              <li>• Stay on topic and add value.</li>
              <li>• Vote based on contribution quality.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  )
}

function CommentForm({
  onSubmit,
  placeholder = 'What are your thoughts?',
  submitLabel = 'Comment'
}: {
  onSubmit: (content: string) => void
  placeholder?: string
  submitLabel?: string
}) {
  const [content, setContent] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = content.trim()

    if (!trimmed) {
      return
    }

    onSubmit(trimmed)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0079d3]"
      />
      <div className="flex justify-end">
        <button type="submit" className="rounded-full bg-[#0079d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0060a8]">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function CommentThread({
  comment,
  onVote,
  onReply,
  canReply,
  depth = 0
}: {
  comment: PostComment
  onVote: (type: 1 | -1, targetPostId?: string, commentId?: string) => Promise<void>
  onReply: (content: string, parentId?: string) => Promise<void>
  canReply: boolean
  depth?: number
}) {
  const [showReply, setShowReply] = useState(false)
  const score = comment.voteScore ?? comment._count.votes

  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50/70 p-4 ${depth > 0 ? 'ml-4 border-l-4 border-l-orange-100' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-800">u/{comment.author.username}</span>
        <span>•</span>
        <span>{formatRelativeTime(comment.createdAt)}</span>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.content}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
        <button onClick={() => void onVote(1, undefined, comment.id)} className="rounded-full bg-white px-3 py-1 hover:text-[#ff4500]">
          ▲ Upvote
        </button>
        <span className="rounded-full bg-white px-3 py-1 text-slate-700">{score} points</span>
        <button onClick={() => void onVote(-1, undefined, comment.id)} className="rounded-full bg-white px-3 py-1 hover:text-[#7193ff]">
          ▼ Downvote
        </button>
        {canReply && (
          <button onClick={() => setShowReply((current) => !current)} className="rounded-full bg-white px-3 py-1 hover:text-[#0079d3]">
            Reply
          </button>
        )}
      </div>

      {showReply && (
        <div className="mt-3">
          <CommentForm onSubmit={(content) => void onReply(content, comment.id)} placeholder="Write a reply" submitLabel="Reply" />
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onVote={onVote}
              onReply={onReply}
              canReply={canReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}