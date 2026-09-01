import type { SocialProviderId } from "@nadaena/api-client";
import { router } from "expo-router";
import { Linking, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PROVIDER_LABELS } from "@/domains/auth/socialLogin";
import { useSocialLogin } from "@/domains/auth/useSocialLogin";
import { WEB_URL } from "@/shared/config/urls";
import { colors, spacing } from "@/shared/theme/colors";
import { AppButton } from "@/shared/ui/AppButton";
import { BrandLogo } from "@/shared/ui/BrandLogo";

const PROVIDERS: SocialProviderId[] = ["kakao", "google"];

export default function LoginScreen() {
	const insets = useSafeAreaInsets();
	const { pendingProvider, error, signIn } = useSocialLogin();

	async function handleSignIn(provider: SocialProviderId) {
		const result = await signIn(provider);

		if (!result) return;

		router.replace(result.isNewUser ? "/onboarding" : "/today");
	}

	return (
		<View
			style={[
				styles.root,
				{
					paddingTop: insets.top + spacing.xxl,
					paddingBottom: insets.bottom + spacing.xl,
				},
			]}
		>
			<View style={styles.hero}>
				<BrandLogo size="hero" />
				<Text style={styles.tagline}>
					어제의 나와 오늘의 내가 매일 한 판.{"\n"}
					연속 며칠이 아니라, 몇 승 몇 패로 남습니다.
				</Text>
			</View>

			<View style={styles.actions}>
				{error && <Text style={styles.error}>{error}</Text>}

				{PROVIDERS.map((provider) => (
					<AppButton
						key={provider}
						label={PROVIDER_LABELS[provider]}
						tone={provider === "kakao" ? "accent" : "outline"}
						isLoading={pendingProvider === provider}
						disabled={pendingProvider !== null}
						onPress={() => void handleSignIn(provider)}
					/>
				))}

				<Text style={styles.notice}>
					비밀번호 없이 소셜 계정으로만 시작합니다.
				</Text>

				{/* 가입이 일어나는 지점이라 여기서 알린다. 설정 화면에만 두면 동의 전에 볼 수 없다. */}
				<Text style={styles.consent}>
					계속하면{" "}
					<Text
						style={styles.link}
						onPress={() => void Linking.openURL(`${WEB_URL}/terms`)}
					>
						이용약관
					</Text>
					과{" "}
					<Text
						style={styles.link}
						onPress={() => void Linking.openURL(`${WEB_URL}/privacy`)}
					>
						개인정보처리방침
					</Text>
					에 동의하는 것으로 봅니다.
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		justifyContent: "space-between",
		paddingHorizontal: spacing.xl,
		backgroundColor: colors.bg,
	},
	hero: { flex: 1, justifyContent: "center", gap: spacing.md },
	tagline: { fontSize: 15, lineHeight: 24, color: colors.contentMuted },
	actions: { gap: spacing.sm },
	error: {
		fontSize: 13,
		color: colors.lose,
		paddingVertical: spacing.sm,
	},
	notice: {
		fontSize: 12,
		color: colors.contentDim,
		textAlign: "center",
		paddingTop: spacing.sm,
	},
	consent: {
		fontSize: 11,
		lineHeight: 17,
		color: colors.contentDim,
		textAlign: "center",
		paddingBottom: spacing.sm,
	},
	link: { textDecorationLine: "underline" },
});
