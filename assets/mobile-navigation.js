(() => {
  'use strict';
  const header = document.querySelector('.nav');
  const nav = document.getElementById('primary-navigation');
  const button = document.getElementById('mobile-menu-toggle');
  if (!header || !nav || !button) return;
  const mobile = window.matchMedia('(max-width: 1050px)');
  let open = false;
  function setOpen(value, restoreFocus = false) {
    open = mobile.matches && value;
    nav.hidden = mobile.matches && !open;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    header.classList.toggle('mobile-menu-open', open);
    document.body.classList.toggle('mobile-nav-open', open);
    if (restoreFocus) button.focus();
  }
  function syncLayout() {
    const focused = nav.contains(document.activeElement);
    button.hidden = !mobile.matches;
    setOpen(false, mobile.matches && focused);
  }
  header.classList.add('nav-enhanced');
  button.addEventListener('click', () => setOpen(!open));
  nav.addEventListener('click', event => {
    if (!event.target.closest('a[href^="#"]')) return;
    setOpen(false);
    // Keep native anchor scrolling; focus the destination for keyboard users.
    const target = document.getElementById(event.target.closest('a').hash.slice(1));
    if (mobile.matches && target) {
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
    }
  });
  document.addEventListener('click', event => {
    if (open && !header.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (open && event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, true);
    }
  });
  header.addEventListener('focusout', event => {
    if (open && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  mobile.addEventListener('change', syncLayout);
  syncLayout();
})();
