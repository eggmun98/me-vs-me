import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/shared/theme/colors";

const SWATCHES: Array<{ label: string; fill: string; outlined?: boolean }> = [
  { label: "무", fill: colors.draw },
  { label: "패", fill: colors.lose },
  { label: "휴식", fill: colors.surface, outlined: true },
];

export function GrassLegend() {
  return (
    <View style={styles.root}>
      <View style={styles.group}>
        <Text style={styles.text}>적음</Text>
        <Swatch fill={colors.win1} />
        <Swatch fill={colors.win2} />
        <Swatch fill={colors.win3} />
        <Text style={styles.text}>많음</Text>
      </View>

      {SWATCHES.map((swatch) => (
        <View key={swatch.label} style={styles.group}>
          <Swatch fill={swatch.fill} outlined={swatch.outlined} />
          <Text style={styles.text}>{swatch.label}</Text>
        </View>
      ))}
    </View>
  );
}

function Swatch({ fill, outlined = false }: { fill: string; outlined?: boolean }) {
  return (
    <View
      style={[
        styles.swatch,
        { backgroundColor: fill },
        outlined && { borderWidth: 1, borderColor: colors.border },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.md },
  group: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  text: { fontSize: 10, color: colors.contentDim },
});
