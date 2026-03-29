'use client'

import { useState } from 'react'

interface CreateSubredditFormProps {
  token: string
  onSubredditCreated: () => void
}

export default function CreateSubredditForm({ token, onSubredditCreated }: CreateSubredditFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/subreddits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    })
    if (res.ok) {
      setName('')
      setDescription('')
      onSubredditCreated()
    } else {
      alert('Error creating subreddit')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <h3>Create Subreddit</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="block mb-2 p-2 border w-full"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="block mb-2 p-2 border w-full"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Create</button>
    </form>
  )
}