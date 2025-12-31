# Customer Service Ticketing System MVP

A Next.js-based ticket system with multi-channel creation (form, API/webhook, email, SMS) and channel-specific replies.

## Features
- Create tickets via web form, API, email, or SMS
- View ticket list and details
- Add replies, sent back via original channel (email/SMS)
- JSON file storage (for MVP)

## Setup
1. Clone/install dependencies: `npm install`
2. Set up env vars in `.env.local` (replace with real keys):
   - SENDGRID_API_KEY
   - TWILIO_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_PHONE_NUMBER
   - EMAIL_FROM (verified sender)
3. Run dev server: `npm run dev`
4. Access at http://localhost:3000

## Integrations
- **Email:** Configure SendGrid inbound parse to POST to `/api/webhooks/email`
- **SMS:** Set Twilio webhook to `/api/webhooks/sms`

## Testing
- Unit tests: `npm run test`
- E2e tests: Start server, then `npx cypress run`

## Deployment
- Build: `npm run build`
- Start: `npm run start`
- Deploy to Vercel (set env vars)
