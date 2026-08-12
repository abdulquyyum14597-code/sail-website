document.addEventListener('includesLoaded', async () => {
  const container = document.getElementById('projectList');
  try {
    const projects = await getProjects();
    if (!projects.length) {
      container.innerHTML = `<p class="empty-text">No projects added yet.</p>`;
      return;
    }
    window.cachedProjects = projects;
    container.innerHTML = projects.map((p, i) => `
      <div class="pub-item" style="border-left-color: var(--color-accent); display:flex; gap:16px; flex-wrap:wrap; cursor:pointer;" onclick="showProjectModal(${i})">
        <div style="flex:1; min-width:260px;">
            <h4>${p.title} ${p.status ? `<span style="font-size:0.75rem; background:rgba(28,124,120,0.1); color:var(--color-teal); padding:2px 6px; border-radius:4px; margin-left:8px; vertical-align:middle;">${p.status}</span>` : ''}</h4>
            <p class="meta" style="margin-bottom:6px;">${p.description}</p>
        </div>
        ${p.image ? `<img src="${p.image}" alt="${p.title}" style="width:120px; height:80px; object-fit:cover; border-radius:4px; border:1px solid var(--color-border);" />` : ''}
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load projects.</p>`;
  }
});

window.showProjectModal = function(index) {
  const p = window.cachedProjects[index];
  if(!p) return;
  const html = `
    <h3 style="margin-bottom:8px;">${p.title} ${p.status ? `<span style="font-size:0.75rem; background:rgba(28,124,120,0.1); color:var(--color-teal); padding:2px 6px; border-radius:4px; margin-left:8px; vertical-align:middle;">${p.status}</span>` : ''}</h3>
    <p style="font-size:1.05rem; margin-bottom:16px; opacity:0.9;">${p.description}</p>
    ${p.image ? `<img src="${p.image}" style="width:100%; max-height:250px; object-fit:cover; border-radius:6px; margin-bottom:20px;" />` : ''}
    ${p.details ? `<p style="font-size:1rem; margin-bottom:20px;">${p.details}</p>` : ''}
    
    <div style="background:var(--color-bg); padding:12px 16px; border-radius:6px; margin-bottom:20px;">
      ${p.techStack ? `<p style="font-size:0.9rem; margin-bottom:6px;"><strong>Tech Stack:</strong> ${p.techStack}</p>` : ''}
      ${p.team ? `<p style="font-size:0.9rem; margin-bottom:6px;"><strong>Team:</strong> ${p.team}</p>` : ''}
      ${p.dates ? `<p style="font-size:0.9rem; margin-bottom:0;"><strong>Timeline:</strong> ${p.dates}</p>` : ''}
    </div>
    
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
        ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener" class="btn btn-outline" style="color:var(--color-text); border-color:var(--color-border); padding:8px 16px;">Code Repository</a>` : ''}
        ${p.demoUrl ? `<a href="${p.demoUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="padding:8px 16px;">Live Demo</a>` : ''}
        ${p.pubUrl ? `<a href="${p.pubUrl}" target="_blank" rel="noopener" class="btn btn-outline" style="color:var(--color-text); border-color:var(--color-border); padding:8px 16px;">Related Link</a>` : ''}
    </div>
  `;
  window.openPublicModal(html);
};
