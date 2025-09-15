import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Bet } from "../bets/bet.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  googleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Bet, (bet) => bet.user)
  bets: Bet[];
}
