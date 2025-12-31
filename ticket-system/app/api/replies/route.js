import { NextResponse } from 'next/server';
const { addComment, getTicketById } = require('../../../lib/tickets.js');

export async function POST(request) {
  const { ticketId, text, author } = await request.json();
  const comment = await addComment(ticketId, { text, author });

  // Send reply via channel
  const ticket = await getTicketById(ticketId);
  if (ticket.channel === 'email' && ticket.sender.email) {
    try {
      const sgMail = (await import('@sendgrid/mail')).default;
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      await sgMail.send({
        to: ticket.sender.email,
        from: process.env.EMAIL_FROM,
        subject: `Re: ${ticket.title}`,
        text: text,
      });
    } catch (error) {
      console.error('SendGrid error:', error);
    }
  } else if (ticket.channel === 'sms' && ticket.sender.phone) {
    try {
      const twilio = (await import('twilio')).default;
      const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilioClient.messages.create({
        body: text,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: ticket.sender.phone,
      });
    } catch (error) {
      console.error('Twilio error:', error);
    }
  }

  return NextResponse.json(comment);
}