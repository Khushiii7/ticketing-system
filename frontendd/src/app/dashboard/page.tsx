import { Box, Grid, Paper, Typography, useTheme, Button } from '@mui/material';
import {
  Assignment as TicketIcon,
  CheckCircle as ResolvedIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  AccessTime as InProgressIcon,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { TicketStatus } from '@/types/ticket';
import DashboardLayout from '@/components/DashboardLayout';
import { ROUTES } from '@/config/routes';
import { useRouter } from 'next/navigation';

interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard = ({ title, value, icon, color }: StatsCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      height: '100%',
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: `${color}20`,
          color: color,
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

const fetchTicketStats = async () => {
  try {
    const response = await fetch(ROUTES.API.TICKETS.STATS);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch ticket stats:', error);
  }
};

const fetchRecentTickets = async (): Promise<Ticket[]> => {
  try {
    const response = await fetch(ROUTES.API.TICKETS.RECENT);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch recent tickets:', error);
    return [];
  }
};

export default function DashboardPage() {
  const theme = useTheme();
  const { data: session } = useSession();
  const router = useRouter();

  const { data: stats } = useQuery({
    queryKey: ['ticketStats'],
    queryFn: fetchTicketStats,
  });
  const { data: recentTickets } = useQuery<Ticket[]>({
    queryKey: ['recentTickets'],
    queryFn: fetchRecentTickets,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return theme.palette.error.main;
      case 'MEDIUM':
        return theme.palette.warning.main;
      case 'LOW':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return <PendingIcon color="info" />;
      case 'IN_PROGRESS':
        return <InProgressIcon color="warning" />;
      case 'RESOLVED':
        return <ResolvedIcon color="success" />;
      case 'CLOSED':
        return <ErrorIcon color="disabled" />;
      default:
        return null;
    }
  };

  const handleViewTicket = (ticketId: string) => {
    router.push(ROUTES.TICKETS.DETAIL(ticketId));
  };

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening with your tickets today.
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Tickets"
            value={stats?.total || 0}
            icon={<TicketIcon fontSize="large" />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Open"
            value={stats?.open || 0}
            icon={<PendingIcon fontSize="large" />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="In Progress"
            value={stats?.inProgress || 0}
            icon={<InProgressIcon fontSize="large" />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Resolved"
            value={stats?.resolved || 0}
            icon={<ResolvedIcon fontSize="large" />}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Recent Tickets</Typography>
              <Box>
                <Button 
                  variant="contained" 
                  onClick={() => router.push(ROUTES.TICKETS.NEW)}
                >
                  Create New Ticket
                </Button>
              </Box>
            </Box>
            <Box>
              {recentTickets?.map((ticket: Ticket) => (
                <Box
                  key={ticket.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {ticket.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: getPriorityColor(ticket.priority),
                        }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {ticket.priority}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        •
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box onClick={() => handleViewTicket(ticket.id)}>
                    {getStatusIcon(ticket.status)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            {/* Add quick action buttons */}
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
