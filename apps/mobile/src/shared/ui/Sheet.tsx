import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/shared/theme/colors";

/** 화면을 다 덮으면 시트가 아니라 페이지로 읽힌다. 위쪽은 항상 남긴다. */
const MAX_HEIGHT_RATIO = 0.88;

/**
 * 웹의 가운데 모달 대신 아래에서 올라오는 시트를 쓴다.
 * 한 손으로 쥐는 화면에서는 확인 버튼이 손가락 가까이 있어야 한다.
 *
 * `Modal` 이 아니라 `@gorhom/bottom-sheet` 을 쓰는 이유는 세 가지다.
 *
 * 1. 내용이 길면 잘렸다. `Modal` 안은 스크롤이 없어서 미션 폼의 아래쪽 필드에 닿지 못했다.
 * 2. 시트 위에 시트를 열 수 없었다. 미션 폼에서 맞춤 반복 시트를 띄우면 `Modal` 이 겹쳐
 *    iOS 에서 제대로 뜨지 않았다. `BottomSheetModal` 은 쌓임을 지원한다.
 * 3. 손잡이가 장식이었다. 끌어내려 닫을 수 없었다.
 */
export function Sheet({
  isOpen,
  title,
  onClose,
  children,
  footer,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const sheet = useRef<BottomSheetModal>(null);

  /** 고정된 푸터에 마지막 내용이 가리지 않도록, 잰 높이만큼 본문 아래를 띄운다. */
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    if (isOpen) sheet.current?.present();
    else sheet.current?.dismiss();
  }, [isOpen]);

  /**
   * 안드로이드 하드웨어 뒤로가기.
   *
   * `@gorhom/bottom-sheet` 5.x 는 이걸 처리하지 않는다(소스에 `BackHandler` 가 없다).
   * 붙이지 않으면 뒤로가기가 시트를 닫는 대신 화면을 빠져나간다.
   */
  useEffect(() => {
    if (!isOpen || Platform.OS !== "android") return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onClose();

        return true;
      },
    );

    return () => subscription.remove();
  }, [isOpen, onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) =>
      footer ? (
        <BottomSheetFooter {...props}>
          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
            onLayout={(event) =>
              setFooterHeight(event.nativeEvent.layout.height)
            }
          >
            {footer}
          </View>
        </BottomSheetFooter>
      ) : null,
    [footer, insets.bottom],
  );

  return (
    <BottomSheetModal
      ref={sheet}
      onDismiss={onClose}
      enablePanDownToClose
      maxDynamicContentSize={Dimensions.get("window").height * MAX_HEIGHT_RATIO}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.grabber}
      // 입력 중에 시트가 키보드를 따라 올라간다. 미션 폼은 입력이 대부분이다.
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: footerHeight + spacing.lg },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.body}>{children}</View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.content,
  },
  body: { gap: spacing.md },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
  },
});
