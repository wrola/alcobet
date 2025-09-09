import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BetsModule } from './bets/bets.module';
import { DailyChecksModule } from './daily-checks/daily-checks.module';
import { TrustmanModule } from './trustman/trustman.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule as CustomScheduleModule } from './schedule/schedule.module';

import { User } from './users/user.entity';
import { Bet } from './bets/bet.entity';
import { DailyCheck } from './daily-checks/daily-check.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_URL || './database.sqlite',
      entities: [User, Bet, DailyCheck],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    BetsModule,
    DailyChecksModule,
    TrustmanModule,
    MailModule,
    CustomScheduleModule,
  ],
})
export class AppModule {}