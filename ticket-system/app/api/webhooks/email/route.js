import { NextResponse } from 'next/server';
const { addTicket } = require('../../../../lib/tickets.js');

export async function POST(request) {
  const body = await request.text(); // SendGrid sends as form data or text
  // Parse the email data; assume JSON or form
  // For simplicity, assume body is JSON with subject, text, from
  const emailData = JSON.parse(body);
  await addTicket({
    title: emailData.subject,
    description: emailData.text,
    priority: 'medium',
    channel: 'email',
    sender: { email: emailData.from, phone: '' },
  });
  return NextResponse.json({ message: 'Ticket created' });
}