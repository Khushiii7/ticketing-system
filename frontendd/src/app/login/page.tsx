'use client';

import { Box, Button, Container, TextField, Typography, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { setUser } from '@/lib/auth';
import { ROUTES } from '@/config/routes';

// Mock user data for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'ADMIN' as const,
  },
  {
    id: '2',
    name: 'Agent User',
    email: 'agent@example.com',
    password: 'password123',
    role: 'AGENT' as const,
  },
  {
    id: '3',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'USER' as const,
  },
];

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Simulate API call with mock data
      const user = MOCK_USERS.find(
        (u) => u.email === data.email && u.password === data.password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Remove password before saving to localStorage
      const { password, ...userData } = user;
      setUser(userData);
      
      // Redirect based on role
      switch (user.role) {
        case 'ADMIN':
          router.push(ROUTES.ADMIN.DASHBOARD);
          break;
        case 'AGENT':
          router.push(ROUTES.AGENT.DASHBOARD);
          break;
        case 'USER':
        default:
          router.push(ROUTES.USER.DASHBOARD);
      }
      
      toast.success(`Welcome back, ${user.name}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          Sign in to your account
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            defaultValue="admin@example.com" // Pre-fill for demo
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            defaultValue="password123" // Pre-fill for demo
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link href={ROUTES.REGISTER} passHref>
                <MuiLink>Sign up</MuiLink>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
