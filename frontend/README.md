# YouTube Clone Frontend

A modern YouTube clone frontend built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎥 Video playback with React Player
- 🔐 User authentication (Login, Register, OAuth)
- 📤 Video upload with thumbnail
- 💬 Comments system
- 👍 Like/Dislike functionality
- 📺 Channel pages
- 🔍 Search functionality
- 📱 Responsive design
- 🎨 YouTube-like UI/UX

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── upload/            # Video upload page
│   ├── watch/             # Video watch page
│   ├── channel/           # Channel pages
│   └── search/            # Search page
├── components/            # React components
│   ├── Header.tsx         # Top navigation bar
│   ├── Sidebar.tsx        # Side navigation
│   ├── VideoCard.tsx      # Video card component
│   └── MainLayout.tsx     # Main layout wrapper
├── lib/                   # Utilities and API
│   ├── api.ts            # Axios configuration
│   └── api-services.ts   # API service functions
├── store/                 # State management
│   └── auth-store.ts     # Authentication store
└── providers/            # React providers
    └── query-provider.tsx # React Query provider
```

## API Integration

The frontend connects to the backend API at `/api/v1`. Make sure your backend is running and the `NEXT_PUBLIC_API_URL` environment variable is set correctly.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **React Player** - Video playback
- **Axios** - HTTP client
- **React Icons** - Icons
- **React Hot Toast** - Notifications

## Features in Detail

### Authentication
- Email/Password login and registration
- OAuth (Google, Facebook)
- Protected routes
- JWT token management

### Video Features
- Upload videos with thumbnails
- Watch videos with player controls
- Like/Dislike videos
- View video details and descriptions
- Related videos sidebar

### Social Features
- Comment on videos
- Subscribe to channels
- View channel pages
- User profiles

### UI/UX
- Dark theme matching YouTube
- Responsive design for all devices
- Smooth animations and transitions
- Loading states and error handling

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Troubleshooting

### CORS Issues
Make sure your backend CORS configuration allows requests from `http://localhost:3000`.

### Authentication Issues
- Ensure cookies are enabled in your browser
- Check that the backend is running and accessible
- Verify JWT tokens are being set correctly

### Video Playback Issues
- Ensure video URLs from Cloudinary are accessible
- Check CORS settings for video files
- Verify React Player is properly configured

## License

ISC
