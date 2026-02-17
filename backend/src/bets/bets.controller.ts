import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Param,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { Request } from "express";
import { BetsService } from "./bets.service";
import { CreateBetDto } from "./dto/create-bet.dto";
import { AuthGuard } from "../auth/auth.guard";

@Controller("bets")
@UseGuards(AuthGuard)
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  async createBet(@Body() createBetDto: CreateBetDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.betsService.create(createBetDto, user);
  }

  @Get()
  async getUserBets(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.betsService.findByUser(userId);
  }

  @Get(":id")
  async getBet(@Param("id") id: string, @Req() req: Request) {
    const betId = parseInt(id, 10);
    const userId = (req as any).user.id;

    const bet = await this.betsService.findByIdAndUser(betId, userId);
    if (!bet) {
      throw new NotFoundException("Bet not found");
    }

    return bet;
  }
}
