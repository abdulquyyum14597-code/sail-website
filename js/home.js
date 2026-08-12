/* ============================================================
   home.js — renders dynamic sections on index.html using api.js
   ============================================================ */

document.addEventListener('includesLoaded', async () => {
  loadSettingsPreview();
  loadResearchPreview();
  loadPublicationsPreview();
});

async function loadSettingsPreview() {
  try {
    const settings = await getSettings();
    document.getElementById('heroTitle').textContent = settings.labName;
    document.getElementById('heroTagline').textContent = settings.tagline;

    const pi = settings.principalInvestigator;
    document.getElementById('piPreview').innerHTML = `
      <img src="${pi.photo}" alt="${pi.name}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 16px auto;" />
      <h3>${pi.name}</h3>
      <p style="color:var(--color-teal);font-weight:600;margin-bottom:10px;">${pi.title}</p>
      <p style="color:var(--color-muted);">${pi.bio}</p>
    `;
  } catch (err) {
    console.error(err);
  }
}

async function loadResearchPreview() {
  const container = document.getElementById('researchPreview');
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
}

async function loadPublicationsPreview() {
  const container = document.getElementById('pubPreview');
  try {
    const pubs = await getPublications();
    if (!pubs.length) {
      container.innerHTML = `<p class="empty-text">No publications added yet.</p>`;
      return;
    }
    container.innerHTML = pubs.slice(0, 3).map(pub => `
      <div class="pub-item">
        <h4>${pub.title}</h4>
        <p class="meta">${pub.authors} — ${pub.venue}, ${pub.year}</p>
        <a href="${pub.link}" target="_blank" rel="noopener">View Publication →</a>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load publications.</p>`;
  }
}
