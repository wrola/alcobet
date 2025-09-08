import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(googleProfile: any): Promise<User> {
    const { id, emails, displayName } = googleProfile;
    const email = emails[0].value;

    return this.usersService.findOrCreate({
      googleId: id,
      email,
      name: displayName,
    });
  }
}