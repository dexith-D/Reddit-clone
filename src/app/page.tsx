'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostCard from '@/components/PostCard'
import AuthForm from '@/components/AuthForm'
import CreatePostForm from '@/components/CreatePostForm'
import CreateSubredditForm from '@/components/CreateSubredditForm'
import RedditLogo from '@/components/RedditLogo'

interface Post {
  id: string
  title: string
  content?: string | null
  author: { username: string }
  subreddit: { name: string }
  _count: { comments: number; votes: number }
  createdAt: string
  voteScore?: number
}

interface User {
  id: string
  username: string
  email: string
}

interface Subreddit {
  id: string
  name: string
  description?: string | null
  _count?: { posts: number }
}

const feedTabs = ['Best', 'Hot', 'New', 'Top'] as const
const primaryFeeds = ['Home', 'Popular', 'All'] as const

type FeedTab = (typeof feedTabs)[number]
type PrimaryFeed = (typeof primaryFeeds)[number]

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState('')
  const [subreddits, setSubreddits] = useState<Subreddit[]>([])
  const [query, setQuery] = useState('')
  const [selectedFeed, setSelectedFeed] = useState<FeedTab>('Best')
  const [selectedPrimaryFeed, setSelectedPrimaryFeed] = useState<PrimaryFeed>('Home')
  const [selectedSubreddit, setSelectedSubreddit] = useState('all')
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      if (!res.ok) {
        throw new Error('Failed to load posts')
      }

      const data = await res.json()
      setPosts(data)
      setError('')
    } catch {
      setError('Unable to load the home feed right now.')
    } finally {
      setLoadingPosts(false)
    }
  }

  const fetchSubreddits = async () => {
    try {
      const res = await fetch('/api/subreddits')
      if (!res.ok) {
        throw new Error('Failed to load subreddits')
      }

      const data = await res.json()
      setSubreddits(data)
    } catch {
      setSubreddits([])
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    void fetchPosts()
    void fetchSubreddits()

    const interval = window.setInterval(() => {
      void fetchPosts()
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

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
    void fetchPosts()
  }

  const handleSubredditCreated = () => {
    void fetchSubreddits()
  }

  const handlePrimaryFeedChange = (feed: PrimaryFeed) => {
    setSelectedPrimaryFeed(feed)
    setSelectedSubreddit('all')

    if (feed === 'Popular') {
      setSelectedFeed('Hot')
      return
    }

    if (feed === 'All') {
      setSelectedFeed('New')
      return
    }

    setSelectedFeed('Best')
  }

  const filteredPosts = useMemo(() => {
    const search = query.trim().toLowerCase()

    const visiblePosts = posts.filter((post) => {
      const matchesSubreddit = selectedSubreddit === 'all' || post.subreddit.name === selectedSubreddit
      const matchesSearch =
        !search ||
        post.title.toLowerCase().includes(search) ||
        post.content?.toLowerCase().includes(search) ||
        post.author.username.toLowerCase().includes(search) ||
        post.subreddit.name.toLowerCase().includes(search)

      return matchesSubreddit && matchesSearch
    })

    const prioritizedPosts =
      selectedPrimaryFeed === 'Popular'
        ? visiblePosts.filter((post) => (post.voteScore ?? post._count.votes) + post._count.comments > 0)
        : visiblePosts

    return [...(prioritizedPosts.length > 0 ? prioritizedPosts : visiblePosts)].sort((left, right) => {
      const leftScore = left.voteScore ?? left._count.votes
      const rightScore = right.voteScore ?? right._count.votes
      const leftFreshness = new Date(left.createdAt).getTime()
      const rightFreshness = new Date(right.createdAt).getTime()

      if (selectedFeed === 'New') {
        return rightFreshness - leftFreshness
      }

      if (selectedFeed === 'Top') {
        return rightScore - leftScore
      }

      if (selectedFeed === 'Hot') {
        return rightScore * 2 + right._count.comments - (leftScore * 2 + left._count.comments)
      }

      return rightScore + right._count.comments - (leftScore + left._count.comments)
    })
  }, [posts, query, selectedFeed, selectedPrimaryFeed, selectedSubreddit])

  const topCommunities = useMemo(
    () => [...subreddits].sort((left, right) => (right._count?.posts ?? 0) - (left._count?.posts ?? 0)).slice(0, 6),
    [subreddits]
  )

  const selectedSubredditDetails = subreddits.find((subreddit) => subreddit.name === selectedSubreddit)

  return (
    <div className="min-h-screen bg-[#dae0e6] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              setSelectedPrimaryFeed('Home')
              setSelectedSubreddit('all')
              setSelectedFeed('Best')
              setQuery('')
            }}
            className="flex items-center gap-2"
          >
            <RedditLogo subtitle="clone" />
          </button>

          <div className="hidden flex-1 md:block">
            <input
              type="text"
              placeholder="Search Reddit"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm outline-none transition focus:border-[#0079d3] focus:bg-white"
            />
          </div>

          {user ? (
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 sm:block">
                u/{user.username}
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="ml-auto hidden text-xs text-slate-500 sm:block">Browse anonymously or sign in to join the conversation.</div>
          )}
        </div>

        <div className="px-4 pb-3 md:hidden">
          <input
            type="text"
            placeholder="Search Reddit"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm outline-none transition focus:border-[#0079d3] focus:bg-white"
          />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="hidden space-y-4 lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Feeds</p>
            {primaryFeeds.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handlePrimaryFeedChange(item)}
                className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  selectedPrimaryFeed === item ? 'bg-orange-50 text-[#ff4500]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Communities</p>
              <span className="text-xs text-slate-400">{subreddits.length}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSubreddit('all')}
              className={`mb-1 flex w-full items-center rounded-xl px-3 py-2 text-sm font-semibold ${
                selectedSubreddit === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              All communities
            </button>
            {topCommunities.map((subreddit) => (
              <button
                key={subreddit.id}
                type="button"
                onClick={() => {
                  setSelectedPrimaryFeed('Home')
                  setSelectedSubreddit(subreddit.name)
                }}
                className={`mb-1 flex w-full items-center rounded-xl px-3 py-2 text-sm font-semibold ${
                  selectedSubreddit === subreddit.name ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                r/{subreddit.name}
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#ff4500]">
                  {selectedSubreddit === 'all' ? `${selectedPrimaryFeed} feed` : `r/${selectedSubreddit}`}
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {selectedSubreddit === 'all'
                    ? selectedPrimaryFeed === 'Popular'
                      ? 'Popular on Reddit clone'
                      : selectedPrimaryFeed === 'All'
                        ? 'Everything happening right now'
                        : 'Your Reddit-style home feed'
                    : `Explore r/${selectedSubreddit}`}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedSubreddit === 'all'
                    ? selectedPrimaryFeed === 'Popular'
                      ? 'Catch the most active posts across the site right now.'
                      : selectedPrimaryFeed === 'All'
                        ? 'See every post across every community in one scrolling feed.'
                        : 'Browse trending conversations, jump into communities, and join the thread when you are ready.'
                    : 'Browse the latest posts from this community and jump into the thread when you are ready.'}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p>
                  <span className="text-lg font-bold text-slate-900">{posts.length}</span> posts
                </p>
                <p>
                  <span className="text-lg font-bold text-slate-900">{subreddits.length}</span> communities
                </p>
              </div>
            </div>
          </div>

          {user ? (
            <CreatePostForm token={token} subreddits={subreddits} onPostCreated={handlePostCreated} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Start posting in seconds</h2>
              <p className="mt-1 text-sm text-slate-600">Sign in from the sidebar to create posts, vote, and reply just like Reddit.</p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <p className="px-2 pb-2 text-xs font-medium text-slate-500">
              Showing <span className="text-slate-900">{selectedFeed}</span> posts in the{' '}
              <span className="text-slate-900">{selectedPrimaryFeed}</span> feed.
            </p>
            <div className="flex flex-wrap gap-2">
              {feedTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={selectedFeed === tab}
                  onClick={() => setSelectedFeed(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedFeed === tab ? 'bg-[#0079d3] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          {loadingPosts ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => router.push(`/post/${post.id}`)}
                onSelectSubreddit={(name) => {
                  setSelectedPrimaryFeed('Home')
                  setSelectedSubreddit(name)
                }}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">No posts here yet</h2>
              <p className="mt-2 text-sm text-slate-600">
                {selectedSubreddit === 'all'
                  ? 'Be the first to kick off a thread and make this front page feel alive.'
                  : `There are no posts in r/${selectedSubreddit} yet. Create one to get the community started.`}
              </p>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-16 bg-linear-to-r from-sky-500 via-blue-500 to-indigo-500" />
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {selectedSubredditDetails ? 'Community spotlight' : 'About this feed'}
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {selectedSubredditDetails ? `r/${selectedSubredditDetails.name}` : 'Home'}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {selectedSubredditDetails?.description || 'Your personalized front page for community conversation and fresh posts.'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="font-bold text-slate-900">{selectedSubredditDetails?._count?.posts ?? posts.length}</p>
                  <p className="text-slate-500">posts</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="font-bold text-slate-900">{subreddits.length}</p>
                  <p className="text-slate-500">communities</p>
                </div>
              </div>
            </div>
          </div>

          {user ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Signed in</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">u/{user.username}</h3>
                <p className="mt-1 text-sm text-slate-600">You are ready to vote, comment, and publish posts.</p>
              </div>
              <CreateSubredditForm token={token} onSubredditCreated={handleSubredditCreated} />
            </>
          ) : (
            <AuthForm onAuth={handleAuth} />
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Top communities</h3>
              <span className="text-xs text-slate-400">Today</span>
            </div>
            <div className="space-y-2">
              {topCommunities.length > 0 ? (
                topCommunities.map((subreddit, index) => (
                  <button
                    key={subreddit.id}
                    type="button"
                    onClick={() => {
                      setSelectedPrimaryFeed('Home')
                      setSelectedSubreddit(subreddit.name)
                    }}
                    className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm transition hover:bg-slate-100"
                  >
                    <span className="font-semibold text-slate-700">
                      {index + 1}. r/{subreddit.name}
                    </span>
                    <span className="text-slate-500">{subreddit._count?.posts ?? 0} posts</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">Create a community to see it trend here.</p>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
