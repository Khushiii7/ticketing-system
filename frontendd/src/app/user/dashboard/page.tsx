'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, removeUser } from '@/lib/auth';
import { ROUTES } from '@/config/routes';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push(ROUTES.LOGIN);
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleLogout = () => {
    removeUser();
    router.push(ROUTES.LOGIN);
  };

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  const dashboardContent = {
    USER: {
      title: 'User Dashboard',
      description: 'Welcome to your user dashboard. Here you can view and manage your tickets.',
    },
    AGENT: {
      title: 'Agent Dashboard',
      description: 'Welcome to the agent dashboard. Manage assigned tickets and help users.',
    },
    ADMIN: {
      title: 'Admin Dashboard',
      description: 'Welcome to the admin dashboard. Manage users, tickets, and system settings.',
    },
  }[user.role as 'USER' | 'AGENT' | 'ADMIN'];

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">{dashboardContent.title}</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      
      <Typography variant="body1" mb={4}>
        {dashboardContent.description}
      </Typography>
      
      <Typography variant="h6">Welcome, {user.name}!</Typography>
      <Typography variant="body2" color="text.secondary">
        You are logged in as: {user.role}
      </Typography>
    </Box>
  );
}
