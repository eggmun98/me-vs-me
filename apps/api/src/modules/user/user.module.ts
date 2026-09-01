import { Module } from "@nestjs/common";
import { DailyModule } from "@/modules/daily/daily.module";
import { RecordModule } from "@/modules/record/record.module";
import { AccountPurgeService } from "./accountPurge.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [DailyModule, RecordModule],
  controllers: [UserController],
  providers: [UserService, AccountPurgeService],
})
export class UserModule {}
