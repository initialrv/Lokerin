import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, UIManager, View } from "react-native";
import PagerView, { type PagerViewOnPageSelectedEvent } from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAccessibilityPrefs } from "@/accessibility/AccessibilityContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { radius, spacing } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import ApplicationsScreen from "./applications";
import OverviewScreen from "./index";
import SettingsScreen from "./settings";

const TAB_ICONS = ["stats-chart", "briefcase", "options"] as const;

function pathToIndex(pathname: string): number {
  if (pathname.includes("settings")) return 2;
  if (pathname.includes("applications")) return 1;
  return 0;
}

function hasNativePager(): boolean {
  return !!(
    UIManager.getViewManagerConfig("RNCViewPager") ??
    UIManager.getViewManagerConfig("RCTRNCPagerView")
  );
}

export default function TabsLayout() {
  const pathname = usePathname();
  const pagerRef = useRef<PagerView>(null);
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { reduceMotion } = useAccessibilityPrefs();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(() => pathToIndex(pathname));
  const styles = createStyles(colors, insets.top, insets.bottom);
  const nativePagerAvailable = hasNativePager();

  const tabs = useMemo(
    () => [
      { title: t("overview"), icon: TAB_ICONS[0] },
      { title: t("applications"), icon: TAB_ICONS[1] },
      { title: t("settings"), icon: TAB_ICONS[2] },
    ],
    [t]
  );

  const goToPage = useCallback(
    (index: number) => {
      setActiveIndex(index);
      if (reduceMotion) {
        pagerRef.current?.setPageWithoutAnimation(index);
      } else {
        pagerRef.current?.setPage(index);
      }
    },
    [reduceMotion]
  );

  const onPageSelected = useCallback(
    (event: PagerViewOnPageSelectedEvent) => {
      setActiveIndex(event.nativeEvent.position);
    },
    []
  );

  if (!nativePagerAvailable) {
    return (
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgElevated },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "800" },
          tabBarStyle: {
            backgroundColor: colors.bgElevated,
            borderTopColor: colors.border,
            height: 62 + Math.max(insets.bottom, 12),
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 12),
          },
          tabBarActiveTintColor: colors.primaryPressed,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("overview"),
            tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="applications"
          options={{
            title: t("applications"),
            tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("settings"),
            tabBarIcon: ({ color, size }) => <Ionicons name="options" color={color} size={size} />,
          }}
        />
      </Tabs>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {tabs[activeIndex].title}
        </Text>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={activeIndex}
        onPageSelected={onPageSelected}
        offscreenPageLimit={1}
      >
        <View key="overview" collapsable={false} style={styles.page}>
          <OverviewScreen />
        </View>
        <View key="applications" collapsable={false} style={styles.page}>
          <ApplicationsScreen />
        </View>
        <View key="settings" collapsable={false} style={styles.page}>
          <SettingsScreen />
        </View>
      </PagerView>

      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const active = activeIndex === index;
          return (
            <Pressable
              key={tab.title}
              onPress={() => goToPage(index)}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityLabel={tab.title}
              accessibilityState={{ selected: active }}
            >
              <Ionicons
                name={tab.icon}
                size={23}
                color={active ? colors.primaryPressed : colors.textMuted}
              />
              <Text
                numberOfLines={1}
                style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelInactive]}
              >
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  topInset: number,
  bottomInset: number
) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    minHeight: 56 + topInset,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: topInset,
  },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  pager: { flex: 1 },
  page: { flex: 1, backgroundColor: colors.bg },
  tabBar: {
    minHeight: 62 + Math.max(bottomInset, 12),
    paddingTop: 6,
    paddingBottom: Math.max(bottomInset, 12),
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: "row",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    minWidth: 0,
  },
  tabLabel: { fontSize: 11, fontWeight: "700", marginTop: 2, maxWidth: "100%" },
  tabLabelActive: { color: colors.primaryPressed },
  tabLabelInactive: { color: colors.textMuted },
});
