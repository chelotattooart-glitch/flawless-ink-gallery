(() => {
  'use strict';
  const popup = document.getElementById('google-review-popup');
  const launcher = document.getElementById('google-review-launcher');
  const close = document.getElementById('google-review-close');
  const cards = Array.from(document.querySelectorAll('.google-review-card'));
  const position = document.getElementById('google-review-position');
  if (!popup || !launcher || !close || !cards.length) return;
  const key = 'flawless-google-reviews-seen';
  let current = 0;
  let seen = false;
  try { seen = sessionStorage.getItem(key) === '1'; } catch {}
  function markSeen() {
    seen = true;
    try { sessionStorage.setItem(key, '1'); } catch {}
  }
  function open(manual) {
    popup.hidden = false;
    launcher.hidden = true;
    launcher.setAttribute('aria-expanded', 'true');
    markSeen();
    if (manual) close.focus();
  }
  function dismiss() {
    const restoreFocus = popup.contains(document.activeElement);
    popup.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');
    markSeen();
    if (restoreFocus) launcher.focus();
  }
  function select(delta) {
    cards[current].hidden = true;
    current = (current + delta + cards.length) % cards.length;
    cards[current].hidden = false;
    position.textContent = (current + 1) + ' of ' + cards.length;
  }
  launcher.hidden = false;
  launcher.addEventListener('click', () => open(true));
  close.addEventListener('click', dismiss);
  popup.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
  });
  document.getElementById('google-review-prev').addEventListener('click', () => select(-1));
  document.getElementById('google-review-next').addEventListener('click', () => select(1));
  if (!seen) setTimeout(() => {
    const editing = document.activeElement && document.activeElement.matches('input,textarea,select,[contenteditable="true"]');
    if (!seen && !document.hidden && !document.querySelector('dialog[open]') && !editing) open(false);
  }, 8000);
})();
