# Deployment Guide

## Environment Setup

### Google OAuth Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/google/callback`
   - Production: `https://your-backend.railway.app/auth/google/callback`

### Gmail App Password Setup
1. Enable 2-factor authentication on Gmail account
2. Generate app password in Google Account settings
3. Use app password in `GMAIL_PASSWORD` environment variable

## Backend Deployment (Railway)

### Environment Variables
```
NODE_ENV=production
DATABASE_URL=file:./database.sqlite
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=random_64_char_string
FRONTEND_URL=https://your-frontend.vercel.app
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_16_char_app_password
PORT=3000
```

### Railway Setup
1. Connect GitHub repository
2. Select backend directory as root
3. Railway auto-detects Node.js
4. Add environment variables in Railway dashboard
5. Deploy automatically on git push

### Database Persistence
- SQLite file stored in Railway volume
- Automatic backups via Railway
- Database migrations run on deployment

## Frontend Deployment (Vercel)

### Environment Variables
```
VITE_API_URL=https://your-backend.railway.app
```

### Vercel Setup
1. Connect GitHub repository
2. Select frontend directory as root
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables in Vercel dashboard

### Build Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
})
```

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Google OAuth credentials
- Gmail account with app password

### Backend Development
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run start:dev     # Runs on localhost:3000
```

### Frontend Development
```bash
cd frontend
npm install
cp .env.example .env  # Configure API URL
npm run dev          # Runs on localhost:5173
```

## Monitoring & Logging

### Backend Logging
- NestJS built-in logger for development
- Winston logger for production
- Log daily email send attempts and failures
- Monitor database query performance

### Error Tracking
- Implement try-catch blocks around critical operations
- Log authentication failures
- Monitor email delivery rates
- Alert on system failures

## Security Considerations

### Production Security
- HTTPS only in production
- Secure session cookies (httpOnly, secure, sameSite)
- CORS configured for specific frontend domain
- Rate limiting on API endpoints
- Input validation on all user inputs
- SQL injection protection via TypeORM
- XSS protection via input sanitization

### Data Protection
- No sensitive data in logs
- Secure token generation for trustman responses
- Token expiration (24 hours)
- User data encryption in transit and at rest