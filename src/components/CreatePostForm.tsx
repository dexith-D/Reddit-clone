'use client'

import { useState } from 'react'

interface CreatePostFormProps {
  token: string
  subreddits: Subreddit[]
  onPostCreated: () => void
}

interface Subreddit {
  id: string
  name: string
  description?: string
}

export default function CreatePostForm({ token, subreddits, onPostCreated }: CreatePostFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subredditId, setSubredditId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content, subredditId })
    })
    if (res.ok) {
      setTitle('')
      setContent('')
      onPostCreated()
    } else {
      alert('Error creating post')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <select
        value={subredditId}
        onChange={(e) => setSubredditId(e.target.value)}
        className="block mb-2 p-2 border w-full"
        required
      >
        <option value="">Select Subreddit</option>
        {subreddits.map((sub) => (
          <option key={sub.id} value={sub.id}>{sub.name}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block mb-2 p-2 border w-full"
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="block mb-2 p-2 border w-full"
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">Create Post</button>
    </form>
  )
}