(() => {
  'use strict';
  const form = document.getElementById('consultation-form');
  if (!form) return;
  const status = document.getElementById('consultation-status');
  const button = form.querySelector('[type="submit"]');
  const originalLabel = button.innerHTML;
  const draftKey = 'flawless-ink-consultation';
  const fieldNames = ['name', 'email', 'phone', 'artist', 'placement', 'size', 'idea', 'references'];
  let sending = false;

  function readDraft() {
    try { return JSON.parse(sessionStorage.getItem(draftKey)); } catch { return null; }
  }
  function saveDraft(draft) {
    // Storage may be unavailable in private browsing. Sending must still work.
    try { sessionStorage.setItem(draftKey, JSON.stringify(draft)); } catch {}
  }
  function photos() {
    return window.consultationPhotos
      ? window.consultationPhotos.getFiles()
      : Array.from(document.getElementById('reference-photos').files);
  }
  function restoreForm() {
    sending = false;
    button.disabled = false;
    button.innerHTML = originalLabel;
    form.removeAttribute('aria-busy');
    const draft = readDraft();
    if (!draft) return;
    if (draft.state === 'accepted') {
      form.reset();
      if (window.consultationPhotos) window.consultationPhotos.clear();
      status.textContent = 'Thank you! Your consultation was accepted for delivery. The studio will contact you to confirm availability.';
      try { sessionStorage.removeItem(draftKey); } catch {}
      return;
    }
    if (draft.state !== 'pending' || !draft.values) return;
    fieldNames.forEach(name => {
      const field = form.elements.namedItem(name);
      if (!field.value && typeof draft.values[name] === 'string') field.value = draft.values[name];
    });
    status.textContent = 'Your consultation details are saved in this tab. If you already submitted, check whether the studio received it before sending again.';
    if (draft.photoCount && !photos().length) {
      status.textContent += ' Please reselect your reference photos before submitting.';
    }
  }

  // The browser sends a normal multipart POST, including the selected File objects.
  // No cross-origin fetch, JSON parsing, automatic retry, or email composer is needed.
  form.addEventListener('formdata', event => {
    photos().forEach((file, index) => event.formData.append('attachment' + (index + 1), file, file.name));
  });
  form.addEventListener('submit', event => {
    if (sending || !form.reportValidity()) {
      event.preventDefault();
      return;
    }
    const values = Object.fromEntries(fieldNames.map(name => [name, form.elements.namedItem(name).value.trim()]));
    for (const name of fieldNames.filter(name => name !== 'references')) {
      if (values[name]) continue;
      event.preventDefault();
      const field = form.elements.namedItem(name);
      field.setCustomValidity('Please complete this field.');
      field.reportValidity();
      field.addEventListener('input', () => field.setCustomValidity(''), {once: true});
      return;
    }
    if (form.elements.namedItem('_honey').value) {
      event.preventDefault();
      return;
    }
    const selectedPhotos = photos();
    if (selectedPhotos.length > 6 || selectedPhotos.reduce((total, file) => total + file.size, 0) > 10000000) {
      event.preventDefault();
      status.textContent = 'Please choose up to 6 photos totaling no more than 10 MB.';
      return;
    }
    if (selectedPhotos.length && !('FormDataEvent' in window)) {
      event.preventDefault();
      status.textContent = 'This browser cannot send photo attachments. Please use a current browser, or remove the photos and include a reference link.';
      return;
    }
    const id = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2);
    const next = new URL('consultation-sent.html', window.location.href);
    next.searchParams.set('submission', id);
    form.elements.namedItem('_next').value = next.href;
    form.elements.namedItem('_url').value = window.location.origin + window.location.pathname;
    form.elements.namedItem('_subject').value = 'Tattoo consultation — ' + values.artist;
    saveDraft({id, state: 'pending', values, photoCount: selectedPhotos.length});
    sending = true;
    button.disabled = true;
    button.textContent = 'Continue to send…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Opening secure submission. Complete any security check to finish sending.';
    // Keep fields enabled: the browser serializes them after this submit event.
  });
  window.addEventListener('pageshow', restoreForm);
})();
