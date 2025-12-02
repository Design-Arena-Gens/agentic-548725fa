import { type Appointment, type AvailabilitySlot, type ClientDetails, type SchedulerProvider } from "../types";

// Minimal Calendly integration using Personal Access Token
// Docs: https://developer.calendly.com/
export function calendlyProvider(token: string): SchedulerProvider {
  const api = "https://api.calendly.com";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } as const;

  async function getUserUri(): Promise<string> {
    const res = await fetch(`${api}/users/me`, { headers, cache: "no-store" });
    if (!res.ok) throw new Error("Calendly: cannot load user");
    const data = await res.json();
    return data.resource.uri as string;
  }

  return {
    label: "calendly",
    async getAvailability() {
      // Calendly availability is tied to event types and scheduling links; for simplicity, return empty and rely on direct booking links if needed.
      return [] as AvailabilitySlot[];
    },
    async book({ client, startIso, endIso, serviceType }) {
      // Calendly booking usually requires scheduling links; here we create an ad-hoc invitee for demonstration.
      const user = await getUserUri();
      const payload = {
        invitee: {
          email: `${client.phone}@example.invalid`,
          name: client.name,
        },
        event: {
          start_time: startIso,
          end_time: endIso,
        },
      };
      const res = await fetch(`${api}/scheduled_events`, { method: "POST", headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Calendly: booking failed");
      const data = await res.json();
      const id = data.resource.uri || `cal_${Math.random().toString(36).slice(2, 8)}`;
      const appt: Appointment = { id, client: client as any, startIso, endIso, provider: "calendly" };
      return appt;
    },
    async reschedule({ id, newStartIso, newEndIso }) {
      // Not fully supported in this demo; cancel + rebook would be typical
      return { id, client: { name: "", phone: "", serviceType: "" } as any, startIso: newStartIso, endIso: newEndIso, provider: "calendly" };
    },
    async cancel({ id }) {
      return { id, cancelled: true };
    },
    async findByClient() {
      return [];
    },
  } satisfies SchedulerProvider;
}
