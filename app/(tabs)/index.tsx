import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type DimensionValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStatusLabel, STATUS_ORDER } from "@/constants/statuses";
import { useDatabase } from "@/context/DatabaseContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { countByStatus, listAllInterviews, listApplications } from "@/repositories/applicationsRepository";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import type { ApplicationStatus, JobApplication } from "@/types/models";

export default function OverviewScreen() {
  const router = useRouter();
  const { db, ready } = useDatabase();
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<{ id: string; company: string; role: string; status: ApplicationStatus }[]>([]);
  const [analytics, setAnalytics] = useState({
    overdueFollowUps: 0,
    upcomingFollowUps: 0,
    upcomingInterviews: 0,
    responseRate: 0,
    offerRate: 0,
    weeklyActivity: 0,
  });
  const [nextAction, setNextAction] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!db || ready !== "ready") return;
    setLoading(true);
    try {
      const c = await countByStatus(db);
      setCounts(c);
      const apps = await listApplications(db, {});
      const interviews = await listAllInterviews(db);
      const activeAppIds = new Set(apps.map((item) => item.id));
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const weekEnd = todayStart + 7 * 24 * 60 * 60 * 1000;
      const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;
      const respondedStatuses: ApplicationStatus[] = ["screening", "interview", "offer", "rejected", "withdrawn"];
      const datedFollowUps = apps
        .filter((a) => a.nextFollowUpAt)
        .map((a) => ({ app: a, date: new Date(a.nextFollowUpAt ?? "") }))
        .filter((item) => !Number.isNaN(item.date.getTime()))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      setAnalytics({
        overdueFollowUps: datedFollowUps.filter((item) => item.date.getTime() < todayStart).length,
        upcomingFollowUps: datedFollowUps.filter((item) => {
          const time = item.date.getTime();
          return time >= todayStart && time <= weekEnd;
        }).length,
        upcomingInterviews: interviews.filter((interview) => {
          if (!activeAppIds.has(interview.applicationId)) return false;
          if (!interview.scheduledAt) return false;
          const time = new Date(interview.scheduledAt).getTime();
          return !Number.isNaN(time) && time >= now.getTime() && time <= weekEnd;
        }).length,
        responseRate: apps.length
          ? Math.round((apps.filter((app) => respondedStatuses.includes(app.status)).length / apps.length) * 100)
          : 0,
        offerRate: apps.length
          ? Math.round((apps.filter((app) => app.status === "offer").length / apps.length) * 100)
          : 0,
        weeklyActivity: apps.filter((app) => {
          const updated = new Date(app.updatedAt).getTime();
          return !Number.isNaN(updated) && updated >= weekStart;
        }).length,
      });
      setNextAction(datedFollowUps[0]?.app ?? null);
      setRecent(
        apps.slice(0, 5).map((a) => ({
          id: a.id,
          company: a.company,
          role: a.role,
          status: a.status,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [db, ready]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const total = STATUS_ORDER.reduce((acc, s) => acc + (counts[s] ?? 0), 0);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <View style={styles.hero}>
        <Text numberOfLines={1} style={styles.h1}>
          Lokerin
        </Text>
        <Text numberOfLines={2} style={styles.sub}>
          {t("appSummary")}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primaryPressed} />
        </View>
      ) : (
        <>
          <View style={styles.metricCard} accessible accessibilityLabel={`${t("pipelineTotals")}: ${total} ${t("applications")}`}>
            <Text numberOfLines={1} style={[styles.cardTitle, styles.metricTitle]}>
              {t("pipelineTotals")}
            </Text>
            <Text numberOfLines={1} style={styles.total}>
              {total}
            </Text>
            <Text numberOfLines={1} style={styles.totalLabel}>
              {t("applications")}
            </Text>
          </View>

          <View
            style={styles.diagramCard}
            accessible
            accessibilityLabel={`${t("responseRate")}: ${analytics.responseRate}%. ${t("offerRate")}: ${analytics.offerRate}%. ${t("analyticsNeedsAction")}: ${analytics.overdueFollowUps}. ${t("analyticsNextSteps")}: ${analytics.upcomingFollowUps}. ${t("analyticsInterviews")}: ${analytics.upcomingInterviews}. ${t("analyticsThisWeek")}: ${analytics.weeklyActivity}.`}
          >
            <View style={styles.diagramTop}>
              {[
                { label: t("responseRate"), value: analytics.responseRate, color: colors.accent },
                { label: t("offerRate"), value: analytics.offerRate, color: colors.primaryPressed },
              ].map((item) => (
                <View key={item.label} style={styles.percentBlock}>
                  <View style={styles.ring}>
                    <View style={[styles.ringFill, { height: `${Math.max(8, item.value)}%`, backgroundColor: item.color }]} />
                    <Text numberOfLines={1} adjustsFontSizeToFit style={styles.ringText}>
                      {item.value}%
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={styles.analyticsLabel}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.barChart}>
              {[
                { label: t("analyticsNeedsAction"), value: analytics.overdueFollowUps, icon: "alert-circle-outline" as const },
                { label: t("analyticsNextSteps"), value: analytics.upcomingFollowUps, icon: "arrow-forward-circle-outline" as const },
                { label: t("analyticsInterviews"), value: analytics.upcomingInterviews, icon: "chatbubbles-outline" as const },
                { label: t("analyticsThisWeek"), value: analytics.weeklyActivity, icon: "calendar-outline" as const },
              ].map((item, _index, all) => {
                const max = Math.max(1, ...all.map((metric) => metric.value));
                const width = `${Math.max(10, (item.value / max) * 100)}%` as DimensionValue;
                return (
                  <View key={item.label} style={styles.barRow}>
                    <View style={styles.barLabelWrap}>
                      <Ionicons name={item.icon} size={15} color={colors.textMuted} />
                      <Text numberOfLines={1} style={styles.barLabel}>
                        {item.label}
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width }]} />
                    </View>
                    <Text numberOfLines={1} style={styles.barValue}>
                      {item.value}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {t("nextAction")}
            </Text>
            {nextAction ? (
              <Pressable
                onPress={() => router.push(`/application/${nextAction.id}`)}
                style={({ pressed }) => [styles.recentRow, pressed && styles.recentRowPressed]}
                accessibilityRole="button"
                accessibilityLabel={`${nextAction.company}, ${nextAction.role}, ${t("followUp")}: ${new Date(nextAction.nextFollowUpAt ?? "").toLocaleDateString()}`}
              >
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.recentMain}>
                  {nextAction.company} - {nextAction.role}
                </Text>
                <Text numberOfLines={1} style={styles.muted}>
                  {t("followUp")}: {new Date(nextAction.nextFollowUpAt ?? "").toLocaleDateString()}
                </Text>
              </Pressable>
            ) : (
              <Text numberOfLines={2} style={styles.muted}>
                {t("noNextAction")}
              </Text>
            )}
          </View>

          <View style={styles.card}>
            {STATUS_ORDER.map((s) => (
              <View key={s} style={styles.row}>
                <Text numberOfLines={1} style={styles.rowLabel}>
                  {getStatusLabel(s, language)}
                </Text>
                <Text numberOfLines={1} style={styles.rowValue}>
                  {counts[s] ?? 0}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {t("recent")}
            </Text>
            {recent.length === 0 ? (
              <Text numberOfLines={2} style={styles.muted}>
                {t("noApplications")}
              </Text>
            ) : (
              recent.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => router.push(`/application/${r.id}`)}
                  style={({ pressed }) => [styles.recentRow, pressed && styles.recentRowPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`${r.company}, ${r.role}, ${getStatusLabel(r.status, language)}`}
                >
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.recentMain}>
                    {r.company} - {r.role}
                  </Text>
                  <Text numberOfLines={1} style={styles.muted}>
                    {getStatusLabel(r.status, language)}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl * 2 },
  hero: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  h1: { color: colors.text, fontSize: 26, fontWeight: "900" },
  sub: { color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  loader: { paddingVertical: spacing.xl },
  metricCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    minHeight: 116,
    width: "100%",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
  },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "800", marginBottom: spacing.sm },
  metricTitle: { marginBottom: 0 },
  diagramCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  diagramTop: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.md },
  percentBlock: { flex: 1, alignItems: "center", minWidth: 0 },
  ring: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  ringFill: { position: "absolute", left: 0, right: 0, bottom: 0 },
  ringText: { color: colors.text, fontSize: 20, fontWeight: "900", zIndex: 1 },
  barChart: { gap: spacing.sm },
  barRow: { flexDirection: "row", alignItems: "center", minHeight: 28, gap: spacing.sm },
  barLabelWrap: { flexDirection: "row", alignItems: "center", gap: spacing.xs, width: 122, minWidth: 0 },
  barLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "700", flex: 1, minWidth: 0 },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999, backgroundColor: colors.primary },
  barValue: { color: colors.text, fontSize: 12, fontWeight: "900", minWidth: 24, textAlign: "right" },
  analyticsLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  total: { color: colors.text, fontSize: 38, fontWeight: "900", marginTop: -spacing.xs },
  totalLabel: { color: colors.primaryPressed, fontSize: 13, fontWeight: "800", marginTop: -spacing.xs },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    minHeight: 36,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowLabel: { color: colors.text, flex: 1, minWidth: 0, paddingRight: spacing.md },
  rowValue: { color: colors.text, fontWeight: "800", minWidth: 36, textAlign: "right" },
  muted: { color: colors.textMuted, lineHeight: 20 },
  recentRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    minHeight: 56,
    justifyContent: "center",
  },
  recentRowPressed: { backgroundColor: colors.primarySoft },
  recentMain: { color: colors.text, fontWeight: "800", marginBottom: spacing.xs },
});
