import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthGuard as CustomAuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // Successful authentication, redirect to frontend
    const frontendUrl = this.configService.get<string>("app.urls.frontend");
    res.redirect(`${frontendUrl}/dashboard`);
  }

  @Get("profile")
  @UseGuards(CustomAuthGuard)
  async getProfile(@Req() req) {
    return req.user;
  }

  @Post("logout")
  async logout(@Req() req, @Res() res) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Session destruction failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    });
  }
}
