import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BetsService } from '../bets/bets.service';
import { DailyChecksService } from '../daily-checks/daily-checks.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class DailyEmailService {
  private readonly logger = new Logger(DailyEmailService.name);

  constructor(
    private readonly betsService: BetsService,
    private readonly dailyChecksService: DailyChecksService,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 9 * * *') // Run at 9 AM every day
  async sendDailyChecks() {
    this.logger.log('Starting daily email job');

    try {
      const activeBets = await this.betsService.findActiveBets();
      this.logger.log(`Found ${activeBets.length} active bets`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const bet of activeBets) {
        try {
          // Create daily check for today if it doesn't exist
          const dailyCheck = await this.dailyChecksService.createDailyCheck(bet, today);

          // Skip if email already sent
          if (dailyCheck.emailSentAt) {
            continue;
          }

          // Send email
          const emailSent = await this.mailService.sendDailyCheckEmail(dailyCheck);
          
          if (emailSent) {
            await this.dailyChecksService.markEmailSent(dailyCheck.id);
            this.logger.log(`Daily check email sent for bet ${bet.id}`);
          } else {
            this.logger.error(`Failed to send daily check email for bet ${bet.id}`);
          }
        } catch (error) {
          this.logger.error(`Error processing bet ${bet.id}: ${error.message}`);
        }
      }

      // Check for expired bets and mark them as completed
      await this.checkExpiredBets();

    } catch (error) {
      this.logger.error(`Daily email job failed: ${error.message}`, error.stack);
    }

    this.logger.log('Daily email job completed');
  }

  private async checkExpiredBets() {
    try {
      const expiredBets = await this.betsService.findExpiredBets();
      this.logger.log(`Found ${expiredBets.length} expired bets`);

      for (const bet of expiredBets) {
        // Check if all daily checks were clean (no 'drank' responses)
        const drankResponses = bet.dailyChecks.filter(check => check.response === 'drank');
        
        if (drankResponses.length === 0) {
          // Success - user gets money back
          await this.betsService.updateStatus(bet.id, 'completed');
          await this.mailService.sendBetCompletedEmail(bet, true);
          this.logger.log(`Bet ${bet.id} marked as completed (success)`);
        } else {
          // Already failed due to drinking
          this.logger.log(`Bet ${bet.id} already failed due to drinking`);
        }
      }
    } catch (error) {
      this.logger.error(`Error checking expired bets: ${error.message}`);
    }
  }
}