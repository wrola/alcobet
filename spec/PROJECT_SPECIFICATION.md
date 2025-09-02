# Alcohol Abstinence Betting App - Project Specification

## Project Overview
A betting application where users commit money to quit drinking, with trustman verification via daily emails.

## Core Features
- User creates a bet with amount, deadline, and trustman email
- Daily email notifications to trustman asking if user drank alcohol
- Trustman responds yes/no via email or web interface
- Automatic payout based on outcome (success = user gets money back, failure = money donated/lost)

## Tech Stack

### Backend: NestJS
- **Framework**: NestJS with TypeScript
- **Database**: SQLite with TypeORM
- **Authentication**: Google OAuth 2.0 with Passport
- **Email**: @nestjs/mailer with Nodemailer
- **Scheduling**: @nestjs/schedule for cron jobs

### Frontend: React
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context

### Deployment
- **Backend**: Railway (handles SQLite automatically)
- **Frontend**: Vercel
- **Email Service**: Gmail SMTP

## Database Schema

### Users Table
```sql
users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  google_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Bets Table
```sql
bets (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  trustman_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'active', -- active, completed, failed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Daily Checks Table
```sql
daily_checks (
  id INTEGER PRIMARY KEY,
  bet_id INTEGER REFERENCES bets(id),
  check_date DATE NOT NULL,
  response TEXT, -- null, 'clean', 'drank'
  response_token TEXT,
  responded_at DATETIME,
  email_sent_at DATETIME
)
```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Handle OAuth callback
- `GET /auth/profile` - Get current user profile
- `POST /auth/logout` - Logout user

### Bets Management
- `POST /bets` - Create new bet
- `GET /bets` - Get user's bets (protected)
- `GET /bets/:id` - Get specific bet details

### Trustman Actions
- `GET /trustman/response/:token` - Get response form page
- `POST /trustman/response/:token` - Submit daily check response

## User Flows

### Primary User Flow
1. User logs in with Google SSO
2. User creates bet (amount, deadline, trustman email)
3. Daily emails sent to trustman
4. Trustman clicks email link and responds
5. Bet automatically resolved on deadline or failure

### Trustman Flow
1. Receives daily email with question
2. Clicks "Yes, they drank" or "No, they stayed clean"
3. Response recorded in system
4. User sees update on dashboard

## Security Features
- Google OAuth 2.0 (no password management)
- Secure session cookies
- CORS protection
- Rate limiting
- Input validation
- Secure response tokens with expiration