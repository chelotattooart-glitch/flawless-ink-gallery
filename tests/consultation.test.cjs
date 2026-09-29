const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'assets/consultation-submit.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function setup(blocked = false) {
  const values = {name:'Ana & Jo',email:'ana@example.invalid',phone:'202-555-0100',artist:'Marcelo',placement:'Arm',size:'4 × 6',idea:'Flowers & stars\nBlack + grey?',references:'https://example.com/art?a=1&b=2',_honey:''};
  const fields = Object.fromEntries(Object.entries(values).map(([name,value])=>[name,{value,setCustomValidity(){},reportValidity(){},addEventListener(){}}]));
  const handlers = {}, calls = [], status = {}, link = {hidden:true};
  const form = {elements:{namedItem:name=>fields[name]},reportValidity:()=>true,addEventListener:(name,fn)=>handlers[name]=fn};
  const compose = {opener:{},location:{replace:url=>calls.push(['compose',url])}};
  vm.runInNewContext(code, {URL,document:{getElementById:id=>id==='consultation-form'?form:id==='consultation-status'?status:link},
    sessionStorage:{getItem:()=>null,removeItem(){}},window:{open:()=>blocked?null:compose,location:{assign:url=>calls.push(['same-tab',url])}}});
  let prevented = false;
  return {fields,values,calls,status,link,compose,handlers,submit(){handlers.submit({preventDefault(){prevented=true;}});assert.equal(prevented,true);}};
}
test('valid consultation opens a fully encoded Gmail draft and preserves details',()=>{
  const s=setup();s.submit();
  assert.equal(s.calls.length,1);
  const url=new URL(s.calls[0][1]);
  assert.equal(url.origin,'https://mail.google.com');
  assert.equal(url.searchParams.get('to'),'flawlessink112@gmail.com');
  assert.equal(url.searchParams.get('su'),'Tattoo consultation — Marcelo');
  for(const value of Object.values(s.values).filter(Boolean)) assert.ok(url.searchParams.get('body').includes(value));
  assert.equal(s.fields.idea.value,s.values.idea);
  assert.equal(s.compose.opener,null);
  assert.equal(s.link.href,url.href);
  assert.match(s.status.textContent,/click Send in Gmail/);
});
test('blocked new tab falls back to same-tab Gmail navigation',()=>{
  const s=setup(true);s.submit();assert.equal(s.calls[0][0],'same-tab');assert.match(s.calls[0][1],/^https:\/\/mail.google.com\//);
});
test('missing required values and honeypot prevent Gmail handoff',()=>{
  const s=setup();s.fields.idea.value='  ';s.submit();assert.equal(s.calls.length,0);
  const bot=setup();bot.fields._honey.value='bot';bot.submit();assert.equal(bot.calls.length,0);
});
test('editing hides stale draft link; page has no delivery-service or upload promises',()=>{
  const s=setup();s.submit();s.handlers.input();assert.equal(s.link.hidden,true);
  assert.doesNotMatch(html,/formsubmit\.co|name="_next"|id="reference-photos"|consultation-confirmation\.js/);
  assert.match(html,/Continue in Gmail/);
  assert.match(html,/Attach any reference photos directly in Gmail/);
});
