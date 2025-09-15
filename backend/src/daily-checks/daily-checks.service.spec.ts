import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DailyChecksService } from "./daily-checks.service";
import { DailyCheck } from "./daily-check.entity";
import { Bet } from "../bets/bet.entity";
import { User } from "../users/user.entity";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid-token"),
}));

describe("DailyChecksService", () => {
  let service: DailyChecksService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    googleId: "google123",
    createdAt: new Date(),
    bets: [],
  };

  const mockBet: Bet = {
    id: 1,
    user: mockUser,
    trustmanEmail: "trustman@example.com",
    amount: 100,
    deadline: new Date("2024-12-31"),
    status: "active",
    createdAt: new Date(),
    dailyChecks: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyChecksService,
        {
          provide: getRepositoryToken(DailyCheck),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DailyChecksService>(DailyChecksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createDailyCheck", () => {
    it("should create new daily check with UUID token", async () => {
      const checkDate = new Date("2024-01-15");
      mockRepository.findOne.mockResolvedValue(null); // No existing check

      const mockDailyCheck = {
        id: 1,
        bet: mockBet,
        checkDate,
        responseToken: "mock-uuid-token",
        response: null,
        respondedAt: null,
        emailSentAt: null,
      };

      mockRepository.create.mockReturnValue(mockDailyCheck);
      mockRepository.save.mockResolvedValue(mockDailyCheck);

      const result = await service.createDailyCheck(mockBet, checkDate);

      expect(mockRepository.create).toHaveBeenCalledWith({
        bet: mockBet,
        checkDate,
        responseToken: "mock-uuid-token",
      });
      expect(result).toEqual(mockDailyCheck);
    });

    it("should return existing daily check if already created", async () => {
      const checkDate = new Date("2024-01-15");
      const existingCheck = {
        id: 1,
        bet: mockBet,
        checkDate,
        responseToken: "existing-token",
      };

      mockRepository.findOne.mockResolvedValue(existingCheck);

      const result = await service.createDailyCheck(mockBet, checkDate);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingCheck);
    });
  });

  describe("updateResponse", () => {
    it("should update daily check with clean response", async () => {
      const mockDailyCheck = {
        id: 1,
        bet: mockBet,
        response: null,
        respondedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(mockDailyCheck);

      const updatedCheck = {
        ...mockDailyCheck,
        response: "clean",
        respondedAt: new Date(),
      };
      mockRepository.save.mockResolvedValue(updatedCheck);

      const result = await service.updateResponse(1, "clean");

      expect(result.response).toBe("clean");
      expect(result.respondedAt).toBeInstanceOf(Date);
    });

    it("should update daily check with drank response", async () => {
      const mockDailyCheck = {
        id: 1,
        bet: mockBet,
        response: null,
        respondedAt: null,
      };

      mockRepository.findOne.mockResolvedValue(mockDailyCheck);

      const updatedCheck = {
        ...mockDailyCheck,
        response: "drank",
        respondedAt: new Date(),
      };
      mockRepository.save.mockResolvedValue(updatedCheck);

      const result = await service.updateResponse(1, "drank");

      expect(result.response).toBe("drank");
      expect(result.respondedAt).toBeInstanceOf(Date);
    });

    it("should throw error if daily check not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateResponse(999, "clean")).rejects.toThrow(
        "Daily check not found",
      );
    });
  });

  describe("findByToken", () => {
    it("should find daily check by response token", async () => {
      const mockDailyCheck = {
        id: 1,
        responseToken: "test-token",
        bet: mockBet,
      };

      mockRepository.findOne.mockResolvedValue(mockDailyCheck);

      const result = await service.findByToken("test-token");

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { responseToken: "test-token" },
        relations: ["bet", "bet.user"],
      });
      expect(result).toEqual(mockDailyCheck);
    });

    it("should return null for invalid token", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByToken("invalid-token");

      expect(result).toBeNull();
    });
  });

  describe("findPendingChecks", () => {
    it("should return daily checks without response or email sent", async () => {
      const pendingChecks = [
        {
          id: 1,
          response: null,
          emailSentAt: null,
          bet: mockBet,
        },
        {
          id: 2,
          response: null,
          emailSentAt: null,
          bet: mockBet,
        },
      ];

      mockRepository.find.mockResolvedValue(pendingChecks);

      const result = await service.findPendingChecks();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          response: null,
          emailSentAt: null,
        },
        relations: ["bet", "bet.user"],
      });
      expect(result).toEqual(pendingChecks);
    });
  });

  describe("markEmailSent", () => {
    it("should update email sent timestamp", async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.markEmailSent(1);

      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        emailSentAt: expect.any(Date),
      });
    });
  });
});
