import {
	apiGet,
	getAccessToken,
	type Me,
	restoreSession,
} from "@nadaena/api-client";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/shared/theme/colors";
import { BrandLogo } from "@/shared/ui/BrandLogo";

/**
 * 부팅 게이트.
 *
 * access 토큰은 메모리에만 있어 앱을 껐다 켜면 없다.
 * SecureStore 의 refresh 로 한 번 되살려 보고, 안 되면 로그인으로 보낸다.
 */
export default function BootScreen() {
	useEffect(() => {
		let isMounted = true;

		void (async () => {
			const isSignedIn = getAccessToken() !== null || (await restoreSession());

			if (!isMounted) return;

			if (!isSignedIn) {
				router.replace("/login");

				return;
			}

			// 온보딩을 마치지 않은 계정이 오늘 화면에 들어가면 빈 화면만 본다.
			try {
				const me = await apiGet<Me>("/users/me");

				if (isMounted)
					router.replace(me.isOnboarded ? "/today" : "/onboarding");
			} catch {
				if (isMounted) router.replace("/login");
			}
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<View style={styles.root}>
			<BrandLogo />
			<ActivityIndicator color={colors.contentDim} />
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.lg,
		backgroundColor: colors.bg,
	},
});
