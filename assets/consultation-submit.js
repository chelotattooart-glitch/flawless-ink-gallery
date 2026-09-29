(() => {
  'use strict';
  const form = document.getElementById('consultation-form');
  if (!form) return;
  const status = document.getElementById('consultation-status');
  const link = document.getElementById('consultation-email-link');
  const fallback = document.getElementById('consultation-email-fallback');
  const message = document.getElementById('consultation-message');
  const copy = document.getElementById('consultation-copy');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(message.value);
      status.textContent = 'Consultation copied. Paste it into your email and send it to flawlessink112@gmail.com.';
    } catch {
      message.focus(); message.select(); message.setSelectionRange(0, message.value.length);
      status.textContent = 'Select and copy the message below, then paste it into your email and send it to flawlessink112@gmail.com.';
    }
  });
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

  form.addEventListener('input', () => { fallback.hidden = true; status.textContent = ''; });
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
    const subject = 'Tattoo consultation — ' + values.artist;
    const url = 'mailto:flawlessink112@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    link.href = url;
    message.value = 'To: flawlessink112@gmail.com\nSubject: ' + subject + '\n\n' + body;
    fallback.hidden = false;
    status.textContent = 'Your consultation is prepared. Send it from your email app to finish. If no app opens, copy the message below. This page cannot confirm email delivery.';
    const params = 'to=' + encodeURIComponent('flawlessink112@gmail.com') + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let gmailURL;
    if (isIOS) {
      gmailURL = 'googlegmail:///co?' + params;
    } else if (/Android/i.test(ua)) {
      gmailURL = 'intent:flawlessink112@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '#Intent;scheme=mailto;action=android.intent.action.SENDTO;package=com.google.android.gm;end';
    } else {
      gmailURL = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent('flawlessink112@gmail.com') + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
    status.textContent = 'Your message is prepared. If Gmail opens, review it and tap Send. If Gmail is unavailable, use another email app or copy your consultation below. This page cannot confirm delivery.';
    window.location.assign(gmailURL);
  });
})();
