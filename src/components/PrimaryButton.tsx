import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";

type Variant = "primary" | "secondary" | "danger";

interface Props extends Omit<PressableProps, "children"> {
  title: string;
  loading?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  title,
  loading,
  variant = "primary",
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const palette =
    variant === "danger"
      ? { bg: colors.danger, fg: colors.bg }
      : variant === "secondary"
        ? { bg: colors.surface, fg: colors.text }
        : { bg: colors.primary, fg: colors.text };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, opacity: pressed ? 0.9 : 1 },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[styles.label, { color: palette.fg }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: "100%",
  },
  label: { fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
