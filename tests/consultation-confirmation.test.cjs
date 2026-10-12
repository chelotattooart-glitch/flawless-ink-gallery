const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {randomUUID} = require('node:crypto');
const root = path.resolve(__dirname, '..');
const submitCode = fs.readFileSync(path.join(root, 'assets/consultation-submit.js'), 'utf8');
const returnCode = fs.readFileSync(path.join(root, 'assets/consultation-confirmation.js'), 'utf8');
const confirmationUrl = 'https://www.flawlessinkgallery.com/consultation-sent.html';

function storage(blocked = false) {
  const data = new Map();
  return {getItem: key => data.get(key) ?? null, setItem(key, value) {if (blocked) throw Error('Blocked'); data.set(key, value);}, removeItem: key => data.delete(key)};
}
function formFixture(sessionStorage = storage()) {
  const fields = Object.fromEntries(Object.entries({name: 'Test Person', email: 'test@example.invalid', phone: '202-555-0100', artist: 'Marcelo', placement: 'Arm', size: '4 x 6', idea: 'Flowers', references: '', _honey: '', _next: confirmationUrl}).map(([key, value]) => [key, {value, setCustomValidity() {}, reportValidity() {}, addEventListener() {}}]));
  const handlers = {}, button = {}, status = {};
  const form = {elements: {namedItem: name => fields[name]}, querySelector: () => button, reportValidity: () => true, removeAttribute() {}, addEventListener: (event, callback) => {handlers[event] = callback;}};
  vm.runInNewContext(submitCode, {document: {getElementById: id => id === 'consultation-form' ? form : status}, window: {addEventListener() {}}, sessionStorage, crypto: {randomUUID}, Date});
  return {sessionStorage, fields, button, status, form, submit() {let prevented = false; handlers.submit({preventDefault() {prevented = true;}}); return !prevented;}};
}
function returnFixture(href, sessionStorage, state = null) {
  const scripts = [], nodes = {'confirmation-heading': {textContent: 'Thank you for reaching out.'}, 'confirmation-copy': {textContent: ''}};
  const window = {location: {href}, history: {state, replaceState(nextState, _title, nextUrl) {this.state = nextState; window.location.href = new URL(nextUrl, href).href;}}};
  const document = {getElementById: id => nodes[id], createElement: () => ({}), head: {appendChild: script => scripts.push(script)}};
  vm.runInNewContext(returnCode, {window, document, sessionStorage, URL, Date});
  return {scripts, nodes, window};
}
test('native POST preserves provider verification and adds a unique return URL', () => {
  const form = formFixture();
  assert.equal(form.submit(), true);
  assert.equal(form.form.method, 'POST');
  assert.equal(form.form.action, 'https://formsubmit.co/flawlessink112@gmail.com');
  assert.match(form.fields._next.value, /consultation-sent\.html\?submission=[a-f0-9-]+$/);
  assert.equal(form.status.textContent.includes('Complete any verification'), true);
  assert.equal(form.button.disabled, true);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /name="_next" value="https:\/\/www\.flawlessinkgallery\.com\/consultation-sent\.html"/);
  assert.equal(html.includes('name="_captcha" value="false"'), false);
});
test('matching return queues the tag once, strips the token, and clears the draft', () => {
  const form = formFixture(); form.submit();
  const page = returnFixture(form.fields._next.value, form.sessionStorage);
  assert.equal(page.scripts.length, 1);
  assert.equal(page.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=AW-18508716792');
  assert.equal(page.window.dataLayer[1][0], 'config');
  assert.equal(page.window.dataLayer[1][1], 'AW-18508716792');
  assert.equal(page.window.location.href, confirmationUrl);
  assert.equal(page.nodes['confirmation-heading'].textContent, 'Your request is submitted.');
  assert.equal(form.sessionStorage.getItem('flawless-ink-consultation'), null);
  assert.equal(form.sessionStorage.getItem('flawless-ink-consultation-return'), null);
  const reload = returnFixture(page.window.location.href, form.sessionStorage, page.window.history.state);
  assert.equal(reload.scripts.length, 0);
  assert.equal(reload.nodes['confirmation-heading'].textContent, 'Your request is submitted.');
  assert.equal(returnFixture(form.fields._next.value, form.sessionStorage).scripts.length, 0);
});
test('direct visits, invalid tokens, and an abandoned submission do not measure', () => {
  const form = formFixture();
  for (const href of [confirmationUrl, confirmationUrl + '?submission=wrong']) assert.equal(returnFixture(href, form.sessionStorage).scripts.length, 0);
  form.submit();
  assert.equal(returnFixture(confirmationUrl, form.sessionStorage).scripts.length, 0);
  assert.equal(returnFixture(confirmationUrl + '?submission=wrong', form.sessionStorage).scripts.length, 0);
});
test('invalid and honeypot submissions are prevented and have no return marker', () => {
  for (const invalid of ['validity', 'whitespace', 'honeypot']) {
    const form = formFixture();
    if (invalid === 'validity') form.form.reportValidity = () => false;
    if (invalid === 'whitespace') form.fields.idea.value = '   ';
    if (invalid === 'honeypot') form.fields._honey.value = 'bot';
    assert.equal(form.submit(), false);
    assert.equal(form.sessionStorage.getItem('flawless-ink-consultation-return'), null);
  }
});
test('blocked storage still permits submission but omits measurement', () => {
  const form = formFixture(storage(true));
  assert.equal(form.submit(), true);
  assert.equal(form.fields._next.value, confirmationUrl);
  assert.equal(returnFixture(form.fields._next.value, form.sessionStorage).scripts.length, 0);
});
test('expired and future-dated markers cannot measure', () => {
  for (const delta of [-25 * 60 * 60 * 1000, 60 * 60 * 1000]) {
    const s = storage();
    s.setItem('flawless-ink-consultation-return', JSON.stringify({token: 'token', createdAt: Date.now() + delta}));
    assert.equal(returnFixture(confirmationUrl + '?submission=token', s).scripts.length, 0);
  }
});
