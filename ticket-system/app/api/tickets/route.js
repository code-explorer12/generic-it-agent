import { NextResponse } from 'next/server';
const { getAllTickets, addTicket, sendNotificationEmail } = require('../../../lib/tickets.js');

export async function GET() {
  try {
    console.log('DATABASE_URL in API:', process.env.DATABASE_URL);
    console.log('CWD:', process.cwd());
    const tickets = await getAllTickets();
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('GET /api/tickets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const ticket = await addTicket(body);
    // Send notification email
    await sendNotificationEmail(ticket, 'created');
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('POST /api/tickets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}