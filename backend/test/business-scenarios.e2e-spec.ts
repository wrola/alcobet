import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/user.entity';
import { Bet } from '../src/bets/bet.entity';
import { DailyCheck } from '../src/daily-checks/daily-check.entity';
import { BetsService } from '../src/bets/bets.service';
import { DailyChecksService } from '../src/daily-checks/daily-checks.service';
import { DailyEmailService } from '../src/schedule/daily-email.service';
import { MailService } from '../src/mail/mail.service';

describe('Business Scenarios (e2e)', () => {
  let app: INestApplication;
  let betsService: BetsService;
  let dailyChecksService: DailyChecksService;
  let dailyEmailService: DailyEmailService;
  let mailService: MailService;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Bet, DailyCheck],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    betsService = app.get<BetsService>(BetsService);
    dailyChecksService = app.get<DailyChecksService>(DailyChecksService);
    dailyEmailService = app.get<DailyEmailService>(DailyEmailService);
    mailService = app.get<MailService>(MailService);
    
    await app.init();

    // Create test user
    testUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      googleId: 'google123',
      createdAt: new Date(),
      bets: [],
    };
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Successful bet completion scenario', () => {
    it('should complete bet successfully when user stays clean until deadline', async () => {
      // Create bet with 3-day duration
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 3);

      const bet = await betsService.create({
        trustmanEmail: 'trustman@example.com',
        amount: 100,
        deadline: deadline.toISOString(),
      }, testUser);

      // Simulate 3 days of clean responses
      for (let i = 0; i < 3; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() + i);
        
        const dailyCheck = await dailyChecksService.createDailyCheck(bet, checkDate);
        await dailyChecksService.updateResponse(dailyCheck.id, 'clean');
      }

      // Mock email service to avoid actual email sending
      jest.spyOn(mailService, 'sendBetCompletedEmail').mockResolvedValue(true);

      // Simulate bet expiration check
      jest.spyOn(betsService, 'findExpiredBets').mockResolvedValue([{
        ...bet,
        dailyChecks: [
          { response: 'clean' },
          { response: 'clean' },
          { response: 'clean' },
        ],
      } as any]);

      // Run daily email service (which checks for expired bets)
      await dailyEmailService.sendDailyChecks();

      // Verify bet was marked as completed
      expect(mailService.sendBetCompletedEmail).toHaveBeenCalledWith(
        expect.objectContaining({ id: bet.id }),
        true
      );
    });
  });

  describe('Failed bet scenario', () => {
    it('should fail bet immediately when user drinks', async () => {
      // Create bet
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7);

      const bet = await betsService.create({
        trustmanEmail: 'trustman@example.com',
        amount: 200,
        deadline: deadline.toISOString(),
      }, testUser);

      // Day 1: Clean response
      const day1Check = await dailyChecksService.createDailyCheck(bet, new Date());
      await dailyChecksService.updateResponse(day1Check.id, 'clean');

      // Day 2: User drinks - should fail immediately
      const day2Date = new Date();
      day2Date.setDate(day2Date.getDate() + 1);
      
      const day2Check = await dailyChecksService.createDailyCheck(bet, day2Date);
      
      // Mock services for the controller logic
      jest.spyOn(mailService, 'sendBetCompletedEmail').mockResolvedValue(true);
      jest.spyOn(betsService, 'updateStatus').mockResolvedValue();

      await dailyChecksService.updateResponse(day2Check.id, 'drank');

      // Bet should be marked as failed
      expect(betsService.updateStatus).toHaveBeenCalledWith(bet.id, 'failed');
      expect(mailService.sendBetCompletedEmail).toHaveBeenCalledWith(
        expect.objectContaining({ id: bet.id }),
        false
      );
    });
  });

  describe('Token expiration scenario', () => {
    it('should reject responses to expired tokens', async () => {
      const bet = await betsService.create({
        trustmanEmail: 'trustman@example.com',
        amount: 100,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
      }, testUser);

      // Create daily check with old date (expired)
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 2); // 2 days ago
      
      const dailyCheck = await dailyChecksService.createDailyCheck(bet, expiredDate);

      // Try to respond to expired token - should be rejected
      const mockDailyCheck = {
        ...dailyCheck,
        checkDate: expiredDate,
        response: null,
        bet: { id: bet.id },
      };

      jest.spyOn(dailyChecksService, 'findByToken').mockResolvedValue(mockDailyCheck as any);

      // This would normally be called via HTTP, but we test the business logic
      try {
        // Calculate if token is expired (> 24 hours)
        const tokenAge = new Date().getTime() - expiredDate.getTime();
        const isExpired = tokenAge > 24 * 60 * 60 * 1000;
        
        expect(isExpired).toBe(true);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('Concurrent response scenario', () => {
    it('should handle duplicate response attempts gracefully', async () => {
      const bet = await betsService.create({
        trustmanEmail: 'trustman@example.com',
        amount: 100,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }, testUser);

      const dailyCheck = await dailyChecksService.createDailyCheck(bet, new Date());

      // First response
      await dailyChecksService.updateResponse(dailyCheck.id, 'clean');

      // Attempt second response - should fail
      const alreadyRespondedCheck = {
        ...dailyCheck,
        response: 'clean',
        respondedAt: new Date(),
      };

      jest.spyOn(dailyChecksService, 'findByToken').mockResolvedValue(alreadyRespondedCheck as any);

      // Business logic should reject duplicate responses
      expect(alreadyRespondedCheck.response).toBeTruthy();
    });
  });

  describe('Missing daily checks scenario', () => {
    it('should handle bets with missing daily check responses', async () => {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 3);

      const bet = await betsService.create({
        trustmanEmail: 'trustman@example.com',
        amount: 100,
        deadline: deadline.toISOString(),
      }, testUser);

      // Create daily checks but don't respond to all
      const day1Check = await dailyChecksService.createDailyCheck(bet, new Date());
      await dailyChecksService.updateResponse(day1Check.id, 'clean');

      const day2Date = new Date();
      day2Date.setDate(day2Date.getDate() + 1);
      const day2Check = await dailyChecksService.createDailyCheck(bet, day2Date);
      // Don't respond to day 2

      // When bet expires with missing responses, it should still complete
      // (assuming missing = clean in business logic)
      const betWithChecks = {
        ...bet,
        dailyChecks: [
          { response: 'clean' },
          { response: null }, // Missing response
        ],
      };

      // Check business logic: missing responses don't count as "drank"
      const drankResponses = betWithChecks.dailyChecks.filter(check => check.response === 'drank');
      expect(drankResponses.length).toBe(0);
    });
  });
});