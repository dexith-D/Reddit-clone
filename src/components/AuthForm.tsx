'use client'

import { useState } from 'react'

interface AuthUser {
  id: string
  username: string
  email: string
}

interface AuthFormProps {
  onAuth: (token: string, user: AuthUser) => void
}

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ identifier: '', username: '', email: '', password: '' })

  const handleChange = (field: 'identifier' | 'username' | 'email' | 'password', value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
    const body = isLogin
      ? { identifier: form.identifier.trim(), password: form.password }
      : {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password
        }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Unable to authenticate right now.')
        return
      }

      onAuth(data.token, data.user)
      setForm({ identifier: '', username: '', email: '', password: '' })
    } catch {
      setError('Unable to reach the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-linear-to-r from-[#ff4500] to-[#ff6a00] px-4 py-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-100">Join the thread</p>
        <h2 className="mt-1 text-lg font-bold">Sign in to vote, comment, and create posts</h2>
      </div>

      <div className="flex border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 px-4 py-3 ${isLogin ? 'border-b-2 border-[#ff4500] text-[#ff4500]' : ''}`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 px-4 py-3 ${!isLogin ? 'border-b-2 border-[#ff4500] text-[#ff4500]' : ''}`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 p-4">
        {isLogin ? (
          <input
            type="text"
            placeholder="Username or email"
            value={form.identifier}
            onChange={(e) => handleChange('identifier', e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0079d3]"
            required
          />
        ) : (
          <>
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0079d3]"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0079d3]"
              required
            />
          </>
        )}

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#0079d3]"
          required
        />

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-[#0079d3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0060a8] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
        </button>

        <p className="text-center text-xs text-slate-500">
          {isLogin ? "New here? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className="font-semibold text-[#0079d3] hover:underline"
          >
            {isLogin ? 'Sign up instead' : 'Log in instead'}
          </button>
        </p>
      </form>
    </div>
  )
}