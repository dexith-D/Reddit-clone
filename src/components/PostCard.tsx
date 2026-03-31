'use client'

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

interface PostCardProps {
  post: Post
  onClick: () => void
  onSelectSubreddit?: (name: string) => void
}

function formatRelativeTime(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return new Date(date).toLocaleDateString()
}

export default function PostCard({ post, onClick, onSelectSubreddit }: PostCardProps) {
  const score = post.voteScore ?? post._count.votes
  const preview = post.content && post.content.length > 220 ? `${post.content.slice(0, 220)}…` : post.content

  return (
    <article
      className="group flex cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex w-12 flex-col items-center gap-1 bg-slate-50 px-2 py-4 text-slate-400">
        <span className="text-xs">▲</span>
        <span className="text-sm font-bold text-slate-700">{score}</span>
        <span className="text-xs">▼</span>
      </div>

      <div className="flex-1 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSelectSubreddit?.(post.subreddit.name)
            }}
            className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            r/{post.subreddit.name}
          </button>
          <span>Posted by u/{post.author.username}</span>
          <span>•</span>
          <span>{formatRelativeTime(post.createdAt)}</span>
        </div>

        <h2 className="mt-2 text-xl font-bold text-slate-900 transition group-hover:text-[#0079d3]">{post.title}</h2>

        {preview && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{preview}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">💬 {post._count.comments} comments</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">🔗 Share</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">💾 Save</span>
        </div>
      </div>
    </article>
  )
}