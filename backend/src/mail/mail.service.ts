import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { DailyCheck } from "../daily-checks/daily-check.entity";
import { Bet } from "../bets/bet.entity";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendDailyCheckEmail(dailyCheck: DailyCheck): Promise<boolean> {
    try {
      const baseUrl = this.configService.get<string>("app.urls.backend");
      const currentDay = this.calculateCurrentDay(dailyCheck.bet.createdAt);
      const totalDays = this.calculateTotalDays(
        dailyCheck.bet.createdAt,
        dailyCheck.bet.deadline,
      );

      await this.mailerService.sendMail({
        to: dailyCheck.bet.trustmanEmail,
        subject: `Daily Check: Is ${dailyCheck.bet.user.name} staying alcohol-free?`,
        template: "daily-check",
        context: {
          userName: dailyCheck.bet.user.name,
          amount: dailyCheck.bet.amount,
          token: dailyCheck.responseToken,
          checkDate: dailyCheck.checkDate.toISOString().split("T")[0],
          deadline: dailyCheck.bet.deadline.toISOString().split("T")[0],
          currentDay,
          totalDays,
          baseUrl,
        },
      });

      this.logger.log(
        `Daily check email sent to ${dailyCheck.bet.trustmanEmail} for bet ${dailyCheck.bet.id}`,
      );
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to send daily check email: ${err.message}`,
        err.stack,
      );
      return false;
    }
  }

  async sendBetCompletedEmail(bet: Bet, isSuccess: boolean): Promise<boolean> {
    try {
      const subject = isSuccess
        ? `Congratulations! ${bet.user.name} completed their commitment`
        : `${bet.user.name}'s commitment ended`;

      const message = isSuccess
        ? `${bet.user.name} successfully completed their alcohol abstinence commitment and will receive their $${bet.amount} back.`
        : `${bet.user.name}'s alcohol abstinence commitment ended. The $${bet.amount} will not be returned.`;

      await this.mailerService.sendMail({
        to: bet.trustmanEmail,
        subject,
        html: `
          <h2>${subject}</h2>
          <p>${message}</p>
          <p>Thank you for helping monitor their progress!</p>
        `,
      });

      this.logger.log(
        `Bet completion email sent to ${bet.trustmanEmail} for bet ${bet.id}`,
      );
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to send bet completion email: ${err.message}`,
        err.stack,
      );
      return false;
    }
  }

  async sendBetCreatedNotification(
    trustmanEmail: string,
    userName: string,
    amount: number,
    deadline: string,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: trustmanEmail,
        subject: `You've been chosen as a trustman for ${userName}`,
        html: `
          <h2>You've been chosen as a trustman!</h2>
          <p><strong>${userName}</strong> has committed $${amount} to quit drinking until <strong>${deadline}</strong>.</p>
          <p>You'll receive daily emails asking if they stayed alcohol-free. Your honest responses help them stay accountable.</p>
          <p>Thanks for being a supportive friend!</p>
        `,
      });

      this.logger.log(`Bet creation notification sent to ${trustmanEmail}`);
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to send bet creation notification: ${err.message}`,
        err.stack,
      );
      return false;
    }
  }

  private calculateCurrentDay(createdAt: Date): number {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateTotalDays(createdAt: Date, deadline: Date): number {
    const created = new Date(createdAt);
    const end = new Date(deadline);
    const diffTime = Math.abs(end.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
