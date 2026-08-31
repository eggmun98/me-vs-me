import * as SecureStore from "expo-secure-store";
import type { RefreshTokenStore } from "@nadaena/api-client";

const KEY = "nadaena.refreshToken";

/**
 * 앱에는 httpOnly 쿠키가 없어 refresh 를 직접 들고 다닌다. (03-tech-stack.md 8장)
 *
 * 그래서 AsyncStorage 가 아니라 SecureStore 다 — iOS Keychain / Android Keystore 에 들어간다.
 * 90일짜리 토큰이라 평문으로 두면 기기를 잃었을 때 그대로 세션을 넘겨주는 셈이 된다.
 */
export const secureRefreshStore: RefreshTokenStore = {
  async read() {
    try {
      return await SecureStore.getItemAsync(KEY);
    } catch {
      return null;
    }
  },

  async write(token) {
    await SecureStore.setItemAsync(KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  async clear() {
    try {
      await SecureStore.deleteItemAsync(KEY);
    } catch {
      // 이미 없으면 지울 것도 없다.
    }
  },
};
