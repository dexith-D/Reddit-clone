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
  description?: string | null
}

export default function CreatePostForm({ token, subreddits, onPostCreated }: CreatePostFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subredditId, setSubredditId] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subredditId) {
      setError('Pick a community before posting.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), subredditId })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error creating post.')
        return
      }

      setTitle('')
      setContent('')
      setSubredditId('')
      setIsExpanded(false)
      onPostCreated()
    } catch {
      setError('Unable to create the post right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-lg text-[#ff4500]">
          {token ? '✎' : '👋'}
        </div>
        <div className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
          {token ? 'Create a post' : 'Log in to start posting'}
        </div>
        <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline">Image</span>
        <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline">Link</span>
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-200 p-4">
          {subreddits.length > 0 ? (
            <select
              value={subredditId}
              onChange={(e) => setSubredditId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0079d3]"
              required
            >
              <option value="">Choose a community</option>
              {subreddits.map((subreddit) => (
                <option key={subreddit.id} value={subreddit.id}>
                  r/{subreddit.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Create a community first, then publish your first thread.
            </p>
          )}

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0079d3]"
            required
          />

          <textarea
            placeholder="What do you want to talk about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0079d3]"
          />

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || subreddits.length === 0}
              className="rounded-full bg-[#0079d3] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0060a8] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}