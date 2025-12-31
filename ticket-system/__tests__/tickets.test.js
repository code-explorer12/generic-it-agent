const mockPrismaInstance = {
  ticket: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  comment: {
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaInstance),
}));

const { addTicket, getAllTickets } = require('../lib/tickets.js');

describe('Tickets lib', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addTicket adds a ticket', async () => {
    const mockTicket = { id: '1', title: 'Test', description: 'Desc' };
    mockPrismaInstance.ticket.create.mockResolvedValue(mockTicket);

    const ticket = await addTicket({ title: 'Test', description: 'Desc' });
    expect(ticket).toEqual(mockTicket);
    expect(mockPrismaInstance.ticket.create).toHaveBeenCalledWith({
      data: {
        title: 'Test',
        description: 'Desc',
        status: 'open',
        priority: 'medium',
        category: 'Support',
        assignedTo: null,
        channel: undefined,
        sender: {},
      },
      include: { comments: true },
    });
  });

  test('getAllTickets returns tickets', async () => {
    const mockTickets = [{ id: '1', title: 'Test' }];
    mockPrismaInstance.ticket.findMany.mockResolvedValue(mockTickets);

    const tickets = await getAllTickets();
    expect(tickets).toEqual(mockTickets);
    expect(mockPrismaInstance.ticket.findMany).toHaveBeenCalledWith({
      include: { comments: true },
      orderBy: { createdAt: 'desc' },
    });
  });
});