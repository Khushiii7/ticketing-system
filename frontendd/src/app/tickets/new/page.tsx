import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { TicketPriority } from '@/types/ticket';

const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assignedToId: z.string().optional(),
});

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

export default function CreateTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
    enabled: true,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateTicketFormData) => {
    try {
      setIsSubmitting(true);
      
      // Create the ticket
      const ticket = await api.createTicket(data);
      
      if (files.length > 0) {
        setIsUploading(true);
        const uploadPromises = files.map((file) =>
          api.uploadFile(ticket.id, file).catch((error: Error) => {
            console.error('Error uploading file:', error);
            return null;
          })
        );
        
        await Promise.all(uploadPromises);
      }
      
      toast.success('Ticket created successfully!');
      // Redirect based on user role
      const userRole = localStorage.getItem('userRole');
      const dashboardPath = userRole === 'admin' ? '/admin/dashboard' : 
                           userRole === 'agent' ? '/agent/dashboard' : '/dashboard';
      router.push(dashboardPath);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box maxWidth="md" mx="auto">
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Ticket
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Fill in the details below to create a new support ticket.
          </Typography>
        </Box>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Title"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={6}
                        label="Description"
                        error={!!errors.description}
                        helperText={errors.description?.message || 'Be as detailed as possible'}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.priority}>
                        <InputLabel>Priority</InputLabel>
                        <Select {...field} label="Priority" disabled={isSubmitting}>
                          <MenuItem value="LOW">Low</MenuItem>
                          <MenuItem value="MEDIUM">Medium</MenuItem>
                          <MenuItem value="HIGH">High</MenuItem>
                          <MenuItem value="URGENT">Urgent</MenuItem>
                        </Select>
                        {errors.priority && (
                          <FormHelperText>{errors.priority.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="assignedToId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Assign To (Optional)</InputLabel>
                        <Select
                          {...field}
                          label="Assign To (Optional)"
                          disabled={isSubmitting || users.length === 0}
                        >
                          {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.name} ({user.role.toLowerCase()})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <input
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      disabled={isUploading || isSubmitting}
                    >
                      Attach Files
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                    Supported formats: Images, PDF, Word, Excel (Max 10MB per file)
                  </Typography>

                  {files.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Attached Files ({files.length}):
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {files.map((file, index) => (
                          <Paper
                            key={index}
                            variant="outlined"
                            sx={{
                              p: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {file.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {(file.size / 1024).toFixed(1)} KB
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeFile(index)}
                              disabled={isUploading || isSubmitting}
                              sx={{ ml: 'auto' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || isUploading}
                  >
                    {isUploading
                      ? 'Uploading Files...'
                      : isSubmitting
                      ? 'Creating Ticket...'
                      : 'Create Ticket'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
