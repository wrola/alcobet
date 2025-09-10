import { Test, TestingModule } from '@nestjs/testing';
import { DailyEmailService } from './daily-email.service';
import { BetsService } from '../bets/bets.service';
import { DailyChecksService } from '../daily-checks/daily-checks.service';
import { MailService } from '../mail/mail.service';
import { Bet } from '../bets/bet.entity';
import { User } from '../users/user.entity';
import { DailyCheck } from '../daily-checks/daily-check.entity';

describe('DailyEmailService', () => {
  let service: DailyEmailService;
  let betsService: BetsService;
  let dailyChecksService: DailyChecksService;
  let mailService: MailService;

  const mockBetsService = {
    findActiveBets: jest.fn(),
    findExpiredBets: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockDailyChecksService = {
    createDailyCheck: jest.fn(),
    markEmailSent: jest.fn(),
  };

  const mockMailService = {
    sendDailyCheckEmail: jest.fn(),
    sendBetCompletedEmail: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    googleId: 'google123',
    createdAt: new Date(),
    bets: [],
  };

  const mockBet: Bet = {
    id: 1,
    user: mockUser,
    trustmanEmail: 'trustman@example.com',
    amount: 100,
    deadline: new Date('2024-12-31'),
    status: 'active',
    createdAt: new Date(),
    dailyChecks: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyEmailService,
        {
          provide: BetsService,
          useValue: mockBetsService,
        },
        {
          provide: DailyChecksService,
          useValue: mockDailyChecksService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<DailyEmailService>(DailyEmailService);
    betsService = module.get<BetsService>(BetsService);
    dailyChecksService = module.get<DailyChecksService>(DailyChecksService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendDailyChecks', () => {
    it('should process active bets and send emails', async () => {
      const mockDailyCheck: DailyCheck = {
        id: 1,
        bet: mockBet,
        checkDate: new Date(),
        response: null,
        responseToken: 'token123',
        respondedAt: null,
        emailSentAt: null,
      };

      mockBetsService.findActiveBets.mockResolvedValue([mockBet]);
      mockDailyChecksService.createDailyCheck.mockResolvedValue(mockDailyCheck);
      mockMailService.sendDailyCheckEmail.mockResolvedValue(true);
      mockBetsService.findExpiredBets.mockResolvedValue([]);

      await service.sendDailyChecks();

      expect(betsService.findActiveBets).toHaveBeenCalled();
      expect(dailyChecksService.createDailyCheck).toHaveBeenCalledWith(
        mockBet,
        expect.any(Date),
      );
      expect(mailService.sendDailyCheckEmail).toHaveBeenCalledWith(mockDailyCheck);
      expect(dailyChecksService.markEmailSent).toHaveBeenCalledWith(1);
    });

    it('should skip sending email if already sent', async () => {
      const sentDailyCheck: DailyCheck = {
        id: 1,
        bet: mockBet,
        checkDate: new Date(),
        response: null,
        responseToken: 'token123',
        respondedAt: null,
        emailSentAt: new Date(),
      };

      mockBetsService.findActiveBets.mockResolvedValue([mockBet]);
      mockDailyChecksService.createDailyCheck.mockResolvedValue(sentDailyCheck);
      mockBetsService.findExpiredBets.mockResolvedValue([]);

      await service.sendDailyChecks();

      expect(mailService.sendDailyCheckEmail).not.toHaveBeenCalled();
      expect(dailyChecksService.markEmailSent).not.toHaveBeenCalled();
    });

    it('should handle email sending failures gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockDailyCheck: DailyCheck = {
        id: 1,
        bet: mockBet,
        checkDate: new Date(),
        response: null,
        responseToken: 'token123',
        respondedAt: null,
        emailSentAt: null,
      };

      mockBetsService.findActiveBets.mockResolvedValue([mockBet]);
      mockDailyChecksService.createDailyCheck.mockResolvedValue(mockDailyCheck);
      mockMailService.sendDailyCheckEmail.mockResolvedValue(false);
      mockBetsService.findExpiredBets.mockResolvedValue([]);

      await service.sendDailyChecks();

      expect(dailyChecksService.markEmailSent).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('checkExpiredBets', () => {
    it('should mark clean bets as completed when expired', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const cleanDailyChecks = [
        { response: 'clean', checkDate: yesterday },
        { response: 'clean', checkDate: new Date() },
      ];

      const expiredBet = {
        ...mockBet,
        deadline: yesterday,
        dailyChecks: cleanDailyChecks,
      };

      mockBetsService.findExpiredBets.mockResolvedValue([expiredBet]);

      await service.sendDailyChecks();

      expect(betsService.updateStatus).toHaveBeenCalledWith(1, 'completed');
      expect(mailService.sendBetCompletedEmail).toHaveBeenCalledWith(expiredBet, true);
    });

    it('should not change status of already failed bets', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const failedDailyChecks = [
        { response: 'clean', checkDate: yesterday },
        { response: 'drank', checkDate: new Date() },
      ];

      const expiredBet = {
        ...mockBet,
        deadline: yesterday,
        dailyChecks: failedDailyChecks,
      };

      mockBetsService.findExpiredBets.mockResolvedValue([expiredBet]);

      await service.sendDailyChecks();

      expect(betsService.updateStatus).not.toHaveBeenCalled();
      expect(mailService.sendBetCompletedEmail).not.toHaveBeenCalled();
    });
  });
});