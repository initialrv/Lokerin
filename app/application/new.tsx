import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAccessibilityPrefs } from "@/accessibility/AccessibilityContext";
import { getApplicationTemplates, type ApplicationTemplate } from "@/constants/applicationTemplates";
import { getStatusLabel, STATUS_ORDER } from "@/constants/statuses";
import { DateField } from "@/components/DateField";
import { LabeledInput } from "@/components/LabeledInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useDatabase } from "@/context/DatabaseContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { insertApplication } from "@/repositories/applicationsRepository";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import type { ApplicationStatus } from "@/types/models";

const emptyToNull = (s: string) => (s.trim() === "" ? null : s.trim());

export default function NewApplicationScreen() {
  const router = useRouter();
  const { db, ready } = useDatabase();
  const { language, t } = useLanguage();
  const { reduceMotion } = useAccessibilityPrefs();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const templates = getApplicationTemplates(language);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [appliedAt, setAppliedAt] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [salaryNote, setSalaryNote] = useState("");
  const [notes, setNotes] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ company?: string; role?: string }>({});

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

  const applyTemplate = (template: ApplicationTemplate | null) => {
    setSelectedTemplateId(template?.id ?? null);
    setTemplatePickerOpen(false);
    if (!template) return;
    setNotes(template.notes);
  };

  const onSave = async () => {
    const nextErrors: typeof errors = {};
    if (!company.trim()) nextErrors.company = t("companyRequired");
    if (!role.trim()) nextErrors.role = t("roleRequired");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!db || ready !== "ready") {
      Alert.alert(t("notReady"), t("notReadyDetail"));
      return;
    }
    setSaving(true);
    try {
      await insertApplication(db, {
        company,
        role,
        status,
        appliedAt: emptyToNull(appliedAt),
        location: emptyToNull(location),
        jobUrl: emptyToNull(jobUrl),
        salaryNote: emptyToNull(salaryNote),
        notes: emptyToNull(notes),
        nextFollowUpAt: emptyToNull(nextFollowUpAt),
      });
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("couldNotSave"), msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.fieldLabel}>{t("template")}</Text>
        <Pressable
          onPress={() => setTemplatePickerOpen(true)}
          style={styles.pickerTrigger}
          accessibilityRole="button"
          accessibilityLabel={t("chooseTemplate")}
          accessibilityState={{ expanded: templatePickerOpen }}
        >
          <Text numberOfLines={1} style={styles.pickerTriggerText}>
            {selectedTemplate?.name ?? t("templateBlank")}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </Pressable>

        <LabeledInput label={`${t("company")}*`} value={company} onChangeText={setCompany} error={errors.company} />
        <LabeledInput label={`${t("role")}*`} value={role} onChangeText={setRole} error={errors.role} />

        <Text style={styles.fieldLabel}>{t("status")}</Text>
        <Pressable onPress={() => setPickerOpen(true)} style={styles.pickerTrigger}>
          <Text numberOfLines={1} style={styles.pickerTriggerText}>
            {getStatusLabel(status, language)}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </Pressable>

        <DateField label={t("appliedDate")} value={appliedAt} onChange={setAppliedAt} clearLabel={t("clear")} />
        <LabeledInput label={t("location")} value={location} onChangeText={setLocation} />
        <LabeledInput label={t("jobUrl")} value={jobUrl} onChangeText={setJobUrl} autoCapitalize="none" keyboardType="url" />
        <LabeledInput label={t("compensation")} value={salaryNote} onChangeText={setSalaryNote} />
        <DateField
          label={t("followUp")}
          value={nextFollowUpAt}
          onChange={setNextFollowUpAt}
          clearLabel={t("clear")}
          withTime
        />
        <LabeledInput label={t("notes")} value={notes} onChangeText={setNotes} multiline />

        <PrimaryButton title={t("saveApplication")} loading={saving} onPress={() => void onSave()} />

        <Modal visible={templatePickerOpen} transparent animationType={reduceMotion ? "none" : "fade"} accessibilityViewIsModal>
          <Pressable style={styles.modalBackdrop} onPress={() => setTemplatePickerOpen(false)}>
            <View style={styles.modalCard}>
              <Text numberOfLines={1} style={styles.modalTitle}>
                {t("chooseTemplate")}
              </Text>
              <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                <Pressable style={styles.modalRow} onPress={() => applyTemplate(null)} accessibilityRole="button">
                  <Text numberOfLines={1} style={styles.modalRowText}>
                    {t("templateBlank")}
                  </Text>
                  <Text numberOfLines={2} style={styles.modalRowHint}>
                    {t("templateHint")}
                  </Text>
                </Pressable>
                {templates.map((template) => (
                  <Pressable
                    key={template.id}
                    style={styles.modalRow}
                    onPress={() => applyTemplate(template)}
                    accessibilityRole="button"
                    accessibilityLabel={`${template.name}. ${template.description}`}
                  >
                    <Text numberOfLines={1} style={styles.modalRowText}>
                      {template.name}
                    </Text>
                    <Text numberOfLines={2} style={styles.modalRowHint}>
                      {template.description}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        <Modal visible={pickerOpen} transparent animationType={reduceMotion ? "none" : "fade"} accessibilityViewIsModal>
          <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
            <View style={styles.modalCard}>
              <Text numberOfLines={1} style={styles.modalTitle}>
                {t("chooseStatus")}
              </Text>
              {STATUS_ORDER.map((s) => (
                <Pressable
                  key={s}
                  style={styles.modalRow}
                  onPress={() => {
                    setStatus(s);
                    setPickerOpen(false);
                  }}
                >
                  <Text numberOfLines={1} style={styles.modalRowText}>
                    {getStatusLabel(s, language)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: 120, alignItems: "stretch" },
  fieldLabel: { color: colors.textMuted, marginBottom: spacing.sm, fontSize: 13, fontWeight: "800" },
  pickerTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    marginBottom: spacing.lg,
  },
  pickerTriggerText: { color: colors.text, fontSize: 16, fontWeight: "800", flex: 1, minWidth: 0 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#16201266",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: "70%",
    width: "100%",
  },
  modalList: { width: "100%" },
  modalTitle: {
    color: colors.text,
    fontWeight: "900",
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalRowText: { color: colors.text, fontSize: 16, fontWeight: "700" },
  modalRowHint: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
});
