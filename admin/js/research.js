const COLLECTION = 'research';

document.addEventListener('adminIncludesLoaded', renderTable);

async function renderTable() {
  const tbody = document.getElementById('researchTableBody');
  const items = await getAll(COLLECTION);

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="4">No research areas yet. Click "+ Add Research Area" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(r => `
    <tr>
      <td>${r.title}</td>
      <td>${r.description}</td>
      <td class="row-actions">
        <button class="edit-btn" onclick='openEditModal(${JSON.stringify(r)})'>Edit</button>
        <button class="delete-btn" onclick="handleDelete('${r.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Research Area';
  document.getElementById('researchForm').reset();
  document.getElementById('rId').value = '';
  document.getElementById('modalOverlay').classList.add('open');
}

function openEditModal(r) {
  document.getElementById('modalTitle').textContent = 'Edit Research Area';
  document.getElementById('rId').value = r.id;
  document.getElementById('rTitle').value = r.title;
  document.getElementById('rDescription').value = r.description;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('researchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('rId').value;
  const data = {
    title: document.getElementById('rTitle').value,
    description: document.getElementById('rDescription').value,
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
  if (!confirm('Delete this research area? This cannot be undone.')) return;
  await deleteItem(COLLECTION, id);
  renderTable();
}
