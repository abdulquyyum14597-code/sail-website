document.addEventListener('includesLoaded', async () => {
  const container = document.getElementById('teamGrid');
  try {
    const team = await getTeam();
    if (!team.length) {
      container.innerHTML = `<p class="empty-text">No team members added yet.</p>`;
      return;
    }
    container.innerHTML = team.map(member => `
      <div class="team-card">
        <img src="${member.photo}" alt="${member.name}" onerror="this.src='assets/images/placeholder-person.jpg'" />
        <div class="info">
          <h4>${member.name}</h4>
          <p class="role">${member.role}</p>
          ${member.bio ? `<p style="color:var(--color-muted);font-size:0.85rem;">${member.bio}</p>` : ''}
          ${member.email ? `<p style="margin-top:8px;"><a href="mailto:${member.email}" style="color:var(--color-teal);font-size:0.82rem;">${member.email}</a></p>` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load team.</p>`;
  }
});
