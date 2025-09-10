import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyCheck } from './daily-check.entity';
import { Bet } from '../bets/bet.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DailyChecksService {
  constructor(
    @InjectRepository(DailyCheck)
    private dailyChecksRepository: Repository<DailyCheck>,
  ) {}

  async createDailyCheck(bet: Bet, checkDate: Date): Promise<DailyCheck> {
    const existingCheck = await this.findByBetAndDate(bet.id, checkDate);
    if (existingCheck) {
      return existingCheck;
    }

    const dailyCheck = this.dailyChecksRepository.create({
      bet,
      checkDate,
      responseToken: uuidv4(),
    });

    return this.dailyChecksRepository.save(dailyCheck);
  }

  async findByBetAndDate(betId: number, date: Date): Promise<DailyCheck | null> {
    return this.dailyChecksRepository.findOne({
      where: {
        bet: { id: betId },
        checkDate: date,
      },
      relations: ['bet'],
    });
  }

  async findByToken(token: string): Promise<DailyCheck | null> {
    return this.dailyChecksRepository.findOne({
      where: { responseToken: token },
      relations: ['bet', 'bet.user'],
    });
  }

  async updateResponse(
    dailyCheckId: number,
    response: 'clean' | 'drank',
  ): Promise<DailyCheck> {
    const dailyCheck = await this.dailyChecksRepository.findOne({
      where: { id: dailyCheckId },
      relations: ['bet'],
    });

    if (!dailyCheck) {
      throw new Error('Daily check not found');
    }

    dailyCheck.response = response;
    dailyCheck.respondedAt = new Date();

    return this.dailyChecksRepository.save(dailyCheck);
  }

  async markEmailSent(dailyCheckId: number): Promise<void> {
    await this.dailyChecksRepository.update(dailyCheckId, {
      emailSentAt: new Date(),
    });
  }

  async findPendingChecks(): Promise<DailyCheck[]> {
    return this.dailyChecksRepository.find({
      where: {
        response: null,
        emailSentAt: null,
      },
      relations: ['bet', 'bet.user'],
    });
  }
}