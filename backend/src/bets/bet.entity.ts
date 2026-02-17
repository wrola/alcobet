import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "../users/user.entity";
import { DailyCheck } from "../daily-checks/daily-check.entity";

@Entity()
export class Bet {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.bets)
  user!: User;

  @Column()
  trustmanEmail!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;

  @Column("date")
  deadline!: Date;

  @Column({ default: "active" })
  status!: "active" | "completed" | "failed";

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => DailyCheck, (check) => check.bet)
  dailyChecks!: DailyCheck[];
}
