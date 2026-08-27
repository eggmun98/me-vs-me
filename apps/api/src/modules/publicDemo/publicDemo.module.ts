import { Module } from "@nestjs/common";
import { DailyModule } from "@/modules/daily/daily.module";
import { PublicDemoController } from "./publicDemo.controller";
import { PublicDemoService } from "./publicDemo.service";

@Module({
  imports: [DailyModule],
  controllers: [PublicDemoController],
  providers: [PublicDemoService],
})
export class PublicDemoModule {}
