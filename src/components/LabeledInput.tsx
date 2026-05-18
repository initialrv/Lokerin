import React from "react";
import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function LabeledInput({ label, error, style, ...rest }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, rest.multiline ? styles.inputMultiline : null, error ? styles.inputError : null, style]}
        textAlignVertical={rest.multiline ? "top" : rest.textAlignVertical}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  wrap: { marginBottom: spacing.lg, width: "100%" },
  label: { color: colors.textMuted, marginBottom: spacing.sm, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    minHeight: 48,
  },
  inputMultiline: { minHeight: 112, maxHeight: 160 },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, marginTop: spacing.xs, fontSize: 12 },
});
