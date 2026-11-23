/**
 * NAZARITH CAPITAL V8.0 — RESEARCH VAULT & PLAYBOOK
 * Central repository for market hypotheses, playbook setups, and chart studies.
 */

window.NZ_Research = (function () {
  'use strict';

  const { $, escapeHtml, renderPageHead, openModal, closeModal, toast } = window.NZ_UI;

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const notes = acc.notes || [];

    const content = `
      ${renderPageHead(
        'KNOWLEDGE ARCHIVE / THESIS REPOSITORY',
        'Research Vault & Playbook',
        'Document macroeconomic hypotheses, structural chart playbooks, and market studies.',
        `<button class="btn primary" onclick="NZ_Research.addModal()">＋ New Research Note</button>`
      )}

      <!-- Search & Category Filters -->
      <div class="toolbar" style="display:flex;gap:10px;margin-bottom:16px">
        <input id="searchResearch" placeholder="Search research by title or thesis..." oninput="NZ_Research.filter()">
      </div>

      <!-- Notes Grid -->
      <div id="researchGrid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:14px">
        ${
          notes.length
            ? notes
                .map(
                  (n, i) => `
              <div class="card" style="display:flex;flex-direction:column;justify-content:space-between">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                    <b style="font-size:14px">${escapeHtml(n.title)}</b>
                    <span class="pill neutral" style="font-size:8px">${escapeHtml(n.category || 'Study')}</span>
                  </div>
                  <small class="muted" style="display:block;margin-bottom:10px">${escapeHtml(n.date || '—')}</small>
                  <p style="font-size:12px;color:#aebbd0;line-height:1.7;white-space:pre-wrap">${escapeHtml(n.body)}</p>
                </div>
                <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px;border-top:1px solid var(--line);padding-top:10px">
                  <button class="btn small danger" onclick="NZ_Research.deleteNote(${i})">Delete</button>
                </div>
              </div>
            `
                )
                .join('')
            : '<div class="card empty" style="grid-column:1/-1">No research notes documented yet. Capture your observations and theses.</div>'
        }
      </div>
    `;

    $('main').innerHTML = content;
  }

  function filter() {
    const q = ($('searchResearch')?.value || '').toLowerCase();
    const acc = window.NZ_Storage.getActiveAccount();
    const notes = acc.notes || [];

    const filtered = notes.filter((n) => (n.title + ' ' + n.body + ' ' + (n.category || '')).toLowerCase().includes(q));

    const grid = $('researchGrid');
    if (!grid) return;

    grid.innerHTML = filtered.length
      ? filtered
          .map(
            (n, i) => `
        <div class="card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
              <b style="font-size:14px">${escapeHtml(n.title)}</b>
              <span class="pill neutral" style="font-size:8px">${escapeHtml(n.category || 'Study')}</span>
            </div>
            <small class="muted" style="display:block;margin-bottom:10px">${escapeHtml(n.date || '—')}</small>
            <p style="font-size:12px;color:#aebbd0;line-height:1.7;white-space:pre-wrap">${escapeHtml(n.body)}</p>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px;border-top:1px solid var(--line);padding-top:10px">
            <button class="btn small danger" onclick="NZ_Research.deleteNote(${i})">Delete</button>
          </div>
        </div>
      `
          )
          .join('')
      : '<div class="card empty" style="grid-column:1/-1">No matching research records found.</div>';
  }

  function addModal() {
    openModal(`
      <div class="modal-head">
        <div>
          <div class="eyebrow">RESEARCH ARCHIVE</div>
          <h2>Document Market Hypothesis</h2>
        </div>
        <button class="btn small ghost" onclick="NZ_UI.closeModal()">✕</button>
      </div>

      <form id="researchForm">
        <div class="field">
          <label>RESEARCH TITLE</label>
          <input id="rTitle" required placeholder="e.g. Higher Timeframe Liquidity Pools in Gold Q4">
        </div>
        <div class="field">
          <label>CATEGORY / CLASSIFICATION</label>
          <select id="rCat">
            <option>Market Study</option>
            <option>SMC Playbook</option>
            <option>Macro Thesis</option>
            <option>Post-Trade Postmortem</option>
          </select>
        </div>
        <div class="field">
          <label>ANALYSIS THESIS & OBSERVATIONS</label>
          <textarea id="rBody" required placeholder="Document the core market dynamics, invalidation zones, and institutional context..."></textarea>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px">
          <button type="button" class="btn ghost" onclick="NZ_UI.closeModal()">Cancel</button>
          <button type="submit" class="btn primary">Save Note</button>
        </div>
      </form>
    `);

    $('researchForm').onsubmit = (e) => {
      e.preventDefault();
      const title = $('rTitle').value.trim();
      const category = $('rCat').value;
      const body = $('rBody').value.trim();

      const acc = window.NZ_Storage.getActiveAccount();
      if (!Array.isArray(acc.notes)) acc.notes = [];

      acc.notes.unshift({
        title,
        category,
        body,
        date: new Date().toISOString().slice(0, 10),
      });

      window.NZ_Storage.saveUsers();
      closeModal();
      render();
      toast('Research note saved.');
    };
  }

  function deleteNote(idx) {
    if (!confirm('Permanently delete this research record?')) return;
    const acc = window.NZ_Storage.getActiveAccount();
    acc.notes.splice(idx, 1);
    window.NZ_Storage.saveUsers();
    render();
    toast('Research note deleted.');
  }

  return {
    render,
    filter,
    addModal,
    deleteNote,
  };
})();
