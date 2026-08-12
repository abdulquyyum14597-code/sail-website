document.addEventListener('includesLoaded', async () => {
  const container = document.getElementById('pubList');
  try {
    const pubs = await getPublications();
    if (!pubs.length) {
      container.innerHTML = `<p class="empty-text">No publications added yet.</p>`;
      return;
    }
    const sorted = [...pubs].sort((a, b) => b.year - a.year);
    container.innerHTML = sorted.map(pub => `
      <div class="pub-item">
        <h4>${pub.title}</h4>
        <p class="meta">${pub.authors} — ${pub.venue}, ${pub.year}</p>
        ${pub.link && pub.link !== '#' ? `<a href="${pub.link}" target="_blank" rel="noopener">View Publication →</a>` : ''}
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load publications.</p>`;
  }
});
