export const BUSINESS = {
  name: "Northstar Wellness Clinic",
  location: {
    address: "123 Aurora Ave, Suite 200, Seattle, WA 98101",
    mapUrl: "https://maps.google.com/?q=123+Aurora+Ave+Seattle+WA+98101",
    parking: "Garage parking onsite; validation available for first 90 minutes.",
  },
  hours: {
    weekdays: "Mon?Fri 8:00 AM ? 6:00 PM",
    saturday: "Sat 9:00 AM ? 2:00 PM",
    sunday: "Closed",
    holidays: "Closed on federal holidays.",
  },
  services: [
    { id: "consult", name: "Initial Consultation", durationMin: 30 },
    { id: "followup", name: "Follow-up Appointment", durationMin: 30 },
    { id: "therapy", name: "Therapy Session", durationMin: 60 },
  ],
  policies: {
    cancellation: "Please cancel or reschedule at least 24 hours in advance to avoid a fee.",
    payment: "We accept all major credit cards and HSA/FSA.",
  },
  contact: {
    phone: "+1 (206) 555-0162",
    email: "care@northstarwellness.example",
  },
  escalationNote: "A human coordinator will review and reply promptly during business hours.",
} as const;
