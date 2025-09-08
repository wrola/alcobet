import { Module } from '@nestjs/common';
import { TrustmanController } from './trustman.controller';
import { DailyChecksModule } from '../daily-checks/daily-checks.module';
import { BetsModule } from '../bets/bets.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [DailyChecksModule, BetsModule, MailModule],
  controllers: [TrustmanController],
})
export class TrustmanModule {}