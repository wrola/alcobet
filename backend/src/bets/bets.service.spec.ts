import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';
import { BetsService } from './bets.service';
import { Bet } from './bet.entity';
import { User } from '../users/user.entity';

describe('BetsService', () => {
  let service: BetsService;
  let repository: Repository<Bet>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    googleId: 'google123',
    createdAt: new Date(),
    bets: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BetsService,
        {
          provide: getRepositoryToken(Bet),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BetsService>(BetsService);
    repository = module.get<Repository<Bet>>(getRepositoryToken(Bet));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a bet with valid future deadline', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const createBetDto = {
        trustmanEmail: 'trustman@example.com',
        amount: 100,
        deadline: tomorrow.toISOString(),
      };

      const mockBet = { id: 1, ...createBetDto, user: mockUser };
      mockRepository.create.mockReturnValue(mockBet);
      mockRepository.save.mockResolvedValue(mockBet);

      const result = await service.create(createBetDto, mockUser);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createBetDto,
        deadline: tomorrow,
        user: mockUser,
      });
      expect(result).toEqual(mockBet);
    });

    it('should reject bet with past deadline', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const createBetDto = {
        trustmanEmail: 'trustman@example.com',
        amount: 100,
        deadline: yesterday.toISOString(),
      };

      await expect(service.create(createBetDto, mockUser))
        .rejects.toThrow(ForbiddenException);
    });

    it('should reject bet with today as deadline', async () => {
      const today = new Date();
      
      const createBetDto = {
        trustmanEmail: 'trustman@example.com',
        amount: 100,
        deadline: today.toISOString(),
      };

      await expect(service.create(createBetDto, mockUser))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('findExpiredBets', () => {
    it('should return bets past their deadline', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const expiredBet = {
        id: 1,
        deadline: yesterday,
        status: 'active',
        user: mockUser,
        dailyChecks: [],
      };

      const activeBet = {
        id: 2,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        status: 'active',
        user: mockUser,
        dailyChecks: [],
      };

      mockRepository.find.mockResolvedValue([expiredBet, activeBet]);

      const result = await service.findExpiredBets();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('should update bet status', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateStatus(1, 'completed');

      expect(mockRepository.update).toHaveBeenCalledWith(1, { status: 'completed' });
    });
  });

  describe('findByUser', () => {
    it('should return user bets with daily checks ordered by creation date', async () => {
      const mockBets = [
        { id: 1, user: mockUser, dailyChecks: [] },
        { id: 2, user: mockUser, dailyChecks: [] },
      ];

      mockRepository.find.mockResolvedValue(mockBets);

      const result = await service.findByUser(1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['dailyChecks'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockBets);
    });
  });

  describe('findByIdAndUser', () => {
    it('should return bet for specific user', async () => {
      const mockBet = { id: 1, user: mockUser, dailyChecks: [] };
      mockRepository.findOne.mockResolvedValue(mockBet);

      const result = await service.findByIdAndUser(1, 1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user: { id: 1 } },
        relations: ['dailyChecks'],
      });
      expect(result).toEqual(mockBet);
    });

    it('should return null for bet not belonging to user', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByIdAndUser(1, 999);

      expect(result).toBeNull();
    });
  });
});