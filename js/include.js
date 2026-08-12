/* ============================================================
   include.js
   Loads shared header/footer partials into any page that has
   <div data-include="header"></div> and <div data-include="footer"></div>
   Keeps markup DRY without needing a build step or framework.
   ============================================================ */

async function loadIncludes() {
  const targets = document.querySelectorAll('[data-include]');
  const base = window.__BASE_PATH__ || '';

  await Promise.all(
    Array.from(targets).map(async (el) => {
      const name = el.getAttribute('data-include');
      try {
        const res = await fetch(`${base}partials/${name}.html`);
        if (!res.ok) throw new Error(`Failed to load partial: ${name}`);
        el.innerHTML = await res.text();
      } catch (err) {
        console.error(err);
        el.innerHTML = `<p style="color:red;">Failed to load ${name}</p>`;
      }
    })
  );

  highlightActiveNav();
  document.dispatchEvent(new CustomEvent('includesLoaded'));
}

function highlightActiveNav() {
  const current = document.body.getAttribute('data-page');
  if (!current) return;
  const link = document.querySelector(`[data-nav="${current}"]`);
  if (link) link.classList.add('active');
}

document.addEventListener('DOMContentLoaded', loadIncludes);
