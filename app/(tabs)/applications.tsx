import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getStatusFilterOptions, getStatusLabel } from "@/constants/statuses";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { useDatabase } from "@/context/DatabaseContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { listApplications } from "@/repositories/applicationsRepository";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import type { ApplicationStatus, JobApplication } from "@/types/models";

export default function ApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { db, ready } = useDatabase();
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [archiveMode, setArchiveMode] = useState<"active" | "archived">("active");
  const [sort, setSort] = useState<"newest" | "followUpSoon" | "companyAsc">("newest");
  const chips = useMemo(() => getStatusFilterOptions(language), [language]);
  const activeFilterLabel = chips.find((item) => item.value === filter)?.label ?? "";
  const sortOptions = [
    { value: "newest" as const, label: t("sortNewest") },
    { value: "followUpSoon" as const, label: t("sortFollowUpSoon") },
    { value: "companyAsc" as const, label: t("sortCompany") },
  ];

  const load = useCallback(async () => {
    if (!db || ready !== "ready") return;
    setLoading(true);
    try {
      const query = search.trim().toLowerCase();
      const statusMatches = query
        ? chips
            .filter((item) => item.value !== "all" && item.label.toLowerCase().includes(query))
            .map((item) => item.value)
        : [];
      const rows = await listApplications(db, { status: filter, search, archived: archiveMode, statusMatches, sort });
      setItems(rows);
    } finally {
      setLoading(false);
    }
  }, [db, ready, filter, search, archiveMode, chips, sort]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const ListHeader = (
    <View style={styles.headerContent}>
      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("search")}
            placeholderTextColor={colors.textMuted}
            style={styles.search}
            accessibilityLabel={t("search")}
            returnKeyType="search"
            multiline={false}
            numberOfLines={1}
          />
        </View>
        <Link href="/application/new" asChild>
          <Pressable style={styles.fab} accessibilityRole="button" accessibilityLabel={t("add")}>
            <Ionicons name="add" size={24} color={colors.text} />
          </Pressable>
        </Link>
      </View>

      <View style={styles.chipGrid}>
        {chips.map((item) => {
          const active = item.value === filter;
          return (
            <Pressable
              key={item.value}
              onPress={() => setFilter(item.value)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.label}
            >
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[styles.chipText, active && styles.chipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.archiveSegment}>
        {(["active", "archived"] as const).map((mode) => {
          const active = archiveMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => setArchiveMode(mode)}
              style={[styles.archiveSegmentButton, active && styles.archiveSegmentButtonActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={mode === "active" ? t("active") : t("archived")}
            >
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[styles.archiveSegmentText, active && styles.archiveSegmentTextActive]}>
                {mode === "active" ? t("active") : t("archived")}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text numberOfLines={1} style={styles.sortLabel}>{t("sort")}</Text>
      <View style={styles.sortRow}>
        {sortOptions.map((option) => {
          const active = sort === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setSort(option.value)}
              style={[styles.sortChip, active && styles.sortChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.label}
            >
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={[styles.sortText, active && styles.sortTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

    </View>
  );

  return (
    <View style={styles.screen}>
      {loading ? (
        <View style={styles.loadingWrap}>
          {ListHeader}
          <ActivityIndicator color={colors.primaryPressed} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          ListEmptyComponent={
            <EmptyState
              title={search ? t("noMatches") : archiveMode === "archived" ? t("noArchivedApplications") : t("noApplications")}
              subtitle={search ? t("tryDifferentSearch") : filter !== "all" ? `${activeFilterLabel}: ${t("noMatches")}` : undefined}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/application/${item.id}`)}
              style={styles.card}
              accessibilityRole="button"
              accessibilityLabel={`${item.company}, ${item.role}, ${getStatusLabel(item.status, language)}`}
            >
              <View style={styles.cardTop}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.company}>
                  {item.company}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              <Text numberOfLines={2} ellipsizeMode="tail" style={styles.role}>
                {item.role}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {t("updated")} {new Date(item.updatedAt).toLocaleString(undefined, { dateStyle: "medium" })}
              </Text>
              {item.nextFollowUpAt ? (
                <Text numberOfLines={1} style={styles.followUp}>
                  {t("followUp")}: {new Date(item.nextFollowUpAt).toLocaleDateString()}
                </Text>
              ) : (
                <Text numberOfLines={1} style={styles.followUpPlaceholder}>
                  {t("noFollowUp")}
                </Text>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerContent: { paddingTop: spacing.sm, paddingBottom: spacing.sm },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  searchWrap: {
    flex: 1,
    height: 46,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  search: { flex: 1, color: colors.text, fontSize: 15, minWidth: 0 },
  fab: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    width: "23%",
    height: 34,
    paddingHorizontal: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { borderColor: colors.primaryPressed, backgroundColor: colors.primarySoft },
  chipText: { color: colors.textMuted, fontWeight: "800", fontSize: 12 },
  chipTextActive: { color: colors.text },
  loadingWrap: { flex: 1 },
  archiveSegment: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  archiveSegmentButton: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  archiveSegmentButtonActive: { backgroundColor: colors.primary },
  archiveSegmentText: { color: colors.textMuted, fontWeight: "800", fontSize: 13 },
  archiveSegmentTextActive: { color: colors.text },
  sortLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "900", marginHorizontal: spacing.lg, marginBottom: spacing.xs },
  sortRow: { flexDirection: "row", gap: spacing.xs, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  sortChip: {
    flex: 1,
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  sortChipActive: { borderColor: colors.borderStrong, backgroundColor: colors.primarySoft },
  sortText: { color: colors.textMuted, fontWeight: "800", fontSize: 11 },
  sortTextActive: { color: colors.text },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 112,
    marginHorizontal: spacing.lg,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm, minHeight: 28 },
  company: { color: colors.text, fontSize: 18, fontWeight: "900", flex: 1, minWidth: 0 },
  role: { color: colors.textMuted, marginTop: spacing.xs, lineHeight: 19 },
  meta: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 12 },
  followUp: { color: colors.primaryPressed, marginTop: spacing.xs, fontSize: 12, fontWeight: "800" },
  followUpPlaceholder: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 12 },
});
