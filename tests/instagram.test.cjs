const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const code=fs.readFileSync('assets/marcelo-instagram.js','utf8');
test('ranks all posts by date regardless of likes or completion, retains more than ten posts, and rechecks after an hour',async()=>{
function el(){return {children:[],dataset:{},append(...nodes){this.children.push(...nodes)},replaceChildren(){this.children=[]},setAttribute(){},addEventListener(n,f){this[n]=f},remove(){}}}
const portfolio={open:false},feed=el(),status=el(),more=el();
let observer,interval,calls=0,now=0;
const rows=Array.from({length:12},(_,i)=>({id:String(i),permalink:'https://www.instagram.com/p/P'+i+'/',published_at:new Date(Date.UTC(2026,8,i+1)).toISOString(),finished_tattoo:true,like_count:100-i,caption:'post '+i}));
rows.push({...rows[11],id:'personal',permalink:'https://www.instagram.com/p/Personal/',finished_tattoo:false,published_at:'2026-10-01T00:00:00Z',like_count:null});
const DateMock=class extends Date {static now(){return now}};
vm.runInNewContext(code,{document:{getElementById:id=>({'portfolio-marcelo':portfolio,'marcelo-instagram-feed':feed,'marcelo-instagram-status':status,'marcelo-instagram-more':more}[id]),createElement:el,body:el()},window:{instgrm:{Embeds:{process(){}}}},MutationObserver:class{constructor(fn){observer=fn}observe(){}},setInterval:fn=>interval=fn,AbortController,setTimeout,clearTimeout,Date:DateMock,fetch:async()=>{calls++;return {ok:true,json:async()=>({account:'marcelo.tattooart',posts:rows})}}});
const flush=()=>new Promise(r=>setImmediate(r));
portfolio.open=true;observer();await flush();
assert.equal(feed.children[0].children[0].dataset.instgrmPermalink,rows[12].permalink);
for(let i=0;i<6;i++)more.click();assert.equal(feed.children.length,13);assert.equal(more.hidden,true);
observer();await flush();assert.equal(calls,1);
now=3600001;interval();await flush();assert.equal(calls,2);assert.equal(feed.children.length,13);
});
