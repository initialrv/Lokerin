import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ApplicationStatus } from "@/types/models";
import { getStatusLabel } from "@/constants/statuses";
import { useLanguage } from "@/i18n/LanguageContext";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const tone: Record<ApplicationStatus, string> = {
    applied: colors.primaryPressed,
    screening: colors.warning,
    interview: colors.accent,
    offer: colors.success,
    accepted: colors.success,
    rejected: colors.danger,
    withdrawn: colors.textMuted,
  };

  return (
    <View
      style={[styles.chip, { borderColor: tone[status], backgroundColor: `${tone[status]}1f` }]}
      accessible
      accessibilityLabel={getStatusLabel(status, language)}
    >
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[styles.text, { color: tone[status] }]}>
        {getStatusLabel(status, language)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    flexShrink: 0,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minHeight: 24,
    justifyContent: "center",
  },
  text: { fontSize: 12, fontWeight: "600" },
});
