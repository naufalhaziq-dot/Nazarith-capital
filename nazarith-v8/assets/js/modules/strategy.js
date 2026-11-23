/**
 * NAZARITH CAPITAL V8.0 — STRATEGY LAB
 * Preserved & elevated from V3.0: Framework for documenting rules,
 * invalidation setups, timeframe alignment, and strategy evaluation.
 */

window.NZ_Strategy = (function () {
  'use strict';

  const { $, escapeHtml, renderPageHead, openModal, closeModal, toast } = window.NZ_UI;

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const strats = acc.strategies || [];

    const content = `
      ${renderPageHead(
        'RESEARCH / SYSTEMATIC METHODOLOGY',
        'Strategy Lab',
        'Document, structure, and evaluate your proprietary trading models and entry frameworks.',
        `<button class="btn primary" onclick="NZ_Strategy.addModal()">＋ New Strategy Model</button>`
      )}

      <!-- Standard Institutional SMC Framework -->
      <div class="note" style="margin-bottom:18px">
        <b>RECOMMENDED INSTITUTIONAL CONFLUENCE FRAMEWORK:</b>
        Higher Timeframe Bias (Daily/4H) → Liquidity Sweep Identification → MSS / CHOCH Displacement → 
        Fresh Unmitigated Order Block / POI → Premium/Discount Alignment → Strict Mathematical Invalidation → 
        Pre-defined Liquidity Target.
      </div>

      <!-- Strategy Library Grid -->
      <div class="card">
        <h3>Proprietary Strategy Library</h3>
        ${
          strats.length
            ? strats
                .map(
                  (s, i) => `
              <div class="list-item" style="align-items:flex-start">
                <div>
                  <b style="font-size:13px">${escapeHtml(s.name)}</b>
                  ${s.timeframe ? `<span class="pill neutral" style="font-size:8px;margin-left:6px">${escapeHtml(s.timeframe)}</span>` : ''}
                  <p class="muted" style="font-size:12px;margin:6px 0 0;line-height:1.7;white-space:pre-wrap">${escapeHtml(s.description || '')}</p>
                </div>
                <button class="btn small danger" onclick="NZ_Strategy.deleteStrategy(${i})">Delete</button>
              </div>
            `
                )
                .join('')
            : '<div class="empty">No strategies documented. Add your execution rules to evaluate them over time.</div>'
        }
      </div>
    `;

    $('main').innerHTML = content;
  }

  function addModal() {
    openModal(`
      <div class="modal-head">
        <div>
          <div class="eyebrow">STRATEGY REPOSITORY</div>
          <h2>Document Trading Strategy</h2>
        </div>
        <button class="btn small ghost" onclick="NZ_UI.closeModal()">✕</button>
      </div>

      <form id="strategyForm">
        <div class="field">
          <label>STRATEGY NAME</label>
          <input id="stratName" required placeholder="e.g. London Session Liquidity Raid + FVG Entry">
        </div>
        <div class="field">
          <label>TARGET TIMEFRAMES</label>
          <input id="stratTf" placeholder="e.g. H4 Bias / M15 Structure / M5 Execution" value="H4 / M15 / M5">
        </div>
        <div class="field">
          <label>RULES & CONFLUENCE REQUIREMENTS</label>
          <textarea id="stratDesc" required placeholder="Detail the exact conditions required before entering: market structure shift, volume displacement, invalidation criteria..."></textarea>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px">
          <button type="button" class="btn ghost" onclick="NZ_UI.closeModal()">Cancel</button>
          <button type="submit" class="btn primary">Save Strategy</button>
        </div>
      </form>
    `);

    $('strategyForm').onsubmit = (e) => {
      e.preventDefault();
      const name = $('stratName').value.trim();
      const timeframe = $('stratTf').value.trim();
      const description = $('stratDesc').value.trim();

      const acc = window.NZ_Storage.getActiveAccount();
      if (!Array.isArray(acc.strategies)) acc.strategies = [];

      acc.strategies.push({ name, timeframe, description });
      window.NZ_Storage.saveUsers();
      closeModal();
      render();
      toast('Strategy documented.');
    };
  }

  function deleteStrategy(idx) {
    if (!confirm('Permanently delete this strategy model?')) return;
    const acc = window.NZ_Storage.getActiveAccount();
    acc.strategies.splice(idx, 1);
    window.NZ_Storage.saveUsers();
    render();
    toast('Strategy deleted.');
  }

  return {
    render,
    addModal,
    deleteStrategy,
  };
})();
