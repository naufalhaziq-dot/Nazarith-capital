/**
 * NAZARITH CAPITAL V8.0 — PERFORMANCE REPORTS
 * Consolidated executive statistical review, setup effectiveness table,
 * and printable format for external auditors, prop firm verification, or personal archive.
 */

window.NZ_Reports = (function () {
  'use strict';

  const { $, escapeHtml, money, renderPageHead } = window.NZ_UI;
  const Calc = window.TradingCalc;

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const trades = acc.trades || [];
    const capital = Number(acc.capital) || 10000;

    const net = Calc.calcNetPnl(trades);
    const wr = Calc.calcWinRate(trades);
    const pf = Calc.calcProfitFactor(trades);
    const closed = Calc.getClosedTrades(trades);
    const expectancy = Calc.calcExpectancy(trades);
    const dd = Calc.calcDrawdown(trades, capital);
    const wl = Calc.calcWinLossAverages(trades);
    const { grossWin, grossLoss } = Calc.calcGrossMetrics(trades);

    const rVals = trades.map((t) => Calc.parseRMultiple(t.risk_reward || t.rr)).filter((n) => n > 0);
    const avgRR = rVals.length ? rVals.reduce((a, b) => a + b, 0) / rVals.length : 0;

    // Setups breakdown
    const setupsMap = {};
    trades.forEach((t) => {
      const s = t.setup || 'Unspecified';
      setupsMap[s] ??= [];
      setupsMap[s].push(t);
    });

    const content = `
      ${renderPageHead(
        'QUANTITATIVE AUDIT / PERIODIC REPORT',
        'Institutional Performance Report',
        'Consolidated quantitative audit of realized trades, risk parameters, and methodology effectiveness.',
        `<button class="btn primary small" onclick="window.print()">🖨 Print / Export PDF</button>`
      )}

      <!-- Primary Report Stats -->
      <div class="grid stats">
        <div class="stat">
          <div class="label">WIN RATE</div>
          <div class="value">${wr.toFixed(2)}%</div>
          <div class="sub">${wl.winCount} wins / ${closed.length} closed trades</div>
        </div>
        <div class="stat">
          <div class="label">PROFIT FACTOR</div>
          <div class="value">${pf === Infinity ? '∞' : pf.toFixed(2)}</div>
          <div class="sub">Gross Profit / Gross Loss</div>
        </div>
        <div class="stat">
          <div class="label">EXPECTANCY</div>
          <div class="value ${expectancy >= 0 ? 'positive' : 'negative'}">${money(expectancy)}</div>
          <div class="sub">Average return per closed trade</div>
        </div>
        <div class="stat">
          <div class="label">MAX DRAWDOWN</div>
          <div class="value negative">${dd.maxDrawdownPct.toFixed(2)}%</div>
          <div class="sub">${money(dd.maxDrawdownCash)} peak-to-trough drop</div>
        </div>
      </div>

      <!-- Risk Profile & Setup Effectiveness -->
      <div class="grid two-col" style="margin-top:16px">
        <div class="card">
          <h3>Reward and Risk Profile</h3>
          <div class="list-item">
            <span>Gross Realized Profit</span>
            <b class="positive">+${money(grossWin)}</b>
          </div>
          <div class="list-item">
            <span>Gross Realized Loss</span>
            <b class="negative">-${money(grossLoss)}</b>
          </div>
          <div class="list-item">
            <span>Average Winning Trade</span>
            <b>${money(wl.avgWin)}</b>
          </div>
          <div class="list-item">
            <span>Average Losing Trade</span>
            <b>-${money(wl.avgLoss)}</b>
          </div>
          <div class="list-item">
            <span>Average Realized R:R</span>
            <b>${avgRR ? avgRR.toFixed(2) + 'R' : '—'}</b>
          </div>
          <div class="list-item">
            <span>Total Realized Net Return</span>
            <b class="${net >= 0 ? 'positive' : 'negative'}"><b>${net >= 0 ? '+' : ''}${money(net)}</b></b>
          </div>
        </div>

        <div class="card">
          <h3>Setup Effectiveness Matrix</h3>
          ${
            Object.keys(setupsMap).length
              ? Object.entries(setupsMap)
                  .map(([name, arr]) => {
                    const c = Calc.getClosedTrades(arr);
                    const w = c.filter((t) => String(t.result).toLowerCase() === 'win').length;
                    const setupWr = c.length ? (w / c.length) * 100 : 0;
                    const pnl = Calc.calcNetPnl(arr);

                    return `
                      <div class="list-item">
                        <div>
                          <b>${escapeHtml(name)}</b>
                          <small style="color:var(--muted);display:block">
                            ${arr.length} trades · ${setupWr.toFixed(1)}% win rate
                          </small>
                        </div>
                        <b class="${pnl >= 0 ? 'positive' : 'negative'}">${pnl >= 0 ? '+' : ''}${money(pnl)}</b>
                      </div>
                    `;
                  })
                  .join('')
              : '<div class="empty">No setup execution data recorded.</div>'
          }
        </div>
      </div>

      <!-- Methodology Note -->
      <div class="card" style="margin-top:16px">
        <h3>Methodology & Institutional Standards</h3>
        <p class="muted" style="font-size:11.5px;line-height:1.8">
          All performance metrics are calculated strictly from closed, realized trades. 
          Open positions and Breakeven trades (where Net P&L = 0) are excluded from the Win Rate denominator to prevent statistical distortion. 
          Profit factor is the ratio of gross positive realized returns to absolute gross negative realized returns. 
          Maximum drawdown is calculated continuously from the highest historical equity curve peak. 
          Past performance is an audit of prior discipline and does not constitute a forward guarantee.
        </p>
      </div>
    `;

    $('main').innerHTML = content;
  }

  return {
    render,
  };
})();
