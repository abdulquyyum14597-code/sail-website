document.addEventListener('includesLoaded', async () => {
  const container = document.getElementById('teamGrid');
  try {
    const team = await getTeam();
    if (!team.length) {
      container.innerHTML = `<p class="empty-text">No team members added yet.</p>`;
      return;
    }
    window.cachedTeam = team;
    container.innerHTML = team.map((member, i) => `
      <div class="team-card" style="cursor:pointer;" onclick="showTeamModal(${i})">
        <img src="${member.photo}" alt="${member.name}" onerror="this.src='assets/images/placeholder-person.jpg'" />
        <div class="info">
          <h4>${member.name}</h4>
          <p class="role">${member.role}</p>
          ${member.bio ? `<p style="color:var(--color-muted);font-size:0.85rem;">${member.bio}</p>` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load team.</p>`;
  }
});

window.showTeamModal = function(index) {
  const member = window.cachedTeam[index];
  if (!member) return;
  const html = `
    <div style="text-align:center;margin-bottom:16px;">
      <img src="${member.photo}" alt="${member.name}" onerror="this.src='assets/images/placeholder-person.jpg'" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 12px auto;" />
    </div>
    <h3 style="text-align:center;margin-bottom:4px;">${member.name}</h3>
    <p style="text-align:center;color:var(--color-teal);font-weight:600;margin-bottom:16px;">${member.role}</p>
    ${member.bio ? `<p style="margin-bottom:16px;">${member.bio}</p>` : ''}
    ${member.email ? `<p style="margin-bottom:8px;"><strong>Email:</strong> <a href="mailto:${member.email}" style="color:var(--color-teal);">${member.email}</a></p>` : ''}
    ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" rel="noopener" class="btn btn-primary" style="text-decoration:none;margin-top:12px;">View LinkedIn &rarr;</a>` : ''}
  `;
  window.openPublicModal(html);
};
