/* ============================================================
   store.js — Admin data layer connected to the real REST API.
   ============================================================ */

const API_BASE_URL = (window.__BASE_PATH__ || '').replace(/\/$/, '');

function storeApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanEndpoint}` : cleanEndpoint;
}

/**
 * Fetch all items in a collection from the REST API
 */
async function getAll(collection) {
  const res = await fetch(storeApiUrl(`/api/${collection}`));
  if (!res.ok) {
    throw new Error(`Failed to fetch ${collection}: ${res.statusText}`);
  }
  return await res.json();
}

/**
 * Add a new item to a collection
 */
async function addItem(collection, item) {
  const res = await fetch(storeApiUrl(`/api/${collection}`), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to add ${collection} item`);
  }
  return await res.json();
}

/**
 * Update an existing item in a collection
 */
async function updateItem(collection, id, updates) {
  const res = await fetch(storeApiUrl(`/api/${collection}/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update ${collection} item`);
  }
  return await res.json();
}

/**
 * Delete an item from a collection
 */
async function deleteItem(collection, id) {
  const res = await fetch(storeApiUrl(`/api/${collection}/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete ${collection} item`);
  }
  return await res.json();
}

/**
 * Export collection as a JSON file
 */
function exportCollection(collection) {
  getAll(collection).then((items) => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* ============================================================
   Settings (single object)
   ============================================================ */

async function getSettingsData() {
  const res = await fetch(storeApiUrl('/api/settings'));
  if (!res.ok) {
    throw new Error(`Failed to fetch settings: ${res.statusText}`);
  }
  return await res.json();
}

async function saveSettingsData(data) {
  const res = await fetch(storeApiUrl('/api/settings'), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save settings');
  }
  return await res.json();
}

function exportSettings() {
  getSettingsData().then((data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* ============================================================
   Contact Messages (Admin)
   ============================================================ */

async function getMessages() {
  const res = await fetch(storeApiUrl('/api/contact/messages'), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch contact messages');
  }
  return await res.json();
}

async function markMessageRead(id) {
  const res = await fetch(storeApiUrl(`/api/contact/messages/${id}/read`), {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to update message');
  return await res.json();
}

async function deleteMessage(id) {
  const res = await fetch(storeApiUrl(`/api/contact/messages/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete message');
  return await res.json();
}

/* ============================================================
   File Upload Helper
   ============================================================ */

async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(storeApiUrl('/api/upload'), {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload image');
  }
  return data; // { success: true, url: 'uploads/filename.jpg' }
}

/**
 * Global helper for file input upload binding
 */
async function handleImageUpload(inputEl, targetInputId) {
  if (!inputEl.files || !inputEl.files[0]) return;
  const file = inputEl.files[0];
  const target = document.getElementById(targetInputId);
  const originalValue = target.value;
  target.value = 'Uploading image...';
  target.disabled = true;

  try {
    const res = await uploadFile(file);
    target.value = res.url;
  } catch (err) {
    alert('Upload failed: ' + err.message);
    target.value = originalValue;
  } finally {
    target.disabled = false;
  }
}
