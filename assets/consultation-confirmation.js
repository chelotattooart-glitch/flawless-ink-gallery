(() => {
  'use strict';
  const pendingKey = 'flawless-ink-consultation-return';
  const url = new URL(window.location.href);
  const token = url.searchParams.get('submission');
  let firstReturn = false;
  let confirmed = Boolean(window.history.state && window.history.state.consultationConfirmed);
  try {
    const pending = JSON.parse(sessionStorage.getItem(pendingKey));
    const age = pending ? Date.now() - pending.createdAt : NaN;
    if (token && pending && token === pending.token && age >= 0 && age < 24 * 60 * 60 * 1000) {
      // Consume the marker before loading the Google tag: refreshes cannot repeat it.
      sessionStorage.removeItem(pendingKey);
      sessionStorage.removeItem('flawless-ink-consultation');
      firstReturn = true;
      confirmed = true;
    }
  } catch {
    // Fail closed for measurement if storage is unavailable.
  }
  if (token) {
    url.searchParams.delete('submission');
    try { window.history.replaceState({consultationConfirmed: confirmed}, '', url.pathname + url.search + url.hash); } catch {}
  }
  if (confirmed) {
    document.getElementById('confirmation-heading').textContent = 'Your request is submitted.';
    document.getElementById('confirmation-copy').textContent = 'Thank you for sharing your tattoo idea. The studio will contact you to discuss the details and availability.';
  }
  if (!firstReturn) return;
  // This tag loads only on the first matching return from the native FormSubmit flow.
  // Google Ads must match this confirmation page, not the form's #book anchor.
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'AW-18508716792');
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18508716792';
  document.head.appendChild(script);
})();
