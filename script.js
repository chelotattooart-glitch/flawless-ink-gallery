
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


// Open only the portfolio that belongs to the clicked artist.
const portfolioSections = [...document.querySelectorAll('.artist-portfolio')];
const portfolioTriggers = [...document.querySelectorAll('[data-open-portfolio]')];

function openArtistPortfolio(name) {
  const target = document.querySelector(`#portfolio-${name}`);
  if (!target) return;

  portfolioSections.forEach(section => section.classList.remove('portfolio-open'));
  target.classList.add('portfolio-open');

  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

portfolioTriggers.forEach(trigger => {
  trigger.addEventListener('click', event => {
    event.preventDefault();
    openArtistPortfolio(trigger.dataset.openPortfolio);
  });
});

document.querySelectorAll('.portfolio-close').forEach(button => {
  button.addEventListener('click', () => {
    const section = button.closest('.artist-portfolio');
    if (section) section.classList.remove('portfolio-open');
    document.querySelector('#artist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
