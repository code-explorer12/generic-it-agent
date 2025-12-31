import { NextResponse } from 'next/server';
const { getTicketById, updateTicket, deleteTicket, sendNotificationEmail } = require('../../../../lib/tickets.js');

export async function GET(request, { params }) {
  const { id } = await params;
  const ticket = await getTicketById(id);
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }
  return NextResponse.json(ticket);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const updates = await request.json();
  const ticket = await updateTicket(id, updates);
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }
  // Send notification email on update/close
  const action = updates.status === 'closed' ? 'closed' : 'updated';
  await sendNotificationEmail(ticket, action);
  return NextResponse.json(ticket);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await deleteTicket(id);
  return NextResponse.json({ message: 'Ticket deleted' });
}