import "react-native-gesture-handler";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AccessibilityProvider } from "@/accessibility/AccessibilityContext";
import { DbLoadingGate } from "@/components/DbLoadingGate";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { DatabaseProvider, useDatabase } from "@/context/DatabaseContext";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";
import { configureNotificationPresentation } from "@/utils/followUpReminders";

const SPLASH_BACKGROUND = "#d7e8c7";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
void configureNotificationPresentation();

function RootStack() {
  const { ready, error, retry } = useDatabase();
  const { t } = useLanguage();
  const { colors, theme } = useTheme();

  const onLayout = useCallback(() => {
    if (ready !== "loading") {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  useEffect(() => {
    if (ready !== "loading") {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  const shellBackground = ready === "loading" ? SPLASH_BACKGROUND : colors.bg;

  return (
    <View style={{ flex: 1, backgroundColor: shellBackground }} onLayout={onLayout}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <DbLoadingGate ready={ready} error={error} onRetry={() => void retry()}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bgElevated },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="application/new" options={{ title: t("newApplication") }} />
          <Stack.Screen name="application/[id]" options={{ title: t("application") }} />
        </Stack>
        <OnboardingDialog />
      </DbLoadingGate>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: SPLASH_BACKGROUND }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AccessibilityProvider>
              <DatabaseProvider>
                <RootStack />
              </DatabaseProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
