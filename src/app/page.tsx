'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PostCard from '@/components/PostCard'
import AuthForm from '@/components/AuthForm'
import CreatePostForm from '@/components/CreatePostForm'
import CreateSubredditForm from '@/components/CreateSubredditForm'

interface Post {
  id: string
  title: string
  content?: string
  author: { username: string }
  subreddit: { name: string }
  _count: { comments: number; votes: number }
  createdAt: string
}

interface User {
  id: string
  username: string
  email: string
}

interface Subreddit {
  id: string
  name: string
  description?: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string>('')
  const [subreddits, setSubreddits] = useState<Subreddit[]>([])
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    fetchPosts()
    fetchSubreddits()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchPosts, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchPosts = async () => {
    const res = await fetch('/api/posts')
    const data = await res.json()
    setPosts(data)
  }

  const fetchSubreddits = async () => {
    const res = await fetch('/api/subreddits')
    const data = await res.json()
    setSubreddits(data)
  }

  const handleAuth = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const handleLogout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const handlePostCreated = () => {
    fetchPosts()
  }

  const handleSubredditCreated = () => {
    fetchSubreddits()
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Reddit Clone</h1>
      {user ? (
        <div>
          <p>Welcome, {user.username}!</p>
          <button onClick={handleLogout} className="mb-4 bg-red-500 text-white p-2 rounded">Logout</button>
          <CreateSubredditForm token={token} onSubredditCreated={handleSubredditCreated} />
          <CreatePostForm token={token} subreddits={subreddits} onPostCreated={handlePostCreated} />
        </div>
      ) : (
        <AuthForm onAuth={handleAuth} />
      )}
      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onClick={() => router.push(`/post/${post.id}`)} />
        ))}
      </div>
    </div>
  )
}
