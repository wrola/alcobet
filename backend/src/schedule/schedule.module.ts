import { Module } from "@nestjs/common";
import { DailyEmailService } from "./daily-email.service";
import { BetsModule } from "../bets/bets.module";
import { DailyChecksModule } from "../daily-checks/daily-checks.module";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [BetsModule, DailyChecksModule, MailModule],
  providers: [DailyEmailService],
})
export class ScheduleModule {}
