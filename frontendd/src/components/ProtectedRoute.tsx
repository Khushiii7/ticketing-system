import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

type Role = 'USER' | 'AGENT' | 'ADMIN';

// Extend the default session types
declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
    };
  }
  interface User {
    role?: Role;
  }
}

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Role[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRoles = ['USER', 'AGENT', 'ADMIN'],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    // If no session exists, redirect to login
    if (!session?.user) {
      router.push(redirectTo);
      return;
    }

    // Now TypeScript should recognize the role property
    const userRole = session.user.role;
    
    // If role is not defined, treat as unauthorized
    if (!userRole) {
      router.push(redirectTo);
      return;
    }

    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      router.push('/unauthorized');
      return;
    }

    setIsAuthorized(true);
  }, [session, status, requiredRoles, router, redirectTo]);

  if (status === 'loading' || isAuthorized === null) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthorized) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <Typography variant="h5">Access Denied</Typography>
        <Typography>You don't have permission to view this page.</Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
