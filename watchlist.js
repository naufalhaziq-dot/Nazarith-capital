/**
 * NAZARITH CAPITAL V8.0 — MARKET WATCHLIST
 * Multi-instrument tracking, directional bias, key structural levels,
 * trading plans, and transparent live-feed status indicators.
 */

window.NZ_Watchlist = (function () {
  'use strict';

  const { $, escapeHtml, renderPageHead, openModal, closeModal, toast } = window.NZ_UI;

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const watch = acc.watch || [];

    const content = `
      ${renderPageHead(
        'ASSET SURVEILLANCE / STRUCTURAL BIAS',
        'Market Watchlist',
        'Track focus pairs, institutional bias, key liquidity pools, and alert triggers.',
        `<button class="btn primary" onclick="NZ_Watchlist.addModal()">＋ Add Asset</button>`
      )}

      <!-- Honest Feed Status Banner (Master Prompt Rule H) -->
      <div class="card" style="margin-bottom:16px;background:#0d141e;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e8b65c;margin-right:6px"></span>
          <b style="font-size:11px;letter-spacing:1px">FEED STATUS: LOCAL SURVEILLANCE MODE</b>
          <p class="muted" style="margin:4px 0 0;font-size:10px">
            Key levels and biases are tracked from your structural analysis. Live WebSocket market price streaming requires Finnhub API Key configured in Settings. No synthetic fake prices are displayed.
          </p>
        </div>
        <button class="btn small ghost" onclick="NZ_App.navigate('settings')">API Config ⚙</button>
      </div>

      <!-- Watchlist Table -->
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ASSET / PAIR</th>
                <th>TIMEFRAME</th>
                <th>INSTITUTIONAL BIAS</th>
                <th>KEY STRUCTURAL LEVEL</th>
                <th>SURVEILLANCE NOTES / PLAN</th>
                <th>ALERT TRIGGER</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${
                watch.length
                  ? watch
                      .map(
                        (w, i) => `
                    <tr>
                      <td><b>${escapeHtml(w.asset || w.symbol)}</b></td>
                      <td>${escapeHtml(w.tf || 'H1 / M15')}</td>
                      <td>
                        <span class="pill ${w.bias === 'Bullish' ? 'neutral' : w.bias === 'Bearish' ? 'loss' : 'gold'}">
                          ${escapeHtml(w.bias || 'Neutral')}
                        </span>
                      </td>
                      <td><b>${escapeHtml(w.note || w.key_level || '—')}</b></td>
                      <td><span style="color:#aebbd0">${escapeHtml(w.plan || w.notes || '—')}</span></td>
                      <td>${w.alert_price ? '$' + Number(w.alert_price).toFixed(2) : '<span class="muted">—</span>'}</td>
                      <td>
                        <button class="btn small danger" onclick="NZ_Watchlist.deleteItem(${i})">Delete</button>
                      </td>
                    </tr>
                  `
                      )
                      .join('')
                  : '<tr><td colspan="7" class="empty">No surveillance assets tracked in this account yet.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    $('main').innerHTML = content;
  }

  function addModal() {
    openModal(`
      <div class="modal-head">
        <div>
          <div class="eyebrow">ASSET SURVEILLANCE</div>
          <h2>Add Asset to Watchlist</h2>
        </div>
        <button class="btn small ghost" onclick="NZ_UI.closeModal()">✕</button>
      </div>

      <form id="watchForm" class="form-grid">
        <div class="field">
          <label>ASSET SYMBOL</label>
          <input id="wAsset" required placeholder="e.g. XAUUSD, EURUSD, BTCUSD">
        </div>
        <div class="field">
          <label>ANALYSIS TIMEFRAME</label>
          <input id="wTf" value="H4 / H1 / M15" placeholder="e.g. H4 / M15">
        </div>
        <div class="field">
          <label>DIRECTIONAL BIAS</label>
          <select id="wBias">
            <option>Bullish</option>
            <option>Bearish</option>
            <option>Neutral</option>
          </select>
        </div>
        <div class="field">
          <label>ALERT TRIGGER PRICE</label>
          <input id="wAlert" type="number" step="any" placeholder="0.00">
        </div>
        <div class="field" style="grid-column:1/-1">
          <label>KEY LEVEL / POI / LIQUIDITY POOL</label>
          <input id="wNote" required placeholder="e.g. 2638.50 Sell-Side Liquidity Pool">
        </div>
        <div class="field" style="grid-column:1/-1">
          <label>TRADING PLAN / CONDITION FOR ENTRY</label>
          <textarea id="wPlan" placeholder="Wait for Asia session liquidity raid + 5m displacement before entering..."></textarea>
        </div>

        <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
          <button type="button" class="btn ghost" onclick="NZ_UI.closeModal()">Cancel</button>
          <button type="submit" class="btn primary">Add to Watchlist</button>
        </div>
      </form>
    `);

    $('watchForm').onsubmit = (e) => {
      e.preventDefault();
      const asset = $('wAsset').value.trim().toUpperCase();
      const tf = $('wTf').value.trim();
      const bias = $('wBias').value;
      const note = $('wNote').value.trim();
      const plan = $('wPlan').value.trim();
      const alert_price = Number($('wAlert').value) || null;

      const acc = window.NZ_Storage.getActiveAccount();
      if (!Array.isArray(acc.watch)) acc.watch = [];

      acc.watch.push({ asset, tf, bias, note, plan, alert_price });
      window.NZ_Storage.saveUsers();
      closeModal();
      render();
      toast('Asset added to watchlist.');
    };
  }

  function deleteItem(idx) {
    const acc = window.NZ_Storage.getActiveAccount();
    acc.watch.splice(idx, 1);
    window.NZ_Storage.saveUsers();
    render();
    toast('Asset removed from watchlist.');
  }

  return {
    render,
    addModal,
    deleteItem,
  };
})();
