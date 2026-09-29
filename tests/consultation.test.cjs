const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('assets/consultation-submit.js','utf8');
function setup(failClipboard=false, userAgent='iPhone', platform='', maxTouchPoints=0){
 const values={name:'Ana & Jo',email:'ana@example.invalid',phone:'202-555-0100',artist:'Marcelo',placement:'Arm',size:'4 × 6',idea:'Flowers & stars\nBlack + grey?',references:'https://example.com/?a=1&b=2',_honey:''};
 const fields=Object.fromEntries(Object.entries(values).map(([n,value])=>[n,{value,setCustomValidity(){},reportValidity(){},addEventListener(){}}]));
 const handlers={},calls=[],status={},link={},fallback={hidden:true},message={value:'',focus(){},select(){this.selected=true},setSelectionRange(){}},copy={addEventListener:(n,f)=>handlers.copy=f};
 const form={elements:{namedItem:n=>fields[n]},reportValidity:()=>true,addEventListener:(n,f)=>handlers[n]=f};
 const nodes={'consultation-form':form,'consultation-status':status,'consultation-email-link':link,'consultation-email-fallback':fallback,'consultation-message':message,'consultation-copy':copy};
 vm.runInNewContext(code,{document:{getElementById:id=>nodes[id]},sessionStorage:{getItem:()=>null,removeItem(){}},window:{location:{assign:u=>calls.push(u)}},navigator:{userAgent,platform,maxTouchPoints,clipboard:{writeText:async t=>{if(failClipboard)throw Error();calls.push(t)}}}});
 return {values,fields,handlers,calls,status,link,fallback,message,submit(){handlers.submit({preventDefault(){}})}};
}
test('iPhone Gmail app link preserves recipient and every entered field including punctuation',()=>{
 const s=setup();s.submit();const url=new URL(s.calls[0]);assert.equal(url.protocol,'googlegmail:');assert.equal(url.pathname,'/co');assert.equal(url.searchParams.get('to'),'flawlessink112@gmail.com');assert.equal(url.searchParams.get('subject'),'Tattoo consultation — Marcelo');
 for(const value of Object.values(s.values).filter(Boolean))assert.ok(url.searchParams.get('body').includes(value));
 assert.equal(s.fallback.hidden,false);assert.equal(s.fields.idea.value,s.values.idea);
});
test('copy fallback copies full message including recipient',async()=>{const s=setup();s.submit();await s.handlers.copy();assert.equal(s.calls[1],s.message.value);assert.match(s.message.value,/To: flawlessink112@gmail.com/);});
test('clipboard failure supports manual selection',async()=>{const s=setup(true);s.submit();await s.handlers.copy();assert.equal(s.message.selected,true);assert.match(s.status.textContent,/Select and copy/);});
test('invalid values and honeypot do not launch email',()=>{const s=setup();s.fields.idea.value=' ';s.submit();assert.equal(s.calls.length,0);const b=setup();b.fields._honey.value='bot';b.submit();assert.equal(b.calls.length,0);});
test('editing hides stale prepared message',()=>{const s=setup();s.submit();s.handlers.input();assert.equal(s.fallback.hidden,true);});

test('Android targets Gmail package and encodes message',()=>{const s=setup(false,'Android');s.submit();assert.match(s.calls[0],/^intent:/);assert.match(s.calls[0],/package=com.google.android.gm;end$/);assert.ok(s.calls[0].includes(encodeURIComponent(s.values.idea)));});
test('desktop opens Gmail web',()=>{const s=setup(false,'Windows');s.submit();assert.match(s.calls[0],/^https:\/\/mail.google.com/);});
test('iPad desktop user agent still targets app',()=>{const s=setup(false,'Macintosh','MacIntel',5);s.submit();assert.match(s.calls[0],/^googlegmail:/);});
