
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); observer.unobserve(e.target); }});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const dialog=document.querySelector('#lightbox');
const full=dialog.querySelector('img');
document.querySelectorAll('.tile').forEach(btn=>{
  btn.addEventListener('click',()=>{ full.src=btn.querySelector('img').src; full.alt=btn.querySelector('img').alt; dialog.showModal(); });
});
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{ if(e.target===dialog) dialog.close(); });


// V2 motion
const nav = document.querySelector('.nav');
const heroImg = document.querySelector('.hero-media img');
const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 35);
  if (heroImg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroImg.style.transform = `scale(${1.04 + Math.min(y,700)/18000}) translate3d(0,${Math.min(y,700)*.045}px,0)`;
  }
};
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();


// Slow homepage background slideshow
const heroSlides = [...document.querySelectorAll('.hero-slide')];
if (heroSlides.length > 1) {
  let currentHeroSlide = 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slideInterval = prefersReducedMotion ? 12000 : 9000;

  setInterval(() => {
    heroSlides[currentHeroSlide].classList.remove('active');
    currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
    heroSlides[currentHeroSlide].classList.add('active');
  }, slideInterval);
}


// Every artist opens the same accessible portfolio layout.
const artistDialogs = [...document.querySelectorAll('.artist-portfolio-dialog')];
function syncArtistScrollLock() {
  document.body.classList.toggle('artist-dialog-open', artistDialogs.some(dialog => dialog.open));
}
function openArtistPortfolio(name) {
  const target = document.getElementById('portfolio-' + name);
  if (!target || !target.classList.contains('artist-portfolio-dialog')) return;
  artistDialogs.forEach(dialog => { if (dialog !== target && dialog.open) dialog.close(); });
  if (!target.open) target.showModal();
  target.scrollTop = 0;
  syncArtistScrollLock();
}
artistDialogs.forEach(dialog => {
  dialog.querySelector('.artist-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', syncArtistScrollLock);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});
document.querySelectorAll('[data-open-portfolio]').forEach(trigger => {
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'portfolio-' + trigger.dataset.openPortfolio);
  trigger.addEventListener('click', event => {
    event.preventDefault();
    openArtistPortfolio(trigger.dataset.openPortfolio);
  });
});
