import { BUSINESS } from "./business";
import { detectIntent, extractName, extractPhone } from "./nlu";
import { clientScheduler } from "./providers/clientScheduler";
import type { AgentOutput, Appointment, ClientDetails, DialogEvent, Intent } from "./types";

interface State {
  intent: Intent | null;
  details: ClientDetails;
  stage: "idle" | "greeting" | "collect_details" | "propose_time" | "confirm" | "booked" | "reschedule_lookup" | "reschedule_propose" | "cancel_lookup" | "confirm_lookup" | "faq" | "business_info" | "escalate";
  pendingSlots: { startIso: string; endIso: string }[];
  pendingAppt?: Appointment;
}

export type { DialogEvent, Intent } from "./types";
export type { DialogTurn } from "./types";

export function newDialogManager() {
  const scheduler = clientScheduler();
  const state: State = {
    intent: null,
    details: {},
    stage: "greeting",
    pendingSlots: [],
  };

  function say(text: string): AgentOutput { return { say: text }; }

  function getOpeningLine() {
    return `Hello, this is the Northstar assistant. How can I help today? I can schedule or reschedule appointments, confirm bookings, share hours and location, and answer common questions.`;
  }

  async function handle(evt: DialogEvent): Promise<AgentOutput | undefined> {
    if (evt.type === "user_text") {
      const text = evt.text.trim();
      if (!text) return;

      // Always try to enrich details from any message
      state.details.name ||= extractName(text);
      state.details.phone ||= extractPhone(text);

      // If mid-flow, keep current intent; otherwise detect
      if (!state.intent || state.stage === "greeting") {
        const intent = detectIntent(text);
        state.intent = intent;
        if (intent === "greet") return say("Hello. How can I assist you today?");
        if (intent === "business_info") return businessInfo();
        if (intent === "faq") return faq(text);
        if (intent === "escalate") return escalate();
        if (intent === "confirm") { state.stage = "confirm_lookup"; return askForLookup(); }
        if (intent === "cancel") { state.stage = "cancel_lookup"; return askForLookup(); }
        if (intent === "reschedule") { state.stage = "reschedule_lookup"; return askForLookup(); }
        if (intent === "schedule") { state.stage = "collect_details"; return askForDetails(); }
        return say("I can help with scheduling, rescheduling, confirmations, FAQs, or business info. What would you like to do?");
      }

      // Handle stages
      switch (state.stage) {
        case "collect_details": {
          if (!state.details.name) return say("Got it. What's your full name?");
          if (!state.details.phone) return say("Thanks. What is the best phone number to reach you?");
          if (!state.details.serviceType) {
            const list = BUSINESS.services.map((s) => s.name).join(", ");
            const hint = `We offer ${list}. Which service do you need?`;
            const matched = BUSINESS.services.find((s) => text.toLowerCase().includes(s.name.toLowerCase()) || text.toLowerCase().includes(s.id));
            if (!matched) return say(hint);
            state.details.serviceType = matched.id;
          }
          state.stage = "propose_time";
          const slots = await scheduler.getAvailability({});
          state.pendingSlots = slots.slice(0, 5);
          if (state.pendingSlots.length === 0) return say("I don't have live availability to propose right now. Do you have a preferred date and time?");
          return say("Here are some upcoming times: " +
            state.pendingSlots.map((s, i) => `${i + 1}. ${formatTime(s.startIso)}`).join("; ") + ". You can say a number or suggest another time.");
        }
        case "propose_time": {
          const idx = parseChoiceIndex(text, state.pendingSlots.length);
          if (idx === null) return say("Please pick a listed option (say 1?5) or provide a specific date and time.");
          const slot = state.pendingSlots[idx];
          const appt = await scheduler.book({ client: reqDetails(state.details), startIso: slot.startIso, endIso: slot.endIso, serviceType: state.details.serviceType });
          state.pendingAppt = appt;
          state.stage = "booked";
          return say(`You're all set for ${formatTime(appt.startIso)}. I'll send a confirmation to your phone ending ${appt.client.phone.slice(-4)}. Anything else I can help with?`);
        }
        case "reschedule_lookup": {
          if (!state.details.phone && !state.details.name) return say("To find your booking, please share your name or phone number.");
          // Client-side demo can't look up; offer escalation
          state.stage = "escalate";
          return say("For security, I need to verify your booking with a human coordinator. I've escalated your request.");
        }
        case "cancel_lookup": {
          if (!state.details.phone && !state.details.name) return say("Please share your name or phone so I can locate the booking to cancel.");
          state.stage = "escalate";
          return say("I'll route this cancellation to a human coordinator to ensure accuracy.");
        }
        case "confirm_lookup": {
          if (!state.details.phone && !state.details.name) return say("Please share your name or phone so I can check your booking.");
          state.stage = "escalate";
          return say("I'll confirm this with a coordinator and follow up shortly.");
        }
        default:
          break;
      }

      // Fallbacks if we get here in idle
      const intent = detectIntent(text);
      if (intent === "business_info") return businessInfo();
      if (intent === "faq") return faq(text);
      if (intent === "escalate") return escalate();
      if (intent === "schedule") { state.stage = "collect_details"; return askForDetails(); }
      if (intent === "confirm") { state.stage = "confirm_lookup"; return askForLookup(); }
      if (intent === "cancel") { state.stage = "cancel_lookup"; return askForLookup(); }
      if (intent === "reschedule") { state.stage = "reschedule_lookup"; return askForLookup(); }

      return say("I didn't catch that. You can say: schedule, reschedule, confirm, hours, location, services, or speak to a human.");
    }
  }

  function askForDetails() {
    if (!state.details.name) return say("Great. May I have your full name?");
    if (!state.details.phone) return say("Thanks. What is the best phone number to reach you?");
    const list = BUSINESS.services.map((s) => s.name).join(", ");
    return say(`Which service do you need? We offer ${list}.`);
  }

  function askForLookup() {
    return say("Please share your full name or phone number so I can look it up.");
  }

  function businessInfo() {
    const { hours, location, services, contact } = BUSINESS;
    return say(
      `We are at ${location.address}. Hours: ${hours.weekdays}; ${hours.saturday}; Sunday closed. ` +
      `Services include ${services.map((s) => s.name).join(", ")}. Our phone is ${contact.phone}.`
    );
  }

  function faq(text: string) {
    // Only answer from our known set to avoid hallucinations
    const { findFaq } = require("./faqs");
    const a = findFaq(text);
    if (!a) return say("I can only answer from our confirmed FAQs, and I don't have that answer. Would you like me to escalate to a human?");
    return say(a);
  }

  function escalate() {
    return say(`No problem. I'll escalate this to a human coordinator. ${BUSINESS.escalationNote}`);
  }

  return { handle, getOpeningLine };
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function reqDetails(d: any): Required<ClientDetails> {
  const name = d.name as string; const phone = d.phone as string; const serviceType = d.serviceType as string;
  return { name, phone, serviceType };
}

function parseChoiceIndex(text: string, max: number): number | null {
  const m = text.match(/\b([1-9])\b/);
  if (!m) return null;
  const idx = parseInt(m[1], 10) - 1;
  if (idx < 0 || idx >= max) return null;
  return idx;
}
