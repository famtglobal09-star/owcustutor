(function () {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;
  const closeButton = menu.querySelector('[data-nav-close]');
  const backdrop = document.querySelector('[data-nav-backdrop]');
  const more = menu.querySelector('.site-nav-more');
  const moreButton = menu.querySelector('.site-nav-more-button');
  const moreMenu = menu.querySelector('.site-nav-more-menu');
  toggle.setAttribute('aria-label', 'Open navigation');
  if (moreButton) moreButton.textContent = 'More +';
  const closeMore = function () {
    if (!moreButton || !moreMenu || !more) return;
    moreButton.setAttribute('aria-expanded', 'false');
    moreMenu.hidden = true;
    more.classList.remove('open');
  };
  const closeMenu = function () {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    if (backdrop) backdrop.hidden = true;
    closeMore();
  };
  const openMenu = function () {
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
    if (backdrop) backdrop.hidden = false;
  };
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  menu.querySelectorAll('.menu-link').forEach(function (link) {
    const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
    link.classList.toggle('active', linkPath === currentPath);
  });
  toggle.addEventListener('click', function () {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (open) closeMenu(); else openMenu();
  });
  if (closeButton) closeButton.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  if (moreButton && moreMenu && more) {
    moreButton.addEventListener('click', function (event) {
      event.stopPropagation();
      const open = moreButton.getAttribute('aria-expanded') === 'true';
      moreButton.setAttribute('aria-expanded', String(!open));
      moreMenu.hidden = open;
      more.classList.toggle('open', !open);
    });
    document.addEventListener('click', function (event) {
      if (!more.contains(event.target)) closeMore();
    });
  }
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
}());
