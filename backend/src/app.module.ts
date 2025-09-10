import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { appConfig, validationSchema } from './config/configuration';

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
      load: [appConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('app.database.url'),
        entities: [User, Bet, DailyCheck],
        synchronize: configService.get<string>('app.nodeEnv') !== 'production',
        logging: configService.get<string>('app.nodeEnv') === 'development',
        migrationsRun: configService.get<boolean>('app.database.migrationsRun'),
      }),
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