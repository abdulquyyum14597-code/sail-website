/* ============================================================
   auth.js — Real Server-Side JWT Authentication for SAIL Admin
   ============================================================ */

const API_BASE = (window.__BASE_PATH__ || '').replace(/\/$/, '');
const TOKEN_KEY = 'sail_admin_jwt';
const USER_KEY = 'sail_admin_user';

function authApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE ? `${API_BASE}${cleanEndpoint}` : cleanEndpoint;
}

/**
 * Perform login against /api/auth/login
 */
async function doLogin(password, username) {
  try {
    const res = await fetch(authApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, username }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem('sail_admin_logged_in', 'true');
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return { success: true };
  } catch (err) {
    console.error('Login network error:', err);
    return { success: false, error: 'Cannot connect to server. Ensure backend is running.' };
  }
}

/**
 * Retrieve current JWT token
 */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Return authorization headers for API requests
 */
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * Check if token is present
 */
function isLoggedIn() {
  return !!getToken();
}

/**
 * Clear session and redirect to login
 */
function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('sail_admin_logged_in');
  window.location.href = 'login.html';
}

/**
 * Route protection for admin pages
 */
async function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  // Validate token with backend in background
  try {
    const res = await fetch(authApiUrl('/api/auth/me'), {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      console.warn('Session expired or invalid. Logging out.');
      logout();
    }
  } catch (err) {
    console.warn('Network issue during session check:', err);
  }
}
