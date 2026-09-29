

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


// Send to the form delivery service without opening another page.
const consultationForm = document.getElementById('consultation-form');
let consultationSending = false;
consultationForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (consultationSending || !consultationForm.reportValidity()) return;
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
  if (value('_honey')) return;
  const status = document.getElementById('consultation-status');
  const button = consultationForm.querySelector('[type="submit"]');
  const photos = window.consultationPhotos ? window.consultationPhotos.getFiles() : [];
  if (photos.length > 6 || photos.reduce((total, file) => total + file.size, 0) > 10000000) {
    status.textContent = 'Please choose up to 6 photos totaling no more than 10 MB.';
    return;
  }
  photos.forEach((file, index) => data.append('attachment' + (index + 1), file, file.name));
  data.set('_subject', 'Tattoo consultation — ' + value('artist'));
  data.set('_template', 'table');
  data.set('_url', window.location.origin + window.location.pathname);
  data.set('_captcha', 'false');
  consultationSending = true;
  const originalLabel = button.innerHTML;
  button.disabled = true; button.textContent = 'Sending…';
  consultationForm.setAttribute('aria-busy', 'true');
  const controls = Array.from(consultationForm.querySelectorAll('input, select, textarea, button'));
  const disabledBefore = controls.map(control => control.disabled);
  controls.forEach(control => { control.disabled = true; });
  status.textContent = 'Sending your consultation…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch('https://formsubmit.co/ajax/flawlessink112@gmail.com', {
      method:'POST', headers:{Accept:'application/json'}, body:data, signal:controller.signal
    });
    const result = await response.json();
    if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Not accepted');
    if (/activat|confirm.*email/i.test(String(result.message || ''))) {
      status.textContent = 'The studio’s contact form is awaiting activation. Please contact flawlessink112@gmail.com directly for now. Your details are still here.';
      return;
    }
    consultationForm.reset();
    if (window.consultationPhotos) window.consultationPhotos.clear();
    status.textContent = 'Your consultation was accepted for delivery. The studio will contact you to confirm availability.';
    let homeStatus = document.getElementById('consultation-home-status');
    if (!homeStatus) {
      homeStatus = document.createElement('p');
      homeStatus.id = 'consultation-home-status';
      homeStatus.className = 'form-note';
      homeStatus.setAttribute('role', 'status');
      homeStatus.setAttribute('tabindex', '-1');
      document.querySelector('.welcome-copy').append(homeStatus);
    }
    homeStatus.textContent = 'Thank you! Your consultation was accepted for delivery. We’ll contact you to discuss your tattoo.';
    window.history.replaceState(window.history.state, '', '#home');
    homeStatus.focus({preventScroll:true});
    window.scrollTo({top:0, left:0, behavior:'instant'});
  } catch (error) {
    status.textContent = error.name === 'AbortError'
      ? 'Delivery could not be confirmed in time. Your details are still here. Please contact the studio before retrying to avoid duplicates.'
      : 'We could not confirm delivery. Your details are still here. Please try again or email flawlessink112@gmail.com.';
  } finally {
    clearTimeout(timeout);
    controls.forEach((control, index) => { control.disabled = disabledBefore[index]; });
    button.disabled = false; button.innerHTML = originalLabel;
    consultationForm.removeAttribute('aria-busy');
    consultationSending = false;
  }
});
