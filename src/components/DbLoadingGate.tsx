import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useLanguage } from "@/i18n/LanguageContext";
import { spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";

const SPLASH_BACKGROUND = "#d7e8c7";
const SPLASH_TEXT = "#162012";

export function DbLoadingGate({
  ready,
  error,
  onRetry,
  children,
}: {
  ready: "loading" | "ready" | "error";
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (ready === "loading") {
    return (
      <View style={styles.splashCenter}>
        <ActivityIndicator size="large" color={colors.primaryPressed} />
        <Text style={styles.splashMuted}>{t("preparingDatabase")}</Text>
      </View>
    );
  }
  if (ready === "error") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{t("databaseError")}</Text>
        <Text style={styles.muted}>{error ?? "Unknown error"}</Text>
        <PrimaryButton title={t("tryAgain")} onPress={onRetry} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }
  return <>{children}</>;
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  splashCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: SPLASH_BACKGROUND,
  },
  splashMuted: { color: SPLASH_TEXT, textAlign: "center", marginTop: spacing.sm },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: spacing.sm },
  muted: { color: colors.textMuted, textAlign: "center", marginTop: spacing.sm },
});
