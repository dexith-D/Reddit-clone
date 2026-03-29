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
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <h2>{isLogin ? 'Login' : 'Signup'}</h2>
      {!isLogin && (
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="block mb-2 p-2 border"
          required
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="block mb-2 p-2 border"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="block mb-2 p-2 border"
        required
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">{isLogin ? 'Login' : 'Signup'}</button>
      <button type="button" onClick={() => setIsLogin(!isLogin)} className="ml-2 text-blue-500">
        {isLogin ? 'Need to signup?' : 'Already have account?'}
      </button>
    </form>
  )
}