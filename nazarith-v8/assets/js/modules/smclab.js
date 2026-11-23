/**
 * NAZARITH CAPITAL V8.0 — SMART MONEY CONCEPTS (SMC) SETUP LAB
 * Preserved & elevated from V3.0: 9 Confluence Factors, Planned R:R,
 * Quality grading (A-D), Risk suggestion, and persistent review archive.
 */

window.NZ_SMCLab = (function () {
  'use strict';

  const { $, escapeHtml, renderPageHead, toast } = window.NZ_UI;

  const FACTORS = [
    ['bias', 'Clear Higher-Timeframe (HTF) Market Bias', 15],
    ['liquidity', 'Liquidity Sweep / Raid of Prior High or Low', 15],
    ['structure', 'Market Structure Shift (MSS) / CHOCH Confirmed', 15],
    ['displacement', 'Strong Displacement Candle with Momentum', 10],
    ['imbalance', 'Fair Value Gap (FVG) / Imbalance Present', 10],
    ['orderblock', 'Valid Refined Order Block / Point of Interest (POI)', 10],
    ['location', 'Premium or Discount Equilibrium Alignment', 10],
    ['session', 'High Probability Session Timing (London / NY)', 5],
    ['news', 'Clear Macro Calendar (No High-Impact Release Conflict)', 5],
  ];

  function getStore() {
    const a = window.NZ_Storage.getActiveAccount();
    if (!Array.isArray(a.smcSetups)) a.smcSetups = [];
    return a.smcSetups;
  }

  function render() {
    const hist = getStore().slice().reverse();

    const content = `
      ${renderPageHead(
        'SMART MONEY CONCEPTS / PRE-EXECUTION FILTER',
        'SMC Setup Lab',
        'Quantify and score setup confluence before risking capital. A strict discipline checklist to eradicate impulsive market entries.'
      )}

      <div class="grid two-col">
        <!-- Checklist Form -->
        <div class="card">
          <h3>SMC Confluence Checklist</h3>
          <p class="muted" style="font-size:11px;margin-bottom:14px">
            Select only factors visibly confirmed on your chart. Do not anticipate conditions before structural confirmation.
          </p>

          <div class="smc-checks">
            ${FACTORS.map(
              ([id, label, weight]) => `
              <label class="smc-check">
                <input type="checkbox" id="smc_${id}" onchange="NZ_SMCLab.updateScore()">
                <span>
                  ${escapeHtml(label)}
                  <small style="display:block;color:var(--muted)">${weight} Points</small>
                </span>
              </label>
            `
            ).join('')}
          </div>

          <div class="form-grid" style="margin-top:16px">
            <div class="field">
              <label>INSTRUMENT</label>
              <input id="smc_symbol" placeholder="e.g. XAUUSD, EURUSD" value="XAUUSD">
            </div>
            <div class="field">
              <label>DIRECTIONAL BIAS</label>
              <select id="smc_bias">
                <option>Buy</option>
                <option>Sell</option>
                <option>Neutral</option>
              </select>
            </div>
            <div class="field">
              <label>PLANNED R:R</label>
              <input id="smc_rr" type="number" min="0" step="0.1" value="3.0" oninput="NZ_SMCLab.updateScore()">
            </div>
            <div class="field">
              <label>ENTRY TIMEFRAME</label>
              <input id="smc_tf" placeholder="e.g. M15 / M5" value="M15">
            </div>
            <div class="field">
              <label>SETUP TYPE</label>
              <select id="smc_type">
                <option>Liquidity Sweep + MSS</option>
                <option>Order Block POI</option>
                <option>FVG Retracement</option>
                <option>Breaker Block</option>
                <option>Session High/Low Raid</option>
                <option>Other</option>
              </select>
            </div>
            <div class="field">
              <label>INVALIDATION THESIS</label>
              <input id="smc_note" placeholder="Where is this setup proven wrong?">
            </div>
          </div>

          <div style="display:flex;gap:10px;margin-top:16px">
            <button class="btn primary" onclick="NZ_SMCLab.saveSetup()">Save Setup Evaluation</button>
            <button class="btn ghost" onclick="NZ_SMCLab.reset()">Reset Checklist</button>
          </div>
        </div>

        <!-- Confluence Diagnostic Assessment -->
        <div class="card">
          <h3>Setup Quality Diagnostic</h3>
          <div class="smc-score" id="smc_score_val">
            0<span style="font-size:16px;color:var(--muted)"> / 100</span>
          </div>
          <div class="smc-bar">
            <span id="smc_bar_fill" style="width:0%"></span>
          </div>

          <h3 id="smc_grade_val" style="margin-top:22px">Not Assessed</h3>
          <p class="muted" id="smc_advice_val" style="font-size:12px;line-height:1.7">
            Tick confirmed chart factors to calculate your confluence score.
          </p>

          <div class="list-item">
            <span>Confluence Score</span>
            <b id="smc_points_val">0 / 100</b>
          </div>
          <div class="list-item">
            <span>Planned Reward-to-Risk</span>
            <b id="smc_rr_val">3.00R</b>
          </div>
          <div class="list-item">
            <span>Risk Execution Recommendation</span>
            <b id="smc_risk_val">Not Assessed</b>
          </div>

          <div class="note" style="margin-top:16px">
            A high confluence score does not guarantee price direction. Always align with broker spreads, liquidity voids, and strictly honor your invalidation stop.
          </div>
        </div>
      </div>

      <!-- Saved Setup Review History -->
      <div class="card" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h3>Saved Setup Evaluations <span class="muted" style="font-weight:400;font-size:10px">${hist.length} IN THIS ACCOUNT</span></h3>
        </div>
        ${
          hist.length
            ? hist
                .map(
                  (x) => `
              <div class="smc-history">
                <div>
                  <div style="font-size:13px;font-weight:600">
                    ${escapeHtml(x.symbol || 'Unspecified')} · <span class="pill ${x.bias === 'Buy' ? 'neutral' : 'loss'}">${escapeHtml(x.bias)}</span>
                  </div>
                  <div class="muted" style="font-size:10px;margin-top:4px">
                    ${escapeHtml(x.date)} · ${escapeHtml(x.type)} · ${escapeHtml(x.timeframe || 'M15')} · ${x.rr}R
                  </div>
                  ${x.note ? `<div style="font-size:11px;color:#cbd6e2;margin-top:4px">${escapeHtml(x.note)}</div>` : ''}
                </div>
                <div style="text-align:right">
                  <div style="font-size:18px;font-weight:600">${x.score}/100</div>
                  <div class="muted" style="font-size:10px">${escapeHtml(x.grade)}</div>
                  <button class="btn small danger" style="margin-top:6px" onclick="NZ_SMCLab.deleteSetup('${escapeHtml(x.id)}')">Delete</button>
                </div>
              </div>
            `
                )
                .join('')
            : '<div class="empty">No setup evaluations saved yet.</div>'
        }
      </div>
    `;

    $('main').innerHTML = content;
    updateScore();
  }

  function updateScore() {
    let score = 0;
    FACTORS.forEach(([id, , weight]) => {
      const el = $('smc_' + id);
      if (el && el.checked) score += weight;
    });

    const rr = Number($('smc_rr')?.value) || 0;
    if (rr >= 2) score += 5;

    const pct = Math.min(100, score);
    const grade =
      pct >= 85
        ? 'Tier A · Prime Institutional Confluence'
        : pct >= 70
        ? 'Tier B · Selective Execution'
        : pct >= 50
        ? 'Tier C · Incomplete Confluence'
        : 'Tier D · High Risk / Sub-optimal';

    const advice =
      pct >= 85
        ? 'High structural confluence. All primary criteria align with smart money footprints.'
        : pct >= 70
        ? 'Moderate confluence. Confirm missing higher timeframe factors before pulling the trigger.'
        : pct >= 50
        ? 'Incomplete confluence. Forcing an entry here introduces uncompensated statistical risk.'
        : 'Too many conditions missing. Do not force an entry.';

    const riskSuggestion =
      pct >= 85 ? 'Standard Written Plan Risk (e.g. 0.5%)' : pct >= 70 ? 'Half Risk / Conservative' : 'No Execution (Stand Aside)';

    if ($('smc_score_val')) {
      $('smc_score_val').innerHTML = `${pct}<span style="font-size:16px;color:var(--muted)"> / 100</span>`;
      $('smc_bar_fill').style.width = pct + '%';
      $('smc_grade_val').textContent = grade;
      $('smc_advice_val').textContent = advice;
      $('smc_points_val').textContent = `${pct} / 100`;
      $('smc_rr_val').textContent = `${rr.toFixed(2)}R`;
      $('smc_risk_val').textContent = riskSuggestion;
    }

    return { score: pct, grade };
  }

  function saveSetup() {
    const result = updateScore();
    const symbol = ($('smc_symbol')?.value || '').trim().toUpperCase();
    if (!symbol) {
      toast('Enter instrument symbol first.', 'error');
      return;
    }

    const rr = Number($('smc_rr')?.value) || 0;
    const selectedFactors = FACTORS.filter(([id]) => $('smc_' + id)?.checked).map((x) => x[0]);

    const item = {
      id: 'smc_' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      symbol,
      bias: $('smc_bias')?.value || 'Buy',
      rr,
      type: $('smc_type')?.value || 'Order Block',
      timeframe: ($('smc_tf')?.value || 'M15').trim(),
      note: ($('smc_note')?.value || '').trim(),
      score: result.score,
      grade: result.grade,
      factors: selectedFactors,
    };

    const store = getStore();
    store.push(item);
    window.NZ_Storage.saveUsers();
    toast('SMC Setup Evaluation saved to active account.');
    render();
  }

  function deleteSetup(id) {
    const a = window.NZ_Storage.getActiveAccount();
    a.smcSetups = (a.smcSetups || []).filter((x) => x.id !== id);
    window.NZ_Storage.saveUsers();
    render();
    toast('Setup deleted.');
  }

  function reset() {
    FACTORS.forEach(([id]) => {
      const el = $('smc_' + id);
      if (el) el.checked = false;
    });
    if ($('smc_note')) $('smc_note').value = '';
    if ($('smc_rr')) $('smc_rr').value = '3.0';
    updateScore();
  }

  return {
    render,
    updateScore,
    saveSetup,
    deleteSetup,
    reset,
  };
})();
