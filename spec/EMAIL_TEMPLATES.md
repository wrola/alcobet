# Email Notification System Specification

## Email Service Configuration

### Nodemailer Setup
```typescript
// mail.module.ts
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD, // App password
        },
      },
      defaults: {
        from: '"AlcoBet App" <noreply@alcobet.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
```

## Daily Check Email Template

### HTML Template (templates/daily-check.hbs)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Check: {{userName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
        .question { font-size: 20px; margin: 20px 0; text-align: center; }
        .buttons { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 15px 30px; margin: 0 10px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; }
        .btn-yes { background-color: #dc2626; color: white; }
        .btn-no { background-color: #16a34a; color: white; }
        .footer { margin-top: 30px; font-size: 14px; color: #666; text-align: center; }
        .progress { background-color: #e5e7eb; border-radius: 10px; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Daily Check: Is {{userName}} staying alcohol-free?</h1>
            <div class="amount">${{amount}} commitment</div>
        </div>

        <div class="progress">
            <strong>Progress:</strong> Day {{currentDay}} of {{totalDays}}<br>
            <strong>Deadline:</strong> {{deadline}}
        </div>

        <div class="question">
            Did <strong>{{userName}}</strong> drink alcohol yesterday ({{checkDate}})?
        </div>

        <div class="buttons">
            <a href="{{baseUrl}}/trustman/response/{{token}}?response=drank" class="btn btn-yes">
                YES, THEY DRANK
            </a>
            <a href="{{baseUrl}}/trustman/response/{{token}}?response=clean" class="btn btn-no">
                NO, THEY STAYED CLEAN
            </a>
        </div>

        <div class="footer">
            <p>You're helping {{userName}} stay accountable for their commitment to quit drinking.</p>
            <p>This is an automated email from AlcoBet. Please respond honestly.</p>
            <p>If you have questions, reply to this email.</p>
        </div>
    </div>
</body>
</html>
```

## Email Service Implementation

### MailService
```typescript
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendDailyCheck(
    trustmanEmail: string,
    userName: string,
    amount: number,
    token: string,
    checkDate: string,
    deadline: string,
    currentDay: number,
    totalDays: number,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: trustmanEmail,
      subject: `Daily Check: Is ${userName} staying alcohol-free?`,
      template: 'daily-check',
      context: {
        userName,
        amount,
        token,
        checkDate,
        deadline,
        currentDay,
        totalDays,
        baseUrl: process.env.FRONTEND_URL,
      },
    });
  }

  async sendBetCreatedNotification(
    trustmanEmail: string,
    userName: string,
    amount: number,
    deadline: string,
  ): Promise<void> {
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
  }
}
```

## Cron Job Specification

### Daily Email Scheduler
```typescript
@Injectable()
export class ScheduleService {
  constructor(
    private betsService: BetsService,
    private dailyChecksService: DailyChecksService,
    private mailService: MailService,
  ) {}

  @Cron('0 9 * * *', {
    name: 'daily-checks',
    timeZone: 'America/New_York',
  })
  async sendDailyChecks() {
    try {
      // Get all active bets
      const activeBets = await this.betsService.getActiveBets();
      
      for (const bet of activeBets) {
        // Check if today is past deadline
        if (new Date() > new Date(bet.deadline)) {
          await this.betsService.completeBet(bet.id);
          continue;
        }

        // Create daily check record
        const token = uuidv4();
        const dailyCheck = await this.dailyChecksService.create({
          betId: bet.id,
          checkDate: new Date().toISOString().split('T')[0],
          responseToken: token,
        });

        // Send email to trustman
        await this.mailService.sendDailyCheck(
          bet.trustmanEmail,
          bet.user.name,
          bet.amount,
          token,
          dailyCheck.checkDate,
          bet.deadline,
          this.calculateCurrentDay(bet.createdAt),
          this.calculateTotalDays(bet.createdAt, bet.deadline),
        );

        // Update email sent timestamp
        await this.dailyChecksService.markEmailSent(dailyCheck.id);
      }
    } catch (error) {
      console.error('Failed to send daily checks:', error);
    }
  }
}
```

## Email Error Handling
- Retry failed emails up to 3 times with exponential backoff
- Log email failures to database or external service
- Send admin notification if email service is down
- Graceful degradation if email service unavailable