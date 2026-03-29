# Reddit Clone

A fully functional Reddit-inspired social media platform built with modern web technologies. Users can create posts, comment, upvote/downvote, and browse communities (subreddits) in a clean, responsive interface.

## ✨ Features

- **User Authentication**: Secure login/signup with JWT tokens
- **Post Creation**: Share text, images, or links with titles and descriptions
- **Voting System**: Upvote/downvote posts and comments (karma system)
- **Subreddits**: Create and join communities for topic-based discussions
- **Real-time Updates**: Live voting and comment notifications via WebSockets
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Search & Sorting**: Filter posts by hot, new, top, and search keywords

## 🛠 Tech Stack

| Frontend | Backend | Database | Other |
|----------|---------|----------|-------|
| React.js | Node.js + Express | MongoDB | Socket.io, JWT, Tailwind CSS |

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Clone & Install
```bash
git clone https://github.com/dexith-D/Reddit-clone.git
cd Reddit-clone
npm install
```

### Environment Setup
Create a `.env` file in the root:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Run the App
```bash
# Backend
npm run dev

# Frontend (new terminal)
cd client
npm install
npm start
```

App will be live at `http://localhost:3000`

## 📁 Project Structure
Reddit-clone/
├── client/ # React frontend
├── server/ # Node.js + Express backend
├── README.md
└── .env.example


## 🧪 Testing
```bash
# Backend tests
npm test

# Frontend tests
cd client && npm test
```

## 🔧 Development Scripts
```bash
npm run dev          # Start both frontend + backend
npm run build        # Build for production
npm run lint         # Run ESLint
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/posts` | Create post |
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts/:id/vote` | Vote on post |

*See `/server/docs/api.md` for full documentation.*

## 🤝 Contributing
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request
