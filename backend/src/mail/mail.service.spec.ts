import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "@nestjs-modules/mailer";
import { MailService } from "./mail.service";
import { DailyCheck } from "../daily-checks/daily-check.entity";
import { Bet } from "../bets/bet.entity";
import { User } from "../users/user.entity";

describe("MailService", () => {
  let service: MailService;
  let mailerService: MailerService;
  let configService: ConfigService;

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

  const mockDailyCheck: DailyCheck = {
    id: 1,
    bet: mockBet,
    checkDate: new Date("2024-01-15"),
    response: null,
    responseToken: "test-token-123",
    respondedAt: null,
    emailSentAt: null,
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "app.urls.backend") return "http://localhost:3000";
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("sendDailyCheckEmail", () => {
    it("should send daily check email with correct template and context", async () => {
      mockMailerService.sendMail.mockResolvedValue({ messageId: "test-id" });

      const result = await service.sendDailyCheckEmail(mockDailyCheck);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: "trustman@example.com",
        subject: "Daily Check: Is Test User staying alcohol-free?",
        template: "daily-check",
        context: expect.objectContaining({
          userName: "Test User",
          amount: 100,
          token: "test-token-123",
          checkDate: "2024-01-15",
          deadline: "2024-12-31",
          baseUrl: "http://localhost:3000",
        }),
      });
      expect(result).toBe(true);
    });

    it("should return false and log error if email sending fails", async () => {
      mockMailerService.sendMail.mockRejectedValue(
        new Error("SMTP connection failed"),
      );

      const result = await service.sendDailyCheckEmail(mockDailyCheck);

      expect(result).toBe(false);
    });
  });

  describe("sendBetCompletedEmail", () => {
    it("should send success email when bet is completed successfully", async () => {
      mockMailerService.sendMail.mockResolvedValue({ messageId: "test-id" });

      const result = await service.sendBetCompletedEmail(mockBet, true);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: "trustman@example.com",
        subject: "Congratulations! Test User completed their commitment",
        html: expect.stringContaining(
          "Test User successfully completed their alcohol abstinence commitment",
        ),
      });
      expect(result).toBe(true);
    });

    it("should send failure email when bet fails", async () => {
      mockMailerService.sendMail.mockResolvedValue({ messageId: "test-id" });

      const result = await service.sendBetCompletedEmail(mockBet, false);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: "trustman@example.com",
        subject: "Test User's commitment ended",
        html: expect.stringContaining(
          "Test User's alcohol abstinence commitment ended",
        ),
      });
      expect(result).toBe(true);
    });

    it("should return false if email sending fails", async () => {
      mockMailerService.sendMail.mockRejectedValue(new Error("Email failed"));

      const result = await service.sendBetCompletedEmail(mockBet, true);

      expect(result).toBe(false);
    });
  });

  describe("sendBetCreatedNotification", () => {
    it("should send bet created notification", async () => {
      mockMailerService.sendMail.mockResolvedValue({ messageId: "test-id" });

      const result = await service.sendBetCreatedNotification(
        "trustman@example.com",
        "Test User",
        100,
        "2024-12-31",
      );

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: "trustman@example.com",
        subject: "You've been chosen as a trustman for Test User",
        html: expect.stringContaining(
          "has committed $100 to quit drinking until",
        ),
      });
      expect(result).toBe(true);
    });
  });
});
