import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import type { JobApplication } from "@/types/models";

const CHANNEL_ID = "follow-up-reminders";
const STORAGE_KEY = "lokerin.followUpRemindersEnabled";
const BACKUP_STORAGE_KEY = "lokerin.backupRemindersEnabled";
const BACKUP_NOTIFICATION_ID_KEY = "lokerin.backupReminderNotificationId";

let prepared = false;
type NotificationsModule = typeof import("expo-notifications");

function canUseNotifications(): boolean {
  return Platform.OS !== "web" && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!canUseNotifications()) return null;
  return import("expo-notifications");
}

export async function configureNotificationPresentation(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function prepareNotifications(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) return false;
  if (!prepared && Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Follow-up reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  prepared = true;

  const current = await Notifications.getPermissionsAsync();
  const permission =
    current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
      ? current
      : await Notifications.requestPermissionsAsync();

  return permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function getFollowUpRemindersEnabled(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored !== "false";
}

export async function setFollowUpRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}

export async function getBackupRemindersEnabled(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(BACKUP_STORAGE_KEY);
  return stored === "true";
}

export async function setBackupRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BACKUP_STORAGE_KEY, enabled ? "true" : "false");
}

export async function getFollowUpReminderPermissionStatus(): Promise<"available" | "unavailable" | "granted" | "denied"> {
  const Notifications = await loadNotifications();
  if (!Notifications) return "unavailable";
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return "granted";
  }
  if (current.canAskAgain) return "available";
  return "denied";
}

export async function cancelFollowUpReminder(notificationId: string | null | undefined): Promise<void> {
  const Notifications = await loadNotifications();
  if (!notificationId || !Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // A stale notification id should not block saving application data.
  }
}

function reminderDate(value: string): Date | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const hasTime = value.includes("T");
  const date = hasTime
    ? parsed
    : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 9, 0, 0, 0);

  if (date.getTime() <= Date.now()) return null;
  return date;
}

export async function scheduleFollowUpReminder(
  app: Pick<JobApplication, "company" | "role" | "nextFollowUpAt">
): Promise<string | null> {
  const enabled = await getFollowUpRemindersEnabled();
  if (!enabled) return null;
  if (!app.nextFollowUpAt) return null;
  const date = reminderDate(app.nextFollowUpAt);
  if (!date) return null;
  const allowed = await prepareNotifications();
  if (!allowed) return null;
  const Notifications = await loadNotifications();
  if (!Notifications) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Follow-up due",
      body: `${app.company} - ${app.role}`,
      data: { screen: "application" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: CHANNEL_ID,
    },
  });
}

export async function refreshBackupReminder(
  enabled: boolean,
  title: string,
  body: string
): Promise<boolean> {
  await setBackupRemindersEnabled(enabled);
  const Notifications = await loadNotifications();
  const existingId = await AsyncStorage.getItem(BACKUP_NOTIFICATION_ID_KEY);
  if (existingId && Notifications) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    } catch {
      // Stale ids should not block changing the setting.
    }
  }
  await AsyncStorage.removeItem(BACKUP_NOTIFICATION_ID_KEY);

  if (!enabled) return true;
  const allowed = await prepareNotifications();
  if (!allowed) return false;
  const readyNotifications = await loadNotifications();
  if (!readyNotifications) return false;

  const id = await readyNotifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type: readyNotifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 7 * 24 * 60 * 60,
      repeats: true,
      channelId: CHANNEL_ID,
    },
  });
  await AsyncStorage.setItem(BACKUP_NOTIFICATION_ID_KEY, id);
  return true;
}
