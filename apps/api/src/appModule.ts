import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { CommonModule } from "./common/common.module";
import { loadEnv } from "./config/env";
import { AuthModule } from "./modules/auth/auth.module";
import { JwtAuthGuard } from "./modules/auth/jwtAuth.guard";
import { CategoryModule } from "./modules/category/category.module";
import { DailyModule } from "./modules/daily/daily.module";
import { MissionModule } from "./modules/mission/mission.module";
import { PublicDemoModule } from "./modules/publicDemo/publicDemo.module";
import { RecordModule } from "./modules/record/record.module";
import { TodayModule } from "./modules/today/today.module";
import { UserModule } from "./modules/user/user.module";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: loadEnv }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CommonModule,
    AuthModule,
    HealthModule,
    CategoryModule,
    MissionModule,
    DailyModule,
    RecordModule,
    TodayModule,
    UserModule,
    PublicDemoModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
