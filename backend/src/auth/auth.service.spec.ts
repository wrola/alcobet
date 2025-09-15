import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.entity";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    findOrCreate: jest.fn(),
  };

  const mockGoogleProfile = {
    id: "google123",
    emails: [{ value: "test@example.com" }],
    displayName: "Test User",
  };

  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    googleId: "google123",
    createdAt: new Date(),
    bets: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    it("should validate user with Google profile and return user", async () => {
      mockUsersService.findOrCreate.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockGoogleProfile);

      expect(usersService.findOrCreate).toHaveBeenCalledWith({
        googleId: "google123",
        email: "test@example.com",
        name: "Test User",
      });
      expect(result).toEqual(mockUser);
    });

    it("should handle profile with multiple emails", async () => {
      const profileWithMultipleEmails = {
        ...mockGoogleProfile,
        emails: [
          { value: "primary@example.com" },
          { value: "secondary@example.com" },
        ],
      };

      mockUsersService.findOrCreate.mockResolvedValue(mockUser);

      await service.validateUser(profileWithMultipleEmails);

      expect(usersService.findOrCreate).toHaveBeenCalledWith({
        googleId: "google123",
        email: "primary@example.com", // Should use first email
        name: "Test User",
      });
    });
  });
});
