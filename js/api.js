/* ============================================================
   api.js
   SINGLE SOURCE OF TRUTH for how the frontend gets its data.
   Connected to the real SAIL REST API.
   ============================================================ */

const API_BASE = (window.__BASE_PATH__ || '').replace(/\/$/, '');

function apiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE ? `${API_BASE}${cleanEndpoint}` : cleanEndpoint;
}

/**
 * Helper to fetch with fallback to static JSON if API is offline
 */
async function fetchWithFallback(endpoint, staticFallbackPath) {
  try {
    const res = await fetch(apiUrl(endpoint));
    if (res.ok) {
      return await res.json();
    }
    throw new Error(`API responded with status: ${res.status}`);
  } catch (err) {
    console.warn(`[api.js] Failed to fetch from ${endpoint}, attempting fallback:`, err.message);
    if (staticFallbackPath) {
      const fallbackRes = await fetch(staticFallbackPath);
      if (fallbackRes.ok) return await fallbackRes.json();
    }
    throw err;
  }
}

/**
 * Team members
 * GET /api/team  ->  [{ id, name, role, photo, bio, email, linkedin }]
 */
async function getTeam() {
  return fetchWithFallback('/api/team', 'data/team.json');
}

/**
 * Publications
 * GET /api/publications -> [{ id, title, authors, venue, year, link }]
 */
async function getPublications() {
  return fetchWithFallback('/api/publications', 'data/publications.json');
}

/**
 * Research areas
 * GET /api/research -> [{ id, title, description }]
 */
async function getResearchAreas() {
  return fetchWithFallback('/api/research', 'data/research.json');
}

/**
 * Gallery photos
 * GET /api/gallery -> [{ id, image, caption }]
 */
async function getGallery() {
  return fetchWithFallback('/api/gallery', 'data/gallery.json');
}

/**
 * Projects
 * GET /api/projects -> [{ id, title, description, details, status, techStack, repoUrl, demoUrl, image }]
 */
async function getProjects() {
  return fetchWithFallback('/api/projects', 'data/projects.json');
}

/**
 * Lab settings / homepage content
 * GET /api/settings -> { labName, tagline, mission, principalInvestigator: {...}, contact: {...} }
 */
async function getSettings() {
  return fetchWithFallback('/api/settings', 'data/settings.json');
}

/**
 * Contact form submission
 * POST /api/contact  body: { name, email, message }
 */
async function submitContactForm(payload) {
  const res = await fetch(apiUrl('/api/contact'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send message');
  }
  return data;
}
