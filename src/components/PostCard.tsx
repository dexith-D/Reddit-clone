'use client'

interface Post {
  id: string
  title: string
  content?: string
  author: { username: string }
  subreddit: { name: string }
  _count: { comments: number; votes: number }
  createdAt: string
}

interface PostCardProps {
  post: Post
  onClick: () => void
}

export default function PostCard({ post, onClick }: PostCardProps) {
  return (
    <div className="border rounded p-4 mb-4 cursor-pointer hover:bg-gray-50" onClick={onClick}>
      <h2 className="text-xl font-bold">{post.title}</h2>
      {post.content && <p className="mt-2">{post.content}</p>}
      <div className="mt-2 text-sm text-gray-600">
        r/{post.subreddit.name} • by {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
      </div>
      <div className="mt-2 text-sm">
        {post._count.votes} votes • {post._count.comments} comments
      </div>
    </div>
  )
}