import { type SchedulerProvider, type AvailabilitySlot, type Appointment, type ClientDetails } from "../types";

export function clientScheduler(): SchedulerProvider {
  async function getAvailability(opts: { fromIso?: string; toIso?: string }) {
    const params = new URLSearchParams();
    if (opts.fromIso) params.set("fromIso", opts.fromIso);
    if (opts.toIso) params.set("toIso", opts.toIso);
    const res = await fetch(`/api/availability?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("availability_failed");
    const data = await res.json();
    return data.slots as AvailabilitySlot[];
  }

  async function book(opts: { client: Required<ClientDetails>; startIso: string; endIso: string; serviceType?: string }) {
    const res = await fetch(`/api/appointments`, { method: "POST", body: JSON.stringify(opts) });
    if (!res.ok) throw new Error("booking_failed");
    const data = await res.json();
    return data.appt as Appointment;
  }

  async function reschedule(opts: { id: string; newStartIso: string; newEndIso: string }) {
    const res = await fetch(`/api/appointments`, { method: "PUT", body: JSON.stringify(opts) });
    if (!res.ok) throw new Error("reschedule_failed");
    return (await res.json()).appt as Appointment;
  }

  async function cancel(opts: { id: string }) { return { id: opts.id, cancelled: true }; }
  async function findByClient() { return [] as Appointment[]; }

  return { label: "client", getAvailability, book, reschedule, cancel, findByClient };
}
