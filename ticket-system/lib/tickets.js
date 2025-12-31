require('dotenv').config({ path: '.env.local' });

const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
console.log('Adapter created');
const prisma = new PrismaClient({ adapter });
console.log('Prisma client created');

module.exports.prisma = prisma;

async function addTicket(ticket) {
  const newTicket = await prisma.ticket.create({
    data: {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status || 'open',
      priority: ticket.priority || 'medium',
      category: ticket.category || 'Support',
      assignedTo: ticket.assignedTo || null,
      channel: ticket.channel,
      sender: ticket.sender || {},
    },
    include: { comments: true },
  });
  return newTicket;
}

async function getTicketById(id) {
  return await prisma.ticket.findUnique({
    where: { id },
    include: { comments: true },
  });
}

async function updateTicket(id, updates) {
  return await prisma.ticket.update({
    where: { id },
    data: updates,
    include: { comments: true },
  });
}

async function deleteTicket(id) {
  await prisma.ticket.delete({
    where: { id },
  });
  return true;
}

async function addComment(ticketId, comment) {
  return await prisma.comment.create({
    data: {
      text: comment.text,
      author: comment.author,
      ticketId,
    },
  });
}

async function sendNotificationEmail(ticket, action) {
  if (!ticket.sender.email) return;
  try {
    const sgMail = (await import('@sendgrid/mail')).default;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const subject = action === 'created' ? `New Ticket: ${ticket.title}` :
                   action === 'updated' ? `Ticket Updated: ${ticket.title}` :
                   `Ticket Closed: ${ticket.title}`;
    const text = action === 'created' ? `Your ticket has been created.\n\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nStatus: ${ticket.status}\nPriority: ${ticket.priority}\nCategory: ${ticket.category}` :
                action === 'updated' ? `Your ticket has been updated.\n\nTitle: ${ticket.title}\nStatus: ${ticket.status}\nPriority: ${ticket.priority}` :
                `Your ticket has been closed.\n\nTitle: ${ticket.title}`;
    await sgMail.send({
      to: ticket.sender.email,
      from: process.env.EMAIL_FROM,
      subject,
      text,
    });
  } catch (error) {
    console.error('SendGrid error:', error);
  }
}

async function getAllTickets() {
  return await prisma.ticket.findMany({
    include: { comments: true },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { getAllTickets, addTicket, getTicketById, updateTicket, deleteTicket, addComment, sendNotificationEmail };