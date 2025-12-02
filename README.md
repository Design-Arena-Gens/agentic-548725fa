# AI Receptionist Agent

A voice-enabled, real-time receptionist assistant for scheduling, FAQs, and business info. Optimized for Vercel.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Env (optional)
- `CALENDLY_TOKEN`: Use Calendly API for bookings
- `GCAL_CREDENTIALS`: Google service account credentials JSON (stringified)
- `GCAL_CALENDAR_ID`: Google Calendar ID

Without these, an in-memory scheduler is used via API for demo purposes.

## Deployment
This project is configured for Vercel. Use:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-548725fa
```

Then verify:

```bash
curl https://agentic-548725fa.vercel.app
```
