# YouTube Clone - Setup Guide

This guide will help you set up both the backend and frontend of the YouTube clone.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Cloudinary account (for video/image storage)
- Git

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000

# JWT Tokens
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Running Both Servers

### Option 1: Separate Terminals

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Option 2: Using npm-run-all (Optional)

Install globally:
```bash
npm install -g npm-run-all
```

From the root directory, create a `package.json`:
```json
{
  "scripts": {
    "dev": "npm-run-all --parallel dev:backend dev:frontend",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev"
  }
}
```

Then run:
```bash
npm run dev
```

## Features

### Backend Features
- User authentication (JWT)
- OAuth (Google, Facebook)
- Video upload and management
- Comments system
- Likes/Dislikes
- Subscriptions
- Playlists
- Watch history

### Frontend Features
- YouTube-like UI/UX
- Video playback
- User authentication
- Video upload
- Comments and likes
- Channel pages
- Search functionality
- Responsive design

## Testing

1. **Register a new account** at `http://localhost:3000/register`
2. **Login** at `http://localhost:3000/login`
3. **Upload a video** at `http://localhost:3000/upload`
4. **Watch videos** on the home page
5. **Like and comment** on videos
6. **Subscribe** to channels

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Verify your MongoDB URI is correct
- Ensure MongoDB is running
- Check network/firewall settings

**Cloudinary Upload Error**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file formats

**CORS Errors**
- Verify `CORS_ORIGIN` matches your frontend URL
- Check backend CORS configuration

### Frontend Issues

**API Connection Error**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure backend is running
- Check browser console for errors

**Authentication Issues**
- Clear browser cookies
- Check backend JWT configuration
- Verify token expiration settings

**Video Playback Issues**
- Check Cloudinary video URLs
- Verify CORS settings for video files
- Check browser console for errors

## Production Deployment

### Backend
1. Set environment variables on your hosting platform
2. Build and start the server
3. Ensure MongoDB is accessible
4. Configure CORS for production domain

### Frontend
1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Set `NEXT_PUBLIC_API_URL` to your production backend URL
3. Deploy to Vercel, Netlify, or your preferred platform

## Project Structure

```
Youtube/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── store/
│   └── package.json
└── SETUP.md
```

## Support

For issues or questions, please check:
- Backend README: `backend/Readme.md`
- Frontend README: `frontend/README.md`
