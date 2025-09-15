import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Bet } from "../bets/bet.entity";

@Entity()
export class DailyCheck {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Bet, (bet) => bet.dailyChecks)
  bet: Bet;

  @Column("date")
  checkDate: Date;

  @Column({ nullable: true })
  response: "clean" | "drank" | null;

  @Column({ nullable: true })
  responseToken: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @Column({ nullable: true })
  emailSentAt: Date;
}
