import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { User } from "../src/users/user.entity";
import { Bet } from "../src/bets/bet.entity";
import { DailyCheck } from "../src/daily-checks/daily-check.entity";

describe("Bets API (e2e)", () => {
  let app: INestApplication;
  let mockUser: User;

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

    // Mock session middleware for testing
    app.use((req, res, next) => {
      req.user = mockUser;
      req.isAuthenticated = () => !!req.user;
      next();
    });

    await app.init();

    // Create test user
    const userRepo = app.get("UserRepository");
    mockUser = await userRepo.save({
      email: "test@example.com",
      name: "Test User",
      googleId: "google123",
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/bets (POST)", () => {
    it("should create a new bet", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const createBetDto = {
        trustmanEmail: "trustman@example.com",
        amount: 100,
        deadline: tomorrow.toISOString(),
      };

      return request(app.getHttpServer())
        .post("/bets")
        .send(createBetDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.trustmanEmail).toBe(createBetDto.trustmanEmail);
          expect(res.body.amount).toBe(createBetDto.amount);
          expect(res.body.status).toBe("active");
        });
    });

    it("should reject bet with past deadline", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const createBetDto = {
        trustmanEmail: "trustman@example.com",
        amount: 100,
        deadline: yesterday.toISOString(),
      };

      return request(app.getHttpServer())
        .post("/bets")
        .send(createBetDto)
        .expect(403);
    });

    it("should validate required fields", () => {
      return request(app.getHttpServer()).post("/bets").send({}).expect(400);
    });

    it("should validate email format", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const createBetDto = {
        trustmanEmail: "invalid-email",
        amount: 100,
        deadline: tomorrow.toISOString(),
      };

      return request(app.getHttpServer())
        .post("/bets")
        .send(createBetDto)
        .expect(400);
    });

    it("should validate minimum amount", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const createBetDto = {
        trustmanEmail: "trustman@example.com",
        amount: 0,
        deadline: tomorrow.toISOString(),
      };

      return request(app.getHttpServer())
        .post("/bets")
        .send(createBetDto)
        .expect(400);
    });
  });

  describe("/bets (GET)", () => {
    it("should return user bets", () => {
      return request(app.getHttpServer())
        .get("/bets")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe("/bets/:id (GET)", () => {
    it("should return specific bet for authenticated user", async () => {
      // First create a bet
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const createResponse = await request(app.getHttpServer())
        .post("/bets")
        .send({
          trustmanEmail: "trustman@example.com",
          amount: 100,
          deadline: tomorrow.toISOString(),
        });

      const betId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/bets/${betId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(betId);
          expect(res.body.trustmanEmail).toBe("trustman@example.com");
        });
    });

    it("should return 404 for non-existent bet", () => {
      return request(app.getHttpServer()).get("/bets/999").expect(404);
    });
  });
});
