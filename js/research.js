document.addEventListener('includesLoaded', async () => {
  const container = document.getElementById('researchGrid');
  try {
    const areas = await getResearchAreas();
    if (!areas.length) {
      container.innerHTML = `<p class="empty-text">No research areas added yet.</p>`;
      return;
    }
    container.innerHTML = areas.map(area => `
      <div class="card">
        <div class="icon">${area.icon || '🔬'}</div>
        <h3>${area.title}</h3>
        <p style="color:var(--color-muted);margin-top:8px;">${area.description}</p>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load research areas.</p>`;
  }
});
