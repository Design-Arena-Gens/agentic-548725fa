export type Role = "user" | "agent";

export interface DialogTurn {
  role: Role;
  text: string;
}

export type Intent =
  | "greet"
  | "schedule"
  | "reschedule"
  | "cancel"
  | "confirm"
  | "business_info"
  | "faq"
  | "escalate"
  | "unknown";

export type DialogEvent =
  | { type: "user_text"; text: string }
  | { type: "system"; name: string };

export interface AgentOutput {
  say?: string;
}

export interface ClientDetails {
  name?: string;
  phone?: string;
  serviceType?: string;
}

export interface Appointment {
  id: string;
  client: Required<ClientDetails>;
  startIso: string; // ISO datetime
  endIso: string; // ISO datetime
  notes?: string;
  provider?: "in_memory" | "calendly" | "google" | "custom";
}

export interface AvailabilitySlot {
  startIso: string;
  endIso: string;
}

export interface SchedulerProvider {
  getAvailability(opts: { serviceType?: string; fromIso?: string; toIso?: string }): Promise<AvailabilitySlot[]>;
  book(opts: { client: Required<ClientDetails>; startIso: string; endIso: string; serviceType?: string }): Promise<Appointment>;
  reschedule(opts: { id: string; newStartIso: string; newEndIso: string }): Promise<Appointment>;
  cancel(opts: { id: string }): Promise<{ id: string; cancelled: boolean }>;
  findByClient(opts: { phone?: string; name?: string }): Promise<Appointment[]>;
  label: string;
}
