import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DailyChecksService } from "../daily-checks/daily-checks.service";
import { BetsService } from "../bets/bets.service";
import { MailService } from "../mail/mail.service";

@Controller("trustman")
export class TrustmanController {
  constructor(
    private readonly dailyChecksService: DailyChecksService,
    private readonly betsService: BetsService,
    private readonly mailService: MailService,
  ) {}

  @Get("response/:token")
  async getResponsePage(
    @Param("token") token: string,
    @Query("response") response?: string,
  ) {
    const dailyCheck = await this.dailyChecksService.findByToken(token);

    if (!dailyCheck) {
      throw new NotFoundException("Invalid or expired token");
    }

    if (dailyCheck.response) {
      return {
        message: "Response already recorded",
        previousResponse: dailyCheck.response,
        respondedAt: dailyCheck.respondedAt,
      };
    }

    // Check if token is expired (24 hours)
    const tokenAge = new Date().getTime() - dailyCheck.checkDate.getTime();
    if (tokenAge > 24 * 60 * 60 * 1000) {
      throw new BadRequestException("Token has expired");
    }

    // If response is provided via query param (from email links)
    if (response && (response === "clean" || response === "drank")) {
      return this.submitResponse(token, { response });
    }

    return {
      userName: dailyCheck.bet.user.name,
      checkDate: dailyCheck.checkDate,
      betAmount: dailyCheck.bet.amount,
      deadline: dailyCheck.bet.deadline,
    };
  }

  @Post("response/:token")
  async submitResponse(
    @Param("token") token: string,
    @Body() body: { response: "clean" | "drank" },
  ) {
    const dailyCheck = await this.dailyChecksService.findByToken(token);

    if (!dailyCheck) {
      throw new NotFoundException("Invalid or expired token");
    }

    if (dailyCheck.response) {
      throw new BadRequestException("Response already recorded");
    }

    // Check if token is expired (24 hours)
    const tokenAge = new Date().getTime() - dailyCheck.checkDate.getTime();
    if (tokenAge > 24 * 60 * 60 * 1000) {
      throw new BadRequestException("Token has expired");
    }

    const updatedCheck = await this.dailyChecksService.updateResponse(
      dailyCheck.id,
      body.response,
    );

    // If user drank, mark bet as failed
    if (body.response === "drank") {
      await this.betsService.updateStatus(dailyCheck.bet.id, "failed");
      await this.mailService.sendBetCompletedEmail(dailyCheck.bet, false);
    }

    return {
      message: "Response recorded successfully",
      response: updatedCheck.response,
      respondedAt: updatedCheck.respondedAt,
    };
  }
}
