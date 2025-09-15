export interface User {
  id: number;
  email: string;
  name: string;
  googleId: string;
  createdAt: string;
}

export interface DailyCheck {
  id: number;
  checkDate: string;
  response: 'clean' | 'drank' | null;
  respondedAt: string | null;
  emailSentAt: string | null;
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

export interface CreateBetDto {
  trustmanEmail: string;
  amount: number;
  deadline: string;
}

export interface TrustmanResponseData {
  userName: string;
  amount: number;
  checkDate: string;
  deadline: string;
  currentDay: number;
  totalDays: number;
  alreadyResponded: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface NetworkError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}