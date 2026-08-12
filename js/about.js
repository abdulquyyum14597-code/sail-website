document.addEventListener('includesLoaded', async () => {
  try {
    const settings = await getSettings();
    document.getElementById('aboutTagline').textContent = settings.tagline;
    document.getElementById('missionText').textContent = settings.mission;
    document.getElementById('affiliationText').textContent = settings.affiliation;
  } catch (err) {
    console.error(err);
  }

  const container = document.getElementById('researchList');
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
