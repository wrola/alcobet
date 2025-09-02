# React Frontend Specification

## Architecture Overview
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context

## Project Structure
```
frontend/
├── src/
│   ├── components/            # Reusable components
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── BetCard.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/                # Route components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CreateBetPage.tsx
│   │   └── TrustmanResponsePage.tsx
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.tsx
│   │   └── useBets.tsx
│   ├── services/             # API services
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   └── bets.service.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   ├── context/              # React context
│   │   └── AuthContext.tsx
│   ├── utils/               # Utility functions
│   │   └── formatters.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── .env
```

## TypeScript Types
```typescript
export interface User {
  id: number;
  email: string;
  name: string;
  googleId: string;
  createdAt: string;
}

export interface Bet {
  id: number;
  user: User;
  trustmanEmail: string;
  amount: number;
  deadline: string;
  status: 'active' | 'completed' | 'failed';
  createdAt: string;
  dailyChecks: DailyCheck[];
}

export interface DailyCheck {
  id: number;
  checkDate: string;
  response: 'clean' | 'drank' | null;
  respondedAt: string | null;
  emailSentAt: string | null;
}

export interface CreateBetDto {
  trustmanEmail: string;
  amount: number;
  deadline: string;
}
```

## Page Components

### HomePage.tsx
- Landing page with app explanation
- "Login with Google" button
- Simple hero section describing the service

### DashboardPage.tsx
- Protected route showing user's active bets
- Bet cards with progress indicators
- "Create New Bet" button
- Bet history section

### CreateBetPage.tsx
- Form with validation:
  - Trustman email (required, email validation)
  - Amount (required, minimum $1)
  - Deadline (required, future date)
- Submit creates bet and redirects to dashboard

### TrustmanResponsePage.tsx
- Accessed via email links with token
- Simple yes/no response form
- "Did [User Name] drink alcohol yesterday?"
- Thank you message after submission

## Services

### AuthService
```typescript
export class AuthService {
  static async login(): Promise<void> {
    window.location.href = `${API_URL}/auth/google`;
  }

  static async logout(): Promise<void> {
    await api.post('/auth/logout');
    window.location.href = '/';
  }

  static async getProfile(): Promise<User | null> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch {
      return null;
    }
  }
}
```

### BetsService
```typescript
export class BetsService {
  static async createBet(bet: CreateBetDto): Promise<Bet> {
    const response = await api.post('/bets', bet);
    return response.data;
  }

  static async getUserBets(): Promise<Bet[]> {
    const response = await api.get('/bets');
    return response.data;
  }

  static async getBet(id: number): Promise<Bet> {
    const response = await api.get(`/bets/${id}`);
    return response.data;
  }
}
```

## Authentication Context
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

## Routing Structure
```typescript
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/create-bet" element={
          <ProtectedRoute>
            <CreateBetPage />
          </ProtectedRoute>
        } />
        <Route path="/trustman/response/:token" element={<TrustmanResponsePage />} />
      </Routes>
    </Router>
  );
}
```

## Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "axios": "^1.6.0",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "typescript": "^5.2.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

## Environment Variables
```
VITE_API_URL=http://localhost:3000  # Development
VITE_API_URL=https://your-backend.railway.app  # Production
```