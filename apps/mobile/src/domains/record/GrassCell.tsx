import { type GrassDay } from "@nadaena/api-client";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, radius } from "@/shared/theme/colors";
import { getGrassStyle } from "@/shared/theme/grassColor";

/**
 * 잔디 한 칸.
 *
 * `size="fill"` 은 부모 칸을 가득 채운다. 월 잔디가 7열 격자를 만들 때 쓴다 —
 * 고정 크기로 두고 `flexWrap` 에 맡기면 화면 너비에 따라 한 줄에 12칸씩 들어가서
 * 요일이 세로로 안 맞는다.
 */
export function GrassCell({
  day,
  size = 20,
  isSelected = false,
  onPress,
}: {
  day: GrassDay;
  size?: number | "fill";
  isSelected?: boolean;
  onPress?: (day: GrassDay) => void;
}) {
  const box = [
    styles.cell,
    size === "fill" ? styles.fill : { width: size, height: size },
    getGrassStyle(day.result, day.rate),
  ];

  if (!onPress) return <View style={box} />;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={day.date}
      accessibilityState={{ selected: isSelected }}
      onPress={() => onPress(day)}
      style={({ pressed }) => [
        styles.hit,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={box} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { borderRadius: radius.sm },
  fill: { width: "100%", aspectRatio: 1 },
  /** 부모 칸 전체가 눌린다. 20pt 짜리 사각형만 눌리게 하면 손가락으로 못 맞춘다. */
  hit: { width: "100%", padding: 2, borderRadius: radius.md },
  selected: { backgroundColor: colors.surfaceHover },
  pressed: { opacity: 0.6 },
});
