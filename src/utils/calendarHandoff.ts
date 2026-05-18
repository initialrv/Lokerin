interface CalendarEventInput {
  title: string;
  startDate: string;
  durationMinutes: number;
  notes?: string;
  location?: string | null;
}

export async function addToDeviceCalendar(input: CalendarEventInput): Promise<"saved" | "canceled"> {
  const Calendar = await import("expo-calendar");
  const available = await Calendar.isAvailableAsync();
  if (!available) {
    throw new Error("Calendar is not available on this device.");
  }

  const permission = await Calendar.requestCalendarPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Calendar permission was not granted.");
  }

  const startDate = new Date(input.startDate);
  if (Number.isNaN(startDate.getTime())) {
    throw new Error("Invalid calendar date.");
  }

  const endDate = new Date(startDate.getTime() + input.durationMinutes * 60 * 1000);
  const result = await Calendar.createEventInCalendarAsync({
    title: input.title,
    startDate,
    endDate,
    notes: input.notes,
    location: input.location ?? undefined,
    alarms: [{ relativeOffset: -30 }],
  });

  return result.action === "canceled" ? "canceled" : "saved";
}
