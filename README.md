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
