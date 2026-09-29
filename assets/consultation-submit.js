(() => {
  'use strict';
  const form = document.getElementById('consultation-form');
  if (!form) return;
  const status = document.getElementById('consultation-status');
  const link = document.getElementById('consultation-gmail-link');
  const names = ['name', 'email', 'phone', 'artist', 'placement', 'size', 'idea', 'references'];

  // Recover text from an unfinished submission through the previous flow.
  try {
    const draft = JSON.parse(sessionStorage.getItem('flawless-ink-consultation'));
    if (draft && draft.state === 'pending' && draft.values) {
      names.forEach(name => {
        const field = form.elements.namedItem(name);
        if (!field.value && typeof draft.values[name] === 'string') field.value = draft.values[name];
      });
    }
    sessionStorage.removeItem('flawless-ink-consultation');
  } catch {}

  form.addEventListener('input', () => { link.hidden = true; status.textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(names.map(name => [name, form.elements.namedItem(name).value.trim()]));
    for (const name of names.filter(name => name !== 'references')) {
      if (values[name]) continue;
      const field = form.elements.namedItem(name);
      field.setCustomValidity('Please complete this field.');
      field.reportValidity();
      field.addEventListener('input', () => field.setCustomValidity(''), {once: true});
      return;
    }
    if (form.elements.namedItem('_honey').value) return;
    const body = [
      'Hello Flawless Ink Gallery,', '', 'I would like to discuss a tattoo consultation.', '',
      'Name: ' + values.name, 'Email: ' + values.email, 'Phone: ' + values.phone,
      'Preferred artist: ' + values.artist, 'Placement: ' + values.placement,
      'Approximate size: ' + values.size, '', 'Tattoo idea:', values.idea, '',
      'Reference link: ' + (values.references || 'None'), '',
      'I understand that the studio must confirm any appointment.'
    ].join('\n');
    const url = new URL('https://mail.google.com/mail/');
    url.searchParams.set('view', 'cm');
    url.searchParams.set('fs', '1');
    url.searchParams.set('to', 'flawlessink112@gmail.com');
    url.searchParams.set('su', 'Tattoo consultation — ' + values.artist);
    url.searchParams.set('body', body);
    link.href = url.href;
    link.hidden = false;
    status.textContent = 'Your consultation email is ready in Gmail. Review it, attach any reference photos, and click Send in Gmail to finish. Your details remain here.';
    // Open during the user's click; fall back to the same tab if pop-ups are blocked.
    const compose = window.open('about:blank', '_blank');
    if (compose) {
      compose.opener = null;
      compose.location.replace(url.href);
    } else {
      window.location.assign(url.href);
    }
  });
})();
