(() => {
  'use strict';
  const coupons = Array.from(document.querySelectorAll('#deals .deal-coupon'));
  const empty = document.getElementById('deals-empty');
  const dialog = document.getElementById('deal-claim-dialog');
  if (!empty || !dialog) return;
  let selected = null;
  function state(coupon) {
    const expires = Date.parse(coupon.dataset.expiresAt);
    const current = Number.isFinite(expires) && Date.now() < expires && coupon.dataset.archived !== 'true';
    const limit = Number(coupon.dataset.claimLimit);
    const claims = Number(coupon.dataset.confirmedClaims);
    const available = current && Number.isInteger(limit) && limit === 5 &&
      Number.isInteger(claims) && claims >= 0 && claims < limit;
    return {current, available};
  }
  function refreshDeals() {
    let active = 0;
    coupons.forEach(coupon => {
      const {current, available} = state(coupon);
      coupon.hidden = !current;
      if (current) active++;
      const button = coupon.querySelector('[data-claim-deal]');
      const status = coupon.querySelector('.deal-claim-status');
      if (button) { button.disabled = !available; button.textContent = available ? 'Claim this deal ↗' : 'Unavailable'; }
      if (status) status.textContent = available ? 'Limited to 5 claims' : 'No claims available';
    });
    empty.hidden = active > 0;
    if (selected && dialog.open) {
      const available = state(selected).available;
      document.getElementById('deal-payment-instructions').hidden = !available;
      document.getElementById('deal-claim-unavailable').hidden = available;
    }
  }
  coupons.forEach(coupon => {
    const button = coupon.querySelector('[data-claim-deal]');
    if (!button) return;
    button.addEventListener('click', () => {
      refreshDeals();
      if (!state(coupon).available) return;
      selected = coupon;
      document.getElementById('deal-claim-summary').textContent =
        coupon.dataset.offerName + ' — ' + coupon.dataset.offerTotal + ' total';
      // Opens a draft in the visitor's messaging app; never sends a message automatically.
      document.getElementById('deal-claim-text').href = 'sms:+17543068422?body=' +
        encodeURIComponent('Hi Flawless Ink! I would like to claim: ' + coupon.dataset.offerName +
        ' (' + coupon.dataset.offerTotal + '). Please confirm availability and the $500 deposit before I send it. My name is: ');
      dialog.showModal();
      document.body.classList.add('deal-dialog-open');
      refreshDeals();
    });
  });
  document.getElementById('deal-claim-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('deal-dialog-open');
    selected = null;
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  refreshDeals();
  setInterval(refreshDeals, 1000);
  document.addEventListener('visibilitychange', refreshDeals);
})();

