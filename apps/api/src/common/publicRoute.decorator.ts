import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublicRoute";

/** 인증 없이 열어두는 경로. 로그인과 헬스체크만 해당한다. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
