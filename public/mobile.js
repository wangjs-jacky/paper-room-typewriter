'use strict';
(() => {
  const link = document.getElementById('mobile-link');
  const dialog = document.getElementById('mobile-dialog');
  const field = document.getElementById('mobile-url');
  const status = document.getElementById('mobile-copy-status');
  const copy = document.getElementById('copy-mobile-link');
  let returnFocus = link;

  link.addEventListener('pointerdown', () => {
    returnFocus = document.activeElement;
  });

  link.addEventListener('click', event => {
    // Keep normal navigation on phones and for modifier-click / no-dialog browsers.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        matchMedia('(max-width: 700px)').matches || !dialog.showModal) return;
    event.preventDefault();
    status.textContent = '';
    copy.textContent = '复制链接';
    if (!dialog.open) dialog.showModal();
  });

  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });

  dialog.addEventListener('close', () => {
    if (returnFocus instanceof HTMLElement && returnFocus.isConnected) {
      returnFocus.focus({ preventScroll: true });
    }
  });

  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(field.value);
      copy.textContent = '已复制';
      status.textContent = '链接已复制，可以发到手机上打开。';
    } catch {
      field.focus();
      field.select();
      field.setSelectionRange(0, field.value.length);
      status.textContent = '请复制已选中的链接，发到手机上打开。';
    }
  });
})();
