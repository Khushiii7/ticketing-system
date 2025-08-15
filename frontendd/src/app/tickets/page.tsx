import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@mui/material';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Button,
  Tooltip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { TicketStatus, TicketPriority, Ticket, User } from '@/types/ticket';
import { format } from 'date-fns';
import { ROUTES } from '@/config/routes';

interface HeadCell {
  id: keyof Ticket;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

const headCells: HeadCell[] = [
  { id: 'title', label: 'Title', sortable: true },
  { id: 'status', label: 'Status', sortable: true, align: 'center', width: '120px' },
  { id: 'priority', label: 'Priority', sortable: true, align: 'center', width: '120px' },
  { id: 'createdBy', label: 'Created By', sortable: true, width: '150px' },
  { id: 'assignedTo', label: 'Assigned To', sortable: true, width: '150px' },
  { id: 'createdAt', label: 'Created', sortable: true, width: '150px' },
];

type Order = 'asc' | 'desc';

const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const priorityOptions = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export default function TicketsPage() {
  const router = useRouter();
  const theme = useTheme();
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Sorting state
  const [orderBy, setOrderBy] = useState<keyof Ticket>('createdAt');
  const [order, setOrder] = useState<Order>('desc');
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [createdByMe, setCreatedByMe] = useState(false);

  // Fetch tickets with filters
  const {
    data: ticketsData = { tickets: [], total: 0 },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['tickets', { page, rowsPerPage, orderBy, order, searchTerm, statusFilter, priorityFilter, assignedToMe, createdByMe }],
    queryFn: () =>
      api.getTickets({
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
        search: searchTerm,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        assignedToMe,
        createdByMe,
      }),
      placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  const handleRequestSort = (property: keyof Ticket) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as TicketStatus | 'ALL');
    setPage(0);
  };

  const handlePriorityFilterChange = (event: SelectChangeEvent) => {
    setPriorityFilter(event.target.value as TicketPriority | 'ALL');
    setPage(0);
  };

  const handleAssignedToMeToggle = () => {
    setAssignedToMe(!assignedToMe);
    setPage(0);
  };

  const handleCreatedByMeToggle = () => {
    setCreatedByMe(!createdByMe);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setAssignedToMe(false);
    setCreatedByMe(false);
    setPage(0);
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'URGENT':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusChip = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return <Chip label="Open" color="info" size="small" />;
      case 'IN_PROGRESS':
        return <Chip label="In Progress" color="warning" size="small" />;
      case 'RESOLVED':
        return <Chip label="Resolved" color="success" size="small" />;
      case 'CLOSED':
        return <Chip label="Closed" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatUserName = (user: { name: string } | null) => {
    if (!user) return 'Unassigned';
    return user.name.split(' ')[0];
  };

  const isFilterActive = searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || assignedToMe || createdByMe;

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h4" component="h1">
            Tickets
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleResetFilters}
              disabled={!isFilterActive}
            >
              Clear Filters
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => router.push(ROUTES.TICKETS.NEW)}
            >
              New Ticket
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="flex-end">
            <TextField
              label="Search tickets..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250, flex: 1 }}
            />
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                label="Priority"
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant={assignedToMe ? 'contained' : 'outlined'}
              color={assignedToMe ? 'primary' : 'inherit'}
              size="small"
              onClick={handleAssignedToMeToggle}
            >
              Assigned to Me
            </Button>

            <Button
              variant={createdByMe ? 'contained' : 'outlined'}
              color={createdByMe ? 'primary' : 'inherit'}
              size="small"
              onClick={handleCreatedByMeToggle}
            >
              Created by Me
            </Button>

            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Tickets Table */}
        <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
            <Table stickyHeader aria-label="tickets table">
              <TableHead>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.align || 'left'}
                      sortDirection={orderBy === headCell.id ? order : false}
                      sx={{
                        width: headCell.width,
                        fontWeight: 600,
                        backgroundColor: theme.palette.background.paper,
                      }}
                    >
                      {headCell.sortable ? (
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : 'asc'}
                          onClick={() => handleRequestSort(headCell.id)}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      ) : (
                        headCell.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Loading tickets...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                      <Typography color="error">
                        Error loading tickets. Please try again.
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => refetch()}
                        sx={{ mt: 1 }}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : ticketsData.tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No tickets found. {isFilterActive ? 'Try adjusting your filters.' : ''}
                      </Typography>
                      {!isFilterActive && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => router.push(ROUTES.TICKETS.NEW)}
                          sx={{ mt: 2 }}
                        >
                          Create New Ticket
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  ticketsData.tickets.map((ticket) => (
                    <TableRow
                      hover
                      key={ticket.id}
                      onClick={() => router.push(ROUTES.TICKETS.DETAIL(ticket.id))}
                      sx={{
                        cursor: 'pointer',
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" noWrap>
                            {ticket.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" noWrap>
                            #{ticket.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(ticket.status)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={ticket.priority}
                          color={getPriorityColor(ticket.priority)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            src={ticket.createdBy.avatar}
                            alt={ticket.createdBy.name}
                            sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                          >
                            {ticket.createdBy.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {formatUserName(ticket.createdBy)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {ticket.assignedTo ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              src={ticket.assignedTo.avatar}
                              alt={ticket.assignedTo.name}
                              sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                            >
                              {ticket.assignedTo.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {formatUserName(ticket.assignedTo)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={format(new Date(ticket.createdAt), 'PPpp')}>
                          <Typography variant="body2">
                            {formatDate(ticket.createdAt)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={ticketsData.total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          />
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
