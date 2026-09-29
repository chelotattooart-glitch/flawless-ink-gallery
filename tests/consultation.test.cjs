const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const submitCode = fs.readFileSync(path.join(root, 'assets/consultation-submit.js'), 'utf8');
const confirmationCode = fs.readFileSync(path.join(root, 'assets/consultation-confirmation.js'), 'utf8');
const key = 'flawless-ink-consultation';
const values = { name: 'Local test', email: 'test@example.invalid', phone: '202-555-0100', artist: 'Marcelo', placement: 'Forearm', size: '4 inches', idea: 'Test only', references: '' };

function setup({ storage = new Map(), files = [], storageBlocked = false, supportsFiles = true } = {}) {
  const fields = {};
  // Read the real form names/defaults, so missing hidden inputs fail the tests.
  const formHtml = html.match(/<form id="consultation-form"[\s\S]*?<\/form>/)[0];
  for (const tag of formHtml.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)) {
    const name = tag[0].match(/\bname="([^"]+)"/)?.[1];
    if (!name) continue;
    fields[name] = { value: tag[0].match(/\bvalue="([^"]*)"/)?.[1] || '', disabled: false,
      setCustomValidity(message) { this.validationMessage = message; }, reportValidity() {}, addEventListener() {} };
  }
  Object.entries(values).forEach(([name, value]) => { fields[name].value = value; });
  const events = {}, windowEvents = {}, status = { textContent: '' }, button = { disabled: false, innerHTML: 'Submit' };
  let photoFiles = files;
  const form = { elements: { namedItem: name => fields[name] },
    querySelector: () => button, addEventListener: (name, fn) => { events[name] = fn; }, reportValidity: () => true,
    setAttribute() {}, removeAttribute() {}, reset() { Object.values(fields).forEach(field => { field.value = ''; }); } };
  const location = new URL('https://www.flawlessinkgallery.com/');
  const sessionStorage = { getItem(name) { if (storageBlocked) throw Error('blocked'); return storage.get(name) || null; },
    setItem(name, value) { if (storageBlocked) throw Error('blocked'); storage.set(name, value); },
    removeItem(name) { if (storageBlocked) throw Error('blocked'); storage.delete(name); } };
  const window = { location, addEventListener: (name, fn) => { windowEvents[name] = fn; },
    consultationPhotos: { getFiles: () => photoFiles, clear: () => { photoFiles = []; } } };
  if (supportsFiles) window.FormDataEvent = function () {};
  const document = { getElementById: id => id === 'consultation-form' ? form : id === 'consultation-status' ? status : { files: photoFiles } };
  vm.runInNewContext(submitCode, { window, document, sessionStorage, URL, crypto: { randomUUID: () => 'test-attempt' } });
  function submit() {
    let prevented = false;
    events.submit({ preventDefault() { prevented = true; } });
    if (prevented) return null;
    const data = new FormData();
    Object.entries(fields).forEach(([name, field]) => { if (!field.disabled) data.append(name, field.value); });
    events.formdata({ formData: data });
    return data;
  }
  return { fields, status, button, storage, sessionStorage, submit, pageshow: () => windowEvents.pageshow(), form };
}

function confirm(storage, url = 'https://www.flawlessinkgallery.com/consultation-sent.html?submission=test-attempt', referrer = '', storageBlocked = false) {
  const title = { textContent: 'Consultation confirmation' }, message = { textContent: '' };
  vm.runInNewContext(confirmationCode, {
    window: { location: { href: url } }, URL,
    document: { referrer, getElementById: id => id === 'confirmation-title' ? title : message },
    sessionStorage: { getItem: name => { if (storageBlocked) throw Error('blocked'); return storage.get(name); },
      setItem: (name, value) => { if (storageBlocked) throw Error('blocked'); storage.set(name, value); } }
  });
  return { title, message };
}

test('native POST preserves all fields and targets the existing studio recipient', () => {
  assert.match(html, /action="https:\/\/formsubmit.co\/flawlessink112@gmail.com" method="POST" enctype="multipart\/form-data"/);
  assert.doesNotMatch(submitCode, /\bfetch\s*\(/);
  const s = setup(), data = s.submit();
  for (const [name, value] of Object.entries(values)) assert.equal(data.get(name), value);
  assert.equal(data.get('_subject'), 'Tattoo consultation — Marcelo');
  assert.equal(data.get('_url'), 'https://www.flawlessinkgallery.com/');
  assert.equal(data.get('_next'), 'https://www.flawlessinkgallery.com/consultation-sent.html?submission=test-attempt');
  assert.equal(data.has('_captcha'), false); // retain provider security checks
  assert.equal(s.button.disabled, true);
  assert.equal(s.submit(), null); // no duplicate submission
});

test('multipart includes actual bytes for all selected photos', async () => {
  const files = [new File(['first photo'], 'one.jpg', {type: 'image/jpeg'}), new File(['second photo'], 'two.png', {type: 'image/png'})];
  const data = setup({ files }).submit();
  assert.equal(data.get('attachment1').name, 'one.jpg');
  assert.equal(await data.get('attachment1').text(), 'first photo');
  assert.equal(await data.get('attachment2').text(), 'second photo');
});

test('whitespace, honeypot, excess photos, and unsupported photo browsers do not submit', () => {
  const whitespace = setup(); whitespace.fields.idea.value = '   '; assert.equal(whitespace.submit(), null);
  const honey = setup(); honey.fields._honey.value = 'bot'; assert.equal(honey.submit(), null);
  assert.equal(setup({files: Array(7).fill({size: 1})}).submit(), null);
  assert.equal(setup({files: [{size: 10000001}]}).submit(), null);
  assert.equal(setup({files: [new File(['x'], 'x.jpg')], supportsFiles: false}).submit(), null);
  assert.ok(setup({supportsFiles: false}).submit());
});

test('Back after failed submission restores fields and unlocks Submit without retrying', () => {
  const s = setup(); s.submit();
  s.fields.name.value = ''; s.pageshow();
  assert.equal(s.fields.name.value, values.name);
  assert.equal(s.button.disabled, false);
  assert.match(s.status.textContent, /check whether the studio received it/);
  assert.equal(JSON.parse(s.storage.get(key)).state, 'pending');
});

test('a full reload restores text and asks to reselect photos', () => {
  const first = setup({files: [new File(['x'], 'x.jpg')]}); first.submit();
  const reload = setup({storage: first.storage}); reload.fields.idea.value = ''; reload.pageshow();
  assert.equal(reload.fields.idea.value, values.idea);
  assert.match(reload.status.textContent, /reselect your reference photos/);
});

test('confirmation clears personal data and Back does not resubmit', () => {
  const s = setup(); s.submit();
  const result = confirm(s.storage);
  assert.match(result.message.textContent, /accepted for delivery/);
  assert.deepEqual(JSON.parse(s.storage.get(key)), {id: 'test-attempt', state: 'accepted'});
  s.pageshow();
  assert.equal(s.fields.name.value, '');
  assert.equal(s.button.disabled, false);
  assert.match(s.status.textContent, /Thank you!/);
  assert.equal(s.storage.has(key), false);
});

test('bare or mismatched confirmation links do not report successful sending', () => {
  const s = setup(); s.submit();
  assert.equal(confirm(s.storage, 'https://www.flawlessinkgallery.com/consultation-sent.html').message.textContent, '');
  assert.equal(confirm(s.storage, 'https://www.flawlessinkgallery.com/consultation-sent.html?submission=wrong').message.textContent, '');
  assert.equal(confirm(new Map()).message.textContent, '');
});

test('blocked session storage does not prevent native sending', () => {
  assert.ok(setup({storageBlocked: true}).submit());
  assert.match(confirm(new Map(), undefined, 'https://formsubmit.co/', true).message.textContent, /accepted for delivery/);
});
