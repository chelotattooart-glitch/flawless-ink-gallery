

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


// Open Gmail directly after validating the consultation; sending happens in Gmail.
const consultationForm = document.getElementById('consultation-form');
const draftPanel = document.getElementById('consultation-draft');
consultationForm.addEventListener('input', () => { draftPanel.hidden = true; });
consultationForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!consultationForm.reportValidity()) return;
  const data = new FormData(consultationForm);
  const value = key => String(data.get(key) || '').trim();
  const requiredFields = {name:'client-name', email:'client-email', phone:'client-phone', artist:'preferred-artist', placement:'tattoo-placement', size:'tattoo-size', idea:'tattoo-idea'};
  for (const [key, id] of Object.entries(requiredFields)) {
    if (value(key)) continue;
    const field = document.getElementById(id);
    field.setCustomValidity('Please complete this field.'); field.reportValidity();
    field.addEventListener('input', () => field.setCustomValidity(''), {once:true});
    return;
  }
  const body = ['Hello Flawless Ink Gallery,', '', 'I would like to discuss a tattoo consultation.', '',
    'Name: ' + value('name'), 'Email: ' + value('email'), 'Phone: ' + (value('phone') || 'Not provided'),
    'Preferred artist: ' + value('artist'), 'Placement: ' + (value('placement') || 'To discuss'),
    'Approximate size: ' + (value('size') || 'To discuss'), '', 'Tattoo idea:', value('idea'), '',
    'Reference link: ' + (value('references') || 'None'), '', 'I understand that the studio must confirm any appointment.'].join('\n');
  const subject = 'Tattoo consultation — ' + value('artist');
  const webUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=flawlessink112%40gmail.com&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  document.getElementById('consultation-email-link').href = webUrl;
  document.getElementById('draft-details').value = body;
  document.getElementById('copy-status').textContent = '';
  draftPanel.hidden = true;
  // Request a separate compose window during the user's Submit gesture.
  const width = Math.min(720, window.screen.availWidth);
  const height = Math.min(760, window.screen.availHeight);
  const popup = window.open('about:blank', '_blank',
    'popup=yes,width=' + width + ',height=' + height + ',resizable=yes,scrollbars=yes');
  if (!popup) {
    let status = document.getElementById('gmail-popup-status');
    if (!status) {
      status = document.createElement('p');
      status.id = 'gmail-popup-status';
      status.className = 'form-note';
      status.setAttribute('role', 'alert');
      consultationForm.append(status);
    }
    status.textContent = 'Please allow pop-ups for this site, then tap Submit again to open Gmail. Your details are still here.';
    return;
  }
  popup.opener = null;
  popup.location.replace(webUrl);
  const status = document.getElementById('gmail-popup-status');
  if (status) status.textContent = '';
  // Gmail handles sending; the original shop window stays on Home.
  window.history.replaceState(window.history.state, '', '#home');
  window.scrollTo({top:0, left:0, behavior:'instant'});

});
document.getElementById('copy-consultation').addEventListener('click', async () => {
  const details = document.getElementById('draft-details');
  try { await navigator.clipboard.writeText(details.value); document.getElementById('copy-status').textContent = 'Copied. Paste these details into your email.'; }
  catch { details.focus(); details.select(); document.getElementById('copy-status').textContent = 'Select and copy the highlighted details, then paste them into your email.'; }
});
