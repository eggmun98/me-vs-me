import { Tabs } from "expo-router";
import { StyleSheet, Text, type ColorValue } from "react-native";
import { colors } from "@/shared/theme/colors";

/**
 * 아이콘 폰트를 붙이기 전까지는 글자로 둔다.
 * 탭이 셋이라 글자만으로도 어디에 있는지 충분히 읽힌다.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.content, fontSize: 16, fontWeight: "700" },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.content,
        tabBarInactiveTintColor: colors.contentDim,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{ title: "오늘", tabBarIcon: ({ color }) => <TabGlyph label="今" color={color} /> }}
      />
      <Tabs.Screen
        name="record"
        options={{ title: "기록", tabBarIcon: ({ color }) => <TabGlyph label="記" color={color} /> }}
      />
      <Tabs.Screen
        name="my"
        options={{ title: "MY", tabBarIcon: ({ color }) => <TabGlyph label="我" color={color} /> }}
      />
    </Tabs>
  );
}

function TabGlyph({ label, color }: { label: string; color: ColorValue }) {
  return <Text style={[styles.glyph, { color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  glyph: { fontSize: 18, fontWeight: "700" },
});
