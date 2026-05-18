import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAccessibilityPrefs } from "@/accessibility/AccessibilityContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";

const STORAGE_KEY = "lokerin.onboarding.v1";

export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export function OnboardingDialog() {
  const { t } = useLanguage();
  const { reduceMotion } = useAccessibilityPrefs();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((seen) => {
      if (seen !== "seen") setVisible(true);
    });
  }, []);

  const close = () => {
    setVisible(false);
    void AsyncStorage.setItem(STORAGE_KEY, "seen");
  };

  return (
    <Modal visible={visible} transparent animationType={reduceMotion ? "none" : "fade"} accessibilityViewIsModal>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityRole="summary" accessible accessibilityLabel={t("onboardingTitle")}>
          <Text style={styles.title}>{t("onboardingTitle")}</Text>
          <Text style={styles.copy}>{t("onboardingLocal")}</Text>
          <Text style={styles.copy}>{t("onboardingBackup")}</Text>
          <Text style={styles.copy}>{t("onboardingReminder")}</Text>
          <Pressable onPress={close} style={styles.button} accessibilityRole="button" accessibilityLabel={t("onboardingStart")}>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={styles.buttonText}>{t("onboardingStart")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#16201266",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: "900", marginBottom: spacing.md },
  copy: { color: colors.textMuted, lineHeight: 21, marginBottom: spacing.sm },
  button: {
    marginTop: spacing.md,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  buttonText: { color: colors.text, fontSize: 16, fontWeight: "900" },
});
