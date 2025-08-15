export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'AGENT' | 'ADMIN';
  token?: string;
}

// Save user to localStorage
export const setUser = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Get user from localStorage
export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

// Remove user from localStorage (logout)
export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getUser();
};

// Get user role
export const getUserRole = (): User['role'] | null => {
  const user = getUser();
  return user?.role || null;
};
