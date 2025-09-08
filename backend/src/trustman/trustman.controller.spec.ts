import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TrustmanController } from './trustman.controller';
import { DailyChecksService } from '../daily-checks/daily-checks.service';
import { BetsService } from '../bets/bets.service';
import { MailService } from '../mail/mail.service';

describe('TrustmanController', () => {
  let controller: TrustmanController;
  let dailyChecksService: DailyChecksService;
  let betsService: BetsService;
  let mailService: MailService;

  const mockDailyChecksService = {
    findByToken: jest.fn(),
    updateResponse: jest.fn(),
  };

  const mockBetsService = {
    updateStatus: jest.fn(),
  };

  const mockMailService = {
    sendBetCompletedEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrustmanController],
      providers: [
        {
          provide: DailyChecksService,
          useValue: mockDailyChecksService,
        },
        {
          provide: BetsService,
          useValue: mockBetsService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    controller = module.get<TrustmanController>(TrustmanController);
    dailyChecksService = module.get<DailyChecksService>(DailyChecksService);
    betsService = module.get<BetsService>(BetsService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getResponsePage', () => {
    it('should throw NotFoundException for invalid token', async () => {
      mockDailyChecksService.findByToken.mockResolvedValue(null);

      await expect(controller.getResponsePage('invalid-token'))
        .rejects.toThrow(NotFoundException);
    });

    it('should return already responded message if response exists', async () => {
      const respondedCheck = {
        id: 1,
        response: 'clean',
        respondedAt: new Date(),
        checkDate: new Date(),
      };

      mockDailyChecksService.findByToken.mockResolvedValue(respondedCheck);

      const result = await controller.getResponsePage('valid-token');

      expect(result.message).toBe('Response already recorded');
      expect((result as any).previousResponse).toBe('clean');
    });

    it('should throw BadRequestException for expired token', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2); // 2 days ago (expired)

      const expiredCheck = {
        id: 1,
        response: null,
        checkDate: yesterday,
        bet: { user: { name: 'Test User' } },
      };

      mockDailyChecksService.findByToken.mockResolvedValue(expiredCheck);

      await expect(controller.getResponsePage('expired-token'))
        .rejects.toThrow(BadRequestException);
    });

    it('should return bet details for valid fresh token', async () => {
      const today = new Date();
      const validCheck = {
        id: 1,
        response: null,
        checkDate: today,
        bet: {
          user: { name: 'Test User' },
          amount: 100,
          deadline: new Date('2024-12-31'),
        },
      };

      mockDailyChecksService.findByToken.mockResolvedValue(validCheck);

      const result = await controller.getResponsePage('valid-token');

      expect((result as any).userName).toBe('Test User');
      expect((result as any).betAmount).toBe(100);
      expect((result as any).checkDate).toBe(today);
    });
  });

  describe('submitResponse', () => {
    it('should record clean response successfully', async () => {
      const today = new Date();
      const validCheck = {
        id: 1,
        response: null,
        checkDate: today,
        bet: { id: 1, user: { name: 'Test User' } },
      };

      const updatedCheck = {
        ...validCheck,
        response: 'clean',
        respondedAt: new Date(),
      };

      mockDailyChecksService.findByToken.mockResolvedValue(validCheck);
      mockDailyChecksService.updateResponse.mockResolvedValue(updatedCheck);

      const result = await controller.submitResponse('valid-token', { response: 'clean' });

      expect(result.message).toBe('Response recorded successfully');
      expect(result.response).toBe('clean');
      expect(betsService.updateStatus).not.toHaveBeenCalled(); // Should not mark as failed for clean response
    });

    it('should record drank response and mark bet as failed', async () => {
      const today = new Date();
      const validCheck = {
        id: 1,
        response: null,
        checkDate: today,
        bet: { id: 1, user: { name: 'Test User' } },
      };

      const updatedCheck = {
        ...validCheck,
        response: 'drank',
        respondedAt: new Date(),
      };

      mockDailyChecksService.findByToken.mockResolvedValue(validCheck);
      mockDailyChecksService.updateResponse.mockResolvedValue(updatedCheck);

      const result = await controller.submitResponse('valid-token', { response: 'drank' });

      expect(result.response).toBe('drank');
      expect(betsService.updateStatus).toHaveBeenCalledWith(1, 'failed');
      expect(mailService.sendBetCompletedEmail).toHaveBeenCalledWith(validCheck.bet, false);
    });

    it('should reject duplicate response submission', async () => {
      const respondedCheck = {
        id: 1,
        response: 'clean',
        checkDate: new Date(),
      };

      mockDailyChecksService.findByToken.mockResolvedValue(respondedCheck);

      await expect(controller.submitResponse('valid-token', { response: 'clean' }))
        .rejects.toThrow(BadRequestException);
    });
  });
});