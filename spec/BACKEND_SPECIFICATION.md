# NestJS Backend Specification

## Architecture Overview
- **Framework**: NestJS with TypeScript
- **Database**: SQLite with TypeORM
- **Authentication**: Google OAuth 2.0 with Passport
- **Email**: Nodemailer with Gmail SMTP
- **Scheduling**: @nestjs/schedule for cron jobs

## Project Structure
```
backend/
├── src/
│   ├── app.module.ts           # Root module
│   ├── main.ts                 # Application entry point
│   ├── auth/                   # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── google.strategy.ts
│   │   └── auth.guard.ts
│   ├── users/                  # Users module
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── user.entity.ts
│   ├── bets/                   # Bets module
│   │   ├── bets.module.ts
│   │   ├── bets.controller.ts
│   │   ├── bets.service.ts
│   │   ├── bet.entity.ts
│   │   └── dto/
│   │       ├── create-bet.dto.ts
│   │       └── bet-response.dto.ts
│   ├── daily-checks/          # Daily checks module
│   │   ├── daily-checks.module.ts
│   │   ├── daily-checks.service.ts
│   │   └── daily-check.entity.ts
│   ├── mail/                  # Email module
│   │   ├── mail.module.ts
│   │   ├── mail.service.ts
│   │   └── templates/
│   │       └── daily-check.hbs
│   └── trustman/              # Trustman responses
│       ├── trustman.module.ts
│       └── trustman.controller.ts
├── package.json
├── tsconfig.json
└── .env
```

## TypeORM Entities

### User Entity
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Bet } from '../bets/bet.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  googleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Bet, bet => bet.user)
  bets: Bet[];
}
```

### Bet Entity
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { DailyCheck } from '../daily-checks/daily-check.entity';

@Entity()
export class Bet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.bets)
  user: User;

  @Column()
  trustmanEmail: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('date')
  deadline: Date;

  @Column({ default: 'active' })
  status: 'active' | 'completed' | 'failed';

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => DailyCheck, check => check.bet)
  dailyChecks: DailyCheck[];
}
```

### DailyCheck Entity
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Bet } from '../bets/bet.entity';

@Entity()
export class DailyCheck {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Bet, bet => bet.dailyChecks)
  bet: Bet;

  @Column('date')
  checkDate: Date;

  @Column({ nullable: true })
  response: 'clean' | 'drank' | null;

  @Column({ nullable: true })
  responseToken: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @Column({ nullable: true })
  emailSentAt: Date;
}
```

## Controllers & Services

### AuthController
```typescript
@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req) {}

  @Post('logout')
  async logout(@Req() req, @Res() res) {}
}
```

### BetsController
```typescript
@Controller('bets')
@UseGuards(AuthGuard)
export class BetsController {
  @Post()
  async createBet(@Body() createBetDto: CreateBetDto, @Req() req) {}

  @Get()
  async getUserBets(@Req() req) {}

  @Get(':id')
  async getBet(@Param('id') id: string, @Req() req) {}
}
```

### TrustmanController
```typescript
@Controller('trustman')
export class TrustmanController {
  @Get('response/:token')
  async getResponsePage(@Param('token') token: string) {}

  @Post('response/:token')
  async submitResponse(@Param('token') token: string, @Body() body: { response: 'clean' | 'drank' }) {}
}
```

## Cron Jobs

### Daily Email Service
```typescript
@Injectable()
export class DailyEmailService {
  @Cron('0 9 * * *') // 9 AM daily
  async sendDailyChecks() {
    // Query active bets
    // Create daily check records
    // Send emails to trustmen
    // Handle failures and retries
  }
}
```

## Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/mailer": "^1.9.1",
    "typeorm": "^0.3.17",
    "sqlite3": "^5.1.6",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0",
    "express-session": "^1.17.3",
    "nodemailer": "^6.9.7",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "uuid": "^9.0.1"
  }
}
```