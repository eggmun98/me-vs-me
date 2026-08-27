import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { OnboardingDto } from "./dto/onboarding.dto";
import { UserService } from "./user.service";

@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @ApiOperation({ summary: "내 정보 — isOnboarded 로 온보딩 필요 여부를 판단한다" })
  getMe() {
    return this.userService.getMe();
  }

  @Patch("me")
  @ApiOperation({ summary: "프로필·타임존 수정 — 타임존은 오늘부터 적용된다" })
  updateMe(@Body() patch: { nickname?: string; bio?: string; timezone?: string }) {
    return this.userService.updateMe(patch);
  }

  @Post("me/onboarding")
  @ApiOperation({ summary: "온보딩 완료 — 닉네임·타임존·첫 미션을 한 번에" })
  completeOnboarding(@Body() dto: OnboardingDto) {
    return this.userService.completeOnboarding(dto);
  }

  @Get("nickname/check")
  @ApiOperation({ summary: "닉네임 중복 확인" })
  checkNickname(@Query("nickname") nickname: string) {
    return this.userService.isNicknameAvailable(nickname);
  }

  @Get("nickname/random")
  @ApiOperation({ summary: "닉네임 추천" })
  suggestNickname() {
    return this.userService.suggestNickname();
  }
}
