/**
 * NAZARITH CAPITAL V8.0 — CAPITAL ALLOCATION & MULTI-ACCOUNT CONSOLIDATION
 * Preserved & elevated from V3.0: Compares isolated trading accounts without mixing journals,
 * tracks aggregate realized P&L, and displays capital concentration meters.
 */

window.NZ_Capital = (function () {
  'use strict';

  const { $, escapeHtml, money, renderPageHead } = window.NZ_UI;

  function render() {
    const accounts = window.NZ_Storage.getAccounts();
    const activeAcc = window.NZ_Storage.getActiveAccount();

    const totalStartingCapital = accounts.reduce((s, a) => s + (Number(a.capital) || 0), 0);
    const totalRealizedPnl = accounts.reduce(
      (s, a) => s + (a.trades || []).reduce((v, t) => v + (Number(t.pnl) || 0), 0),
      0
    );
    const totalPortfolioEquity = totalStartingCapital + totalRealizedPnl;

    const content = `
      ${renderPageHead(
        'PORTFOLIO OVERSIGHT / CAPITAL CONSOLIDATION',
        'Capital Allocation & Firm Exposure',
        'Compare your isolated trading accounts, monitor prop firm allocations, and track consolidated portfolio equity.',
        `<button class="btn primary" onclick="NZ_Accounts.openManager()">＋ Manage Accounts</button>`
      )}

      <!-- Portfolio Consolidation KPIs -->
      <div class="grid stats">
        <div class="stat">
          <div class="label">TOTAL STARTING CAPITAL</div>
          <div class="value">${money(totalStartingCapital)}</div>
          <div class="sub">${accounts.length} isolated accounts</div>
        </div>
        <div class="stat">
          <div class="label">AGGREGATE REALIZED P&L</div>
          <div class="value ${totalRealizedPnl >= 0 ? 'positive' : 'negative'}">
            ${totalRealizedPnl >= 0 ? '+' : ''}${money(totalRealizedPnl)}
          </div>
          <div class="sub">Sum across all portfolios</div>
        </div>
        <div class="stat">
          <div class="label">CONSOLIDATED EQUITY</div>
          <div class="value">${money(totalPortfolioEquity)}</div>
          <div class="sub">Starting capital + realized returns</div>
        </div>
        <div class="stat">
          <div class="label">ACTIVE WORKSPACE</div>
          <div class="value gold-text">${escapeHtml(activeAcc.name)}</div>
          <div class="sub">${escapeHtml(activeAcc.type || 'Personal')} Account</div>
        </div>
      </div>

      <!-- Account Allocation List -->
      <div class="card" style="margin-top:16px">
        <h3>Individual Account Allocations</h3>
        ${
          accounts
            .map((a) => {
              const pnl = (a.trades || []).reduce((s, t) => s + (Number(t.pnl) || 0), 0);
              const cap = Number(a.capital) || 0;
              const eq = cap + pnl;
              const isCurrent = a.id === activeAcc.id;

              return `
                <div class="list-item" style="padding:14px 0">
                  <div style="min-width:0">
                    <div style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px">
                      ${escapeHtml(a.name)}
                      ${isCurrent ? '<span class="pill gold" style="font-size:8px">ACTIVE</span>' : ''}
                    </div>
                    <small style="color:var(--muted);display:block;margin-top:4px">
                      ${escapeHtml(a.firm || 'Independent')} · ${escapeHtml(a.type || 'Account')} · ${(a.trades || []).length} trades recorded
                    </small>
                  </div>
                  <div style="text-align:right">
                    <b style="font-size:14px">${money(eq)}</b>
                    <div class="${pnl >= 0 ? 'positive' : 'negative'}" style="font-size:10px">
                      ${pnl >= 0 ? '+' : ''}${money(pnl)} P&L
                    </div>
                  </div>
                </div>
              `;
            })
            .join('')
        }
      </div>

      <!-- Capital Concentration Meters -->
      <div class="card" style="margin-top:16px">
        <h3>Capital Concentration Breakdown</h3>
        <p class="muted" style="font-size:11px;margin-bottom:14px">Relative capital distribution across independent prop firms and personal brokerages.</p>

        ${
          accounts
            .map((a) => {
              const cap = Number(a.capital) || 0;
              const share = totalStartingCapital > 0 ? (cap / totalStartingCapital) * 100 : 0;
              return `
                <div style="margin:14px 0">
                  <div style="display:flex;justify-content:space-between;font-size:11px">
                    <span>${escapeHtml(a.name)} (${escapeHtml(a.firm || 'Independent')})</span>
                    <b>${share.toFixed(1)}% (${money(cap)})</b>
                  </div>
                  <div class="nc2-meter">
                    <span style="width:${share}%"></span>
                  </div>
                </div>
              `;
            })
            .join('')
        }
      </div>
    `;

    $('main').innerHTML = content;
  }

  return {
    render,
  };
})();
