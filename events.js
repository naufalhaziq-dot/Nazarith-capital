/**
 * NAZARITH CAPITAL V8.0 — MACRO EVENT PLANNER
 * Economic releases, high-impact news restrictions, personal event schedule,
 * and transparent API provider status (no synthetic simulated live events).
 */

window.NZ_Events = (function () {
  'use strict';

  const { $, escapeHtml, dateFmt, renderPageHead, openModal, closeModal, toast } = window.NZ_UI;

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const events = acc.events || [];

    const content = `
      ${renderPageHead(
        'MACRO SURVEILLANCE / NEWS RESTRICTIONS',
        'Macro Event Planner',
        'Track central bank rate decisions, macroeconomic releases, and enforce pre-news risk restrictions.',
        `<button class="btn primary" onclick="NZ_Events.addModal()">＋ Add Macro Event</button>`
      )}

      <!-- Honest Feed Status Banner (Master Prompt Rule K) -->
      <div class="card" style="margin-bottom:16px;background:#0d141e;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e8b65c;margin-right:6px"></span>
          <b style="font-size:11px;letter-spacing:1px">ECONOMIC CALENDAR FEED: MANUAL & LOCAL SCHEDULE</b>
          <p class="muted" style="margin:4px 0 0;font-size:10px">
            Scheduled events are registered manually by the trader. External live economic calendar synchronization requires Finnhub / ForexFactory API connector. No fabricated fake news feeds are displayed.
          </p>
        </div>
        <button class="btn small ghost" onclick="NZ_App.navigate('settings')">Configure Provider ⚙</button>
      </div>

      <!-- Institutional Risk Restriction Policy -->
      <div class="note" style="border-left-color:var(--red);background:#221316;color:#f3c7cb">
        <b>INSTITUTIONAL NEWS RESTRICTION MANDATE:</b>
        Do not open new positions within 15 minutes before and 15 minutes after High-Impact economic releases (NFP, CPI, FOMC, Rate Decisions). 
        Unhedged exposure during news events is gambling against institutional slippage and spread expansion.
      </div>

      <!-- Events List -->
      <div class="card" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h3>Registered Macro & Economic Events</h3>
          <span class="muted" style="font-size:10px">${events.length} EVENTS REGISTERED</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>TIME</th>
                <th>CURRENCY</th>
                <th>IMPACT</th>
                <th>EVENT TITLE</th>
                <th>PREPARATION NOTE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${
                events.length
                  ? events
                      .slice()
                      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                      .map(
                        (e, i) => `
                    <tr>
                      <td><b>${dateFmt(e.date)}</b></td>
                      <td>${escapeHtml(e.time || 'All Day')}</td>
                      <td><span class="pill neutral">${escapeHtml(e.currency || 'USD')}</span></td>
                      <td>
                        <span class="pill ${e.impact === 'High' ? 'loss' : e.impact === 'Medium' ? 'gold' : 'neutral'}">
                          ${escapeHtml(e.impact || 'High')}
                        </span>
                      </td>
                      <td><b>${escapeHtml(e.title)}</b></td>
                      <td><span style="color:#cbd6e2">${escapeHtml(e.note || '—')}</span></td>
                      <td>
                        <button class="btn small danger" onclick="NZ_Events.deleteEvent(${i})">Delete</button>
                      </td>
                    </tr>
                  `
                      )
                      .join('')
                  : '<tr><td colspan="7" class="empty">No macro events registered. Add major releases you are monitoring.</td></tr>'
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
          <div class="eyebrow">MACRO CALENDAR</div>
          <h2>Register Macro Economic Event</h2>
        </div>
        <button class="btn small ghost" onclick="NZ_UI.closeModal()">✕</button>
      </div>

      <form id="eventForm" class="form-grid">
        <div class="field">
          <label>EVENT TITLE</label>
          <input id="evTitle" required placeholder="e.g. US CPI, Non-Farm Payrolls, FOMC">
        </div>
        <div class="field">
          <label>RELEASE DATE</label>
          <input id="evDate" type="date" required value="${new Date().toISOString().slice(0, 10)}">
        </div>
        <div class="field">
          <label>TIME (LOCAL / UTC)</label>
          <input id="evTime" placeholder="e.g. 19:30 WIB or 13:30 UTC" value="19:30">
        </div>
        <div class="field">
          <label>CURRENCY / DOMAIN</label>
          <select id="evCurr">
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>JPY</option>
            <option>AUD</option>
            <option>CAD</option>
            <option>GLOBAL</option>
          </select>
        </div>
        <div class="field">
          <label>PROJECTED VOLATILITY IMPACT</label>
          <select id="evImpact">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div class="field">
          <label>PRE-NEWS RESTRICTION ACTION</label>
          <input id="evNote" placeholder="e.g. Close partials, move stop to BE 30m prior">
        </div>

        <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
          <button type="button" class="btn ghost" onclick="NZ_UI.closeModal()">Cancel</button>
          <button type="submit" class="btn primary">Register Event</button>
        </div>
      </form>
    `);

    $('eventForm').onsubmit = (e) => {
      e.preventDefault();
      const title = $('evTitle').value.trim();
      const date = $('evDate').value;
      const time = $('evTime').value.trim();
      const currency = $('evCurr').value;
      const impact = $('evImpact').value;
      const note = $('evNote').value.trim();

      const acc = window.NZ_Storage.getActiveAccount();
      if (!Array.isArray(acc.events)) acc.events = [];

      acc.events.push({ title, date, time, currency, impact, note });
      window.NZ_Storage.saveUsers();
      closeModal();
      render();
      toast('Macro economic event registered.');
    };
  }

  function deleteEvent(idx) {
    const acc = window.NZ_Storage.getActiveAccount();
    acc.events.splice(idx, 1);
    window.NZ_Storage.saveUsers();
    render();
    toast('Event removed.');
  }

  return {
    render,
    addModal,
    deleteEvent,
  };
})();
