(() => {
  'use strict';
  const key = 'flawless-ink-consultation';
  const id = new URL(window.location.href).searchParams.get('submission');
  if (!id) return;
  let draft;
  try { draft = JSON.parse(sessionStorage.getItem(key)); } catch {}
  // The provider redirects here via _next after a normal form submission.
  // A bare visit to this page never displays a successful submission.
  if (draft && draft.id !== id) return;
  if (!draft && !document.referrer.startsWith('https://formsubmit.co/')) return;
  document.getElementById('confirmation-title').textContent = 'Thank you. Your request is sent.';
  document.getElementById('confirmation-message').textContent = 'Your consultation was accepted for delivery to the studio. We’ll be in touch to discuss your idea.';
  // Discard contact details after acceptance; the form uses this marker on Back.
  try { sessionStorage.setItem(key, JSON.stringify({id, state: 'accepted'})); } catch {}
})();
