/**
 * NAZARITH CAPITAL V8.0 — TRADING CALENDAR & DAILY REVIEW
 * Preserved & elevated from V3.0: Daily color-coded profit/loss grid,
 * month navigation, monthly KPIs, and chronological daily breakdowns.
 */

window.NZ_Calendar = (function () {
  'use strict';

  const { $, escapeHtml, money, dateFmt, renderPageHead } = window.NZ_UI;

  let currentCalDate = new Date();

  function pnlByDateMap(trades) {
    const map = {};
    trades.forEach((t) => {
      const dStr = t.trade_date || t.date;
      if (!dStr) return;
      map[dStr] = (map[dStr] || 0) + (Number(t.pnl) || 0);
    });
    return map;
  }

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const trades = acc.trades || [];
    const map = pnlByDateMap(trades);

    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayIndex = (firstDay.getDay() + 6) % 7; // Monday = 0
    const totalDays = new Date(year, month + 1, 0).getDate();

    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthTrades = trades.filter((t) => {
      const dStr = t.trade_date || t.date;
      return dStr && dStr.startsWith(monthPrefix);
    });

    const monthPnl = monthTrades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
    const monthClosed = monthTrades.filter((t) => ['win', 'loss'].includes(String(t.result).toLowerCase()));
    const monthWins = monthClosed.filter((t) => String(t.result).toLowerCase() === 'win').length;
    const monthWr = monthClosed.length ? (monthWins / monthClosed.length) * 100 : 0;
    const activeDaysCount = new Set(monthTrades.map((t) => t.trade_date || t.date)).size;

    const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const cells = [];

    // Blank leading cells
    for (let i = 0; i < startDayIndex; i++) {
      cells.push('<div class="nc2-day muted-day"></div>');
    }

    // Actual calendar days
    for (let d = 1; d <= totalDays; d++) {
      const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const v = map[dayKey];
      const cls = v > 0 ? 'profit' : v < 0 ? 'lossday' : '';

      cells.push(`
        <div class="nc2-day ${cls}">
          <small>${d}</small>
          <b class="${v > 0 ? 'positive' : v < 0 ? 'negative' : 'muted'}">
            ${v != null ? (v >= 0 ? '+' : '') + money(v) : '—'}
          </b>
        </div>
      `);
    }

    // Trailing cells
    while (cells.length % 7) {
      cells.push('<div class="nc2-day muted-day"></div>');
    }

    const monthTitle = currentCalDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Daily breakdown groups
    const dailyGroups = {};
    monthTrades.forEach((t) => {
      const d = t.trade_date || t.date;
      dailyGroups[d] ??= { pnl: 0, count: 0 };
      dailyGroups[d].pnl += Number(t.pnl) || 0;
      dailyGroups[d].count++;
    });

    const sortedDays = Object.entries(dailyGroups).sort((a, b) => b[0].localeCompare(a[0]));

    const content = `
      ${renderPageHead(
        'EXECUTION HISTORY / CHRONOLOGICAL CALENDAR',
        'Trading Calendar',
        'Visualize daily consistency, execution frequency, and monthly profit realization.',
        `
        <div style="display:flex;gap:6px">
          <button class="btn small ghost" onclick="NZ_Calendar.changeMonth(-1)">◀ Prev</button>
          <button class="btn small ghost" onclick="NZ_Calendar.resetMonth()">Current</button>
          <button class="btn small ghost" onclick="NZ_Calendar.changeMonth(1)">Next ▶</button>
        </div>
        `
      )}

      <!-- Month KPIs -->
      <div class="grid stats">
        <div class="stat">
          <div class="label">MONTHLY REALIZED P&L</div>
          <div class="value ${monthPnl >= 0 ? 'positive' : 'negative'}">${monthPnl >= 0 ? '+' : ''}${money(monthPnl)}</div>
          <div class="sub">${monthTrades.length} trades in ${monthTitle}</div>
        </div>
        <div class="stat">
          <div class="label">ACTIVE TRADING DAYS</div>
          <div class="value">${activeDaysCount} Days</div>
          <div class="sub">Sessions with realized executions</div>
        </div>
        <div class="stat">
          <div class="label">MONTHLY WIN RATE</div>
          <div class="value">${monthWr.toFixed(1)}%</div>
          <div class="sub">${monthWins} wins / ${monthClosed.length} closed trades</div>
        </div>
        <div class="stat">
          <div class="label">AVERAGE DAILY RETURN</div>
          <div class="value ${monthPnl >= 0 ? 'positive' : 'negative'}">
            ${money(activeDaysCount ? monthPnl / activeDaysCount : 0)}
          </div>
          <div class="sub">Per active session</div>
        </div>
      </div>

      <!-- Calendar Day Grid -->
      <div class="card" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h3>${monthTitle}</h3>
          <span class="muted" style="font-size:10px">Green = Positive Day · Red = Negative Day</span>
        </div>

        <div class="nc2-calendar">
          ${dayLabels.map((l) => `<div style="text-align:center;color:var(--muted);font-size:9px;padding:6px;font-weight:700">${l}</div>`).join('')}
          ${cells.join('')}
        </div>
      </div>

      <!-- Chronological Daily Realizations -->
      <div class="card" style="margin-top:16px">
        <h3>Daily Execution Log (${monthTitle})</h3>
        ${
          sortedDays.length
            ? sortedDays
                .map(
                  ([d, x]) => `
              <div class="list-item">
                <span><b>${dateFmt(d)}</b> · ${x.count} recorded trades</span>
                <b class="${x.pnl >= 0 ? 'positive' : 'negative'}">${x.pnl >= 0 ? '+' : ''}${money(x.pnl)}</b>
              </div>
            `
                )
                .join('')
            : '<div class="empty">No trades recorded during this month.</div>'
        }
      </div>
    `;

    $('main').innerHTML = content;
  }

  function changeMonth(delta) {
    currentCalDate = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() + delta, 1);
    render();
  }

  function resetMonth() {
    currentCalDate = new Date();
    render();
  }

  return {
    render,
    changeMonth,
    resetMonth,
  };
})();
