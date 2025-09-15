import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { User } from "./user.entity";

describe("UsersService", () => {
  let service: UsersService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserData = {
    email: "test@example.com",
    name: "Test User",
    googleId: "google123",
  };

  const mockUser: User = {
    id: 1,
    ...mockUserData,
    createdAt: new Date(),
    bets: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findOrCreate", () => {
    it("should return existing user if found by Google ID", async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOrCreate(mockUserData);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { googleId: "google123" },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should create new user if not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.findOrCreate(mockUserData);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { googleId: "google123" },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(mockUserData);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe("findByGoogleId", () => {
    it("should find user by Google ID", async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByGoogleId("google123");

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { googleId: "google123" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByGoogleId("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should find user by email", async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail("test@example.com");

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("findById", () => {
    it("should find user by ID", async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
