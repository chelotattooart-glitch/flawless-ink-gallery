(() => {
  'use strict';
  const input = document.getElementById('reference-photos');
  const list = document.getElementById('reference-photo-list');
  const status = document.getElementById('reference-photo-status');
  const form = document.getElementById('consultation-form');
  if (!input || !list || !form) return;
  const allowed = new Set(['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']);
  const maxFile = 5 * 1024 * 1024, maxTotal = 10 * 1000 * 1000;
  let files = [], urls = [];

  function invalidate() { document.getElementById('consultation-status').textContent = ''; }
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
        errors.push(file.name + ': maximum 6 photos and 10 MB total.'); continue;
      }
      files.push(file);
    }
    input.value = ''; invalidate(); render();
    status.textContent = files.length + ' of 6 photos selected. ' + errors.join(' ');
  });
  window.consultationPhotos = {
    getFiles: () => files.slice(),
    clear: () => { files = []; input.value = ''; render(); status.textContent = 'No photos selected.'; }
  };
})();
