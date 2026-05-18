import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { getStatusLabel, STATUS_ORDER } from "@/constants/statuses";
import { DateField } from "@/components/DateField";
import { EmptyState } from "@/components/EmptyState";
import { LabeledInput } from "@/components/LabeledInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusBadge } from "@/components/StatusBadge";
import { ThemedDialog } from "@/components/ThemedDialog";
import { useDatabase } from "@/context/DatabaseContext";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  deleteApplication,
  deleteInterview,
  getApplication,
  insertInterview,
  insertApplication,
  listInterviewsForApplication,
  setApplicationArchived,
  updateApplication,
  updateInterview,
} from "@/repositories/applicationsRepository";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import type { ApplicationStatus, InterviewEvent, JobApplication } from "@/types/models";
import { addToDeviceCalendar } from "@/utils/calendarHandoff";

const emptyToNull = (s: string) => (s.trim() === "" ? null : s.trim());

export default function ApplicationDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const navigation = useNavigation();
  const { db, ready } = useDatabase();
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<JobApplication | null>(null);
  const [interviews, setInterviews] = useState<InterviewEvent[]>([]);

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

  const [ivTitle, setIvTitle] = useState("");
  const [ivWhen, setIvWhen] = useState("");
  const [ivNotes, setIvNotes] = useState("");
  const [ivModal, setIvModal] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [archiveConfirmVisible, setArchiveConfirmVisible] = useState(false);

  const load = useCallback(async () => {
    if (!db || ready !== "ready" || !id) return;
    setLoading(true);
    try {
      const row = await getApplication(db, id);
      setApp(row);
      if (row) {
        setCompany(row.company);
        setRole(row.role);
        setStatus(row.status);
        setAppliedAt(row.appliedAt ?? "");
        setLocation(row.location ?? "");
        setJobUrl(row.jobUrl ?? "");
        setSalaryNote(row.salaryNote ?? "");
        setNotes(row.notes ?? "");
        setNextFollowUpAt(row.nextFollowUpAt ?? "");
        const iv = await listInterviewsForApplication(db, id);
        setInterviews(iv);
      }
    } finally {
      setLoading(false);
    }
  }, [db, ready, id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onDelete = useCallback(async () => {
    if (!db || !id) return;
    try {
      await deleteApplication(db, id);
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert("Delete failed", msg);
    }
  }, [db, id, router]);

  const onToggleArchive = async (archived: boolean) => {
    if (!db || !id) return;
    try {
      const updated = await setApplicationArchived(db, id, archived);
      setApp(updated);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("couldNotSave"), msg);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: app?.company ? `${app.company}` : t("application"),
      headerRight: () => (
        <Pressable
          onPress={() => {
            Alert.alert(t("deleteApplication"), t("deleteHint"), [
              { text: "Cancel", style: "cancel" },
              {
                text: t("delete"),
                style: "destructive",
                onPress: () => void onDelete(),
              },
            ]);
          }}
          style={{ paddingHorizontal: 12 }}
        >
          <Text style={{ color: colors.danger, fontWeight: "900" }}>{t("delete")}</Text>
        </Pressable>
      ),
    });
  }, [navigation, app?.company, onDelete, t, colors.danger]);

  const onSave = async () => {
    if (!db || !id || ready !== "ready") return;
    if (!company.trim() || !role.trim()) {
      Alert.alert(t("validation"), `${t("companyRequired")} / ${t("roleRequired")}`);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateApplication(db, id, {
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
      setApp(updated);
      setFeedbackMessage(t("savedSuccess"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("couldNotSave"), msg);
    } finally {
      setSaving(false);
    }
  };

  const openNewInterview = () => {
    setEditingInterviewId(null);
    setIvTitle("");
    setIvWhen("");
    setIvNotes("");
    setIvModal(true);
  };

  const openEditInterview = (interview: InterviewEvent) => {
    setEditingInterviewId(interview.id);
    setIvTitle(interview.title);
    setIvWhen(interview.scheduledAt ?? "");
    setIvNotes(interview.notes ?? "");
    setIvModal(true);
  };

  const closeInterviewModal = () => {
    setIvModal(false);
    setEditingInterviewId(null);
    setIvTitle("");
    setIvWhen("");
    setIvNotes("");
  };

  const onSaveInterview = async () => {
    if (!db || !id) return;
    if (!ivTitle.trim()) {
      Alert.alert(t("validation"), t("titleRequired"));
      return;
    }
    try {
      const input = {
        title: ivTitle,
        scheduledAt: emptyToNull(ivWhen),
        notes: emptyToNull(ivNotes),
      };
      if (editingInterviewId) {
        await updateInterview(db, editingInterviewId, input);
      } else {
        await insertInterview(db, id, input);
      }
      closeInterviewModal();
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("couldNotSave"), msg);
    }
  };

  const onRemoveInterview = (ivId: string) => {
    Alert.alert(t("removeInterview"), undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: t("remove"),
        style: "destructive",
        onPress: async () => {
          if (!db) return;
          await deleteInterview(db, ivId);
          await load();
        },
      },
    ]);
  };

  const onDuplicateApplication = async () => {
    if (!db || ready !== "ready" || !app) return;
    try {
      const duplicated = await insertApplication(db, {
        company: `${company || app.company} copy`,
        role: role || app.role,
        status,
        appliedAt: null,
        location: emptyToNull(location),
        jobUrl: emptyToNull(jobUrl),
        salaryNote: emptyToNull(salaryNote),
        notes: emptyToNull(notes),
        nextFollowUpAt: null,
      });
      setFeedbackMessage(t("copiedApplication"));
      router.push(`/application/${duplicated.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("couldNotSave"), msg);
    }
  };

  const addFollowUpToCalendar = async () => {
    if (!nextFollowUpAt) return;
    try {
      const result = await addToDeviceCalendar({
        title: `Follow up: ${role || app?.role} at ${company || app?.company}`,
        startDate: nextFollowUpAt,
        durationMinutes: 30,
        notes: t("followUpCalendarNote"),
        location: location || null,
      });
      if (result === "saved") setFeedbackMessage(t("addedToCalendar"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("couldNotAddToCalendar"), msg);
    }
  };

  const addInterviewToCalendar = async (interview: InterviewEvent) => {
    if (!interview.scheduledAt) return;
    try {
      const result = await addToDeviceCalendar({
        title: `${interview.title}: ${role || app?.role} at ${company || app?.company}`,
        startDate: interview.scheduledAt,
        durationMinutes: 60,
        notes: [t("interviewCalendarNote"), interview.notes].filter(Boolean).join("\n\n"),
        location: location || null,
      });
      if (result === "saved") setFeedbackMessage(t("addedToCalendar"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("couldNotAddToCalendar"), msg);
    }
  };

  if (!id) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{t("missingId")}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{t("loading")}</Text>
      </View>
    );
  }

  if (!app) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{t("thisNoLongerExists")}</Text>
        <PrimaryButton title={t("goBack")} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.summaryCard}>
          <StatusBadge status={status} />
          {app.archivedAt ? (
            <Text numberOfLines={1} style={styles.archivedLabel}>
              {t("archived")}
            </Text>
          ) : null}
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.summaryTitle}>
            {company || app.company}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.summarySub}>
            {role || app.role}
          </Text>
        </View>

        <LabeledInput label={`${t("company")}*`} value={company} onChangeText={setCompany} />
        <LabeledInput label={`${t("role")}*`} value={role} onChangeText={setRole} />

        <Text style={styles.fieldLabel}>{t("status")}</Text>
        <Pressable onPress={() => setPickerOpen(true)} style={styles.pickerTrigger}>
          <Text numberOfLines={1} style={styles.pickerTriggerText}>
            {getStatusLabel(status, language)}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </Pressable>

        <DateField label={t("appliedDate")} value={appliedAt} onChange={setAppliedAt} clearLabel={t("clear")} />
        <LabeledInput label={t("location")} value={location} onChangeText={setLocation} />
        <LabeledInput label={t("jobUrl")} value={jobUrl} onChangeText={setJobUrl} autoCapitalize="none" />
        <LabeledInput label={t("compensation")} value={salaryNote} onChangeText={setSalaryNote} />
        <DateField
          label={t("followUp")}
          value={nextFollowUpAt}
          onChange={setNextFollowUpAt}
          clearLabel={t("clear")}
          withTime
        />
        {nextFollowUpAt ? (
          <PrimaryButton
            title={t("addToCalendar")}
            variant="secondary"
            onPress={() => void addFollowUpToCalendar()}
            style={{ marginTop: -spacing.md, marginBottom: spacing.lg }}
          />
        ) : null}
        <LabeledInput label={t("notes")} value={notes} onChangeText={setNotes} multiline />

        <PrimaryButton title={t("saveChanges")} loading={saving} onPress={() => void onSave()} />
        <PrimaryButton
          title={app.archivedAt ? t("restoreApplication") : t("archive")}
          variant="secondary"
          onPress={() => {
            if (app.archivedAt) {
              void onToggleArchive(false);
              return;
            }
            setArchiveConfirmVisible(true);
          }}
          style={{ marginTop: spacing.sm }}
        />
        <PrimaryButton
          title={t("duplicateApplication")}
          variant="secondary"
          onPress={() => void onDuplicateApplication()}
          style={{ marginTop: spacing.sm }}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("interviews")}</Text>
            <Pressable onPress={openNewInterview} style={styles.linkBtn}>
              <Text style={styles.linkText}>{t("add")}</Text>
            </Pressable>
          </View>
          {interviews.length === 0 ? (
            <EmptyState title={t("noInterviews")} />
          ) : (
            interviews.map((iv) => (
              <View key={iv.id} style={styles.ivCard}>
                <View style={styles.ivContent}>
                  <Pressable onPress={() => openEditInterview(iv)} accessibilityRole="button">
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.ivTitle}>
                      {iv.title}
                    </Text>
                    {iv.scheduledAt ? (
                      <Text numberOfLines={1} style={styles.muted}>
                        {new Date(iv.scheduledAt).toLocaleString()}
                      </Text>
                    ) : null}
                    {iv.notes ? (
                      <Text numberOfLines={2} ellipsizeMode="tail" style={styles.ivNotes}>
                        {iv.notes}
                      </Text>
                    ) : null}
                  </Pressable>
                  {iv.scheduledAt ? (
                    <Pressable
                      onPress={() => void addInterviewToCalendar(iv)}
                      style={styles.calendarPill}
                      accessibilityRole="button"
                      accessibilityLabel={t("addToCalendar")}
                    >
                      <Text numberOfLines={1} style={styles.calendarPillText}>
                        {t("addToCalendar")}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
                <Pressable onPress={() => onRemoveInterview(iv.id)} hitSlop={8} style={styles.removeBtn}>
                  <Text style={styles.removeText}>x</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Modal visible={pickerOpen} transparent animationType="fade">
          <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t("chooseStatus")}</Text>
              {STATUS_ORDER.map((s) => (
                <Pressable
                  key={s}
                  style={styles.modalRow}
                  onPress={() => {
                    setStatus(s);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalRowText}>{getStatusLabel(s, language)}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>

        <Modal visible={ivModal} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, styles.sheet]}>
              <Text style={styles.modalTitle}>{editingInterviewId ? t("editInterview") : t("newInterview")}</Text>
              <View style={{ padding: spacing.lg }}>
                <LabeledInput label={`${t("interviewTitle")}*`} value={ivTitle} onChangeText={setIvTitle} />
                <DateField
                  label={t("interviewDate")}
                  value={ivWhen}
                  onChange={setIvWhen}
                  clearLabel={t("clear")}
                  withTime
                />
                <LabeledInput label={t("notes")} value={ivNotes} onChangeText={setIvNotes} multiline />
                <PrimaryButton title={t("saveInterview")} onPress={() => void onSaveInterview()} />
                <PrimaryButton
                  title="Cancel"
                  variant="secondary"
                  onPress={closeInterviewModal}
                  style={{ marginTop: spacing.sm }}
                />
              </View>
            </View>
          </View>
        </Modal>
        <ThemedDialog
          visible={!!feedbackMessage}
          message={feedbackMessage ?? ""}
          buttonLabel={t("close")}
          onClose={() => setFeedbackMessage(null)}
        />
        <ThemedDialog
          visible={archiveConfirmVisible}
          title={t("archiveApplication")}
          message={t("archiveHint")}
          buttonLabel={t("archive")}
          onClose={() => {
            setArchiveConfirmVisible(false);
            void onToggleArchive(true);
          }}
          secondaryButtonLabel="Cancel"
          onSecondaryPress={() => setArchiveConfirmVisible(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: 160, alignItems: "stretch" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, padding: spacing.xl },
  muted: { color: colors.textMuted, lineHeight: 20 },
  summaryCard: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: { color: colors.text, fontSize: 22, fontWeight: "900", marginTop: spacing.md },
  summarySub: { color: colors.textMuted, marginTop: spacing.xs, fontWeight: "700" },
  archivedLabel: {
    color: colors.primaryPressed,
    fontSize: 12,
    fontWeight: "900",
    marginTop: spacing.md,
    textTransform: "uppercase",
  },
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
    maxHeight: "80%",
    width: "100%",
  },
  sheet: { marginTop: "auto", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
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
  section: { marginTop: spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    minHeight: 40,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900", flex: 1, minWidth: 0 },
  linkBtn: {
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: { color: colors.text, fontWeight: "900" },
  ivCard: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgElevated,
    minHeight: 88,
    alignItems: "flex-start",
    width: "100%",
  },
  ivContent: { flex: 1, minWidth: 0 },
  ivTitle: { color: colors.text, fontWeight: "900", marginBottom: spacing.xs },
  ivNotes: { color: colors.text, marginTop: spacing.sm, lineHeight: 20 },
  calendarPill: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarPillText: { color: colors.text, fontSize: 12, fontWeight: "900" },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { color: colors.danger, fontWeight: "900" },
});
