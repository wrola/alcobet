# AlcoBet Frontend

A React TypeScript application for the AlcoBet alcohol abstinence betting platform.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **Axios** for API communication
- **React Context** for state management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Layout.tsx     # Main layout wrapper
│   ├── Header.tsx     # Navigation header
│   ├── BetCard.tsx    # Bet display component
│   ├── LoadingSpinner.tsx
│   └── ProtectedRoute.tsx
├── pages/             # Route components
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   ├── CreateBetPage.tsx
│   └── TrustmanResponsePage.tsx
├── services/          # API services
│   ├── api.ts         # Axios configuration
│   ├── auth.service.ts
│   └── bets.service.ts
├── hooks/             # Custom React hooks
│   ├── useAuth.tsx
│   └── useBets.tsx
├── context/           # React context providers
│   └── AuthContext.tsx
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Utility functions
│   └── formatters.ts
└── App.tsx            # Main application component
```

## Features

### Authentication
- Google OAuth 2.0 integration
- Session-based authentication
- Protected routes for authenticated users

### Bet Management
- Create new betting commitments
- View active, completed, and failed bets
- Real-time progress tracking
- Form validation with user feedback

### Trustman Interface
- Public response pages accessible via email tokens
- Simple yes/no interface for daily check responses
- Success/error handling for submissions

### UI/UX
- Fully responsive design (mobile-first)
- Loading states and error handling
- Accessible components with proper ARIA labels
- Modern, clean interface with Tailwind CSS

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

## Deployment

The frontend is configured for deployment to Vercel:

1. Connect your repository to Vercel
2. Set the `VITE_API_URL` environment variable to your production backend URL
3. Deploy - Vercel will automatically detect the Vite configuration

## API Integration

The frontend communicates with the NestJS backend via REST APIs:

- Authentication endpoints (`/auth/*`)
- Bet management endpoints (`/bets/*`) 
- Trustman response endpoints (`/trustman/response/*`)

All API calls include session cookies for authentication and use Axios interceptors for error handling.

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript strictly - no `any` types
3. Ensure all components are responsive
4. Add proper error handling for API calls
5. Test on multiple browsers and devices