'use client'

import { useState } from 'react'

interface AuthFormProps {
  onAuth: (token: string, user: any) => void
}

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ username: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
    const body = isLogin ? { username: form.username || form.email, password: form.password } : form
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (res.ok) {
      onAuth(data.token, data.user)
    } else {
      alert(data.error)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-300 rounded-lg shadow-sm">
      <div className="flex border-b border-gray-300">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-3 px-4 text-center font-medium ${isLogin ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-3 px-4 text-center font-medium ${!isLogin ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
        >
          Sign Up
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        {!isLogin && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
              required
            />
          </div>
        )}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
        <div className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-500 hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </form>
    </div>
  )
}