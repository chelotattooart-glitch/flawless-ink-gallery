(() => {
  'use strict';
  const coupons = Array.from(document.querySelectorAll('#deals .deal-coupon'));
  const empty = document.getElementById('deals-empty');
  if (!empty) return;
  function refreshDeals() {
    const now = Date.now();
    let active = 0;
    coupons.forEach(coupon => {
      const expires = Date.parse(coupon.dataset.expiresAt);
      const valid = Number.isFinite(expires) && now < expires && coupon.dataset.archived !== 'true';
      coupon.hidden = !valid;
      if (valid) active++;
    });
    empty.hidden = active > 0;
  }
  refreshDeals();
  // Recheck open tabs and tabs restored after the monthly boundary.
  setInterval(refreshDeals, 1000);
  document.addEventListener('visibilitychange', refreshDeals);
})();
