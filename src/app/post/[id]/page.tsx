'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Post {
  id: string
  title: string
  content?: string
  author: { username: string }
  subreddit: { name: string }
  comments: Comment[]
  _count: { votes: number }
}

interface Comment {
  id: string
  content: string
  author: { username: string }
  replies: Comment[]
  _count: { votes: number }
}

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [token, setToken] = useState('')

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) setToken(storedToken)
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    const res = await fetch(`/api/posts/${id}`)
    const data = await res.json()
    setPost(data)
  }

  const handleVote = async (postId?: string, commentId?: string, type: number) => {
    if (!token) return
    await fetch('/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ postId, commentId, type })
    })
    fetchPost()
  }

  const handleComment = async (content: string, parentId?: string) => {
    if (!token) return
    await fetch(`/api/posts/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, parentId })
    })
    fetchPost()
  }

  if (!post) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <div className="text-sm text-gray-600">r/{post.subreddit.name} • by {post.author.username}</div>
      {post.content && <p className="mt-2">{post.content}</p>}
      <div className="mt-2">
        <button onClick={() => handleVote(post.id, undefined, 1)}>Upvote</button>
        <span>{post._count.votes}</span>
        <button onClick={() => handleVote(post.id, undefined, -1)}>Downvote</button>
      </div>
      <div className="mt-4">
        <h2>Comments</h2>
        {token && <CommentForm onSubmit={(content) => handleComment(content)} />}
        {post.comments.map((comment) => (
          <CommentComponent key={comment.id} comment={comment} onVote={handleVote} onReply={handleComment} token={token} />
        ))}
      </div>
    </div>
  )
}

function CommentForm({ onSubmit }: { onSubmit: (content: string) => void }) {
  const [content, setContent] = useState('')
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(content); setContent('') }} className="mb-4">
      <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2 border" />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Comment</button>
    </form>
  )
}

function CommentComponent({ comment, onVote, onReply, token }: { comment: Comment; onVote: (postId?: string, commentId?: string, type: number) => void; onReply: (content: string, parentId: string) => void; token: string }) {
  const [showReply, setShowReply] = useState(false)
  return (
    <div className="border-l pl-4 mb-2">
      <p>{comment.content}</p>
      <div>
        <button onClick={() => onVote(undefined, comment.id, 1)}>Up</button>
        <span>{comment._count.votes}</span>
        <button onClick={() => onVote(undefined, comment.id, -1)}>Down</button>
        {token && <button onClick={() => setShowReply(!showReply)}>Reply</button>}
      </div>
      {showReply && <CommentForm onSubmit={(content) => onReply(content, comment.id)} />}
      {comment.replies.map((reply) => (
        <CommentComponent key={reply.id} comment={reply} onVote={onVote} onReply={onReply} token={token} />
      ))}
    </div>
  )
}