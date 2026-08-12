const COLLECTION = 'gallery';

document.addEventListener('adminIncludesLoaded', renderTable);

async function renderTable() {
  const tbody = document.getElementById('galleryTableBody');
  const items = await getAll(COLLECTION);

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="3">No photos yet. Click "+ Add Photo" to add one.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(g => `
    <tr>
      <td><img src="../${g.image}" onerror="this.src='../assets/images/placeholder-lab.jpg'" style="width:70px;height:52px;object-fit:cover;border-radius:6px;" /></td>
      <td>${g.caption || '—'}</td>
      <td class="row-actions">
        <button class="edit-btn" onclick='openEditModal(${JSON.stringify(g)})'>Edit</button>
        <button class="delete-btn" onclick="handleDelete('${g.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Photo';
  document.getElementById('galleryForm').reset();
  document.getElementById('gId').value = '';
  document.getElementById('modalOverlay').classList.add('open');
}

function openEditModal(g) {
  document.getElementById('modalTitle').textContent = 'Edit Photo';
  document.getElementById('gId').value = g.id;
  document.getElementById('gImage').value = g.image;
  document.getElementById('gCaption').value = g.caption || '';
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('galleryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('gId').value;
  const data = {
    image: document.getElementById('gImage').value,
    caption: document.getElementById('gCaption').value,
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
  if (!confirm('Delete this photo? This cannot be undone.')) return;
  await deleteItem(COLLECTION, id);
  renderTable();
}
