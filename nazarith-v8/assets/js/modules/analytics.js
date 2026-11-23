/**
 * NAZARITH CAPITAL V8.0 — INSTITUTIONAL ANALYTICS ENGINE
 * Deep statistical matrices: Win Rate by Pair, Session, Day of Week, Strategy,
 * Drawdown Underwater Chart, Streaks, Expectancy, and Monthly Performance Heatmap.
 */

window.NZ_Analytics = (function () {
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
    const streaks = Calc.calcStreaks(trades);
    const wl = Calc.calcWinLossAverages(trades);
    const dd = Calc.calcDrawdown(trades, capital);

    // Grouping breakdowns
    const byPair = {};
    const bySession = {};
    const byDay = { Mon: [], Tue: [], Wed: Thu: [], Fri: [] };
    const byStrategy = {};

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    trades.forEach((t) => {
      // Pair
      const sym = (t.symbol || 'OTHER').toUpperCase();
      (byPair[sym] ??= []).push(t);

      // Session
      const sess = t.session || 'London';
      (bySession[sess] ??= []).push(t);

      // Strategy
      const strat = t.setup || 'SMC';
      (byStrategy[strat] ??= []).push(t);

      // Day of week
      const dStr = t.trade_date || t.date;
      if (dStr) {
        const d = new Date(`${dStr}T12:00:00`);
        if (!Number.isNaN(d.getTime())) {
          const dayName = dayNames[d.getDay()];
          if (byDay[dayName]) {
            byDay[dayName].push(t);
          } else {
            byDay[dayName] = [t];
          }
        }
      }
    });

    const content = `
      ${renderPageHead(
        'QUANTITATIVE AUDIT / STATISTICAL EDGE',
        'Institutional Analytics',
        'Deconstruct your trading edge across instruments, sessions, day-of-week, strategy confluences, and drawdown depth.'
      )}

      <!-- Primary Metrics Grid -->
      <div class="grid stats">
        <div class="stat">
          <div class="label">EXPECTANCY / TRADE</div>
          <div class="value ${expectancy >= 0 ? 'positive' : 'negative'}">${money(expectancy)}</div>
          <div class="sub">Average return per closed trade</div>
        </div>
        <div class="stat">
          <div class="label">AVG WIN VS AVG LOSS</div>
          <div class="value">${money(wl.avgWin)} <span class="muted" style="font-size:14px">/</span> <span class="negative">${money(wl.avgLoss)}</span></div>
          <div class="sub">Payoff Ratio: ${wl.winLossRatio === Infinity ? '∞' : wl.winLossRatio.toFixed(2)} : 1</div>
        </div>
        <div class="stat">
          <div class="label">MAX STREAKS</div>
          <div class="value"><span class="positive">${streaks.maxWinStreak}W</span> <span class="muted" style="font-size:14px">/</span> <span class="negative">${streaks.maxLossStreak}L</span></div>
          <div class="sub">Current streak: ${streaks.currentWinStreak ? streaks.currentWinStreak + ' Win' : streaks.currentLossStreak + ' Loss'}</div>
        </div>
        <div class="stat">
          <div class="label">PEAK DRAWDOWN</div>
          <div class="value negative">${dd.maxDrawdownPct.toFixed(2)}%</div>
          <div class="sub">${money(dd.maxDrawdownCash)} max peak-to-trough drop</div>
        </div>
      </div>

      <!-- Monthly Performance Heatmap -->
      <div class="card" style="margin-top:16px">
        <h3>Monthly Performance Heatmap <span class="muted" style="font-weight:400;font-size:10px">NET RETURN % PER MONTH</span></h3>
        <p class="muted" style="font-size:11px;margin-bottom:14px">Monthly net return percentage calculated from historical trade realizations against active capital.</p>
        ${renderHeatmap(trades, capital)}
      </div>

      <!-- Drawdown & Underwater Analysis -->
      <div class="card" style="margin-top:16px">
        <h3>Underwater Drawdown Analysis <span class="muted" style="font-weight:400;font-size:10px">DEPTH FROM HISTORICAL PEAK</span></h3>
        ${renderUnderwaterChart(trades, capital)}
      </div>

      <!-- Breakdown Matrices Grid -->
      <div class="grid two-col" style="margin-top:16px">
        <!-- Instrument / Pair Breakdown -->
        <div class="card">
          <h3>Performance by Instrument</h3>
          ${renderBreakdownTable(byPair)}
        </div>

        <!-- Session Breakdown -->
        <div class="card">
          <h3>Performance by Trading Session</h3>
          ${renderBreakdownTable(bySession)}
        </div>
      </div>

      <div class="grid two-col" style="margin-top:16px">
        <!-- Strategy Breakdown -->
        <div class="card">
          <h3>Performance by Strategy</h3>
          ${renderBreakdownTable(byStrategy)}
        </div>

        <!-- Day of Week Breakdown -->
        <div class="card">
          <h3>Performance by Day of Week</h3>
          ${renderBreakdownTable(byDay)}
        </div>
      </div>
    `;

    $('main').innerHTML = content;
  }

  function renderBreakdownTable(groupMap) {
    const keys = Object.keys(groupMap).filter((k) => groupMap[k] && groupMap[k].length > 0);
    if (!keys.length) {
      return '<div class="empty">No execution data for this breakdown.</div>';
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SEGMENT</th>
              <th>TRADES</th>
              <th>WIN RATE</th>
              <th>PROFIT FACTOR</th>
              <th>NET REALIZED P&L</th>
            </tr>
          </thead>
          <tbody>
            ${keys
              .map((k) => {
                const arr = groupMap[k];
                const wr = Calc.calcWinRate(arr);
                const pf = Calc.calcProfitFactor(arr);
                const pnl = Calc.calcNetPnl(arr);
                return `
                  <tr>
                    <td><b>${escapeHtml(k)}</b></td>
                    <td>${arr.length}</td>
                    <td>${wr.toFixed(1)}%</td>
                    <td>${pf === Infinity ? '∞' : pf.toFixed(2)}</td>
                    <td class="${pnl >= 0 ? 'positive' : 'negative'}"><b>${pnl >= 0 ? '+' : ''}${money(pnl)}</b></td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderHeatmap(trades, capital) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearsMap = {};

    trades.forEach((t) => {
      const dStr = t.trade_date || t.date;
      if (!dStr) return;
      const d = new Date(`${dStr}T12:00:00`);
      if (Number.isNaN(d.getTime())) return;

      const y = d.getFullYear();
      const m = d.getMonth();

      yearsMap[y] ??= Array(12).fill(0);
      yearsMap[y][m] += Number(t.pnl) || 0;
    });

    const currentYear = new Date().getFullYear();
    if (!yearsMap[currentYear]) {
      yearsMap[currentYear] = Array(12).fill(0);
    }

    const sortedYears = Object.keys(yearsMap).sort((a, b) => b - a);

    return `
      <div class="heatmap-wrap">
        <table class="heatmap-table">
          <thead>
            <tr>
              <th style="text-align:left">YEAR</th>
              ${months.map((m) => `<th>${m}</th>`).join('')}
              <th>YTD</th>
            </tr>
          </thead>
          <tbody>
            ${sortedYears
              .map((y) => {
                const monthValues = yearsMap[y];
                const ytdPnl = monthValues.reduce((a, b) => a + b, 0);
                const ytdPct = capital ? (ytdPnl / capital) * 100 : 0;

                return `
                  <tr>
                    <td style="text-align:left;font-weight:700">${y}</td>
                    ${monthValues
                      .map((val) => {
                        const pct = capital ? (val / capital) * 100 : 0;
                        let cellCls = 'neutral-cell';
                        if (pct > 5) cellCls = 'positive-high';
                        else if (pct > 2) cellCls = 'positive-med';
                        else if (pct > 0) cellCls = 'positive-light';
                        else if (pct < -5) cellCls = 'negative-high';
                        else if (pct < -2) cellCls = 'negative-med';
                        else if (pct < 0) cellCls = 'negative-light';

                        return `
                          <td class="heatmap-cell ${cellCls}" title="${money(val)}">
                            ${val === 0 ? '—' : (pct > 0 ? '+' : '') + pct.toFixed(1) + '%'}
                          </td>
                        `;
                      })
                      .join('')}
                    <td style="font-weight:700" class="${ytdPnl >= 0 ? 'positive' : 'negative'}">
                      ${ytdPnl >= 0 ? '+' : ''}${ytdPct.toFixed(1)}%
                    </td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderUnderwaterChart(trades, capital) {
    if (!trades.length) {
      return '<div class="empty">Not enough trade history to construct drawdown trajectory.</div>';
    }

    const sorted = [...trades].sort((a, b) => {
      const da = a.trade_date || a.date || '';
      const db = b.trade_date || b.date || '';
      return da.localeCompare(db);
    });

    const W = 760;
    const H = 160;
    const L = 50;
    const R = 20;
    const T = 10;
    const B = 25;
    const plotW = W - L - R;
    const plotH = H - T - B;

    let eq = capital;
    let peak = capital;
    const ddSeries = [0];

    sorted.forEach((t) => {
      eq += Number(t.pnl) || 0;
      if (eq > peak) peak = eq;
      const ddPct = peak > 0 ? ((peak - eq) / peak) * 100 : 0;
      ddSeries.push(ddPct);
    });

    const maxDd = Math.max(10, ...ddSeries);
    const step = plotW / Math.max(1, ddSeries.length - 1);

    const pathPoints = ddSeries.map((ddVal, i) => {
      const x = L + i * step;
      const y = T + (ddVal / maxDd) * plotH;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const areaPath = `${pathPoints.join(' ')} L${(L + (ddSeries.length - 1) * step).toFixed(1)},${T} L${L},${T} Z`;

    return `
      <div style="background:#0a111a;padding:12px;border:1px solid #233142;border-radius:var(--radius)">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Underwater drawdown chart" style="width:100%;height:auto">
          <!-- Baseline 0% line -->
          <line x1="${L}" y1="${T}" x2="${W - R}" y2="${T}" stroke="#53c99a" stroke-width="1.5"/>
          <text x="${L - 6}" y="${T + 4}" text-anchor="end" fill="#8294aa" font-size="9">0%</text>

          <!-- 50% max depth line -->
          <line x1="${L}" y1="${T + plotH / 2}" x2="${W - R}" y2="${T + plotH / 2}" stroke="#233244" stroke-dasharray="3 5"/>
          <text x="${L - 6}" y="${T + plotH / 2 + 4}" text-anchor="end" fill="#8294aa" font-size="9">-${(maxDd / 2).toFixed(1)}%</text>

          <!-- Max DD line -->
          <line x1="${L}" y1="${T + plotH}" x2="${W - R}" y2="${T + plotH}" stroke="#ee7777" stroke-dasharray="2 4" stroke-opacity="0.6"/>
          <text x="${L - 6}" y="${T + plotH + 4}" text-anchor="end" fill="#ee7777" font-size="9">-${maxDd.toFixed(1)}%</text>

          <!-- Underwater Area Fill -->
          <path d="${areaPath}" fill="rgba(238, 119, 119, 0.22)"/>
          <path d="${pathPoints.join(' ')}" fill="none" stroke="#ee7777" stroke-width="2"/>
        </svg>
      </div>
    `;
  }

  return {
    render,
  };
})();
