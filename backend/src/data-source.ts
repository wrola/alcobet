import { DataSource } from "typeorm";
import { User } from "./users/user.entity";
import { Bet } from "./bets/bet.entity";
import { DailyCheck } from "./daily-checks/daily-check.entity";

export default new DataSource({
  type: "sqlite",
  database: process.env.DATABASE_URL ?? "./database.sqlite",
  entities: [User, Bet, DailyCheck],
  migrations: ["src/migrations/*.ts"],
});
