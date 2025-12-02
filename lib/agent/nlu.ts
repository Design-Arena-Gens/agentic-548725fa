import { Intent } from "./types";

const intentMatchers: { intent: Intent; patterns: RegExp[] }[] = [
  { intent: "schedule", patterns: [/schedule|book|appointment|reserve/i] },
  { intent: "reschedule", patterns: [/reschedule|move|change time|change my/i] },
  { intent: "cancel", patterns: [/cancel|can't make|cannot make|remove/i] },
  { intent: "confirm", patterns: [/confirm|is my booking|do i have/i] },
  { intent: "business_info", patterns: [/hours|location|address|where|when open|services|pricing/i] },
  { intent: "faq", patterns: [/insurance|how do|what is|policy|policies|payment/i] },
  { intent: "escalate", patterns: [/human|agent|representative|manager|escalate/i] },
  { intent: "greet", patterns: [/hello|hi|good (morning|afternoon|evening)/i] },
];

export function detectIntent(text: string): Intent {
  for (const m of intentMatchers) {
    if (m.patterns.some((p) => p.test(text))) return m.intent;
  }
  return "unknown";
}

export function extractPhone(text: string): string | undefined {
  const m = text.replace(/[^0-9]/g, "").match(/(\d{10,15})/);
  return m?.[1];
}

export function extractName(text: string): string | undefined {
  // naive: take words that start with capital letters
  const m = text.match(/\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/);
  if (m) return `${m[1]} ${m[2]}`;
  return undefined;
}
