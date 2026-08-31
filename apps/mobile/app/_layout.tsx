import "@/shared/config/configureApi";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@/shared/theme/colors";

export default function RootLayout() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 하루 단위로 움직이는 데이터라 자주 다시 부를 이유가 없다.
            staleTime: 30_000,
            retry: 1,
            // 앱을 다시 열면 날짜가 바뀌었을 수 있다. 웹과 달리 여기서는 다시 부른다.
            refetchOnMount: true,
          },
        },
      }),
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={client}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.bg },
              headerTitleStyle: { color: colors.content, fontSize: 16, fontWeight: "700" },
              headerTintColor: colors.content,
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ title: "시작하기" }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="missions" options={{ title: "미션 관리" }} />
            <Stack.Screen name="settings" options={{ title: "설정" }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
