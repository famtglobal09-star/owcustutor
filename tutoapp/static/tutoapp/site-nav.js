(function () {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  menu.querySelectorAll('.menu-link').forEach(function (link) {
    const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
    link.classList.toggle('active', linkPath === currentPath);
  });
  toggle.addEventListener('click', function () {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('open', !open);
  });
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    }
  });
}());
