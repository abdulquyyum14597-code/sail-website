// theme.js - loaded as early as possible in <head>
(function() {
  const savedTheme = localStorage.getItem('sail_theme');
  if (savedTheme && savedTheme !== 'original') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
})();

function setTheme(theme) {
  if (theme === 'original') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('sail_theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sail_theme', theme);
  }
}
