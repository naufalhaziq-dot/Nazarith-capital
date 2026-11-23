/**
 * NAZARITH CAPITAL V8.0 — ADVANCED PORTFOLIO INTELLIGENCE & EXECUTIVE DASHBOARD
 * Consolidated performance metrics, interactive SVG equity curve, and multi-period tracking.
 */

window.NZ_Portfolio = (function () {
  'use strict';

  const { $, escapeHtml, money, dateFmt, renderPageHead } = window.NZ_UI;
  const Calc = window.TradingCalc;

  let currentPeriod = 'monthly';

  function periodBuckets(period, trades = []) {
    const now = new Date();
    const list = [];
    const pad = (n) => String(n).padStart(2, '0');
    const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (period === 'daily') {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        list.push({ key: dateKey(d), label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` });
      }
    } else if (period === 'weekly') {
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      for (let i = 11; i >= 0; i--) {
        const d = new Date(monday);
        d.setDate(d.getDate() - 7 * i);
        list.push({ key: dateKey(d), label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` });
      }
    } else if (period === 'yearly') {
      for (let i = 4; i >= 0; i--) {
        const y = now.getFullYear() - i;
        list.push({ key: String(y), label: String(y) });
      }
    } else {
      // Monthly
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        list.push({
          key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`,
          label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        });
      }
    }

    const map = {};
    list.forEach((x) => (map[x.key] = { ...x, pnl: 0, count: 0, wins: 0, losses: 0 }));

    const keyFor = (t) => {
      const dStr = t.trade_date || t.date;
      if (!dStr) return null;
      const d = new Date(`${dStr}T12:00:00`);
      if (Number.isNaN(d.getTime())) return null;
      if (period === 'daily') return dateKey(d);
      if (period === 'weekly') {
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        return dateKey(d);
      }
      if (period === 'yearly') return String(d.getFullYear());
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    };

    trades.forEach((t) => {
      const k = keyFor(t);
      if (k && map[k]) {
        const pnl = Number(t.pnl) || 0;
        map[k].pnl += pnl;
        map[k].count++;
        const res = String(t.result || '').toLowerCase();
        if (res === 'win') map[k].wins++;
        if (res === 'loss') map[k].losses++;
      }
    });

    return list.map((x) => map[x.key]);
  }

  function renderEquityPanelHtml(trades, capital) {
    const buckets = periodBuckets(currentPeriod, trades);
    const totalPnl = buckets.reduce((a, b) => a + b.pnl, 0);
    const count = buckets.reduce((a, b) => a + b.count, 0);

    const W = 760;
    const H = 220;
    const L = 60;
    const R = 20;
    const T = 16;
    const B = 36;
    const plotW = W - L - R;
    const plotH = H - T - B;

    // Bar chart math
    const maxAbs = Math.max(1, ...buckets.map((b) => Math.abs(b.pnl)));
    const step = plotW / Math.max(1, buckets.length);
    const zero = T + plotH / 2;

    const bars = buckets
      .map((b, i) => {
        const h = (Math.abs(b.pnl) / maxAbs) * (plotH * 0.44);
        const x = L + i * step + step * 0.2;
        const y = b.pnl >= 0 ? zero - h : zero;
        const col = b.pnl >= 0 ? '#53c99a' : '#ee7777';
        return `
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(step * 0.6).toFixed(1)}" height="${Math.max(2, h).toFixed(1)}" rx="2" fill="${col}">
            <title>${escapeHtml(b.label)}: ${money(b.pnl)} (${b.count} trades)</title>
          </rect>
        `;
      })
      .join('');

    // Cumulative Line chart math
    const equityPoints = [];
    let running = capital;
    buckets.forEach((b, i) => {
      running += b.pnl;
      equityPoints.push([L + i * step + step / 2, running]);
    });

    const minEq = Math.min(capital, ...equityPoints.map((p) => p[1]));
    const maxEq = Math.max(capital, ...equityPoints.map((p) => p[1]));
    const range = Math.max(1, maxEq - minEq);
    const yEq = (v) => T + plotH - ((v - minEq) / range) * plotH;

    const path = equityPoints.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${yEq(p[1]).toFixed(1)}`).join(' ');
    const dots = equityPoints
      .map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${yEq(p[1]).toFixed(1)}" r="3" fill="#9dbbd8"><title>Equity: ${money(p[1])}</title></circle>`)
      .join('');

    const labels = buckets
      .map((b, i) => `<text x="${(L + i * step + step / 2).toFixed(1)}" y="${H - 12}" text-anchor="middle" fill="#8294aa" font-size="10">${escapeHtml(b.label)}</text>`)
      .join('');

    const grid = [0, 0.25, 0.5, 0.75, 1]
      .map((v) => {
        const y = T + plotH * v;
        const val = maxAbs * (0.5 - v) * 2;
        return `
          <line x1="${L}" y1="${y}" x2="${W - R}" y2="${y}" stroke="#233244" stroke-dasharray="3 5"/>
          <text x="${L - 8}" y="${y + 4}" text-anchor="end" fill="#8294aa" font-size="9">${money(val)}</text>
        `;
      })
      .join('');

    const lineGrid = [0, 0.25, 0.5, 0.75, 1]
      .map((v) => {
        const y = T + plotH * v;
        const val = minEq + range * (1 - v);
        return `
          <line x1="${L}" y1="${y}" x2="${W - R}" y2="${y}" stroke="#233244" stroke-dasharray="3 5"/>
          <text x="${L - 8}" y="${y + 4}" text-anchor="end" fill="#8294aa" font-size="9">${money(val)}</text>
        `;
      })
      .join('');

    const periodName = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }[currentPeriod];

    return `
      <div class="equity-panel">
        <div class="equity-toolbar">
          <div>
            <div class="eyebrow">EQUITY & PROFIT HISTOGRAM</div>
            <div style="font-size:13px;color:#9eafc3;margin-top:4px">${periodName} realization · ${count} recorded executions</div>
          </div>
          <div class="equity-tabs">
            ${[['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['yearly', 'Yearly']]
              .map(
                ([v, l]) =>
                  `<button class="btn small ${currentPeriod === v ? 'primary' : 'ghost'}" onclick="NZ_Portfolio.setPeriod('${v}')">${l}</button>`
              )
              .join('')}
          </div>
        </div>

        <div class="equity-kpis">
          <div><small>PERIOD NET REALIZED P&L</small><b class="${totalPnl >= 0 ? 'positive' : 'negative'}">${money(totalPnl)}</b></div>
          <div><small>TRADES IN PERIOD</small><b>${count}</b></div>
          <div><small>PROFITABLE BUCKETS</small><b>${buckets.filter((b) => b.pnl > 0).length} / ${buckets.length}</b></div>
          <div><small>STARTING CAPITAL</small><b>${money(capital)}</b></div>
        </div>

        <div class="equity-charts">
          <div class="equity-chart">
            <div class="chart-title">PERIOD REALIZED P&L (BAR CHART)</div>
            <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Realized profit bar chart">
              ${grid}
              <line x1="${L}" y1="${zero}" x2="${W - R}" y2="${zero}" stroke="#65778e"/>
              <g>${bars}</g>
              ${labels}
            </svg>
            <div class="chart-legend">
              <span><i style="background:#53c99a"></i> Realized Profit</span>
              <span><i style="background:#ee7777"></i> Realized Loss</span>
            </div>
          </div>

          <div class="equity-chart">
            <div class="chart-title">CUMULATIVE EQUITY TRAJECTORY (LINE CHART)</div>
            <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cumulative equity curve">
              ${lineGrid}
              <path d="${path}" fill="none" stroke="#9dbbd8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              ${dots}
              ${labels}
            </svg>
            <div class="chart-legend">
              <span><i style="background:#9dbbd8"></i> Account Equity ($)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function setPeriod(p) {
    currentPeriod = p;
    const el = $('equityContainer');
    if (el) {
      const acc = window.NZ_Storage.getActiveAccount();
      el.innerHTML = renderEquityPanelHtml(acc.trades || [], Number(acc.capital) || 10000);
    }
  }

  function currentPeriodTotals(period, trades) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const weekDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    weekDate.setDate(weekDate.getDate() - ((weekDate.getDay() + 6) % 7));
    const weekKey = `${weekDate.getFullYear()}-${pad(weekDate.getMonth() + 1)}-${pad(weekDate.getDate())}`;

    const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const yearKey = String(now.getFullYear());

    let pnl = 0;
    let count = 0;

    trades.forEach((t) => {
      const dStr = t.trade_date || t.date;
      if (!dStr) return;
      const d = new Date(`${dStr}T12:00:00`);
      if (Number.isNaN(d.getTime())) return;

      let key;
      if (period === 'daily') {
        key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      } else if (period === 'weekly') {
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      } else if (period === 'monthly') {
        key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      } else {
        key = String(d.getFullYear());
      }

      const target = period === 'daily' ? today : period === 'weekly' ? weekKey : period === 'monthly' ? monthKey : yearKey;
      if (key === target) {
        pnl += Number(t.pnl) || 0;
        count++;
      }
    });

    return { pnl, count };
  }

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const trades = acc.trades || [];
    const capital = Number(acc.capital) || 10000;

    const net = Calc.calcNetPnl(trades);
    const equity = capital + net;
    const wr = Calc.calcWinRate(trades);
    const pf = Calc.calcProfitFactor(trades);
    const closed = Calc.getClosedTrades(trades);
    const wins = trades.filter((t) => String(t.result).toLowerCase() === 'win');
    const losses = trades.filter((t) => String(t.result).toLowerCase() === 'loss');

    const ddData = Calc.calcDrawdown(trades, capital);
    const avgRisk = trades.length
      ? trades.reduce((a, t) => a + (Number(t.risk_percentage || t.risk) || 0), 0) / trades.length
      : 0;

    const rVals = trades.map((t) => Calc.parseRMultiple(t.risk_reward || t.rr)).filter((n) => n > 0);
    const avgRR = rVals.length ? rVals.reduce((a, b) => a + b, 0) / rVals.length : 0;

    const recent = [...trades]
      .sort((a, b) => (b.trade_date || b.date || '').localeCompare(a.trade_date || a.date || ''))
      .slice(0, 5);

    const accounts = window.NZ_Storage.getAccounts();
    const totalPortfolioCapital = accounts.reduce((s, a) => s + (Number(a.capital) || 0), 0);
    const totalPortfolioPnl = accounts.reduce(
      (s, a) => s + (a.trades || []).reduce((v, t) => v + (Number(t.pnl) || 0), 0),
      0
    );

    const content = `
      ${renderPageHead(
        'INSTITUTIONAL PLATFORM / PORTFOLIO INTELLIGENCE',
        'Executive Dashboard',
        'A consolidated multi-dimensional overview of your active trading performance, drawdown, and capital allocation.',
        `<button class="btn primary" onclick="NZ_Journal.openModal()">＋ New Trade Entry</button>`
      )}

      <!-- Primary KPI Stats Grid -->
      <div class="grid stats">
        <div class="stat">
          <div class="label">ACCOUNT EQUITY</div>
          <div class="value">${money(equity)}</div>
          <div class="sub">Starting: ${money(capital)} · ${money(net)} P&L</div>
        </div>
        <div class="stat">
          <div class="label">NET REALIZED P&L</div>
          <div class="value ${net >= 0 ? 'positive' : 'negative'}">${net >= 0 ? '+' : ''}${money(net)}</div>
          <div class="sub">${capital ? ((net / capital) * 100).toFixed(2) : '0.00'}% return on capital</div>
        </div>
        <div class="stat">
          <div class="label">WIN RATE (CLOSED)</div>
          <div class="value">${wr.toFixed(2)}%</div>
          <div class="sub">${wins.length} wins / ${closed.length} closed trades</div>
        </div>
        <div class="stat">
          <div class="label">PROFIT FACTOR</div>
          <div class="value">${pf === Infinity ? '∞' : pf.toFixed(2)}</div>
          <div class="sub">Gross Win / Gross Loss</div>
        </div>
      </div>

      <!-- Equity Chart Panel -->
      <div class="card" style="margin-top:16px">
        <div id="equityContainer">
          ${renderEquityPanelHtml(trades, capital)}
        </div>
      </div>

      <!-- Secondary Metrics: Trading Statistics & Period Summary -->
      <div class="grid two-col" style="margin-top:16px">
        <div class="card">
          <h3>Trading Statistics <span class="muted" style="font-weight:400;font-size:10px">ALL TIME</span></h3>
          <div class="list-item">
            <span>Average Risk / Trade</span>
            <b>${trades.length ? avgRisk.toFixed(2) + '%' : '—'}</b>
          </div>
          <div class="list-item">
            <span>Average Realized R:R</span>
            <b>${avgRR ? avgRR.toFixed(2) + 'R' : '—'}</b>
          </div>
          <div class="list-item">
            <span>Largest Realized Win</span>
            <b class="positive">${wins.length ? money(Math.max(...wins.map((t) => Number(t.pnl) || 0))) : '—'}</b>
          </div>
          <div class="list-item">
            <span>Largest Realized Loss</span>
            <b class="negative">${losses.length ? money(Math.min(...losses.map((t) => Number(t.pnl) || 0))) : '—'}</b>
          </div>
          <div class="list-item">
            <span>Maximum Drawdown</span>
            <b>${ddData.maxDrawdownPct.toFixed(2)}% (${money(ddData.maxDrawdownCash)})</b>
          </div>
        </div>

        <div class="card">
          <h3>Period Realization <span class="muted" style="font-weight:400;font-size:10px">CURRENT HORIZON</span></h3>
          ${[['Today', 'daily'], ['This week', 'weekly'], ['This month', 'monthly'], ['This year', 'yearly']]
            .map(([label, period]) => {
              const { pnl: v, count: n } = currentPeriodTotals(period, trades);
              return `
                <div class="list-item">
                  <span>${label} · ${n} executions</span>
                  <b class="${v >= 0 ? 'positive' : 'negative'}">${v >= 0 ? '+' : ''}${money(v)}</b>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>

      <!-- Multi-Account Portfolio Consolidation Snapshot -->
      <div class="card" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h3>Firm & Account Allocation <span class="muted" style="font-weight:400;font-size:10px">${accounts.length} ACCOUNTS CONSOLIDATED</span></h3>
          <button class="btn small ghost" onclick="NZ_Accounts.openManager()">MANAGE ALL ACCOUNTS</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ACCOUNT</th>
                <th>BROKER / PROP FIRM</th>
                <th>CLASSIFICATION</th>
                <th>STARTING</th>
                <th>REALIZED P&L</th>
                <th>CURRENT EQUITY</th>
                <th>PORTFOLIO SHARE</th>
              </tr>
            </thead>
            <tbody>
              ${accounts
                .map((a) => {
                  const pnl = (a.trades || []).reduce((s, t) => s + (Number(t.pnl) || 0), 0);
                  const cap = Number(a.capital) || 0;
                  const curEq = cap + pnl;
                  const share = totalPortfolioCapital > 0 ? (cap / totalPortfolioCapital) * 100 : 0;
                  const isCurrent = a.id === acc.id;
                  return `
                    <tr style="${isCurrent ? 'background:rgba(23, 37, 53, 0.45);' : ''}">
                      <td><b>${escapeHtml(a.name)}</b> ${isCurrent ? '<span class="pill gold" style="font-size:8px">ACTIVE</span>' : ''}</td>
                      <td>${escapeHtml(a.firm || 'Independent')}</td>
                      <td><span class="pill neutral">${escapeHtml(a.type || 'Personal')}</span></td>
                      <td>${money(cap)}</td>
                      <td class="${pnl >= 0 ? 'positive' : 'negative'}">${pnl >= 0 ? '+' : ''}${money(pnl)}</td>
                      <td><b>${money(curEq)}</b></td>
                      <td>${share.toFixed(1)}%</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Transactions Table -->
      <div class="card" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h3>Recent Executions</h3>
          <button class="btn small ghost" onclick="NZ_App.navigate('journal')">VIEW FULL TRADE JOURNAL ↗</button>
        </div>
        ${recent.length ? window.NZ_Journal.renderTable(recent, false) : '<div class="empty">No executions recorded in this account yet.</div>'}
      </div>
    `;

    $('main').innerHTML = content;
  }

  return {
    render,
    setPeriod,
  };
})();
