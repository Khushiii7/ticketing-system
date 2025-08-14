import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import DashboardLayout from '../components/DashboardLayout';
import { getAuthData } from '../lib/api';
import styles from '../styles/Dashboard.module.css';

// API endpoints
const API_BASE_URL = 'http://localhost:8080/api';

// SWR fetcher with auth
const fetcher = async (url) => {
  const auth = getAuthData();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth?.token}`
  };
  
  const res = await fetch(`${API_BASE_URL}${url}`, { headers });
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export default function Dashboard() {
  const router = useRouter();
  const [auth, setAuth] = useState(null);
  
  // Fetch tickets based on user role
  const { data: tickets, error: ticketsError } = useSWR(
    auth?.role === 'ROLE_ADMIN' ? '/tickets' : 
    auth?.role === 'ROLE_AGENT' ? '/tickets/assigned' : 
    '/tickets/my', 
    fetcher,
    { revalidateOnFocus: false }
  );
  
  // Fetch stats based on user role
  const { data: stats } = useSWR(
    auth?.role === 'ROLE_ADMIN' ? '/stats/admin' : 
    auth?.role === 'ROLE_AGENT' ? '/stats/agent' : 
    '/stats/user', 
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    // Check if user is authenticated
    const authData = getAuthData();
    if (!authData || !authData.token) {
      router.push('/login');
      return;
    }
    setAuth(authData);
    
    // Redirect to appropriate dashboard based on role
    if (authData.role === 'ROLE_ADMIN' && router.pathname !== '/admin/dashboard') {
      router.push('/admin/dashboard');
    } else if (authData.role === 'ROLE_AGENT' && router.pathname !== '/agent/dashboard') {
      router.push('/agent/dashboard');
    }
  }, [router]);

  if (!auth) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Render dashboard content based on user role
  const renderDashboardContent = () => {
    if (ticketsError) {
      return (
        <div className={styles.alert}>
          <p>Error loading tickets. Please try again later.</p>
        </div>
      );
    }

    if (!tickets) {
      return <div className={styles.loading}>Loading tickets...</div>;
    }

    if (tickets.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📋</div>
          <h3 className={styles.emptyStateTitle}>No tickets found</h3>
          <p className={styles.emptyStateDescription}>
            {auth.role === 'ROLE_USER' 
              ? 'You haven\'t created any tickets yet. Create your first ticket to get started.'
              : 'There are no tickets assigned to you at the moment.'}
          </p>
          {auth.role === 'ROLE_USER' && (
            <button 
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={() => router.push('/tickets/new')}
            >
              Create New Ticket
            </button>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className={styles.dashboardGrid}>
          {stats && (
            <>
              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ backgroundColor: '#3b82f6' }}>
                  📝
                </div>
                <h3 className={styles.cardTitle}>Total Tickets</h3>
                <p className={styles.cardValue}>{stats.totalTickets || 0}</p>
              </div>
              
              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ backgroundColor: '#10b981' }}>
                  ✅
                </div>
                <h3 className={styles.cardTitle}>Open</h3>
                <p className={styles.cardValue}>{stats.openTickets || 0}</p>
              </div>
              
              {auth.role !== 'ROLE_USER' && (
                <div className={styles.card}>
                  <div className={styles.cardIcon} style={{ backgroundColor: '#f59e0b' }}>
                    🔄
                  </div>
                  <h3 className={styles.cardTitle}>In Progress</h3>
                  <p className={styles.cardValue}>{stats.inProgressTickets || 0}</p>
                </div>
              )}
              
              <div className={styles.card}>
                <div className={styles.cardIcon} style={{ backgroundColor: '#10b981' }}>
                  🎉
                </div>
                <h3 className={styles.cardTitle}>Resolved</h3>
                <p className={styles.cardValue}>{stats.resolvedTickets || 0}</p>
              </div>
            </>
          )}
        </div>
        
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                {auth.role !== 'ROLE_USER' && <th>Requester</th>}
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className={styles.clickableRow}
                  onClick={() => router.push(`/ticket/${ticket.id}`)}
                >
                  <td>#{ticket.id}</td>
                  <td>{ticket.subject}</td>
                  <td>
                    <span className={`${styles.statusIndicator} ${
                      ticket.status === 'OPEN' ? styles.statusOpen :
                      ticket.status === 'IN_PROGRESS' ? styles.statusInProgress :
                      ticket.status === 'RESOLVED' ? styles.statusResolved :
                      styles.statusClosed
                    }`}>
                      {ticket.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </td>
                  <td>{ticket.priority || 'N/A'}</td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  {auth.role !== 'ROLE_USER' && (
                    <td>{ticket.requester?.name || 'N/A'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Dashboard" userRole={auth.role}>
      {renderDashboardContent()}
    </DashboardLayout>
  );
}
