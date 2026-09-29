// Build a local email draft. No customer data is uploaded by this site.
function buildConsultationEmail({subject, body, attachments}) {
  const encode = text => {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  };
  const wrap = text => (text.match(/.{1,76}/g) || []).join('\r\n');
  const boundary = 'flawless_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  const lines = [
    'To: flawlessink112@gmail.com',
    'Subject: =?UTF-8?B?' + encode(subject) + '?=',
    'X-Unsent: 1',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' + boundary + '"', '',
    '--' + boundary, 'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64', '', wrap(encode(body)), ''
  ];
  attachments.forEach((file, index) => {
    const name = (index + 1) + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif'];
    if (!allowed.includes(file.type) || !/^[A-Za-z0-9+/]*={0,2}$/.test(file.base64)) throw new Error('Invalid attachment');
    lines.push('--' + boundary, 'Content-Type: ' + file.type + '; name="' + name + '"',
      'Content-Disposition: attachment; filename="' + name + '"',
      'Content-Transfer-Encoding: base64', '', wrap(file.base64), '');
  });
  lines.push('--' + boundary + '--', '');
  return lines.join('\r\n');
}

(() => {
  'use strict';
  const input = document.getElementById('reference-photos');
  const list = document.getElementById('reference-photo-list');
  const status = document.getElementById('reference-photo-status');
  const form = document.getElementById('consultation-form');
  const download = document.getElementById('download-photo-email');
  const note = document.getElementById('photo-draft-note');
  const downloadStatus = document.getElementById('photo-download-status');
  if (!input || !list || !form || !download) return;
  const allowed = new Set(['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']);
  const maxFile = 5 * 1024 * 1024, maxTotal = 15 * 1024 * 1024;
  let files = [], urls = [], revision = 0, busy = false;

  function invalidate() {
    revision++;
    document.getElementById('consultation-draft').hidden = true;
    downloadStatus.textContent = '';
  }
  function render() {
    urls.forEach(url => URL.revokeObjectURL(url)); urls = [];
    list.replaceChildren();
    files.forEach((file, index) => {
      const item = document.createElement('li');
      const preview = document.createElement('div'); preview.className = 'reference-preview';
      const fallback = document.createElement('span'); fallback.textContent = 'Preview unavailable';
      const img = document.createElement('img'); img.alt = 'Reference photo ' + (index + 1); img.loading = 'lazy';
      const url = URL.createObjectURL(file); urls.push(url);
      img.onload = () => { fallback.hidden = true; };
      img.onerror = () => { img.hidden = true; };
      img.src = url; preview.append(img, fallback);
      const name = document.createElement('p'); name.textContent = file.name;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove reference ' + (index + 1) + ': ' + file.name);
      remove.addEventListener('click', () => {
        files.splice(index, 1); invalidate(); render();
        status.textContent = files.length + ' of 6 photos selected.';
        input.focus();
      });
      item.append(preview, name, remove); list.append(item);
    });
  }
  input.addEventListener('change', () => {
    const errors = [];
    for (const file of input.files) {
      if (files.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) continue;
      if (!allowed.has(file.type)) { errors.push(file.name + ': unsupported image format.'); continue; }
      if (!file.size || file.size > maxFile) { errors.push(file.name + ': choose a photo between 1 byte and 5 MB.'); continue; }
      if (files.length >= 6 || files.reduce((sum,f) => sum + f.size, 0) + file.size > maxTotal) {
        errors.push(file.name + ': maximum 6 photos and 15 MB total.'); continue;
      }
      files.push(file);
    }
    input.value = ''; invalidate(); render();
    status.textContent = files.length + ' of 6 photos selected. ' + errors.join(' ');
  });
  form.addEventListener('input', invalidate);
  form.addEventListener('submit', () => {
    if (document.getElementById('consultation-draft').hidden) return;
    download.hidden = files.length === 0;
    note.hidden = files.length === 0;
    downloadStatus.textContent = '';
  });
  const readBase64 = file => new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Photo could not be read'));
    reader.readAsDataURL(file);
  });
  download.addEventListener('click', async () => {
    if (busy || !files.length || !form.reportValidity()) return;
    busy = true; download.disabled = true;
    const version = revision, selected = files.slice();
    const subject = 'Tattoo consultation — ' + document.getElementById('preferred-artist').value;
    const body = document.getElementById('draft-details').value + '\n\nReference photos attached: ' + selected.length;
    downloadStatus.textContent = 'Preparing your email with photos…';
    try {
      const attachments = await Promise.all(selected.map(async file => ({name:file.name,type:file.type,base64:await readBase64(file)})));
      if (version !== revision) return;
      const email = buildConsultationEmail({subject, body, attachments});
      const url = URL.createObjectURL(new Blob([email], {type:'message/rfc822'}));
      const link = document.createElement('a'); link.href = url; link.download = 'Flawless-Ink-consultation.eml';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      downloadStatus.textContent = 'Email file prepared with ' + selected.length + ' photos. Open it in a compatible email app and send it to flawlessink112@gmail.com. Nothing has been sent yet.';
    } catch {
      downloadStatus.textContent = 'Could not prepare the attachments. Use Open email app, then attach the original photos manually.';
    } finally { busy = false; download.disabled = false; }
  });
})();
