(() => {
  'use strict';
  const strip = document.getElementById('artist-strip');
  const controls = document.getElementById('artist-browse-controls');
  const previous = document.getElementById('artist-scroll-prev');
  const next = document.getElementById('artist-scroll-next');
  const slider = document.getElementById('artist-scroll-position');
  const count = document.getElementById('artist-scroll-count');
  if (!strip || !controls || !previous || !next || !slider || !count) return;
  const cards = Array.from(strip.querySelectorAll('.artist-profile-card'));
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const maximum = () => Math.max(0, strip.scrollWidth - strip.clientWidth);
  function update() {
    frame = 0;
    const max = maximum();
    const position = Math.max(0, Math.min(max, strip.scrollLeft));
    controls.hidden = max <= 2;
    previous.disabled = position <= 2;
    next.disabled = position >= max - 2;
    slider.value = max ? String(Math.round(position / max * 1000)) : '0';
    const bounds = strip.getBoundingClientRect();
    const visible = cards.map((card, index) => {
      const rect = card.getBoundingClientRect();
      return rect.right > bounds.left + 2 && rect.left < bounds.right - 2 ? index + 1 : null;
    }).filter(Boolean);
    const description = visible.length ? 'Artists ' + visible[0] + '–' + visible[visible.length - 1] + ' of ' + cards.length : cards.length + ' artists';
    count.textContent = description;
    slider.setAttribute('aria-valuetext', description);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function move(direction) {
    const step = cards.length > 1
      ? cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left
      : strip.clientWidth;
    strip.scrollTo({left: Math.max(0, Math.min(maximum(), strip.scrollLeft + direction * step)),
      behavior: motion.matches ? 'auto' : 'smooth'});
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  slider.addEventListener('input', () => {
    strip.style.scrollSnapType = 'none';
    strip.scrollTo({left: Number(slider.value) / 1000 * maximum(), behavior:'instant'});
    schedule();
  });
  slider.addEventListener('change', () => { strip.style.scrollSnapType = ''; schedule(); });
  slider.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  strip.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(schedule);
    resize.observe(strip);
    cards.forEach(card => resize.observe(card));
  }
  update();
})();
