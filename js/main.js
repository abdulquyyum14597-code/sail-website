/* ============================================================
   main.js — shared small UI behaviors across all public pages
   ============================================================ */

document.addEventListener('includesLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ============================================================
   Public Global Modal Handling
   ============================================================ */
window.openPublicModal = function(htmlContent) {
  const modal = document.getElementById('publicModal');
  const contentBox = document.getElementById('publicModalContent');
  if (modal && contentBox) {
    contentBox.innerHTML = htmlContent;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closePublicModal = function() {
  const modal = document.getElementById('publicModal');
  if (modal) {
    modal.classList.remove('active');
    document.getElementById('publicModalContent').innerHTML = '';
    document.body.style.overflow = '';
  }
};

/* Close modal on Escape key */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closePublicModal();
  }
});
