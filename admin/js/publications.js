/* ============================================================
   publications.js — CRUD logic for the Publications admin page.
   This is the TEMPLATE PATTERN: team.js, research.js, gallery.js
   follow the exact same structure (render table, open modal,
   save, delete) just with different fields.
   ============================================================ */

const COLLECTION = 'publications';

document.addEventListener('adminIncludesLoaded', renderTable);

async function renderTable() {
  const tbody = document.getElementById('pubTableBody');
  const items = await getAll(COLLECTION);

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5">No publications yet. Click "+ Add Publication" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(pub => `
    <tr>
      <td>${pub.title}</td>
      <td>${pub.authors}</td>
      <td>${pub.year}</td>
      <td>${pub.venue}</td>
      <td class="row-actions">
        <button class="edit-btn" onclick='openEditModal(${JSON.stringify(pub)})'>Edit</button>
        <button class="delete-btn" onclick="handleDelete('${pub.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Publication';
  document.getElementById('pubForm').reset();
  document.getElementById('pubId').value = '';
  document.getElementById('modalOverlay').classList.add('open');
}

function openEditModal(pub) {
  document.getElementById('modalTitle').textContent = 'Edit Publication';
  document.getElementById('pubId').value = pub.id;
  document.getElementById('pubTitle').value = pub.title;
  document.getElementById('pubAuthors').value = pub.authors;
  document.getElementById('pubVenue').value = pub.venue;
  document.getElementById('pubYear').value = pub.year;
  document.getElementById('pubLink').value = pub.link || '';
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('pubForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('pubId').value;
  const data = {
    title: document.getElementById('pubTitle').value,
    authors: document.getElementById('pubAuthors').value,
    venue: document.getElementById('pubVenue').value,
    year: Number(document.getElementById('pubYear').value),
    link: document.getElementById('pubLink').value,
  };

  if (id) {
    await updateItem(COLLECTION, id, data);
  } else {
    await addItem(COLLECTION, data);
  }

  closeModal();
  renderTable();
});

async function handleDelete(id) {
  if (!confirm('Delete this publication? This cannot be undone.')) return;
  await deleteItem(COLLECTION, id);
  renderTable();
}
