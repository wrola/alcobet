import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.entity";

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (error: any, user?: any) => void) {
    done(null, user.id);
  }

  async deserializeUser(
    userId: number,
    done: (error: any, user?: any) => void,
  ) {
    try {
      const user = await this.usersService.findById(userId);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
