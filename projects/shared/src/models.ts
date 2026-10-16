// Wspólny model domeny dla obu aplikacji (legacy i modern).
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: number | null;
  reporterEmail: string;
  tags: string[];
  dueDate: string | null; // ISO yyyy-mm-dd
  createdAt: string;
  updatedAt: string;
}

export type TicketDraft = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;

export interface User {
  id: number;
  name: string;
  email: string;
  team: 'L1' | 'L2' | 'DevOps';
}

export interface TicketComment {
  id: number;
  ticketId: number;
  authorId: number;
  body: string;
  createdAt: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TicketQuery {
  q?: string;
  status?: TicketStatus | 'all';
  priority?: TicketPriority | 'all';
  page?: number;
  pageSize?: number;
}

export interface TicketStats {
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  overdue: number;
}

export const STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
export const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
