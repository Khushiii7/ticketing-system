'use client';

import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Link as MuiLink, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { setUser } from '@/lib/auth';
import { ROUTES } from '@/config/routes';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['USER', 'AGENT', 'ADMIN']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  const role = watch('role');

  const handleRoleChange = (event: SelectChangeEvent) => {
    setValue('role', event.target.value as 'USER' | 'AGENT' | 'ADMIN');
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user object
      const user = {
        id: uuidv4(),
        name: data.name,
        email: data.email,
        role: data.role,
      };
      
      // Save to localStorage
      setUser(user);
      
      toast.success('Registration successful!');
      
      // Redirect based on role
      switch (data.role) {
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          Create an account
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            autoComplete="name"
            autoFocus
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={role}
              label="Role"
              onChange={handleRoleChange}
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="AGENT">Support Agent</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link href="/login" passHref>
                <MuiLink>Sign in</MuiLink>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
