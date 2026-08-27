import { Global, Module } from "@nestjs/common";
import { CurrentUserService } from "./currentUser.service";

@Global()
@Module({
  providers: [CurrentUserService],
  exports: [CurrentUserService],
})
export class CommonModule {}
