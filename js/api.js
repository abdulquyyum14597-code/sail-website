/* ============================================================
   api.js
   SINGLE SOURCE OF TRUTH for how the frontend gets its data.

   RIGHT NOW: every function reads from local static JSON files
   in /data/*.json — this lets the whole site work with zero
   backend.

   LATER: when the backend guy's API is ready, each function
   below only needs its fetch URL swapped from a local JSON
   path to a real endpoint (e.g. '/data/team.json' becomes
   'https://api.sail-lab.com/api/team'). Nothing else in the
   site changes, because every page calls these functions,
   never fetch() directly.

   Expected shapes are documented above each function so the
   backend guy knows exactly what JSON to return.
   ============================================================ */

const API_BASE = window.__BASE_PATH__ || '';

/**
 * Team members
 * GET /api/team  ->  [{ id, name, role, photo, bio, email, linkedin }]
 */
async function getTeam() {
  const res = await fetch(`${API_BASE}data/team.json`);
  if (!res.ok) throw new Error('Failed to fetch team data');
  return res.json();
}

/**
 * Publications
 * GET /api/publications -> [{ id, title, authors, venue, year, link }]
 */
async function getPublications() {
  const res = await fetch(`${API_BASE}data/publications.json`);
  if (!res.ok) throw new Error('Failed to fetch publications data');
  return res.json();
}

/**
 * Research areas
 * GET /api/research -> [{ id, title, description }]
 */
async function getResearchAreas() {
  const res = await fetch(`${API_BASE}data/research.json`);
  if (!res.ok) throw new Error('Failed to fetch research data');
  return res.json();
}

/**
 * Gallery photos
 * GET /api/gallery -> [{ id, image, caption }]
 */
async function getGallery() {
  const res = await fetch(`${API_BASE}data/gallery.json`);
  if (!res.ok) throw new Error('Failed to fetch gallery data');
  return res.json();
}

/**
 * Projects
 * GET /api/projects -> [{ id, title, description, details, status, techStack, repoUrl, demoUrl, image }]
 */
async function getProjects() {
  const res = await fetch(`${API_BASE}data/projects.json?_t=${Date.now()}`);
  if (!res.ok) throw new Error('Failed to fetch projects data');
  return res.json();
}

/**
 * Lab settings / homepage content
 * GET /api/settings -> { labName, tagline, mission, principalInvestigator: {...} }
 */
async function getSettings() {
  const res = await fetch(`${API_BASE}data/settings.json`);
  if (!res.ok) throw new Error('Failed to fetch settings data');
  return res.json();
}

/**
 * Contact form submission
 * POST /api/contact  body: { name, email, message }
 * NOTE: no backend yet, so this currently just logs and resolves.
 * Backend guy: wire this to send an email / store in DB.
 */
async function submitContactForm(payload) {
  console.log('[submitContactForm] placeholder submission:', payload);
  return { success: true };
}
