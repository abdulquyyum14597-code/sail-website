document.addEventListener('includesLoaded', async () => {
  const container = document.getElementById('researchGrid');
  try {
    const areas = await getResearchAreas();
    if (!areas.length) {
      container.innerHTML = `<p class="empty-text">No research areas added yet.</p>`;
      return;
    }
    window.cachedResearch = areas;
    container.innerHTML = areas.map((area, i) => `
      <div class="card" style="cursor:pointer;" onclick="showResearchModal(${i})">
        <h3>${area.title}</h3>
        <p style="color:var(--color-muted);margin-top:8px;">${area.description}</p>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load research areas.</p>`;
  }
});

window.showResearchModal = function(index) {
  const area = window.cachedResearch[index];
  if(!area) return;
  const html = `
    <h3 style="margin-bottom:16px;">${area.title}</h3>
    <p style="font-size:1.05rem; opacity:0.9; margin-bottom:24px;">${area.description}</p>
  `;
  window.openPublicModal(html);
};
