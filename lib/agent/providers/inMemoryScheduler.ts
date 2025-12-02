import { addMinutes, eachDayOfInterval, isWithinInterval, setHours, setMinutes } from "date-fns";
import { type Appointment, type AvailabilitySlot, type ClientDetails, type SchedulerProvider } from "../types";

function iso(d: Date) { return d.toISOString(); }

export function inMemoryProvider(): SchedulerProvider {
  const appts = new Map<string, Appointment>();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function generateSlots(fromIso?: string, toIso?: string): AvailabilitySlot[] {
    const now = new Date();
    const from = fromIso ? new Date(fromIso) : now;
    const to = toIso ? new Date(toIso) : addMinutes(now, 60 * 24 * 14); // next 14 days

    const days = eachDayOfInterval({ start: from, end: to });
    const slots: AvailabilitySlot[] = [];
    for (const day of days) {
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      const startHour = isWeekend ? 9 : 8;
      const endHour = isWeekend ? 14 : 18;
      for (let h = startHour; h < endHour; h++) {
        for (const m of [0, 30]) {
          const start = setMinutes(setHours(day, h), m);
          const end = addMinutes(start, 30);
          const within = isWithinInterval(start, { start: from, end: to });
          if (!within || start < now) continue;
          // exclude booked times
          const conflict = Array.from(appts.values()).some((a) =>
            !(new Date(a.endIso) <= start || new Date(a.startIso) >= end)
          );
          if (!conflict) slots.push({ startIso: iso(start), endIso: iso(end) });
        }
      }
    }
    return slots.slice(0, 100);
  }

  return {
    label: "in_memory",
    async getAvailability({ fromIso, toIso }) {
      return generateSlots(fromIso, toIso);
    },
    async book({ client, startIso, endIso, serviceType }) {
      const id = `mem_${Math.random().toString(36).slice(2, 10)}`;
      const appt: Appointment = { id, client: { ...client }, startIso, endIso, provider: "in_memory" };
      appts.set(id, appt);
      return appt;
    },
    async reschedule({ id, newStartIso, newEndIso }) {
      const prev = appts.get(id);
      if (!prev) throw new Error("Appointment not found");
      const next: Appointment = { ...prev, startIso: newStartIso, endIso: newEndIso };
      appts.set(id, next);
      return next;
    },
    async cancel({ id }) {
      const ok = appts.delete(id);
      return { id, cancelled: ok };
    },
    async findByClient({ phone, name }) {
      const items = Array.from(appts.values()).filter((a) =>
        (phone && a.client.phone.includes(phone)) || (name && a.client.name.toLowerCase().includes(name.toLowerCase()))
      );
      return items;
    }
  } satisfies SchedulerProvider;
}
