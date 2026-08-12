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
    window.cachedResearchPreview = areas;
    container.innerHTML = areas.map((area, i) => `
      <div class="card" style="cursor:pointer;" onclick="showHomeResearchModal(${i})">
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
    window.cachedPubPreview = pubs.slice(0, 3);
    container.innerHTML = window.cachedPubPreview.map((pub, i) => `
      <div class="pub-item" style="cursor:pointer;" onclick="showHomePubModal(${i})">
        <h4>${pub.title}</h4>
        <p class="meta">${pub.authors} &mdash; ${pub.venue}, ${pub.year}</p>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load publications.</p>`;
  }
}

window.showHomeResearchModal = function(index) {
  const area = window.cachedResearchPreview[index];
  if(!area) return;
  const html = `
    <h3 style="margin-bottom:16px;">${area.title}</h3>
    <p style="font-size:1.05rem; opacity:0.9; margin-bottom:24px;">${area.description}</p>
  `;
  window.openPublicModal(html);
};

window.showHomePubModal = function(index) {
  const pub = window.cachedPubPreview[index];
  if(!pub) return;
  const html = `
    <h3 style="margin-bottom:12px;">${pub.title}</h3>
    <p style="margin-bottom:10px;"><strong>Authors:</strong> ${pub.authors}</p>
    <p style="margin-bottom:20px;"><strong>Venue:</strong> ${pub.venue} (${pub.year})</p>
    ${pub.link && pub.link !== '#' ? `<a href="${pub.link}" target="_blank" rel="noopener" class="btn btn-primary" style="text-decoration:none;">View Full Publication &rarr;</a>` : ''}
  `;
  window.openPublicModal(html);
};
