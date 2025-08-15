export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'AGENT' | 'ADMIN';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: Pick<User, 'id' | 'name' | 'avatar'>;
  ticketId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  createdBy: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  assignedTo?: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  comments: Comment[];
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  assignedToId?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string | null;
}

export interface TicketFilterOptions {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assignedToMe?: boolean;
  createdByMe?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TicketsResponse {
  data: Ticket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StatsResponse {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byStatus: Record<TicketStatus, number>;
}
