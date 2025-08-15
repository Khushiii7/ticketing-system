import { getSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Ticket, TicketPriority, TicketStatus, User, Comment, CreateTicketInput as TicketCreateData, UpdateTicketInput as TicketUpdateData } from '@/types/ticket';

// Mock users
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'ADMIN',
    avatar: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'AGENT',
    avatar: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'USER',
    avatar: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock tickets
let mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Ticket 1',
    description: 'This is the first ticket',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: new Date('2023-08-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2023-08-01T10:00:00Z').toISOString(),
    createdBy: mockUsers[0],
    assignedTo: mockUsers[1],
    comments: [],
    attachments: [],
  },
  {
    id: '2',
    title: 'Ticket 2',
    description: 'This is the second ticket',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    createdAt: new Date('2023-08-05T14:00:00Z').toISOString(),
    updatedAt: new Date('2023-08-05T14:00:00Z').toISOString(),
    createdBy: mockUsers[1],
    assignedTo: mockUsers[2],
    comments: [],
    attachments: [],
  },
];

// Mock comments
let mockComments: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      content: 'Have you tried resetting your password?',
      createdAt: new Date('2023-08-01T11:30:00Z').toISOString(),
      updatedAt: new Date('2023-08-01T11:30:00Z').toISOString(),
      author: mockUsers[1],
      ticketId: '1'  // Add the ticketId that this comment belongs to
    },
  ],
  '2': [
    {
      id: 'c2',
      content: 'What is the file size of the image you are trying to upload?',
      createdAt: new Date('2023-08-05T15:45:00Z').toISOString(),
      updatedAt: new Date('2023-08-05T15:45:00Z').toISOString(),
      author: mockUsers[1],
      ticketId: '2'  // Add the ticketId that this comment belongs to
    },
  ],
};

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get current user ID from session
const getCurrentUserId = async (): Promise<string> => {
  const session = await getSession();
  return (session?.user as Session['user'])?.id || '1'; // Default to admin user if not logged in
};

// Mock API client
export const api = {
  // Ticket methods
  getTickets: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedToMe?: boolean;
    createdByMe?: boolean;
  }) => {
    await delay(500); // Simulate network delay

    let tickets = [...mockTickets];
    const currentUserId = await getCurrentUserId();

    // Apply filters
    if (params?.search) {
      const search = params.search.toLowerCase();
      tickets = tickets.filter(
        t =>
          t.title.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search)
      );
    }

    if (params?.status) {
      tickets = tickets.filter(t => t.status === params.status);
    }

    if (params?.priority) {
      tickets = tickets.filter(t => t.priority === params.priority);
    }

    if (params?.assignedToMe) {
      tickets = tickets.filter(t => t.assignedTo?.id === currentUserId);
    }

    if (params?.createdByMe) {
      tickets = tickets.filter(t => t.createdBy.id === currentUserId);
    }

    // Apply sorting
    if (params?.sortBy) {
      const sortBy = params.sortBy as keyof Ticket;
      tickets.sort((a, b) => {
        let aVal = a[sortBy] ?? '';
        let bVal = b[sortBy] ?? '';

        if (sortBy === 'createdBy' || sortBy === 'assignedTo') {
          aVal = a[sortBy]?.name ?? '';
          bVal = b[sortBy]?.name ?? '';
        }

        // Convert to string and handle case-insensitive comparison
        const strA = String(aVal).toLowerCase();
        const strB = String(bVal).toLowerCase();

        if (strA < strB) return params.sortOrder === 'asc' ? -1 : 1;
        if (strA > strB) return params.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTickets = tickets.slice(start, end);

    return {
      tickets: paginatedTickets,
      total: tickets.length,
      page,
      limit,
      totalPages: Math.ceil(tickets.length / limit),
    };
  },

  getTicketById: async (id: string): Promise<Ticket | null> => {
    await delay(300);
    const ticket = mockTickets.find(t => t.id === id) || null;
    if (ticket) {
      return {
        ...ticket,
        comments: mockComments[id] || [],
      };
    }
    return null;
  },

  createTicket: async (data: TicketCreateData): Promise<Ticket> => {
    await delay(500);
    const currentUserId = await getCurrentUserId();
    const currentUser = mockUsers.find(u => u.id === currentUserId) || mockUsers[0];
    
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      description: data.description,
      status: 'OPEN',
      priority: data.priority || 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser,
      assignedTo: data.assignedToId ? mockUsers.find(u => u.id === data.assignedToId) : undefined,
      comments: [],
      attachments: [],
    };
    
    mockTickets = [newTicket, ...mockTickets];
    return newTicket;
  },

  updateTicket: async (id: string, data: Partial<TicketUpdateData>): Promise<Ticket> => {
    await delay(400);
    const index = mockTickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');

    const updatedTicket = {
      ...mockTickets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.assignedToId) {
      updatedTicket.assignedTo = mockUsers.find(u => u.id === data.assignedToId) || undefined;
    } else {
      updatedTicket.assignedTo = undefined;
    }

    mockTickets[index] = updatedTicket as Ticket;
    return updatedTicket as Ticket;
  },

  deleteTicket: async (id: string): Promise<void> => {
    await delay(300);
    mockTickets = mockTickets.filter(t => t.id !== id);
  },

  // Comment methods
  getComments: async (ticketId: string): Promise<Comment[]> => {
    await delay(300);
    return mockComments[ticketId] || [];
  },

  addComment: async (ticketId: string, content: string): Promise<Comment> => {
    await delay(400);
    const currentUserId = await getCurrentUserId();
    const currentUser = mockUsers.find(u => u.id === currentUserId) || mockUsers[0];
    
    const now = new Date().toISOString();
    const newComment: Comment = {
      id: `c${Math.random().toString(36).substr(2, 9)}`,
      content,
      createdAt: now,
      updatedAt: now,  // Add this line
      ticketId,        // Add this line
      author: currentUser,
    };
  
    if (!mockComments[ticketId]) {
      mockComments[ticketId] = [];
    }
    mockComments[ticketId].push(newComment);
    return newComment;
  },

  // User methods
  getUsers: async (): Promise<User[]> => {
    await delay(300);
    return [...mockUsers];
  },

  // Auth methods
  login: async (email: string, password: string) => {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    return {
      user,
      token: 'mock-jwt-token',
    };
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    await delay(500);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email,
      role: data.role as 'USER' | 'AGENT' | 'ADMIN',
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return {
      user: newUser,
      token: 'mock-jwt-token',
    };
  },
};