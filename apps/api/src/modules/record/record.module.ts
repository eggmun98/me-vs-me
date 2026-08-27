import { Module } from "@nestjs/common";
import { DailyModule } from "@/modules/daily/daily.module";
import { RecordController } from "./record.controller";
import { RecordService } from "./record.service";

@Module({
  imports: [DailyModule],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}
