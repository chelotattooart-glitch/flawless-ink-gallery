(() => {
  'use strict';
  const form = document.getElementById('consultation-form');
  if (!form) return;
  const status = document.getElementById('consultation-status');
  const button = form.querySelector('[type="submit"]');
  const names = ['name', 'email', 'phone', 'artist', 'placement', 'size', 'idea', 'references'];
  let sending = false;
  let submitted = false;
  form.addEventListener('input', () => {
    if (!sending) { submitted = false; button.disabled = false; status.textContent = ''; }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || submitted || !form.reportValidity()) return;
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
    sending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your consultation… Please keep this page open.';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/flawlessink112@gmail.com', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        signal: controller.signal,
        body: JSON.stringify({...values, _subject: 'Tattoo consultation — ' + values.artist,
          _template: 'table', _honey: '', _url: window.location.href})
      });
      const result = await response.json();
      const message = typeof result.message === 'string' ? result.message : typeof result.error === 'string' ? result.error : '';
      if (/activat|confirm.*email/i.test(message)) {
        status.textContent = 'The studio’s consultation form still needs email activation. Please call or text the studio using the links below. Your details remain here.';
      } else if (!response.ok || !(result.success === true || result.success === 'true')) {
        status.textContent = 'The form service did not accept the request. ' + (message.slice(0,400) || 'Please call or text the studio below.') + ' Your details remain here.';
      } else {
        submitted = true;
        status.textContent = 'Your consultation was accepted for sending to the studio. This is not a confirmed appointment. The studio will contact you to confirm availability.';
      }
    } catch {
      status.textContent = 'We could not confirm your submission. Your details are still here. Please try again or call/text the studio below. If you retry, mention it may be a duplicate.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = submitted;
      form.removeAttribute('aria-busy');
    }
  });
})();
