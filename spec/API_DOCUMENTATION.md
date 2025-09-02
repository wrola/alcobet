# API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: `https://your-backend.railway.app`

## Authentication

All authenticated endpoints require a valid session cookie obtained through Google OAuth.

### POST /auth/google
Initiates Google OAuth flow.
- **Response**: Redirects to Google OAuth consent screen

### GET /auth/google/callback
Handles Google OAuth callback and creates user session.
- **Response**: Redirects to frontend dashboard

### GET /auth/profile
Gets current authenticated user profile.
- **Auth**: Required
- **Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "googleId": "google_123456789",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### POST /auth/logout
Logs out user and destroys session.
- **Auth**: Required
- **Response**: `204 No Content`

## Bets Management

### POST /bets
Creates a new bet.
- **Auth**: Required
- **Body**:
```json
{
  "trustmanEmail": "trustman@example.com",
  "amount": 100.00,
  "deadline": "2024-12-31"
}
```
- **Response**:
```json
{
  "id": 1,
  "user": { "id": 1, "name": "John Doe", "email": "user@example.com" },
  "trustmanEmail": "trustman@example.com",
  "amount": 100.00,
  "deadline": "2024-12-31",
  "status": "active",
  "createdAt": "2024-01-15T10:00:00Z",
  "dailyChecks": []
}
```

### GET /bets
Gets all bets for the authenticated user.
- **Auth**: Required
- **Response**:
```json
[
  {
    "id": 1,
    "trustmanEmail": "trustman@example.com",
    "amount": 100.00,
    "deadline": "2024-12-31",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z",
    "dailyChecks": [
      {
        "id": 1,
        "checkDate": "2024-01-16",
        "response": "clean",
        "respondedAt": "2024-01-16T15:30:00Z",
        "emailSentAt": "2024-01-16T09:00:00Z"
      }
    ]
  }
]
```

### GET /bets/:id
Gets specific bet details for the authenticated user.
- **Auth**: Required
- **Parameters**: `id` - Bet ID
- **Response**: Same as POST /bets response

## Trustman Actions

### GET /trustman/response/:token
Gets trustman response page data.
- **Auth**: Not required
- **Parameters**: `token` - Unique response token
- **Response**:
```json
{
  "userName": "John Doe",
  "amount": 100.00,
  "checkDate": "2024-01-16",
  "deadline": "2024-12-31",
  "currentDay": 2,
  "totalDays": 350,
  "alreadyResponded": false
}
```

### POST /trustman/response/:token
Submits trustman response for daily check.
- **Auth**: Not required
- **Parameters**: `token` - Unique response token
- **Body**:
```json
{
  "response": "clean" // or "drank"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Response recorded successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Rate Limiting
- Authentication endpoints: 5 requests per minute per IP
- Bet creation: 3 requests per minute per user
- Trustman responses: 10 requests per minute per IP
- Profile endpoints: 30 requests per minute per user

## Validation Rules

### Create Bet DTO
```typescript
export class CreateBetDto {
  @IsEmail()
  @IsNotEmpty()
  trustmanEmail: string;

  @IsNumber()
  @Min(1)
  @Max(10000)
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  deadline: string; // Must be future date
}
```

### Trustman Response DTO
```typescript
export class TrustmanResponseDto {
  @IsIn(['clean', 'drank'])
  response: 'clean' | 'drank';
}
```