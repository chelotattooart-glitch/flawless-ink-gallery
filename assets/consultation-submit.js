(() => {
  'use strict';
  const form = document.getElementById('consultation-form');
  if (!form) return;
  const status = document.getElementById('consultation-status');
  const button = form.querySelector('[type="submit"]');
  const names = ['name', 'email', 'phone', 'artist', 'placement', 'size', 'idea', 'references'];
  const key = 'flawless-ink-consultation';
  form.action = 'https://formsubmit.co/flawlessink112@gmail.com';
  form.method = 'POST';
  form.removeAttribute('onsubmit');
  try {
    const draft = JSON.parse(sessionStorage.getItem(key));
    if (draft && draft.state === 'pending' && draft.values) {
      names.forEach(name => {
        const field = form.elements.namedItem(name);
        if (field && !field.value && typeof draft.values[name] === 'string') field.value = draft.values[name];
      });
    }
  } catch {}
  const restoreButton = () => {
    button.disabled = false;
    button.textContent = 'Send consultation';
  };
  window.addEventListener('pageshow', restoreButton);
  restoreButton();
  form.addEventListener('submit', event => {
    if (!form.reportValidity() || form.elements.namedItem('_honey').value) {
      event.preventDefault();
      return;
    }
    const values = Object.fromEntries(names.map(name => [name, form.elements.namedItem(name).value.trim()]));
    for (const name of names.filter(name => name !== 'references')) {
      if (values[name]) continue;
      event.preventDefault();
      const field = form.elements.namedItem(name);
      field.setCustomValidity('Please complete this field.');
      field.reportValidity();
      field.addEventListener('input', () => field.setCustomValidity(''), {once: true});
      return;
    }
    try { sessionStorage.setItem(key, JSON.stringify({state: 'pending', values})); } catch {}
    status.textContent = 'Opening the secure submission page. Complete any verification there to finish sending your consultation.';
    button.disabled = true;
    button.textContent = 'Submitting…';
    // Native POST keeps the provider's spam verification and activation notices visible.
    // Do not claim delivery from a redirect or a click.
  });
})();
