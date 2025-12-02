import { type SchedulerProvider, type AvailabilitySlot, type Appointment } from "../types";

// Lightweight placeholder for Google Calendar integration (service account)
// In a real setup, use googleapis library; here we no-op to avoid heavy deps.
export function googleCalendarProvider(opts: { credentialsJson: string; calendarId: string; timezone: string }): SchedulerProvider {
  return {
    label: "google",
    async getAvailability() {
      return [] as AvailabilitySlot[];
    },
    async book({ client, startIso, endIso }) {
      const id = `gcal_${Math.random().toString(36).slice(2, 10)}`;
      const appt: Appointment = { id, client: client as any, startIso, endIso, provider: "google" };
      return appt;
    },
    async reschedule({ id, newStartIso, newEndIso }) {
      return { id, client: { name: "", phone: "", serviceType: "" } as any, startIso: newStartIso, endIso: newEndIso, provider: "google" };
    },
    async cancel({ id }) {
      return { id, cancelled: true };
    },
    async findByClient() { return []; },
  };
}
