const COLLECTION = 'projects';

document.addEventListener('adminIncludesLoaded', renderTable);

async function renderTable() {
  const tbody = document.getElementById('projTableBody');
  const items = await getAll(COLLECTION);

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5">No projects yet. Click "+ Add Project" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(p => `
    <tr>
      <td><strong>${p.title}</strong></td>
      <td>${p.description || ''}</td>
      <td>${p.techStack || ''}</td>
      <td>${p.status || ''}</td>
      <td class="row-actions">
        <button class="edit-btn" onclick='openEditModal(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Edit</button>
        <button class="delete-btn" onclick="handleDelete('${p.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Project';
  document.getElementById('projForm').reset();
  document.getElementById('projId').value = '';
  document.getElementById('modalOverlay').classList.add('open');
}

function openEditModal(p) {
  document.getElementById('modalTitle').textContent = 'Edit Project';
  document.getElementById('projId').value = p.id;
  document.getElementById('projTitle').value = p.title || '';
  document.getElementById('projDesc').value = p.description || '';
  document.getElementById('projDetails').value = p.details || '';
  document.getElementById('projStatus').value = p.status || '';
  document.getElementById('projTech').value = p.techStack || '';
  document.getElementById('projDates').value = p.dates || '';
  document.getElementById('projTeam').value = p.team || '';
  document.getElementById('projCode').value = p.repoUrl || '';
  document.getElementById('projDemo').value = p.demoUrl || '';
  document.getElementById('projPub').value = p.pubUrl || '';
  document.getElementById('projImage').value = p.image || '';
  
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('projForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('projId').value;
  const data = {
    title: document.getElementById('projTitle').value,
    description: document.getElementById('projDesc').value,
    details: document.getElementById('projDetails').value,
    status: document.getElementById('projStatus').value,
    techStack: document.getElementById('projTech').value,
    dates: document.getElementById('projDates').value,
    team: document.getElementById('projTeam').value,
    repoUrl: document.getElementById('projCode').value,
    demoUrl: document.getElementById('projDemo').value,
    pubUrl: document.getElementById('projPub').value,
    image: document.getElementById('projImage').value
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
  if (!confirm('Delete this project? This cannot be undone.')) return;
  await deleteItem(COLLECTION, id);
  renderTable();
}
