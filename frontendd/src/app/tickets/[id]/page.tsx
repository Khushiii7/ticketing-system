{{ ... }}
import { ROUTES } from '@/config/routes';
import { useRouter, useParams } from 'next/navigation';

export default function TicketDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  
  // Fetch ticket details
  const fetchTicket = async () => {
    try {
      const response = await fetch(ROUTES.API.TICKETS.BY_ID(id as string));
      if (!response.ok) throw new Error('Ticket not found');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      throw error;
    }
  };

  // Add comment
  const handleAddComment = async (content: string) => {
    try {
      await fetch(ROUTES.API.TICKETS.COMMENTS(id as string), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      // Refresh comments
      await fetchTicket();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (status: string) => {
    try {
      await fetch(ROUTES.API.TICKETS.BY_ID(id as string), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      // Refresh ticket data
      await fetchTicket();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.back()}
        >
          Back to Tickets
        </Button>
        
        <Box>
          <Button 
            variant="outlined" 
            onClick={() => router.push(ROUTES.TICKETS.EDIT(id as string))}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => updateTicketStatus('CLOSED')}
          >
            Close Ticket
          </Button>
        </Box>
      </Box>

      {/* Rest of your ticket detail page */}
      
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        {/* Comments list */}
        
        <Box mt={2}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a comment..."
            variant="outlined"
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const content = e.currentTarget.value.trim();
                if (content) {
                  await handleAddComment(content);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </Box>
      </Box>
    </div>
  );
}
