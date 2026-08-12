async function loadAdminIncludes() {
  const targets = document.querySelectorAll('[data-include]');
  await Promise.all(
    Array.from(targets).map(async (el) => {
      const name = el.getAttribute('data-include');
      const res = await fetch(`partials/${name}.html`);
      el.innerHTML = await res.text();
    })
  );
  const current = document.body.getAttribute('data-page');
  const link = document.querySelector(`[data-nav="${current}"]`);
  if (link) link.classList.add('active');
  document.dispatchEvent(new CustomEvent('adminIncludesLoaded'));
}

document.addEventListener('DOMContentLoaded', () => {
  requireLogin();
  loadAdminIncludes();
});
