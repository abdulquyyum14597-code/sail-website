/* ============================================================
   home.js — renders dynamic sections on index.html using api.js
   ============================================================ */

document.addEventListener('includesLoaded', async () => {
  loadSettingsPreview();
  loadResearchPreview();
  loadPublicationsPreview();
  loadTeamPreview();
  loadProjectsPreview();
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

async function loadTeamPreview() {
  const container = document.getElementById('teamPreview');
  if (!container) return;
  try {
    const team = await getTeam();
    if (!team.length) {
      container.innerHTML = `<p class="empty-text">No team members added yet.</p>`;
      return;
    }
    window.cachedTeamPreview = team.slice(0, 3);
    container.innerHTML = window.cachedTeamPreview.map((member, i) => `
      <div class="team-card" style="cursor:pointer;" onclick="showHomeTeamModal(${i})">
        <img src="${member.photo}" alt="${member.name}" onerror="this.src='assets/images/placeholder-person.jpg'" />
        <div class="info">
          <h4>${member.name}</h4>
          <p class="role">${member.role}</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load team.</p>`;
  }
}

async function loadProjectsPreview() {
  const container = document.getElementById('projectsPreview');
  if (!container) return;
  try {
    const projects = await getProjects();
    if (!projects.length) {
      container.innerHTML = `<p class="empty-text">No projects added yet.</p>`;
      return;
    }
    window.cachedProjectsPreview = projects.slice(0, 3);
    container.innerHTML = window.cachedProjectsPreview.map((p, i) => `
      <div class="card" style="cursor:pointer;" onclick="showHomeProjectModal(${i})">
        <h3>${p.title}</h3>
        <p style="color:var(--color-muted);margin-top:8px;">${p.description || ''}</p>
        ${p.status ? `<p style="color:var(--color-teal);font-size:0.82rem;font-weight:600;margin-top:8px;">${p.status}</p>` : ''}
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load projects.</p>`;
  }
}

/* --- Modal handlers for homepage previews --- */

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

window.showHomeTeamModal = function(index) {
  const member = window.cachedTeamPreview[index];
  if(!member) return;
  const html = `
    <div style="text-align:center;margin-bottom:16px;">
      <img src="${member.photo}" alt="${member.name}" onerror="this.src='assets/images/placeholder-person.jpg'" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 12px auto;" />
    </div>
    <h3 style="text-align:center;margin-bottom:4px;">${member.name}</h3>
    <p style="text-align:center;color:var(--color-teal);font-weight:600;margin-bottom:16px;">${member.role}</p>
    ${member.bio ? `<p style="margin-bottom:16px;">${member.bio}</p>` : ''}
    ${member.email ? `<p><strong>Email:</strong> <a href="mailto:${member.email}" style="color:var(--color-teal);">${member.email}</a></p>` : ''}
  `;
  window.openPublicModal(html);
};

window.showHomeProjectModal = function(index) {
  const p = window.cachedProjectsPreview[index];
  if(!p) return;
  const html = `
    <h3 style="margin-bottom:12px;">${p.title}</h3>
    ${p.description ? `<p style="margin-bottom:12px;">${p.description}</p>` : ''}
    ${p.details ? `<p style="margin-bottom:16px;">${p.details}</p>` : ''}
    ${p.techStack ? `<p style="margin-bottom:8px;"><strong>Tech Stack:</strong> ${p.techStack}</p>` : ''}
    ${p.status ? `<p style="margin-bottom:8px;"><strong>Status:</strong> ${p.status}</p>` : ''}
    ${p.dates ? `<p style="margin-bottom:16px;"><strong>Duration:</strong> ${p.dates}</p>` : ''}
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:16px;">
      ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="text-decoration:none;">Code Repository &rarr;</a>` : ''}
      ${p.demoUrl ? `<a href="${p.demoUrl}" target="_blank" rel="noopener" class="btn btn-outline" style="text-decoration:none;border-color:var(--color-teal);color:var(--color-teal);">Live Demo &rarr;</a>` : ''}
    </div>
  `;
  window.openPublicModal(html);
};
