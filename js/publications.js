document.addEventListener('includesLoaded', async () => {
  const container = document.getElementById('pubList');
  try {
    const pubs = await getPublications();
    if (!pubs.length) {
      container.innerHTML = `<p class="empty-text">No publications added yet.</p>`;
      return;
    }
    const sorted = [...pubs].sort((a, b) => b.year - a.year);
    window.cachedPubs = sorted;
    container.innerHTML = sorted.map((pub, i) => `
      <div class="pub-item" style="cursor:pointer;" onclick="showPubModal(${i})">
        <h4>${pub.title}</h4>
        <p class="meta">${pub.authors} &mdash; ${pub.venue}, ${pub.year}</p>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load publications.</p>`;
  }
});

window.showPubModal = function(index) {
  const pub = window.cachedPubs[index];
  if(!pub) return;
  const html = `
    <h3 style="margin-bottom:12px;">${pub.title}</h3>
    <p style="margin-bottom:10px;"><strong>Authors:</strong> ${pub.authors}</p>
    <p style="margin-bottom:20px;"><strong>Venue:</strong> ${pub.venue} (${pub.year})</p>
    ${pub.link && pub.link !== '#' ? `<a href="${pub.link}" target="_blank" rel="noopener" class="btn btn-primary" style="text-decoration:none;">View Full Publication &rarr;</a>` : ''}
  `;
  window.openPublicModal(html);
};
