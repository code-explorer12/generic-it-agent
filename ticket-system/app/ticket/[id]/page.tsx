'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  comments: Comment[];
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assignedTo: string;
  comments: Comment[];
}

export default function TicketDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/tickets/${id}`)
        .then(res => res.ok ? res.json() : Promise.reject('Ticket not found'))
        .then((data) => {
          setTicket(data);
          setEditStatus(data.status);
          setEditPriority(data.priority);
          setEditCategory(data.category);
          setEditAssignedTo(data.assignedTo);
        })
        .catch(() => setTicket(null));
    }
  }, [id]);

  const handleSaveChanges = async () => {
    if (!ticket) return;
    setLoading(true);
    await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: editStatus, priority: editPriority, category: editCategory, assignedTo: editAssignedTo }),
    });
    setLoading(false);
    // Refresh
    fetch(`/api/tickets/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Ticket not found'))
      .then((data) => {
        setTicket(data);
        setEditStatus(data.status);
        setEditPriority(data.priority);
        setEditCategory(data.category);
        setEditAssignedTo(data.assignedTo);
      })
      .catch(() => setTicket(null));
  };

  const handleCloseTicket = async () => {
    setLoading(true);
    await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    });
    setLoading(false);
    // Refresh and redirect
    fetch(`/api/tickets/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Ticket not found'))
      .then((data) => {
        setTicket(data);
        setEditStatus(data.status);
        setEditPriority(data.priority);
        router.push('/');
      })
      .catch(() => setTicket(null));
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: id, text: reply, author: 'rep' }),
    });
    setReply('');
    // Refresh ticket
    fetch(`/api/tickets/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Ticket not found'))
      .then(setTicket)
      .catch(() => setTicket(null));
  };

  if (!ticket) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  const isClosed = ticket.status === 'closed';

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
        ← Back to Tickets
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{ticket.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{ticket.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus} disabled={loading}>
                <SelectTrigger data-cy="status-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={editPriority} onValueChange={setEditPriority} disabled={loading}>
                <SelectTrigger data-cy="priority-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory} disabled={loading}>
                <SelectTrigger data-cy="category-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="Inquiry">Inquiry</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input
                value={editAssignedTo}
                onChange={(e) => setEditAssignedTo(e.target.value)}
                placeholder="Assign to..."
                disabled={loading}
                data-cy="assigned-input"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveChanges} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            {!isClosed && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-cy="close-button" variant="destructive" disabled={loading}>
                    Close Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Close Ticket</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to close this ticket? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>Cancel</Button>
                    <Button variant="destructive" onClick={handleCloseTicket} disabled={loading}>
                      {loading ? 'Closing...' : 'Close Ticket'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            <div data-cy="comments-list" className="space-y-2">
              {ticket.comments.length === 0 ? (
                <p className="text-muted-foreground">No comments yet.</p>
              ) : (
                ticket.comments.map(comment => (
                  <div key={comment.id} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <strong>{comment.author}:</strong>
                      <small className="text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</small>
                    </div>
                    <p className="mt-1">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          {!isClosed && (
            <form onSubmit={handleReply} className="space-y-2">
              <Label htmlFor="reply">Add Reply</Label>
              <Textarea
                id="reply"
                data-cy="reply-textarea"
                placeholder="Type your reply here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                required
              />
              <Button data-cy="reply-button" type="submit">Send Reply</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}