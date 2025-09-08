import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { DailyCheck } from '../daily-checks/daily-check.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendDailyCheckEmail(dailyCheck: DailyCheck): Promise<boolean> {
    try {
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      
      const cleanUrl = `${baseUrl}/trustman/response/${dailyCheck.responseToken}?response=clean`;
      const drankUrl = `${baseUrl}/trustman/response/${dailyCheck.responseToken}?response=drank`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h1>Daily Check for ${dailyCheck.bet.user.name}</h1>
            <p>Date: ${dailyCheck.checkDate.toISOString().split('T')[0]}</p>
          </div>

          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h2>Did ${dailyCheck.bet.user.name} drink alcohol yesterday?</h2>
            <p>Please click one of the buttons below to record your response.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${cleanUrl}" style="display: inline-block; padding: 15px 30px; margin: 0 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; background: #28a745; color: white;">
              No, they stayed clean ✓
            </a>
            <a href="${drankUrl}" style="display: inline-block; padding: 15px 30px; margin: 0 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; background: #dc3545; color: white;">
              Yes, they drank alcohol ✗
            </a>
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px; font-size: 14px; color: #6c757d;">
            <p><strong>Bet Details:</strong></p>
            <p>Amount: $${dailyCheck.bet.amount}</p>
            <p>Deadline: ${dailyCheck.bet.deadline.toISOString().split('T')[0]}</p>
            <p>Your response helps determine if ${dailyCheck.bet.user.name} succeeds in their commitment.</p>
            <p>This link expires in 24 hours.</p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        to: dailyCheck.bet.trustmanEmail,
        subject: `Daily Check: ${dailyCheck.bet.user.name} - ${dailyCheck.checkDate.toISOString().split('T')[0]}`,
        html: htmlContent,
      });

      this.logger.log(`Daily check email sent to ${dailyCheck.bet.trustmanEmail} for bet ${dailyCheck.bet.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send daily check email: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendBetCompletedEmail(bet: any, isSuccess: boolean): Promise<boolean> {
    try {
      const subject = isSuccess 
        ? `Congratulations! ${bet.user.name} completed their commitment`
        : `${bet.user.name}'s commitment ended`;

      const message = isSuccess
        ? `${bet.user.name} successfully completed their alcohol abstinence commitment and will receive their $${bet.amount} back.`
        : `${bet.user.name}'s alcohol abstinence commitment ended. The $${bet.amount} will not be returned.`;

      await this.transporter.sendMail({
        to: bet.trustmanEmail,
        subject,
        html: `
          <h2>${subject}</h2>
          <p>${message}</p>
          <p>Thank you for helping monitor their progress!</p>
        `,
      });

      this.logger.log(`Bet completion email sent to ${bet.trustmanEmail} for bet ${bet.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send bet completion email: ${error.message}`, error.stack);
      return false;
    }
  }
}