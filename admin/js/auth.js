/* ============================================================
   auth.js — PLACEHOLDER admin authentication.

   This is a simple client-side gate so you can build/test the
   admin UI before a real backend exists. It is NOT secure and
   must be replaced by real server-side auth (sessions/JWT) once
   the backend guy sets that up — swap checkLogin()/doLogin() to
   call his /api/admin/login endpoint instead.
   ============================================================ */

const ADMIN_PASSWORD = 'sail2026'; // TODO: replace with real backend auth
const SESSION_KEY = 'sail_admin_logged_in';

function doLogin(password) {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    return true;
  }
  return false;
}

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}

function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}
