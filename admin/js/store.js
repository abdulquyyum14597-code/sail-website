/* ============================================================
   store.js — Admin data layer.

   RIGHT NOW (no backend yet): all CRUD operations read/write to
   the browser's localStorage, seeded from the public site's
   /data/*.json files on first run. This lets you build and test
   the FULL admin experience (add/edit/delete) without a backend.

   Each collection also has an "Export JSON" button in its page —
   use that to download the updated file and replace the one in
   /data/, which is what the public site actually reads from.

   LATER (once backend exists): each function's body just needs
   to call the real API (fetch POST/PUT/DELETE to his endpoints)
   instead of touching localStorage. The function names and
   signatures below are exactly what the rest of the admin UI
   calls — keep them the same so nothing else has to change.
   ============================================================ */

const COLLECTIONS = ['team', 'publications', 'research', 'gallery'];

async function seedIfEmpty(collection) {
  const existing = localStorage.getItem(`sail_${collection}`);
  if (existing) return;
  const res = await fetch(`../data/${collection}.json`);
  const data = await res.json();
  localStorage.setItem(`sail_${collection}`, JSON.stringify(data));
}

async function getAll(collection) {
  await seedIfEmpty(collection);
  return JSON.parse(localStorage.getItem(`sail_${collection}`) || '[]');
}

async function saveAll(collection, items) {
  localStorage.setItem(`sail_${collection}`, JSON.stringify(items));
}

async function addItem(collection, item) {
  const items = await getAll(collection);
  item.id = `${collection[0]}${Date.now()}`;
  items.push(item);
  await saveAll(collection, items);
  return item;
}

async function updateItem(collection, id, updates) {
  const items = await getAll(collection);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) throw new Error('Item not found');
  items[idx] = { ...items[idx], ...updates };
  await saveAll(collection, items);
  return items[idx];
}

async function deleteItem(collection, id) {
  const items = await getAll(collection);
  const filtered = items.filter(i => i.id !== id);
  await saveAll(collection, filtered);
}

function exportCollection(collection) {
  getAll(collection).then(items => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* Settings is a single object, not a list — handled separately */
async function getSettingsData() {
  const existing = localStorage.getItem('sail_settings');
  if (existing) return JSON.parse(existing);
  const res = await fetch('../data/settings.json');
  const data = await res.json();
  localStorage.setItem('sail_settings', JSON.stringify(data));
  return data;
}

async function saveSettingsData(data) {
  localStorage.setItem('sail_settings', JSON.stringify(data));
}

function exportSettings() {
  getSettingsData().then(data => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    a.click();
    URL.revokeObjectURL(url);
  });
}
