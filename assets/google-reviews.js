(() => {
  'use strict';
  const popup = document.getElementById('google-review-popup');
  const launcher = document.getElementById('google-review-launcher');
  const close = document.getElementById('google-review-close');
  let cards = Array.from(document.querySelectorAll('.google-review-card'));
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
  // Refresh the published review snapshot without reloading the visitor's page.
  const refreshInterval = 60 * 60 * 1000;
  let lastRefresh = Date.now();
  let refreshing = false;
  async function refreshReviews() {
    if (refreshing) return;
    refreshing = true;
    try {
      const response = await fetch('./index.html?reviews=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw new Error('Review refresh failed');
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      const updated = Array.from(page.querySelectorAll('#google-review-cards .google-review-card'));
      if (updated.length < 5) throw new Error('Incomplete review snapshot');
      document.getElementById('google-review-cards').replaceChildren(...updated);
      cards = updated;
      current = 0;
      cards.forEach((card, index) => { card.hidden = index !== 0; });
      position.textContent = '1 of ' + cards.length;
      const note = page.querySelector('.google-review-note');
      if (note) document.querySelector('.google-review-note').textContent = note.textContent;
      lastRefresh = Date.now();
    } catch {
      // Keep the last complete set on network or publication failure.
    } finally { refreshing = false; }
  }
  setInterval(refreshReviews, refreshInterval);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastRefresh >= refreshInterval) refreshReviews();
  });
  launcher.addEventListener('click', () => open(true));
  close.addEventListener('click', dismiss);
  popup.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
  });
  document.getElementById('google-review-prev').addEventListener('click', () => select(-1));
  document.getElementById('google-review-next').addEventListener('click', () => select(1));
  if (!seen) setTimeout(() => {
    const editing = document.activeElement && document.activeElement.matches('input,textarea,select,[contenteditable="true"]');
    if (!seen && !window.matchMedia('(max-width: 1050px)').matches && !document.hidden && !document.querySelector('dialog[open]') && !editing) open(false);
  }, 8000);
})();
