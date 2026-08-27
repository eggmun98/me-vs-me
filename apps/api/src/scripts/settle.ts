import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/appModule";
import { SettlementService } from "@/modules/daily/settlement.service";

/**
 * 정산을 손으로 한 번 돌린다.
 *
 * 배치가 멈춰 있던 구간을 메우거나, 규칙을 바꾼 뒤 다시 계산할 때 쓴다.
 * 여러 번 돌려도 결과가 같다.
 */
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ["error"] });
  const result = await app.get(SettlementService).settleAllUsers();

  console.log(`정산한 사용자 ${result.settled}명`);
  await app.close();
}

void main();
