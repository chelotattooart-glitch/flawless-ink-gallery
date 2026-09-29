const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('assets/consultation-submit.js', 'utf8');
function setup(fetcher) {
  const handlers = {};
  const fields = Object.fromEntries(['name','email','phone','artist','placement','size','idea','references','_honey'].map(n => [n,{value: n === '_honey' ? '' : n === 'email' ? 'test@example.com' : 'test',setCustomValidity(){},reportValidity(){},addEventListener(){}}]));
  const status = {textContent:''}, button = {disabled:false};
  const form = {elements:{namedItem:n=>fields[n]}, querySelector:()=>button, reportValidity:()=>true, addEventListener:(n,fn)=>handlers[n]=fn, setAttribute(){},removeAttribute(){}};
  vm.runInNewContext(source,{document:{getElementById:id=>id==='consultation-form'?form:status},fetch:fetcher,AbortController,setTimeout,clearTimeout,window:{location:{href:'https://www.flawlessinkgallery.com/'}}});
  return {handlers,fields,status,button,submit:()=>handlers.submit({preventDefault(){}})};
}
test('sends all fields and blocks repeat submission after acceptance', async()=>{
  let count=0, body;
  const f=setup(async(url,options)=>{count++; assert.match(url,/formsubmit.co\/ajax\//); body=JSON.parse(options.body);return {ok:true,json:async()=>({success:'true'})};});
  await f.submit(); await f.submit();
  assert.equal(count,1);assert.equal(body.email,'test@example.com');assert.equal(body.idea,'test');assert.equal(f.button.disabled,true);
  assert.match(f.status.textContent,/not a confirmed appointment/);
});
test('failure preserves entered details and enables retry',async()=>{
  const f=setup(async()=>{throw new Error('offline')});await f.submit();
  assert.equal(f.fields.idea.value,'test');assert.equal(f.button.disabled,false);assert.match(f.status.textContent,/could not confirm/);
});
test('activation response is not shown as success',async()=>{
  const f=setup(async()=>({ok:true,json:async()=>({success:false,message:'Please activate your form'})}));await f.submit();
  assert.match(f.status.textContent,/needs email activation/);assert.equal(f.button.disabled,false);
});
test('honeypot blocks request',async()=>{
  let called=false; const f=setup(async()=>{called=true});f.fields._honey.value='spam';await f.submit();assert.equal(called,false);
});
