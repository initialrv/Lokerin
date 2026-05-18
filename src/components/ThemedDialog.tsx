import React from "react";
import { Modal, Pressable, StyleSheet, Text } from "react-native";
import { useAccessibilityPrefs } from "@/accessibility/AccessibilityContext";
import { PrimaryButton } from "@/components/PrimaryButton";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";

interface ThemedDialogProps {
  visible: boolean;
  message: string;
  buttonLabel: string;
  onClose: () => void;
  title?: string;
  secondaryButtonLabel?: string;
  onSecondaryPress?: () => void;
}

export function ThemedDialog({
  visible,
  message,
  buttonLabel,
  onClose,
  title,
  secondaryButtonLabel,
  onSecondaryPress,
}: ThemedDialogProps) {
  const { reduceMotion } = useAccessibilityPrefs();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal visible={visible} transparent animationType={reduceMotion ? "none" : "fade"} accessibilityViewIsModal>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} accessible accessibilityRole="alert" accessibilityLabel={title ? `${title}. ${message}` : message}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={[styles.message, title && styles.messageWithTitle]}>{message}</Text>
          <PrimaryButton title={buttonLabel} onPress={onClose} />
          {secondaryButtonLabel && onSecondaryPress ? (
            <PrimaryButton title={secondaryButtonLabel} variant="secondary" onPress={onSecondaryPress} />
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#16201266",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  message: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 24,
  },
  messageWithTitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: -spacing.sm,
  },
});
