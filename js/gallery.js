document.addEventListener('includesLoaded', async () => {
  const container = document.getElementById('galleryGrid');
  try {
    const photos = await getGallery();
    if (!photos.length) {
      container.innerHTML = `<p class="empty-text">No photos added yet.</p>`;
      return;
    }
    window.cachedGallery = photos;
    container.innerHTML = photos.map((photo, i) => `
      <div class="card" style="padding:0;overflow:hidden;cursor:pointer;" onclick="showGalleryModal(${i})">
        <img src="${photo.image}" alt="${photo.caption}" onerror="this.src='assets/images/placeholder-lab.jpg'" style="width:100%;aspect-ratio:4/3;object-fit:cover;" />
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="empty-text">Failed to load gallery.</p>`;
  }
});

window.showGalleryModal = function(index) {
  const photo = window.cachedGallery[index];
  if(!photo) return;
  const html = `
    <img src="${photo.image}" onerror="this.src='assets/images/placeholder-lab.jpg'" style="width:100%; border-radius:6px; margin-bottom:12px;"/>
    ${photo.caption ? `<p style="font-size:1.05rem; margin-top:16px;">${photo.caption}</p>` : ''}
  `;
  window.openPublicModal(html);
};
