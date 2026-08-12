document.addEventListener('includesLoaded', async () => {
  const container = document.getElementById('galleryGrid');
  try {
    const photos = await getGallery();
    if (!photos.length) {
      container.innerHTML = `<p class="empty-text">No photos added yet.</p>`;
      return;
    }
    container.innerHTML = photos.map(photo => `
      <div class="card" style="padding:0;overflow:hidden;">
        <img src="${photo.image}" alt="${photo.caption}" onerror="this.src='assets/images/placeholder-lab.jpg'" style="width:100%;aspect-ratio:4/3;object-fit:cover;" />
        ${photo.caption ? `<p style="padding:14px 16px;color:var(--color-muted);font-size:0.88rem;">${photo.caption}</p>` : ''}
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load gallery.</p>`;
  }
});
