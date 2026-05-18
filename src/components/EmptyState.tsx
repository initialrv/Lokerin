import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.box}>
      <View style={styles.iconWrap}>
        <Ionicons name="file-tray-outline" size={22} color={colors.primaryPressed} />
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>
      {subtitle ? (
        <Text numberOfLines={3} style={styles.sub}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  box: { padding: spacing.xl, alignItems: "center", minHeight: 180, justifyContent: "center" },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: "800", textAlign: "center" },
  sub: { color: colors.textMuted, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 },
});
