import { type Appointment, type AvailabilitySlot, type ClientDetails, type SchedulerProvider } from "../types";

export function buildScheduler(): SchedulerProvider {
  // Env-driven provider selection
  if (process.env.CALENDLY_TOKEN) {
    const { calendlyProvider } = require("./calendly");
    return calendlyProvider(process.env.CALENDLY_TOKEN as string);
  }
  if (process.env.GCAL_CREDENTIALS && process.env.GCAL_CALENDAR_ID) {
    const { googleCalendarProvider } = require("./googleCalendar");
    return googleCalendarProvider({
      credentialsJson: process.env.GCAL_CREDENTIALS as string,
      calendarId: process.env.GCAL_CALENDAR_ID as string,
      timezone: process.env.TZ || "America/Los_Angeles",
    });
  }
  const { inMemoryProvider } = require("./inMemoryScheduler");
  return inMemoryProvider();
}

export type { SchedulerProvider };
