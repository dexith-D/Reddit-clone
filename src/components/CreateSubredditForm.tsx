'use client'

import { useState } from 'react'

interface CreateSubredditFormProps {
  token: string
  onSubredditCreated: () => void
}

export default function CreateSubredditForm({ token, onSubredditCreated }: CreateSubredditFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/subreddits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error creating subreddit.')
        return
      }

      setName('')
      setDescription('')
      onSubredditCreated()
    } catch {
      setError('Unable to create the community right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Moderator tools</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">Create a community</h3>
        <p className="mt-1 text-sm text-slate-600">Start a new subreddit for any topic in seconds.</p>
      </div>

      <input
        type="text"
        placeholder="Community name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0079d3]"
        required
      />

      <textarea
        placeholder="Short description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0079d3]"
      />

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#ff4500] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e03d00] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSubmitting ? 'Creating...' : 'Create Community'}
      </button>
    </form>
  )
}