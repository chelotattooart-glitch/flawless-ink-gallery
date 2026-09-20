
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


// V3 cinematic interactions
const progress=document.querySelector('.progress');
const root=document.documentElement;
let ticking=false;
function cinematicScroll(){
  if(ticking) return;
  ticking=true;
  requestAnimationFrame(()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;
    const impact=document.querySelector('.impact');
    if(impact){
      const r=impact.getBoundingClientRect();
      const p=Math.max(-1,Math.min(1,(innerHeight/2-(r.top+r.height/2))/innerHeight));
      impact.querySelector('span').style.transform=`translateX(${p*8-3}vw)`;
      impact.querySelector('strong').style.transform=`translateX(${-p*8+6}vw)`;
    }
    ticking=false;
  });
}
addEventListener('scroll',cinematicScroll,{passive:true});
cinematicScroll();

if(matchMedia('(pointer:fine)').matches){
  addEventListener('pointermove',e=>{
    root.style.setProperty('--mx',e.clientX+'px');
    root.style.setProperty('--my',e.clientY+'px');
  },{passive:true});
}
