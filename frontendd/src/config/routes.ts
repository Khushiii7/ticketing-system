export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Role-based dashboard routes
  USER: {
    DASHBOARD: '/user/dashboard',
  },
  AGENT: {
    DASHBOARD: '/agent/dashboard',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
  },
  
  // Main app routes
  DASHBOARD: '/dashboard',
  TICKETS: {
    BASE: '/tickets',
    NEW: '/tickets/new',
    DETAIL: (id: string) => `/tickets/${id}`,
    EDIT: (id: string) => `/tickets/${id}/edit`,
  },
  
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  
  // API routes
  API: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
    },
    TICKETS: {
      BASE: '/api/tickets',
      BY_ID: (id: string) => `/api/tickets/${id}`,
      COMMENTS: (ticketId: string) => `/api/tickets/${ticketId}/comments`,
      STATS: '/api/tickets/stats',
      RECENT: '/api/tickets/recent',
    },
    USERS: {
      BASE: '/api/users',
      BY_ID: (id: string) => `/api/users/${id}`,
    },
  },
} as const;

export type RouteType = typeof ROUTES;

// Helper function to check if a route is active
export const isActiveRoute = (currentPath: string, routePath: string): boolean => {
  if (routePath === ROUTES.HOME) {
    return currentPath === routePath;
  }
  return currentPath.startsWith(routePath);
};
