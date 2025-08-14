import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAuthData, clearAuthData } from '../lib/api';
import styles from '../styles/Dashboard.module.css';

export default function DashboardLayout({ children, title, userRole }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const auth = getAuthData();
    if (!auth || !auth.token) {
      router.push('/login');
      return;
    }
    setUser(auth);

    // Set active tab based on current route
    const path = router.pathname;
    if (path.includes('tickets')) setActiveTab('tickets');
    else if (path.includes('admin')) setActiveTab('admin');
    else if (path.includes('agent')) setActiveTab('agent');
    else setActiveTab('dashboard');
  }, [router]);

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  // Define navigation items based on user role
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'tickets', label: 'My Tickets', path: '/tickets' },
  ];

  if (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_AGENT') {
    navItems.push(
      { id: 'agent', label: 'Agent Dashboard', path: '/agent/dashboard' }
    );
  }

  if (user.role === 'ROLE_ADMIN') {
    navItems.push(
      { id: 'admin', label: 'Admin', path: '/admin/dashboard' }
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button className={styles.menuButton} onClick={toggleMenu}>
          ☰
        </button>
        <h1>{title}</h1>
      </header>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>Ticket System</h2>
          <button className={styles.closeButton} onClick={toggleMenu}>
            ×
          </button>
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className={styles.userDetails}>
            <h3>{user.name || 'User'}</h3>
            <span className={styles.userRole}>
              {user.role ? user.role.replace('ROLE_', '') : 'User'}
            </span>
          </div>
        </div>

        <nav className={styles.nav}>
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <Link 
                  href={item.path}
                  className={`${styles.navLink} ${activeTab === item.id ? styles.active : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.footer}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div className={styles.overlay} onClick={toggleMenu}></div>
      )}

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
