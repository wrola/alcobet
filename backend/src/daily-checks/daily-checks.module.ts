import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DailyCheck } from "./daily-check.entity";
import { DailyChecksService } from "./daily-checks.service";

@Module({
  imports: [TypeOrmModule.forFeature([DailyCheck])],
  providers: [DailyChecksService],
  exports: [DailyChecksService],
})
export class DailyChecksModule {}
