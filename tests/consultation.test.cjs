const {test}=require('node:test'), assert=require('node:assert/strict'), vm=require('node:vm'), fs=require('node:fs');
const source=fs.readFileSync('assets/consultation-submit.js','utf8');
function setup(valid=true,honey=''){
 const handlers={}, fields=Object.fromEntries(['name','email','phone','artist','placement','size','idea','references','_honey'].map(n=>[n,{value:n==='_honey'?honey:'test',setCustomValidity(){},reportValidity(){},addEventListener(){}}]));
 let prevented=false,stored;
 const form={querySelector:()=>({}),elements:{namedItem:n=>fields[n]},reportValidity:()=>valid,addEventListener:(n,f)=>handlers[n]=f};
 vm.runInNewContext(source,{document:{getElementById:id=>id==='consultation-form'?form:{}},window:{addEventListener(){}},sessionStorage:{getItem:()=>null,removeItem(){},setItem:(k,v)=>stored=JSON.parse(v)},Date});
 return {fields,submit(){handlers.submit({preventDefault(){prevented=true}});return {prevented,stored}}};
}
test('valid request uses browser POST and saves draft',()=>{let r=setup().submit();assert.equal(r.prevented,false);assert.equal(r.stored.values.idea,'test')});
test('invalid or honeypot request never navigates',()=>{assert.equal(setup(false).submit().prevented,true);assert.equal(setup(true,'spam').submit().prevented,true)});
test('whitespace required fields cannot submit',()=>{const f=setup();f.fields.name.value='  ';assert.equal(f.submit().prevented,true)});
