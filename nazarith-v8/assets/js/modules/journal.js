/**
 * NAZARITH CAPITAL V8.0 — ADVANCED TRADING JOURNAL
 * Institutional trade documentation: entry/exit price, lot size, risk %,
 * R:R, sessions, mistake tags, emotions, pre/post screenshots, and filters.
 */

window.NZ_Journal = (function () {
  'use strict';

  const { $, escapeHtml, money, dateFmt, toast, openModal, closeModal, confirmDialog, viewImage, renderPageHead } =
    window.NZ_UI;

  let draftImages = [];
  let editingId = null;

  function render() {
    const trades = window.NZ_Storage.getTrades();
    const sorted = [...trades].sort((a, b) => {
      const da = a.trade_date || a.date || '';
      const db = b.trade_date || b.date || '';
      return db.localeCompare(da);
    });

    const content = `
      ${renderPageHead(
        'EXECUTION ARCHIVE / AUDIT LOG',
        'Institutional Trade Journal',
        'Record, audit, and analyze every setup, risk parameter, chart verification, and psychological state.',
        `<button class="btn primary" onclick="NZ_Journal.openModal()">＋ New Journal Entry</button>`
      )}

      <!-- Multi-Filter Toolbar -->
      <div class="toolbar" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
        <input id="searchTrades" style="max-width:240px" placeholder="Search pair, setup, tag..." oninput="NZ_Journal.filterTrades()">
        <select id="filterResult" onchange="NZ_Journal.filterTrades()" style="max-width:140px">
          <option value="">All outcomes</option>
          <option>Win</option>
          <option>Loss</option>
          <option>Breakeven</option>
          <option>Open</option>
        </select>
        <select id="filterDirection" onchange="NZ_Journal.filterTrades()" style="max-width:130px">
          <option value="">All directions</option>
          <option>BUY</option>
          <option>SELL</option>
        </select>
        <select id="filterSession" onchange="NZ_Journal.filterTrades()" style="max-width:130px">
          <option value="">All sessions</option>
          <option>London</option>
          <option>New York</option>
          <option>Asia</option>
          <option>Overlap</option>
        </select>
        <select id="filterMistake" onchange="NZ_Journal.filterTrades()" style="max-width:160px">
          <option value="">All mistake tags</option>
          <option value="none">Flawless (No Mistake)</option>
          <option>FOMO Entry</option>
          <option>Moved Stop Loss</option>
          <option>Overleveraged</option>
          <option>Revenge Trading</option>
          <option>Chased Market</option>
          <option>Early Exit</option>
        </select>
        <span class="muted" id="rowCount" style="margin-left:auto;font-size:11px">${sorted.length} records</span>
      </div>

      <!-- Journal Table Container -->
      <div id="journalTableContainer">
        ${sorted.length ? renderTable(sorted) : '<div class="card empty">Your journal is empty. Document your first trade to establish an institutional record.</div>'}
      </div>
    `;

    $('main').innerHTML = content;
  }

  function filterTrades() {
    const q = ($('searchTrades')?.value || '').toLowerCase().trim();
    const r = $('filterResult')?.value || '';
    const d = $('filterDirection')?.value || '';
    const s = $('filterSession')?.value || '';
    const m = $('filterMistake')?.value || '';

    const trades = window.NZ_Storage.getTrades();
    const filtered = trades.filter((t) => {
      const matchText =
        !q ||
        [t.symbol, t.setup, t.setup_type, t.notes, t.entry_reason, t.mistake_tag, ...(t.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(q);
      const matchRes = !r || (t.result || '').toLowerCase() === r.toLowerCase();
      const matchDir = !d || (t.direction || '').toUpperCase() === d.toUpperCase();
      const matchSess = !s || (t.session || '').toLowerCase() === s.toLowerCase();
      let matchMistake = true;
      if (m === 'none') {
        matchMistake = !t.mistake_tag || t.mistake_tag === 'None';
      } else if (m) {
        matchMistake = (t.mistake_tag || '').toLowerCase() === m.toLowerCase();
      }

      return matchText && matchRes && matchDir && matchSess && matchMistake;
    });

    filtered.sort((a, b) => {
      const da = a.trade_date || a.date || '';
      const db = b.trade_date || b.date || '';
      return db.localeCompare(da);
    });

    const countEl = $('rowCount');
    if (countEl) countEl.textContent = `${filtered.length} records`;

    const tableEl = $('journalTableContainer');
    if (tableEl) {
      tableEl.innerHTML = filtered.length
        ? renderTable(filtered)
        : '<div class="card empty">No trades match your filter criteria.</div>';
    }
  }

  function renderTable(rows, allowActions = true) {
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>DATE</th>
              <th>PAIR</th>
              <th>DIR</th>
              <th>SESSION</th>
              <th>LOT</th>
              <th>R:R</th>
              <th>SETUP</th>
              <th>RESULT</th>
              <th>NET P&L</th>
              <th>MISTAKE TAG</th>
              <th>CHART VERIFICATION</th>
              ${allowActions ? '<th>ACTIONS</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map((t) => {
                const res = String(t.result || 'Open');
                const pillCls = res === 'Win' ? 'win' : res === 'Loss' ? 'loss' : 'neutral';
                const pnl = Number(t.pnl) || 0;
                const pnlCls = pnl > 0 ? 'positive' : pnl < 0 ? 'negative' : 'muted';
                const imgs = t.images || [];

                return `
                  <tr>
                    <td>${dateFmt(t.trade_date || t.date)}</td>
                    <td><b>${escapeHtml(t.symbol)}</b></td>
                    <td><span class="pill ${t.direction === 'BUY' ? 'neutral' : 'loss'}">${escapeHtml(t.direction)}</span></td>
                    <td>${escapeHtml(t.session || 'London')}</td>
                    <td>${t.lot_size ? Number(t.lot_size).toFixed(2) : '—'}</td>
                    <td>${escapeHtml(t.risk_reward || t.rr || '—')}</td>
                    <td>${escapeHtml(t.setup || 'SMC')}</td>
                    <td><span class="pill ${pillCls}">${escapeHtml(res)}</span></td>
                    <td class="${pnlCls}"><b>${money(pnl)}</b></td>
                    <td>
                      ${
                        t.mistake_tag && t.mistake_tag !== 'None'
                          ? `<span class="pill loss" style="font-size:8px">${escapeHtml(t.mistake_tag)}</span>`
                          : '<span class="muted" style="font-size:10px">—</span>'
                      }
                    </td>
                    <td>
                      <div class="thumbs">
                        ${
                          imgs.length
                            ? imgs
                                .map(
                                  (src, i) =>
                                    `<img class="thumb" src="${src}" onclick="NZ_UI.viewImage('${src}')" alt="Trade chart ${i + 1}" title="Click to enlarge">`
                                )
                                .join('')
                            : '<span class="muted">—</span>'
                        }
                      </div>
                    </td>
                    ${
                      allowActions
                        ? `
                      <td>
                        <button class="btn small ghost" onclick="NZ_Journal.viewDetails('${escapeHtml(t.id)}')">View</button>
                        <button class="btn small ghost" onclick="NZ_Journal.openModal('${escapeHtml(t.id)}')">Edit</button>
                        <button class="btn small danger" onclick="NZ_Journal.deleteTrade('${escapeHtml(t.id)}')">×</button>
                      </td>
                    `
                        : ''
                    }
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function openTradeModal(id = null) {
    editingId = id;
    const trades = window.NZ_Storage.getTrades();
    const t = id ? trades.find((x) => x.id === id) : null;
    draftImages = t ? [...(t.images || [])] : [];

    const defaultDate = new Date().toISOString().slice(0, 10);

    openModal(`
      <div class="modal-head">
        <div>
          <div class="eyebrow">${t ? 'AUDIT / MODIFICATION' : 'INSTITUTIONAL EXECUTION'}</div>
          <h2>${t ? 'Edit Trade Journal' : 'Record New Trade'}</h2>
        </div>
        <button class="btn small ghost" onclick="NZ_UI.closeModal()">✕</button>
      </div>

      <form id="tradeForm">
        <div class="form-grid">
          <div class="field">
            <label>EXECUTION DATE</label>
            <input id="f_date" type="date" required value="${escapeHtml(t?.trade_date || t?.date || defaultDate)}">
          </div>
          <div class="field">
            <label>INSTRUMENT / SYMBOL</label>
            <input id="f_symbol" type="text" required placeholder="e.g. XAUUSD, EURUSD, BTCUSD" value="${escapeHtml(t?.symbol || 'XAUUSD')}">
          </div>
          <div class="field">
            <label>MARKET ASSET CLASS</label>
            <select id="f_market">
              ${['Forex', 'Crypto', 'Indices', 'Commodities', 'Stocks', 'Other']
                .map((m) => `<option ${t?.market === m ? 'selected' : ''}>${m}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field">
            <label>DIRECTION</label>
            <select id="f_direction">
              <option ${t?.direction === 'BUY' ? 'selected' : ''}>BUY</option>
              <option ${t?.direction === 'SELL' ? 'selected' : ''}>SELL</option>
            </select>
          </div>
          <div class="field">
            <label>ENTRY PRICE</label>
            <input id="f_entry" type="number" step="any" placeholder="0.00" value="${t?.entry_price ?? t?.entry ?? ''}">
          </div>
          <div class="field">
            <label>STOP LOSS PRICE</label>
            <input id="f_stop" type="number" step="any" placeholder="0.00" value="${t?.stop_loss ?? t?.stop ?? ''}">
          </div>
          <div class="field">
            <label>TAKE PROFIT PRICE</label>
            <input id="f_target" type="number" step="any" placeholder="0.00" value="${t?.take_profit ?? t?.target ?? ''}">
          </div>
          <div class="field">
            <label>LOT SIZE</label>
            <input id="f_lot" type="number" step="0.01" placeholder="1.00" value="${t?.lot_size ?? 1.0}">
          </div>
          <div class="field">
            <label>RISK PERCENTAGE (%)</label>
            <input id="f_risk" type="number" step="0.05" placeholder="0.50" value="${t?.risk_percentage ?? t?.risk ?? 0.5}">
          </div>
          <div class="field">
            <label>RISK : REWARD (R:R)</label>
            <input id="f_rr" type="text" placeholder="1:3" value="${escapeHtml(t?.risk_reward || t?.rr || '1:3')}">
          </div>
          <div class="field">
            <label>STRATEGY METHODOLOGY</label>
            <input id="f_setup" type="text" placeholder="e.g. SMC, Supply/Demand, Breakout" value="${escapeHtml(t?.setup || 'SMC')}">
          </div>
          <div class="field">
            <label>SETUP TYPE</label>
            <select id="f_setup_type">
              ${['Liquidity Sweep + MSS', 'Order Block POI', 'FVG Retracement', 'Breaker Block', 'Session High/Low Raid', 'Other']
                .map((st) => `<option ${t?.setup_type === st ? 'selected' : ''}>${st}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field">
            <label>OUTCOME RESULT</label>
            <select id="f_result">
              <option ${t?.result === 'Win' ? 'selected' : ''}>Win</option>
              <option ${t?.result === 'Loss' ? 'selected' : ''}>Loss</option>
              <option ${t?.result === 'Breakeven' ? 'selected' : ''}>Breakeven</option>
              <option ${t?.result === 'Open' ? 'selected' : ''}>Open</option>
            </select>
          </div>
          <div class="field">
            <label>NET REALIZED P&L (USD)</label>
            <input id="f_pnl" type="number" step="any" required placeholder="0.00" value="${t?.pnl ?? 0}">
          </div>
        </div>

        <!-- Institutional Diagnostics & Psychology -->
        <div class="form-grid" style="margin-top:8px">
          <div class="field">
            <label>TRADING SESSION</label>
            <select id="f_session">
              ${['London', 'New York', 'Asia', 'Overlap', 'Other']
                .map((sess) => `<option ${t?.session === sess ? 'selected' : ''}>${sess}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field">
            <label>EXECUTION QUALITY</label>
            <select id="f_execution">
              ${['Excellent', 'Good', 'Average', 'Poor']
                .map((eq) => `<option ${(t?.execution_quality || t?.execution) === eq ? 'selected' : ''}>${eq}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field">
            <label>EMOTION (BEFORE TRADE)</label>
            <select id="f_emotion_before">
              ${['Calm', 'Confident', 'Fearful', 'FOMO', 'Revenge Trading', 'Overconfident', 'Fatigued']
                .map((em) => `<option ${(t?.emotion_before || t?.emotion) === em ? 'selected' : ''}>${em}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field">
            <label>EMOTION (AFTER TRADE)</label>
            <select id="f_emotion_after">
              ${['Calm', 'Satisfied', 'Regretful', 'Frustrated', 'Excited', 'Disciplined']
                .map((em) => `<option ${(t?.emotion_after || 'Calm') === em ? 'selected' : ''}>${em}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field" style="grid-column:1/-1">
            <label>MISTAKE TRACKING TAG</label>
            <select id="f_mistake">
              ${['None', 'FOMO Entry', 'Moved Stop Loss', 'Overleveraged', 'Revenge Trading', 'Chased Market', 'Early Exit', 'Hesitated Entry']
                .map((m) => `<option ${t?.mistake_tag === m ? 'selected' : ''}>${m}</option>`)
                .join('')}
            </select>
          </div>
        </div>

        <div class="field">
          <label>ENTRY REASON & THESIS</label>
          <input id="f_entry_reason" placeholder="e.g. Higher timeframe liquidity sweep into 15m order block" value="${escapeHtml(t?.entry_reason || '')}">
        </div>

        <div class="field">
          <label>EXIT REASON & REFLECTION</label>
          <input id="f_exit_reason" placeholder="e.g. Hit predetermined 1:3 TP target before NY close" value="${escapeHtml(t?.exit_reason || '')}">
        </div>

        <div class="field">
          <label>TRADE NOTES & CONFLUENCE</label>
          <textarea id="f_notes" placeholder="Detailed invalidation level, spread conditions, session behavior...">${escapeHtml(t?.notes || '')}</textarea>
        </div>

        <!-- Chart Screenshot Upload (Canvas Compressed + Storage Ready) -->
        <div class="field">
          <label>CHART SCREENSHOTS (PRE / POST TRADE)</label>
          <label class="upload-box" for="journalImageFiles">
            <div style="font-size:22px;color:var(--blue)">＋</div>
            <b style="font-size:12px">Upload Chart Screenshots</b>
            <div style="font-size:10px;color:var(--muted);margin-top:4px">PNG, JPG, WEBP · Up to 3 images · Max 5MB each</div>
            <input id="journalImageFiles" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onchange="NZ_Journal.handleImages(this.files)">
          </label>
          <div id="previewGrid" class="preview-grid">
            ${renderPreviews()}
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px">
          <button type="button" class="btn ghost" onclick="NZ_UI.closeModal()">Cancel</button>
          <button type="submit" class="btn primary">Save Journal Entry</button>
        </div>
      </form>
    `);

    $('tradeForm').onsubmit = (e) => saveTradeAction(e);
  }

  function renderPreviews() {
    return draftImages
      .map(
        (src, i) => `
        <div class="preview-item">
          <img src="${src}" alt="Screenshot ${i + 1}">
          <button type="button" onclick="NZ_Journal.removeDraftImage(${i})">✕</button>
        </div>
      `
      )
      .join('');
  }

  function handleImages(files) {
    const list = [...files];
    list.forEach((file) => {
      if (draftImages.length >= 3) {
        toast('Maximum 3 chart screenshots allowed per trade.', 'error');
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        toast('Only PNG, JPG, or WEBP image formats supported.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast('Each image must be under 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1600;
          const scale = Math.min(1, maxDim / img.width, maxDim / img.height);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          draftImages.push(compressed);
          $('previewGrid').innerHTML = renderPreviews();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    $('journalImageFiles').value = '';
  }

  function removeDraftImage(idx) {
    draftImages.splice(idx, 1);
    $('previewGrid').innerHTML = renderPreviews();
  }

  function saveTradeAction(e) {
    e.preventDefault();
    const val = (id) => $(id)?.value;

    const item = {
      id: editingId || 'tr_' + Date.now(),
      trade_date: val('f_date'),
      symbol: (val('f_symbol') || 'XAUUSD').trim().toUpperCase(),
      market: val('f_market'),
      direction: val('f_direction'),
      entry_price: val('f_entry') ? Number(val('f_entry')) : null,
      stop_loss: val('f_stop') ? Number(val('f_stop')) : null,
      take_profit: val('f_target') ? Number(val('f_target')) : null,
      lot_size: Number(val('f_lot')) || 1.0,
      risk_percentage: Number(val('f_risk')) || 0.5,
      risk_reward: val('f_rr') || '1:3',
      setup: val('f_setup') || 'SMC',
      setup_type: val('f_setup_type'),
      result: val('f_result'),
      pnl: Number(val('f_pnl')) || 0,
      session: val('f_session'),
      execution_quality: val('f_execution'),
      emotion_before: val('f_emotion_before'),
      emotion_after: val('f_emotion_after'),
      mistake_tag: val('f_mistake') === 'None' ? '' : val('f_mistake'),
      entry_reason: val('f_entry_reason') || '',
      exit_reason: val('f_exit_reason') || '',
      notes: val('f_notes') || '',
      images: [...draftImages],
    };

    window.NZ_Storage.saveTrade(item);
    closeModal();
    render();
    toast('Trade journal entry saved.');
  }

  function deleteTradeAction(id) {
    confirmDialog({
      title: 'Delete Trade Record',
      message: 'Permanently remove this trade record from the institutional journal?',
      confirmText: 'Delete Trade',
      onConfirm: () => {
        window.NZ_Storage.deleteTrade(id);
        render();
        toast('Trade deleted.');
      },
    });
  }

  function viewDetails(id) {
    const trades = window.NZ_Storage.getTrades();
    const t = trades.find((x) => x.id === id);
    if (!t) return;

    openModal(`
      <div class="modal-head">
        <div>
          <div class="eyebrow">TRADE AUDIT RECORD</div>
          <h2>${escapeHtml(t.symbol)} · ${escapeHtml(t.direction)} (${escapeHtml(t.result)})</h2>
        </div>
        <button class="btn small ghost" onclick="NZ_UI.closeModal()">✕</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px">
        <div style="background:#0c1520;padding:10px;border-radius:var(--radius)">
          <small class="muted" style="display:block;font-size:9px">DATE</small>
          <b>${dateFmt(t.trade_date || t.date)}</b>
        </div>
        <div style="background:#0c1520;padding:10px;border-radius:var(--radius)">
          <small class="muted" style="display:block;font-size:9px">MARKET / SESSION</small>
          <b>${escapeHtml(t.market || 'Forex')} · ${escapeHtml(t.session || 'London')}</b>
        </div>
        <div style="background:#0c1520;padding:10px;border-radius:var(--radius)">
          <small class="muted" style="display:block;font-size:9px">RISK : REWARD</small>
          <b>${escapeHtml(t.risk_reward || t.rr || '—')}</b>
        </div>
        <div style="background:#0c1520;padding:10px;border-radius:var(--radius)">
          <small class="muted" style="display:block;font-size:9px">REALIZED P&L</small>
          <b class="${Number(t.pnl) >= 0 ? 'positive' : 'negative'}">${money(t.pnl)}</b>
        </div>
      </div>

      <div class="detail-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
        <div><small>Entry Price</small><b>${t.entry_price ?? t.entry ?? '—'}</b></div>
        <div><small>Stop Loss</small><b>${t.stop_loss ?? t.stop ?? '—'}</b></div>
        <div><small>Take Profit</small><b>${t.take_profit ?? t.target ?? '—'}</b></div>
        <div><small>Lot Size</small><b>${t.lot_size ?? '—'}</b></div>
        <div><small>Risk %</small><b>${t.risk_percentage ?? t.risk ?? '—'}%</b></div>
        <div><small>Execution Quality</small><b>${escapeHtml(t.execution_quality || t.execution || 'Good')}</b></div>
        <div><small>Emotion (Pre-trade)</small><b>${escapeHtml(t.emotion_before || t.emotion || 'Calm')}</b></div>
        <div><small>Emotion (Post-trade)</small><b>${escapeHtml(t.emotion_after || 'Calm')}</b></div>
        <div><small>Mistake Tag</small><b class="${t.mistake_tag ? 'negative' : ''}">${escapeHtml(t.mistake_tag || 'None')}</b></div>
      </div>

      ${t.entry_reason ? `<div style="margin:10px 0"><small class="muted">Entry Reason:</small><div style="font-size:12px;margin-top:2px">${escapeHtml(t.entry_reason)}</div></div>` : ''}
      ${t.exit_reason ? `<div style="margin:10px 0"><small class="muted">Exit Reason:</small><div style="font-size:12px;margin-top:2px">${escapeHtml(t.exit_reason)}</div></div>` : ''}
      ${t.notes ? `<div style="margin:10px 0"><small class="muted">Notes / Thesis:</small><p style="font-size:12px;white-space:pre-wrap;color:#cfdceb;margin:4px 0">${escapeHtml(t.notes)}</p></div>` : ''}

      <div class="preview-grid" style="margin-top:16px">
        ${(t.images || []).map((src) => `<div class="preview-item"><img src="${src}" onclick="NZ_UI.viewImage('${src}')" alt="Chart" style="cursor:pointer"></div>`).join('')}
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px">
        <button class="btn ghost" onclick="NZ_UI.closeModal()">Close</button>
        <button class="btn primary" onclick="NZ_Journal.openModal('${escapeHtml(t.id)}')">Edit Trade</button>
      </div>
    `);
  }

  return {
    render,
    filterTrades,
    renderTable,
    openModal: openTradeModal,
    handleImages,
    removeDraftImage,
    deleteTrade: deleteTradeAction,
    viewDetails,
  };
})();
