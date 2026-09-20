
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
