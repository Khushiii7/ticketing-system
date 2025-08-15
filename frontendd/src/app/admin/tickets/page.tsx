'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, X, Check, AlertCircle, MessageSquare, User as UserIcon } from 'lucide-react';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  assignedTo: User | null;
}

// Mock data - replace with actual API calls
const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Cannot login to account',
    description: 'I am unable to login to my account. Getting invalid credentials error.',
    status: 'open',
    priority: 'high',
    createdAt: '2023-08-10T10:30:00Z',
    updatedAt: '2023-08-10T10:30:00Z',
    createdBy: { id: '3', name: 'John Doe', email: 'john@example.com', role: 'user' },
    assignedTo: null,
  },
  {
    id: '2',
    title: 'Payment not processed',
    description: 'My payment was deducted but order was not placed.',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2023-08-11T14:45:00Z',
    updatedAt: '2023-08-12T09:15:00Z',
    createdBy: { id: '4', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    assignedTo: { id: '2', name: 'Support Agent', email: 'agent@example.com', role: 'agent' },
  },
  // Add more mock tickets as needed
];

const mockAgents = [
  { id: '2', name: 'Support Agent', email: 'agent@example.com', role: 'agent' },
  { id: '5', name: 'Another Agent', email: 'agent2@example.com', role: 'agent' },
];

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
  });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const queryClient = useQueryClient();

  // Fetch tickets
  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ['adminTickets'],
    queryFn: async () => {
      // Replace with actual API call
      // const response = await api.get('/admin/tickets');
      // return response.data;
      return mockTickets;
    },
  });

  // Update ticket status
  const { mutate: updateTicketStatus } = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: TicketStatus }) => {
      // Replace with actual API call
      console.log(`Updating ticket ${ticketId} status to ${status}`);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
    },
  });

  // Assign ticket
  const { mutate: assignTicket } = useMutation({
    mutationFn: async ({ ticketId, agentId }: { ticketId: string; agentId: string }) => {
      // Replace with actual API call
      console.log(`Assigning ticket ${ticketId} to agent ${agentId}`);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
    },
  });

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = 
      (!filters.status || ticket.status === filters.status) &&
      (!filters.priority || ticket.priority === filters.priority) &&
      (!filters.assignedTo || 
        (filters.assignedTo === 'unassigned' && !ticket.assignedTo) ||
        ticket.assignedTo?.id === filters.assignedTo);
    
    return matchesSearch && matchesFilters;
  });

  // Get ticket statistics
  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  const getStatusBadgeClass = (status: TicketStatus) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority: TicketPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage all support tickets in the system.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tickets</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{ticketStats.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Open</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{ticketStats.open}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{ticketStats.inProgress}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{ticketStats.resolved}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                name="search"
                type="text"
                placeholder="Search tickets..."
                className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <div className="flex space-x-2">
              <div>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={filters.assignedTo}
                  onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                >
                  <option value="">All Assignees</option>
                  <option value="unassigned">Unassigned</option>
                  {mockAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {(filters.status || filters.priority || filters.assignedTo) && (
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setFilters({ status: '', priority: '', assignedTo: '' })}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tickets list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <li key={ticket.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {ticket.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(ticket.priority)}`}>
                          {ticket.priority}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <UserIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {ticket.createdBy.name}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="text-gray-400">•</span>
                        <span className="ml-2">
                          Created {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {ticket.assignedTo && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="text-gray-400">•</span>
                          <span className="ml-2">
                            Assigned to {ticket.assignedTo.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <select
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={ticket.status}
                      onChange={(e) => updateTicketStatus({
                        ticketId: ticket.id,
                        status: e.target.value as TicketStatus
                      })}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    
                    <select
                      className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={ticket.assignedTo?.id || ''}
                      onChange={(e) => assignTicket({
                        ticketId: ticket.id,
                        agentId: e.target.value
                      })}
                    >
                      <option value="">Assign to...</option>
                      <option value="">Unassign</option>
                      {mockAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-12 text-center sm:px-6">
              <div className="text-gray-500">No tickets found matching your criteria.</div>
            </li>
          )}
        </ul>
      </div>

      {/* Ticket details modal */}
      {selectedTicket && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedTicket.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Created by {selectedTicket.createdBy.name} on {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setSelectedTicket(null)}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">Description</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-line">
                    {selectedTicket.description}
                  </p>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">Details</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="mt-1 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedTicket.status)}`}>
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <p className="mt-1 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                          {selectedTicket.priority}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Assigned To</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTicket.assignedTo ? selectedTicket.assignedTo.name : 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedTicket.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">Actions</h4>
                  <div className="flex space-x-3">
                    <select
                      className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={selectedTicket.status}
                      onChange={(e) => {
                        updateTicketStatus({
                          ticketId: selectedTicket.id,
                          status: e.target.value as TicketStatus
                        });
                        setSelectedTicket({
                          ...selectedTicket,
                          status: e.target.value as TicketStatus
                        });
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    
                    <select
                      className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={selectedTicket.assignedTo?.id || ''}
                      onChange={(e) => {
                        const agentId = e.target.value;
                        assignTicket({
                          ticketId: selectedTicket.id,
                          agentId
                        });
                        setSelectedTicket({
                          ...selectedTicket,
                          assignedTo: agentId ? mockAgents.find(a => a.id === agentId) || null : null
                        });
                      }}
                    >
                      <option value="">Assign to...</option>
                      <option value="">Unassign</option>
                      {mockAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
