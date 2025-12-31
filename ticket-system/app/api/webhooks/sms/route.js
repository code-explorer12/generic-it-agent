import { NextResponse } from 'next/server';
const { addTicket } = require('../../../../lib/tickets.js');

export async function POST(request) {
  const body = await request.formData(); // Twilio sends form data
  const smsBody = body.get('Body');
  const from = body.get('From');
  await addTicket({
    title: 'SMS Ticket',
    description: smsBody,
    priority: 'medium',
    channel: 'sms',
    sender: { email: '', phone: from },
  });
  return NextResponse.json({ message: 'Ticket created' });
}