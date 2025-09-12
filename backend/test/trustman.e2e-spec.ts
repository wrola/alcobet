import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { User } from "../src/users/user.entity";
import { Bet } from "../src/bets/bet.entity";
import { DailyCheck } from "../src/daily-checks/daily-check.entity";
import { DailyChecksService } from "../src/daily-checks/daily-checks.service";
import { BetsService } from "../src/bets/bets.service";

describe("Trustman API (e2e)", () => {
  let app: INestApplication;
  let dailyChecksService: DailyChecksService;
  let betsService: BetsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [User, Bet, DailyCheck],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    dailyChecksService = app.get<DailyChecksService>(DailyChecksService);
    betsService = app.get<BetsService>(BetsService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/trustman/response/:token (GET)", () => {
    it("should return daily check details for valid token", async () => {
      // Create test data
      const user = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        googleId: "google123",
      };
      const bet = {
        id: 1,
        user,
        trustmanEmail: "trustman@example.com",
        amount: 100,
        deadline: new Date("2024-12-31"),
      };
      const dailyCheck = {
        id: 1,
        bet,
        checkDate: new Date(),
        responseToken: "valid-token-123",
        response: null,
      };

      jest
        .spyOn(dailyChecksService, "findByToken")
        .mockResolvedValue(dailyCheck as any);

      return request(app.getHttpServer())
        .get("/trustman/response/valid-token-123")
        .expect(200)
        .expect((res) => {
          expect(res.body.userName).toBe("Test User");
          expect(res.body.betAmount).toBe(100);
        });
    });

    it("should return 404 for invalid token", () => {
      jest.spyOn(dailyChecksService, "findByToken").mockResolvedValue(null);

      return request(app.getHttpServer())
        .get("/trustman/response/invalid-token")
        .expect(404);
    });

    it("should return already responded message if response exists", async () => {
      const respondedCheck = {
        id: 1,
        response: "clean",
        respondedAt: new Date(),
      };

      jest
        .spyOn(dailyChecksService, "findByToken")
        .mockResolvedValue(respondedCheck as any);

      return request(app.getHttpServer())
        .get("/trustman/response/responded-token")
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe("Response already recorded");
          expect(res.body.previousResponse).toBe("clean");
        });
    });

    it("should handle direct response via query parameter", async () => {
      const dailyCheck = {
        id: 1,
        bet: { user: { name: "Test User" } },
        checkDate: new Date(),
        response: null,
      };

      jest
        .spyOn(dailyChecksService, "findByToken")
        .mockResolvedValue(dailyCheck as any);
      jest
        .spyOn(dailyChecksService, "updateResponse")
        .mockResolvedValue({ response: "clean" } as any);

      return request(app.getHttpServer())
        .get("/trustman/response/valid-token?response=clean")
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe("Response recorded successfully");
          expect(res.body.response).toBe("clean");
        });
    });
  });

  describe("/trustman/response/:token (POST)", () => {
    it("should record clean response", async () => {
      const dailyCheck = {
        id: 1,
        bet: { id: 1, user: { name: "Test User" } },
        checkDate: new Date(),
        response: null,
      };

      const updatedCheck = {
        ...dailyCheck,
        response: "clean",
        respondedAt: new Date(),
      };

      jest
        .spyOn(dailyChecksService, "findByToken")
        .mockResolvedValue(dailyCheck as any);
      jest
        .spyOn(dailyChecksService, "updateResponse")
        .mockResolvedValue(updatedCheck as any);

      return request(app.getHttpServer())
        .post("/trustman/response/valid-token")
        .send({ response: "clean" })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe("Response recorded successfully");
          expect(res.body.response).toBe("clean");
        });
    });

    it("should record drank response and mark bet as failed", async () => {
      const dailyCheck = {
        id: 1,
        bet: { id: 1, user: { name: "Test User" } },
        checkDate: new Date(),
        response: null,
      };

      const updatedCheck = {
        ...dailyCheck,
        response: "drank",
        respondedAt: new Date(),
      };

      jest
        .spyOn(dailyChecksService, "findByToken")
        .mockResolvedValue(dailyCheck as any);
      jest
        .spyOn(dailyChecksService, "updateResponse")
        .mockResolvedValue(updatedCheck as any);
      jest.spyOn(betsService, "updateStatus").mockResolvedValue();

      return request(app.getHttpServer())
        .post("/trustman/response/valid-token")
        .send({ response: "drank" })
        .expect(201)
        .expect((res) => {
          expect(res.body.response).toBe("drank");
        });
    });

    it("should reject invalid response values", () => {
      const dailyCheck = {
        id: 1,
        checkDate: new Date(),
        response: null,
      };

      jest
        .spyOn(dailyChecksService, "findByToken")
        .mockResolvedValue(dailyCheck as any);

      return request(app.getHttpServer())
        .post("/trustman/response/valid-token")
        .send({ response: "invalid" })
        .expect(400);
    });

    it("should reject duplicate responses", async () => {
      const respondedCheck = {
        id: 1,
        checkDate: new Date(),
        response: "clean",
        respondedAt: new Date(),
      };

      jest
        .spyOn(dailyChecksService, "findByToken")
        .mockResolvedValue(respondedCheck as any);

      return request(app.getHttpServer())
        .post("/trustman/response/valid-token")
        .send({ response: "clean" })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe("Response already recorded");
        });
    });
  });
});
