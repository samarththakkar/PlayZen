# PlayZen 🎬

A production-grade, full-stack YouTube clone built with React, Node.js, Express, and MongoDB — featuring real video uploads, OAuth login, a recommendation engine, Shorts, playlists, notifications, and much more.

---

## 🚀 Features

### Authentication & User Management
- **Email/Password** registration with OTP verification (via Brevo)
- **Google OAuth 2.0** login (Passport.js)
- JWT-based authentication with access & refresh tokens (stored in HTTP-only cookies)
- Forgot password / reset password via OTP
- Avatar & cover image upload with crop support (Cloudinary)
- User channel profiles with subscriber counts

### Video & Shorts
- Upload videos and Shorts with thumbnail support (Multer + Cloudinary)
- Video detail pages with view tracking
- Publish / unpublish toggle
- Delete video
- Studio dashboard showing your own uploads

### Social Features
- Like / unlike videos, comments, and tweets
- Subscribe / unsubscribe to channels
- Comment on videos
- Tweet (community posts) support
- Real-time-style notifications

### Discovery & Recommendations
- Full-text search across videos
- Interest-based recommendation engine
- Subscriptions feed (videos from subscribed channels)
- Category browsing

### Library
- Watch History (auto-tracked)
- Watch Later (save for later)
- Watch Progress (resume where you left off)
- Liked Videos collection
- Playlists (create, manage, add videos)

### Frontend
- Built with **React 19** + **Vite**
- **Tailwind CSS v4** for styling
- React Router v7 for client-side routing
- Custom hooks: `useFetch`, `useAuth`, `useLike`, `useSubscription`, `useSearch`, `useNotifications`, `useWatchProgress`
- Reusable UI components: Button, Input, Modal, Card, Skeleton loaders
- Responsive layouts with Sidebar, BottomNav (mobile), Header, Navbar
- Landing page, Auth pages (Login, Signup, Forgot/Reset Password), Home, Watch, Profile, Upload, Search, Subscriptions, History, Watch Later, Liked Videos, Shorts, Settings

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Image Cropping | react-easy-crop, react-image-crop |
| Notifications | react-hot-toast |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Pagination | mongoose-aggregate-paginate-v2 |
| Auth | JWT (jsonwebtoken), bcrypt, Passport.js |
| OAuth | passport-google-oauth20, passport-facebook |
| File Uploads | Multer |
| Cloud Storage | Cloudinary |
| Email / OTP | Brevo (via nodemailer / axios) |
| Dev Tools | Nodemon, Prettier, ESLint |

---

## 📁 Project Structure

```
PlayZen/
├── backend/
│   ├── src/
│   │   ├── config/          # Passport OAuth config
│   │   ├── controllers/     # Business logic
│   │   │   ├── user.controller.js
│   │   │   ├── video.controller.js
│   │   │   ├── subscriber.controller.js
│   │   │   ├── like.controller.js
│   │   │   ├── comments.controller.js
│   │   │   ├── playlist.controller.js
│   │   │   ├── tweets.controller.js
│   │   │   ├── recommendation.controller.js
│   │   │   ├── search.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── watchProgress.controller.js
│   │   │   ├── watchHistory.controller.js
│   │   │   ├── watchLater.controller.js
│   │   │   ├── shorts.controller.js
│   │   │   ├── settings.controller.js
│   │   │   └── category.controller.js
│   │   ├── models/          # Mongoose schemas
│   │   │   ├── user.model.js
│   │   │   ├── video.model.js
│   │   │   ├── subscription.model.js
│   │   │   ├── likes.model.js
│   │   │   ├── comments.model.js
│   │   │   ├── playlists.model.js
│   │   │   ├── tweets.model.js
│   │   │   ├── shorts.model.js
│   │   │   ├── watchHistory.model.js
│   │   │   ├── watchProgress.model.js
│   │   │   ├── watchLater.model.js
│   │   │   ├── notifications.model.js
│   │   │   ├── interest.model.js
│   │   │   ├── category.model.js
│   │   │   └── settings.model.js
│   │   ├── routes/          # Express routers (13+ route files)
│   │   ├── middlewares/     # JWT auth, optional auth, Multer
│   │   ├── utils/           # ApiError, ApiResponse, asyncHandler, Cloudinary, OTP
│   │   ├── db/              # MongoDB connection
│   │   ├── app.js           # Express app setup
│   │   └── index.js         # Server entry point
│   ├── scripts/             # Seed scripts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/           # Home, Watch, Upload, Profile, Auth, Search, etc.
    │   ├── components/
    │   │   ├── common/      # Header, Sidebar, Navbar, BottomNav, Footer
    │   │   ├── video/       # VideoCard
    │   │   └── ui/          # Button, Input, Modal, Card, Skeleton
    │   ├── hooks/           # Custom React hooks
    │   ├── services/        # API service layer (axios calls)
    │   ├── context/         # AuthContext
    │   ├── constants/       # Route constants
    │   ├── utils/           # formatDate, cropImage, avatarUtils
    │   ├── layouts/         # AuthLayout, MainLayout
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## ⚙️ API Endpoints

| Resource | Base Path |
|---|---|
| Users | `/api/v1/users` |
| Videos | `/api/v1/videos` |
| Playlists | `/api/v1/playlists` |
| Tweets | `/api/v1/tweets` |
| Likes | `/api/v1/likes` |
| Comments | `/api/v1/comments` |
| Subscriptions | `/api/v1/subscriptions` |
| Notifications | `/api/v1/notifications` |
| Watch Progress | `/api/v1/watch-progress` |
| Recommendations | `/api/v1/recommendations` |
| Search | `/api/v1/search` |
| Watch History | `/api/v1/watch-history` |
| Watch Later | `/api/v1/watch-later` |

---

## 🔧 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account
- Google Cloud project (for OAuth)
- Brevo account (for OTP emails)

### 1. Clone the repo

```bash
git clone https://github.com/samarththakkar/PlayZen.git
cd PlayZen
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

BREVO_API_KEY=your_brevo_api_key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Visit: `http://localhost:5173`

---

## 🗄️ Database Models

The app uses **13+ Mongoose models** covering:
- `User` — auth, profile, watch history, OAuth support
- `Video` — file, thumbnail, views, likes, categories, slug
- `Subscription` — channel subscriptions with notification preferences
- `Likes` — polymorphic likes (videos, comments, tweets)
- `Comments` — nested comments on videos
- `Playlists` — user-created video playlists
- `Tweets` — community/post feature
- `Shorts` — short-form vertical video
- `WatchHistory` — per-user video watch log
- `WatchProgress` — resume playback position
- `WatchLater` — saved videos queue
- `Notifications` — activity notifications
- `Interest` — user interest tags for recommendations
- `Category` — video categories
- `Settings` — per-user app settings

---

## 📜 License

MIT License © 2026 Samarth Thakkar
