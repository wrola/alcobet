import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from './bet.entity';
import { User } from '../users/user.entity';
import { CreateBetDto } from './dto/create-bet.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(Bet)
    private betsRepository: Repository<Bet>,
    private readonly mailService: MailService,
  ) {}

  async create(createBetDto: CreateBetDto, user: User): Promise<Bet> {
    const deadline = new Date(createBetDto.deadline);
    
    if (deadline <= new Date()) {
      throw new ForbiddenException('Deadline must be in the future');
    }

    const bet = this.betsRepository.create({
      ...createBetDto,
      deadline,
      user,
    });

    const savedBet = await this.betsRepository.save(bet);

    // Send notification email to trustman
    try {
      await this.mailService.sendBetCreatedNotification(
        createBetDto.trustmanEmail,
        user.name,
        createBetDto.amount,
        createBetDto.deadline,
      );
    } catch (error) {
      console.error('Failed to send bet creation notification:', error);
      // Don't fail the bet creation if email fails
    }

    return savedBet;
  }

  async findByUser(userId: number): Promise<Bet[]> {
    return this.betsRepository.find({
      where: { user: { id: userId } },
      relations: ['dailyChecks'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Bet | null> {
    return this.betsRepository.findOne({
      where: { id },
      relations: ['user', 'dailyChecks'],
    });
  }

  async findByIdAndUser(id: number, userId: number): Promise<Bet | null> {
    return this.betsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['dailyChecks'],
    });
  }

  async updateStatus(betId: number, status: 'active' | 'completed' | 'failed'): Promise<void> {
    await this.betsRepository.update(betId, { status });
  }

  async findActiveBets(): Promise<Bet[]> {
    return this.betsRepository.find({
      where: { status: 'active' },
      relations: ['user', 'dailyChecks'],
    });
  }

  async findExpiredBets(): Promise<Bet[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.betsRepository.find({
      where: { status: 'active' },
      relations: ['user', 'dailyChecks'],
    }).then(bets => bets.filter(bet => bet.deadline < today));
  }
}