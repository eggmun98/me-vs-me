import { Module } from "@nestjs/common";
import { DailyService } from "./daily.service";
import { SettlementService } from "./settlement.service";

@Module({
  providers: [DailyService, SettlementService],
  exports: [DailyService, SettlementService],
})
export class DailyModule {}
