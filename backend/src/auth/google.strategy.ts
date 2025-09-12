import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>("app.google.clientId"),
      clientSecret: configService.get<string>("app.google.clientSecret"),
      callbackURL: "/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName } = profile;
    const email = emails[0].value;

    const user = await this.usersService.findOrCreate({
      googleId: id,
      email,
      name: displayName,
    });

    done(null, user);
  }
}
