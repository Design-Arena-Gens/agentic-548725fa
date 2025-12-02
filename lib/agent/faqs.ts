export const FAQS: { q: string; a: string }[] = [
  { q: "Do you accept insurance?", a: "We provide detailed receipts for out-of-network reimbursement. Please check with your insurer." },
  { q: "Where are you located?", a: "123 Aurora Ave, Suite 200, Seattle, WA 98101. There's garage parking with validation." },
  { q: "What are your hours?", a: "Mon?Fri 8:00 AM ? 6:00 PM; Sat 9:00 AM ? 2:00 PM; Sun closed." },
  { q: "What services do you offer?", a: "Initial consultation, follow-ups, and therapy sessions. Happy to help you choose." },
  { q: "How do I cancel?", a: "Tell me your name and phone, and I can cancel or reschedule for you." },
];

export function findFaq(question: string): string | undefined {
  const lower = question.toLowerCase();
  const match = FAQS.find(({ q }) => lower.includes(q.toLowerCase().replace(/[^a-z0-9 ]/gi, "")));
  return match?.a;
}
