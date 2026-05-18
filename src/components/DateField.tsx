import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  clearLabel?: string;
  withTime?: boolean;
}

function toDate(value: string): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toDateValue(date: Date, withTime: boolean): string {
  if (withTime) return date.toISOString();
  return date.toISOString().slice(0, 10);
}

function displayValue(value: string, withTime: boolean): string {
  if (!value) return withTime ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD";
  const date = toDate(value);
  if (withTime) {
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }
  return value.slice(0, 10);
}

export function DateField({ label, value, onChange, clearLabel = "Clear", withTime = false }: DateFieldProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [draftDate, setDraftDate] = useState<Date | null>(null);
  const selectedDate = useMemo(() => toDate(value), [value]);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed" || !date) {
      setOpen(false);
      setPickerMode("date");
      setDraftDate(null);
      return;
    }
    if (withTime && pickerMode === "date" && Platform.OS !== "ios") {
      setDraftDate(date);
      setPickerMode("time");
      return;
    }
    setOpen(false);
    setPickerMode("date");
    const next = draftDate && pickerMode === "time"
      ? new Date(
          draftDate.getFullYear(),
          draftDate.getMonth(),
          draftDate.getDate(),
          date.getHours(),
          date.getMinutes()
        )
      : date;
    setDraftDate(null);
    onChange(toDateValue(next, withTime));
  };

  const openPicker = () => {
    setPickerMode("date");
    setDraftDate(null);
    setOpen(true);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {value ? (
          <Pressable
            onPress={() => onChange("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`${clearLabel} ${label}`}
          >
            <Text style={styles.clear}>{clearLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={openPicker}
        style={styles.input}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayValue(value, withTime)}`}
      >
        <Text numberOfLines={1} style={[styles.value, !value && styles.placeholder]}>
          {displayValue(value, withTime)}
        </Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          key={pickerMode}
          value={draftDate ?? selectedDate}
          mode={withTime && Platform.OS === "ios" ? "datetime" : pickerMode}
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  wrap: { marginBottom: spacing.lg, width: "100%" },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13 },
  clear: { color: colors.primaryPressed, fontSize: 12, fontWeight: "900" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    justifyContent: "center",
  },
  value: { color: colors.text, fontSize: 16, fontWeight: "700" },
  placeholder: { color: colors.textMuted },
});
