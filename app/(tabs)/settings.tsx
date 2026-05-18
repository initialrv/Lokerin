import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { resetOnboarding } from "@/components/OnboardingDialog";
import { ThemedDialog } from "@/components/ThemedDialog";
import { useDatabase } from "@/context/DatabaseContext";
import { useLanguage, type Language } from "@/i18n/LanguageContext";
import {
  listAllInterviews,
  listApplications,
  refreshFollowUpReminders,
  replaceAllData,
} from "@/repositories/applicationsRepository";
import {
  shareCsvExport,
  shareJsonExport,
  sharePdfExport,
} from "@/utils/exportData";
import {
  getBackupRemindersEnabled,
  getFollowUpReminderPermissionStatus,
  getFollowUpRemindersEnabled,
  refreshBackupReminder,
} from "@/utils/followUpReminders";
import { pickJsonImport } from "@/utils/importData";
import { radius, spacing } from "@/theme/colors";
import { useTheme, type ThemeMode } from "@/theme/ThemeContext";

const languageOptions: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "id", label: "Indonesia" },
];

const themeOptions: { value: ThemeMode; labelKey: "lightMode" | "darkMode" }[] = [
  { value: "light", labelKey: "lightMode" },
  { value: "dark", labelKey: "darkMode" },
];

const PRIVACY_POLICY_URL = "https://ravenduck.github.io/lokerin/privacy-policy";

export default function SettingsScreen() {
  const { db, ready } = useDatabase();
  const { language, setLanguage, t } = useLanguage();
  const { colors, theme, setTheme } = useTheme();
  const styles = createStyles(colors);
  const [online, setOnline] = useState<boolean | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [backupRemindersEnabled, setBackupRemindersEnabled] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<
    "available" | "unavailable" | "granted" | "denied"
  >("available");
  const [savingReminders, setSavingReminders] = useState(false);
  const [savingBackupReminders, setSavingBackupReminders] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [importConfirmVisible, setImportConfirmVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = NetInfo.addEventListener((s) => {
        setOnline(!!s.isConnected);
      });
      void NetInfo.fetch().then((s) => setOnline(!!s.isConnected));
      return () => {
        unsubscribe();
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      void getFollowUpRemindersEnabled().then(setRemindersEnabled);
      void getBackupRemindersEnabled().then(setBackupRemindersEnabled);
      void getFollowUpReminderPermissionStatus().then(setReminderStatus);
    }, [])
  );

  const reminderStatusText =
    reminderStatus === "granted"
      ? t("notificationStatusGranted")
      : reminderStatus === "denied"
        ? t("notificationDenied")
        : reminderStatus === "unavailable"
          ? t("notificationStatusUnavailable")
          : t("notificationStatusAvailable");

  const onToggleReminders = async (enabled: boolean) => {
    if (!db || ready !== "ready") return;
    setSavingReminders(true);
    try {
      await refreshFollowUpReminders(db, enabled);
      setRemindersEnabled(enabled);
      setReminderStatus(await getFollowUpReminderPermissionStatus());
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("couldNotSave"), msg);
    } finally {
      setSavingReminders(false);
    }
  };

  const onToggleBackupReminders = async (enabled: boolean) => {
    setSavingBackupReminders(true);
    try {
      const scheduled = await refreshBackupReminder(enabled, t("backupReminderTitle"), t("backupReminderBody"));
      setBackupRemindersEnabled(enabled && scheduled);
      setReminderStatus(await getFollowUpReminderPermissionStatus());
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("couldNotSave"), msg);
    } finally {
      setSavingBackupReminders(false);
    }
  };

  const onExport = async () => {
    if (!db || ready !== "ready") return;
    setExporting(true);
    try {
      const applications = await listApplications(db, { archived: "all" });
      const interviews = await listAllInterviews(db);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      await shareJsonExport(`jobapply-export-${stamp}.json`, {
        exportedAt: new Date().toISOString(),
        version: 1,
        applications,
        interviews,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("exportFailed"), msg);
    } finally {
      setExporting(false);
    }
  };

  const onExportPdf = async () => {
    if (!db || ready !== "ready") return;
    setExportingPdf(true);
    try {
      const applications = await listApplications(db, { archived: "all" });
      const interviews = await listAllInterviews(db);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      await sharePdfExport(`lokerin-export-${stamp}.pdf`, {
        exportedAt: new Date().toISOString(),
        version: 1,
        applications,
        interviews,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("exportFailed"), msg);
    } finally {
      setExportingPdf(false);
    }
  };

  const onExportCsv = async () => {
    if (!db || ready !== "ready") return;
    setExportingCsv(true);
    try {
      const applications = await listApplications(db, { archived: "all" });
      const interviews = await listAllInterviews(db);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      await shareCsvExport(`lokerin-export-${stamp}.csv`, {
        exportedAt: new Date().toISOString(),
        version: 1,
        applications,
        interviews,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("exportFailed"), msg);
    } finally {
      setExportingCsv(false);
    }
  };

  const onImport = async () => {
    if (!db || ready !== "ready") return;
    setImportConfirmVisible(true);
  };

  const confirmImport = async () => {
    if (!db || ready !== "ready") return;
    setImportConfirmVisible(false);
    setImporting(true);
    try {
      const payload = await pickJsonImport();
      if (!payload) return;
      await replaceAllData(db, payload);
      setDialogMessage(t("restoreSuccess"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("importFailed"), msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 }}
    >
      <Text numberOfLines={1} style={styles.h1}>
        {t("settings")}
      </Text>

      <View style={styles.card}>
        <Text numberOfLines={1} style={styles.label}>
          {t("language")}
        </Text>
        <View style={styles.segment}>
          {languageOptions.map((option) => {
            const active = option.value === language;
            return (
              <Pressable
                key={option.value}
                onPress={() => setLanguage(option.value)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option.label}
              >
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text numberOfLines={1} style={styles.label}>
          {t("appearance")}
        </Text>
        <View style={styles.segment}>
          {themeOptions.map((option) => {
            const active = option.value === theme;
            return (
              <Pressable
                key={option.value}
                onPress={() => setTheme(option.value)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(option.labelKey)}
              >
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {t(option.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text numberOfLines={1} style={styles.label}>
          {t("connectivity")}
        </Text>
        <Text numberOfLines={1} style={styles.value}>
          {online === null ? t("checking") : online ? t("online") : t("offline")}
        </Text>
        <Text numberOfLines={3} style={styles.note}>
          {t("offlineHint")}
        </Text>
      </View>

      <View style={styles.card}>
        <Text numberOfLines={1} style={styles.label}>
          {t("notifications")}
        </Text>
        <Text numberOfLines={2} style={styles.note}>
          {t("notificationsNote")}
        </Text>
        <Text numberOfLines={2} style={styles.value}>
          {reminderStatusText}
        </Text>
        <View style={styles.segment}>
          {[
            { value: true, label: t("notificationOn") },
            { value: false, label: t("notificationOff") },
          ].map((option) => {
            const active = option.value === remindersEnabled;
            return (
              <Pressable
                key={option.label}
                disabled={savingReminders}
                onPress={() => void onToggleReminders(option.value)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled: savingReminders }}
                accessibilityLabel={`${t("notifications")}: ${option.label}`}
              >
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text numberOfLines={1} style={styles.label}>
          {t("backupReminder")}
        </Text>
        <Text numberOfLines={2} style={styles.note}>
          {t("backupReminderNote")}
        </Text>
        <View style={styles.segment}>
          {[
            { value: true, label: t("notificationOn") },
            { value: false, label: t("notificationOff") },
          ].map((option) => {
            const active = option.value === backupRemindersEnabled;
            return (
              <Pressable
                key={option.label}
                disabled={savingBackupReminders}
                onPress={() => void onToggleBackupReminders(option.value)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled: savingBackupReminders }}
                accessibilityLabel={`${t("backupReminder")}: ${option.label}`}
              >
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text numberOfLines={1} style={styles.label}>
          {t("dataExport")}
        </Text>
        <Text numberOfLines={3} style={styles.note}>
          {t("exportNote")}
        </Text>
        <Pressable
          onPress={() => setExportMenuOpen((open) => !open)}
          style={styles.dropdownTrigger}
          accessibilityRole="button"
          accessibilityLabel={t("dataExport")}
          accessibilityState={{ expanded: exportMenuOpen }}
        >
          <Text numberOfLines={1} style={styles.dropdownText}>
            {t("dataExport")}
          </Text>
          <Ionicons name={exportMenuOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
        </Pressable>
        {exportMenuOpen ? (
          <View style={styles.dropdownMenu}>
            <PrimaryButton title={t("exportJson")} loading={exporting} onPress={() => void onExport()} />
            <PrimaryButton
              title={t("exportCsv")}
              loading={exportingCsv}
              variant="secondary"
              onPress={() => void onExportCsv()}
              style={{ marginTop: spacing.sm }}
            />
            <PrimaryButton
              title={t("exportPdf")}
              loading={exportingPdf}
              variant="secondary"
              onPress={() => void onExportPdf()}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text numberOfLines={1} style={styles.label}>
          {t("importRestore")}
        </Text>
        <Text numberOfLines={3} style={styles.note}>
          {t("importNote")}
        </Text>
        <PrimaryButton title={t("importJson")} loading={importing} variant="secondary" onPress={() => void onImport()} />
      </View>

      <View style={styles.card}>
        <Text numberOfLines={1} style={styles.label}>
          {t("privacy")}
        </Text>
        <Text numberOfLines={4} style={styles.note}>
          {t("privacyNote")}
        </Text>
        <PrimaryButton
          title={t("privacyPolicy")}
          variant="secondary"
          onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
        />
      </View>

      <View style={styles.card}>
        <Text numberOfLines={1} style={styles.label}>
          {t("about")}
        </Text>
        <Text numberOfLines={2} style={styles.note}>
          Lokerin 1.0.0
        </Text>
        <PrimaryButton
          title={t("resetOnboarding")}
          variant="secondary"
          onPress={() => {
            void resetOnboarding().then(() => setDialogMessage(t("resetOnboardingDone")));
          }}
        />
      </View>
      <ThemedDialog
        visible={!!dialogMessage}
        message={dialogMessage ?? ""}
        buttonLabel={t("close")}
        onClose={() => setDialogMessage(null)}
      />
      <ThemedDialog
        visible={importConfirmVisible}
        title={t("restoreConfirmTitle")}
        message={t("restoreConfirmMessage")}
        buttonLabel={t("restore")}
        onClose={() => void confirmImport()}
        secondaryButtonLabel={t("cancel")}
        onSecondaryPress={() => setImportConfirmVisible(false)}
      />
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  h1: { color: colors.text, fontSize: 24, fontWeight: "900", marginBottom: spacing.md },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    minHeight: 112,
    width: "100%",
  },
  label: { color: colors.text, fontWeight: "900" },
  value: { color: colors.primaryPressed, fontWeight: "900" },
  note: { color: colors.textMuted, lineHeight: 20 },
  dropdownTrigger: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: { color: colors.text, fontWeight: "900", flex: 1, minWidth: 0 },
  dropdownMenu: { marginTop: spacing.sm },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentButton: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentText: { color: colors.textMuted, fontWeight: "800", fontSize: 13 },
  segmentTextActive: { color: colors.text },
});
