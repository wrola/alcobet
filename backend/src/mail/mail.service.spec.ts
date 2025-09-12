import { Test, TestingModule } from "@nestjs/testing";
import { MailService } from "./mail.service";
import { DailyCheck } from "../daily-checks/daily-check.entity";
import { Bet } from "../bets/bet.entity";
import { User } from "../users/user.entity";

describe("MailService", () => {
  let service: MailService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);

    // Mock the transporter
    service["transporter"] = {
      sendMail: jest.fn(),
    } as any;

    // Mock environment variable
    process.env.BACKEND_URL = "http://localhost:3000";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("sendDailyCheckEmail", () => {
    it("should send daily check email with correct HTML content", async () => {
      const mockTransporter = service["transporter"];
      mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

      const result = await service.sendDailyCheckEmail(mockDailyCheck);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: "trustman@example.com",
        subject: "Daily Check: Test User - 2024-01-15",
        html: expect.stringContaining("Did Test User drink alcohol yesterday?"),
      });
      expect(result).toBe(true);
    });

    it("should return false and log error if email sending fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockTransporter = service["transporter"];
      mockTransporter.sendMail.mockRejectedValue(
        new Error("SMTP connection failed"),
      );

      const result = await service.sendDailyCheckEmail(mockDailyCheck);

      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe("sendBetCompletedEmail", () => {
    it("should send success email when bet is completed successfully", async () => {
      const mockTransporter = service["transporter"];
      mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

      const result = await service.sendBetCompletedEmail(mockBet, true);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: "trustman@example.com",
        subject: "Congratulations! Test User completed their commitment",
        html: expect.stringContaining(
          "Test User successfully completed their alcohol abstinence commitment",
        ),
      });
      expect(result).toBe(true);
    });

    it("should send failure email when bet fails", async () => {
      const mockTransporter = service["transporter"];
      mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

      const result = await service.sendBetCompletedEmail(mockBet, false);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: "trustman@example.com",
        subject: "Test User's commitment ended",
        html: expect.stringContaining(
          "Test User's alcohol abstinence commitment ended",
        ),
      });
      expect(result).toBe(true);
    });

    it("should return false if email sending fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockTransporter = service["transporter"];
      mockTransporter.sendMail.mockRejectedValue(new Error("Email failed"));

      const result = await service.sendBetCompletedEmail(mockBet, true);

      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});
