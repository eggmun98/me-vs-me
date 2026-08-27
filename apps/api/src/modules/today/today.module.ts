import { Module } from "@nestjs/common";
import { DailyModule } from "@/modules/daily/daily.module";
import { RecordModule } from "@/modules/record/record.module";
import { TodayController } from "./today.controller";
import { TodayService } from "./today.service";

@Module({
  imports: [DailyModule, RecordModule],
  controllers: [TodayController],
  providers: [TodayService],
})
export class TodayModule {}
