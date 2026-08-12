const COLLECTION = 'team';

document.addEventListener('adminIncludesLoaded', renderTable);

async function renderTable() {
  const tbody = document.getElementById('teamTableBody');
  const items = await getAll(COLLECTION);

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="4">No team members yet. Click "+ Add Member" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.role}</td>
      <td>${m.email || '—'}</td>
      <td class="row-actions">
        <button class="edit-btn" onclick='openEditModal(${JSON.stringify(m)})'>Edit</button>
        <button class="delete-btn" onclick="handleDelete('${m.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Team Member';
  document.getElementById('teamForm').reset();
  document.getElementById('tId').value = '';
  document.getElementById('modalOverlay').classList.add('open');
}

function openEditModal(m) {
  document.getElementById('modalTitle').textContent = 'Edit Team Member';
  document.getElementById('tId').value = m.id;
  document.getElementById('tName').value = m.name;
  document.getElementById('tRole').value = m.role;
  document.getElementById('tPhoto').value = m.photo || '';
  document.getElementById('tBio').value = m.bio || '';
  document.getElementById('tEmail').value = m.email || '';
  document.getElementById('tLinkedin').value = m.linkedin || '';
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('teamForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('tId').value;
  const data = {
    name: document.getElementById('tName').value,
    role: document.getElementById('tRole').value,
    photo: document.getElementById('tPhoto').value || 'assets/images/placeholder-person.jpg',
    bio: document.getElementById('tBio').value,
    email: document.getElementById('tEmail').value,
    linkedin: document.getElementById('tLinkedin').value,
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
  if (!confirm('Delete this team member? This cannot be undone.')) return;
  await deleteItem(COLLECTION, id);
  renderTable();
}
