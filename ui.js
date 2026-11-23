/**
 * NAZARITH CAPITAL V8.0 — UI HELPER COMPONENTS
 * Modals, Toasts, Formatters, Lightbox, and Dialogs.
 */

window.NZ_UI = (function () {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));
  }

  function money(n, currency = 'USD') {
    const num = Number(n);
    if (!Number.isFinite(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(num);
  }

  function dateFmt(s) {
    if (!s) return '—';
    try {
      const d = new Date(String(s).includes('T') ? s : s + 'T12:00:00');
      if (Number.isNaN(d.getTime())) return String(s);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return String(s);
    }
  }

  function toast(msg, type = 'info') {
    const root = $('toastRoot');
    if (!root) return;
    const isError = type === 'error' || type === 'danger';
    root.innerHTML = `<div class="toast ${isError ? 'error' : ''}">${escapeHtml(msg)}</div>`;
    setTimeout(() => {
      if (root.innerHTML.includes(escapeHtml(msg))) {
        root.innerHTML = '';
      }
    }, 3200);
  }

  function openModal(htmlContent) {
    const root = $('modalRoot');
    if (!root) return;
    root.innerHTML = `
      <div class="modal-backdrop" id="activeModalBackdrop" onclick="if(event.target===this)NZ_UI.closeModal()">
        <div class="modal" id="activeModalCard">
          ${htmlContent}
        </div>
      </div>
    `;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const root = $('modalRoot');
    if (root) root.innerHTML = '';
    document.body.style.overflow = '';
  }

  function confirmDialog({ title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Confirm', onConfirm }) {
    openModal(`
      <div class="modal-head">
        <h2>${escapeHtml(title)}</h2>
        <button class="btn small ghost" onclick="NZ_UI.closeModal()">✕</button>
      </div>
      <p style="color:#aebbd0;line-height:1.7;margin:16px 0">${escapeHtml(message)}</p>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px">
        <button class="btn ghost" onclick="NZ_UI.closeModal()">Cancel</button>
        <button class="btn danger" id="nzConfirmBtn">${escapeHtml(confirmText)}</button>
      </div>
    `);

    $('nzConfirmBtn').onclick = () => {
      closeModal();
      if (typeof onConfirm === 'function') onConfirm();
    };
  }

  function viewImage(src) {
    if (!src) return;
    openModal(`
      <div style="text-align:right;margin-bottom:8px">
        <button class="btn small ghost" onclick="NZ_UI.closeModal()">✕ Close Chart</button>
      </div>
      <div style="display:flex;justify-content:center;align-items:center">
        <img class="image-view" src="${escapeHtml(src)}" alt="Trade Chart Verification">
      </div>
    `);
  }

  function renderPageHead(eyebrow, title, description, actionsHtml = '') {
    return `
      <div class="page-head">
        <div>
          <div class="eyebrow">${escapeHtml(eyebrow)}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        ${actionsHtml ? `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${actionsHtml}</div>` : ''}
      </div>
    `;
  }

  return {
    $,
    escapeHtml,
    money,
    dateFmt,
    toast,
    openModal,
    closeModal,
    confirmDialog,
    viewImage,
    renderPageHead,
  };
})();
