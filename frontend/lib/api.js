const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Logs in a user with the provided credentials
 * @param {string} username - The username or email
 * @param {string} password - The user's password
 * @param {string} role - The user's role (user, agent, admin)
 * @returns {Promise<Object>} The authentication response
 */
export async function login(username, password) {
  try {
    const response = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Login failed. Please check your credentials.');
    }

    const data = await response.json();
    console.log('Login successful:', data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message || 'An error occurred during login. Please try again.');
  }
}

/**
 * Retrieves the current authentication data from localStorage
 * @returns {Object|null} The authentication data or null if not authenticated
 */
export function getAuthData() {
  if (typeof window === 'undefined') return null;
  const authData = localStorage.getItem('auth');
  return authData ? JSON.parse(authData) : null;
}

/**
 * Checks if the current user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
  const authData = getAuthData();
  return !!(authData && authData.token);
}

/**
 * Checks if the current user has the required role
 * @param {string|Array<string>} requiredRole - The role(s) to check against
 * @returns {boolean} True if user has the required role, false otherwise
 */
export function hasRole(requiredRole) {
  const authData = getAuthData();
  if (!authData) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(authData.role);
  }
  return authData.role === requiredRole;
}

/**
 * Gets the authentication header with the JWT token
 * @returns {Object} The authorization header or empty object if not authenticated
 */
export function authHeader() {
  const authData = getAuthData();
  if (!authData || !authData.token) return {};
  return { 'Authorization': `Bearer ${authData.token}` };
}

/**
 * Logs out the current user
 */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth');
    window.location.href = '/';
  }
}

/**
 * Handles API requests with authentication
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - The fetch options
 * @returns {Promise<Object>} The API response data
 */
export async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...authHeader(),
    ...options.headers
  };

  try {
    const response = await fetch(`${API}${endpoint}`, {
      ...options,
      headers
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      logout();
      throw new Error('Your session has expired. Please log in again.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}
