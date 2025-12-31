import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import request from 'supertest';

const app = next({ dev: false });
const handle = app.getRequestHandler();

let server;

beforeAll(async () => {
  await app.prepare();
  server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  await new Promise((resolve) => server.listen(0, resolve));
});

afterAll(async () => {
  server.close();
});

describe('API Routes', () => {
  beforeEach(() => {
    // Clear tickets
    require('fs').writeFileSync('tickets.json', '[]');
  });

  it('GET /api/tickets returns empty array initially', async () => {
    const response = await request(server).get('/api/tickets');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('POST /api/tickets creates a ticket', async () => {
    const ticketData = {
      title: 'API Test Ticket',
      description: 'API desc',
      priority: 'medium',
      channel: 'api',
      sender: { email: 'api@example.com', phone: '' }
    };
    const response = await request(server).post('/api/tickets').send(ticketData);
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('API Test Ticket');
    expect(response.body.id).toBeDefined();
  });

  it('GET /api/tickets/[id] returns ticket', async () => {
    const ticketData = {
      title: 'Get Test',
      description: 'Get desc',
      priority: 'high',
      channel: 'form',
      sender: { email: '', phone: '' }
    };
    const createRes = await request(server).post('/api/tickets').send(ticketData);
    const ticketId = createRes.body.id;
    const response = await request(server).get(`/api/tickets/${ticketId}`);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Get Test');
  });

  it('POST /api/replies adds comment', async () => {
    const ticketData = {
      title: 'Reply Test',
      description: 'Reply desc',
      priority: 'low',
      channel: 'form',
      sender: { email: '', phone: '' }
    };
    const createRes = await request(server).post('/api/tickets').send(ticketData);
    const ticketId = createRes.body.id;
    const replyData = { ticketId, text: 'Test reply', author: 'rep' };
    const response = await request(server).post('/api/replies').send(replyData);
    expect(response.status).toBe(200);
    expect(response.body.text).toBe('Test reply');
    expect(response.body.author).toBe('rep');
  });
});