import { Image, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/shared/theme/colors";

const mark = require("../../../assets/nadaena-mark.png");

type BrandLogoProps = {
	size?: "compact" | "hero";
};

export function BrandLogo({ size = "compact" }: BrandLogoProps) {
	const isHero = size === "hero";

	return (
		<View style={[styles.root, isHero ? styles.heroRoot : styles.compactRoot]}>
			<Image
				source={mark}
				resizeMode="contain"
				style={isHero ? styles.heroMark : styles.compactMark}
			/>
			<View style={isHero && styles.centerText}>
				<Text style={isHero ? styles.heroKorean : styles.compactKorean}>
					나 대 나
				</Text>
				<Text style={isHero ? styles.heroEnglish : styles.compactEnglish}>
					nadaena
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		alignItems: "center",
	},
	compactRoot: {
		flexDirection: "row",
		gap: spacing.sm,
	},
	heroRoot: {
		gap: spacing.xs,
	},
	compactMark: {
		width: 58,
		height: 38,
	},
	heroMark: {
		width: 132,
		height: 82,
	},
	centerText: {
		alignItems: "center",
	},
	compactKorean: {
		fontSize: 18,
		fontWeight: "800",
		color: colors.content,
	},
	heroKorean: {
		fontSize: 34,
		fontWeight: "800",
		color: colors.content,
	},
	compactEnglish: {
		marginTop: 1,
		fontSize: 10,
		fontWeight: "700",
		color: colors.contentDim,
	},
	heroEnglish: {
		marginTop: 2,
		fontSize: 12,
		fontWeight: "700",
		color: colors.contentDim,
	},
});
