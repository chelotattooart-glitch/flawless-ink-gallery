(() => {
  'use strict';
  const form = document.getElementById('consultation-form');
  if (!form) return;
  const status = document.getElementById('consultation-status');
  const button = form.querySelector('[type="submit"]');
  const names = ['name','email','phone','artist','placement','size','idea','references'];
  const key = 'flawless-consultation-draft-v6';
  try {
    const draft = JSON.parse(sessionStorage.getItem(key));
    if (draft && Date.now() - draft.savedAt < 3600000) {
      names.forEach(name => { const field = form.elements.namedItem(name); if (!field.value && typeof draft.values[name] === 'string') field.value = draft.values[name]; });
    }
    sessionStorage.removeItem(key);
  } catch {}
  window.addEventListener('pageshow', () => {button.disabled = false;status.textContent = '';});
  form.addEventListener('submit', event => {
    if (!form.reportValidity() || form.elements.namedItem('_honey').value) {event.preventDefault();return;}
    const values = {};
    for (const name of names) {
      const field = form.elements.namedItem(name);
      values[name] = field.value.trim();
      if (name !== 'references' && !values[name]) {
        event.preventDefault();
        field.setCustomValidity('Please complete this field.');
        field.reportValidity();
        field.addEventListener('input', () => field.setCustomValidity(''), {once:true});
        return;
      }
    }
    try {sessionStorage.setItem(key, JSON.stringify({savedAt:Date.now(),values}));} catch {}
    status.textContent = 'Continuing to the form service. Complete any verification on the next page. Your consultation is not confirmed yet.';
    // Allow the browser's normal POST, including the provider's CAPTCHA/activation flow.
  });
})();
