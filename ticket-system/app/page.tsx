'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  assignedTo: string;
}

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);

  useEffect(() => {
    // Load filters from localStorage on client
    if (typeof window !== 'undefined') {
      const savedStatus = JSON.parse(localStorage.getItem('statusFilters') || '[]');
      const savedPriority = JSON.parse(localStorage.getItem('priorityFilters') || '[]');
      const savedCategory = JSON.parse(localStorage.getItem('categoryFilters') || '[]');
      setStatusFilters(savedStatus);
      setPriorityFilters(savedPriority);
      setCategoryFilters(savedCategory);
    }

    fetch('/api/tickets')
      .then(res => res.json())
      .then(setTickets);
  }, []);

  const handleStatusChange = (value: string, checked: boolean) => {
    const newFilters = checked
      ? [...statusFilters, value]
      : statusFilters.filter(f => f !== value);
    setStatusFilters(newFilters);
    if (typeof window !== 'undefined') {
      localStorage.setItem('statusFilters', JSON.stringify(newFilters));
    }
  };

  const handlePriorityChange = (value: string, checked: boolean) => {
    const newFilters = checked
      ? [...priorityFilters, value]
      : priorityFilters.filter(f => f !== value);
    setPriorityFilters(newFilters);
    if (typeof window !== 'undefined') {
      localStorage.setItem('priorityFilters', JSON.stringify(newFilters));
    }
  };

  const handleCategoryChange = (value: string, checked: boolean) => {
    const newFilters = checked
      ? [...categoryFilters, value]
      : categoryFilters.filter(f => f !== value);
    setCategoryFilters(newFilters);
    if (typeof window !== 'undefined') {
      localStorage.setItem('categoryFilters', JSON.stringify(newFilters));
    }
  };

  const handleClearFilters = () => {
    setStatusFilters([]);
    setPriorityFilters([]);
    setCategoryFilters([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('statusFilters');
      localStorage.removeItem('priorityFilters');
      localStorage.removeItem('categoryFilters');
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    (!statusFilters.length || statusFilters.includes(ticket.status)) &&
    (!priorityFilters.length || priorityFilters.includes(ticket.priority)) &&
    (!categoryFilters.length || categoryFilters.includes(ticket.category))
  );

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Button asChild>
          <Link href="/create">Create Ticket</Link>
        </Button>
      </div>
      <div className="mb-6 space-y-4">
        <div className="flex gap-6 flex-wrap">
          <div>
            <Label className="block mb-2">Filter by Status</Label>
            <div className="space-y-2">
              {['open', 'pending', 'closed'].map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={statusFilters.includes(status)}
                    onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                  />
                  <Label htmlFor={`status-${status}`} className="capitalize">{status}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label className="block mb-2">Filter by Priority</Label>
            <div className="space-y-2">
              {['low', 'medium', 'high'].map(priority => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={priorityFilters.includes(priority)}
                    onCheckedChange={(checked) => handlePriorityChange(priority, checked as boolean)}
                  />
                  <Label htmlFor={`priority-${priority}`} className="capitalize">{priority}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label className="block mb-2">Filter by Category</Label>
            <div className="space-y-2">
              {['Bug', 'Feature', 'Inquiry', 'Support'].map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={categoryFilters.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Button data-cy="clear-filters" variant="outline" onClick={handleClearFilters}>
          Clear All Filters
        </Button>
      </div>
      <div className="grid gap-4">
        {filteredTickets.map(ticket => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle>{ticket.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Status: {ticket.status} | Priority: {ticket.priority} | Category: {ticket.category}
              </p>
              <p className="text-sm text-muted-foreground">Assigned to: {ticket.assignedTo || 'Unassigned'}</p>
              <Button variant="link" asChild className="p-0 h-auto">
                <Link href={`/ticket/${ticket.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
