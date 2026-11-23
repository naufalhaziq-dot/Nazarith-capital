/**
 * NAZARITH CAPITAL V8.0 — RISK MANAGEMENT INTELLIGENCE
 * Multi-Asset Position Size Calculator, Daily/Weekly Loss Limit Guardrails,
 * Maximum Drawdown Alarms, Risk of Ruin Analysis, and Capital Preservation.
 */

window.NZ_Risk = (function () {
  'use strict';

  const { $, escapeHtml, money, renderPageHead, toast } = window.NZ_UI;
  const Calc = window.TradingCalc;

  // Instrument specifications preset
  const PRESETS = {
    'EURUSD': { name: 'EUR/USD (Forex Standard)', unitValue: 10, multiplier: 1, type: 'Forex' },
    'GBPUSD': { name: 'GBP/USD (Forex Standard)', unitValue: 10, multiplier: 1, type: 'Forex' },
    'USDJPY': { name: 'USD/JPY (Forex JPY Pair)', unitValue: 9.2, multiplier: 1, type: 'Forex' },
    'XAUUSD': { name: 'XAU/USD Gold (100 oz contract)', unitValue: 10, multiplier: 1, type: 'Commodities' },
    'US30': { name: 'US30 / Dow Jones Index', unitValue: 1, multiplier: 1, type: 'Indices' },
    'NAS100': { name: 'NAS100 / Nasdaq Index', unitValue: 1, multiplier: 1, type: 'Indices' },
    'BTCUSD': { name: 'BTC/USD Bitcoin (1 Token)', unitValue: 1, multiplier: 1, type: 'Crypto' },
  };

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const trades = acc.trades || [];
    const capital = Number(acc.capital) || 10000;
    const policy = acc.riskPolicy || { dailyLimit: 2, weeklyLimit: 5, maxRisk: 1, maxDrawdown: 10 };

    // Calculate today's losses
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTrades = trades.filter((t) => (t.trade_date || t.date) === todayStr);
    const todayPnl = todayTrades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
    const todayLossPct = capital > 0 && todayPnl < 0 ? (Math.abs(todayPnl) / capital) * 100 : 0;

    // Check breach of limits
    const isDailyLimitBreached = todayLossPct >= (policy.dailyLimit || 2);
    const dd = Calc.calcDrawdown(trades, capital);
    const isDrawdownBreached = dd.maxDrawdownPct >= (policy.maxDrawdown || 10);

    // Risk of ruin calculation
    const wl = Calc.calcWinLossAverages(trades);
    const wr = Calc.calcWinRate(trades);
    const ror = Calc.calcRiskOfRuin({
      winRatePercent: wr,
      avgWin: wl.avgWin,
      avgLoss: wl.avgLoss,
      riskPercent: policy.maxRisk || 0.5,
    });

    const content = `
      ${renderPageHead(
        'CAPITAL PRESERVATION / EXPOSURE CONTROL',
        'Risk Management Intelligence',
        'Mathematical position sizing, circuit breakers, loss-limit monitoring, and ruin probability safeguards.'
      )}

      <!-- Circuit Breaker Warning Banners if Breached -->
      ${
        isDailyLimitBreached
          ? `
        <div class="risk-warning-banner">
          <span style="font-size:18px">⚠️</span>
          <div>
            <b>DAILY LOSS LIMIT BREACHED:</b>
            Realized loss today is ${todayLossPct.toFixed(2)}% (${money(todayPnl)}), exceeding your ${policy.dailyLimit}% limit.
            Trading for today should be halted immediately according to your written risk plan.
          </div>
        </div>
      `
          : ''
      }

      ${
        isDrawdownBreached
          ? `
        <div class="risk-warning-banner">
          <span style="font-size:18px">🛑</span>
          <div>
            <b>MAXIMUM DRAWDOWN LIMIT WARNING:</b>
            Current drawdown of ${dd.maxDrawdownPct.toFixed(2)}% exceeds your institutional threshold of ${policy.maxDrawdown}%.
            Cut position size in half until account equity recovers.
          </div>
        </div>
      `
          : ''
      }

      <!-- Risk KPI Summary -->
      <div class="grid stats">
        <div class="stat">
          <div class="label">CAPITAL PRESERVATION GAUGE</div>
          <div class="value ${ror > 10 ? 'negative' : 'positive'}">
            ${ror <= 1 ? 'Optimal (Tier 1)' : ror <= 10 ? 'Moderate (Tier 2)' : 'High Risk'}
          </div>
          <div class="sub">Account Resilience: ${Math.max(0, 100 - ror).toFixed(1)}%</div>
        </div>
        <div class="stat">
          <div class="label">RISK OF RUIN (ESTIMATE)</div>
          <div class="value ${ror > 5 ? 'negative' : 'positive'}">${ror.toFixed(2)}%</div>
          <div class="sub">Vince-Kaufman probability model</div>
        </div>
        <div class="stat">
          <div class="label">DAILY LOSS EXPOSURE</div>
          <div class="value ${todayPnl < 0 ? 'negative' : 'positive'}">${todayLossPct.toFixed(2)}% / ${policy.dailyLimit}%</div>
          <div class="sub">Today P&L: ${money(todayPnl)}</div>
        </div>
        <div class="stat">
          <div class="label">MAX DRAWDOWN POLICY</div>
          <div class="value ${dd.maxDrawdownPct > policy.maxDrawdown ? 'negative' : 'positive'}">
            ${dd.maxDrawdownPct.toFixed(1)}% / ${policy.maxDrawdown}%
          </div>
          <div class="sub">Threshold set in policy</div>
        </div>
      </div>

      <!-- Position Sizing Calculator & Real-Time Calculation -->
      <div class="grid two-col" style="margin-top:16px">
        <div class="card">
          <h3>Institutional Position Sizing Calculator</h3>
          <p class="muted" style="font-size:11px;margin-bottom:14px">Calculate lot size based on account equity, risk percentage, and pip/point invalidation distance.</p>

          <div class="form-grid">
            <div class="field">
              <label>PRESET INSTRUMENT</label>
              <select id="rPreset" onchange="NZ_Risk.applyPreset(this.value)">
                ${Object.keys(PRESETS)
                  .map((k) => `<option value="${k}">${escapeHtml(PRESETS[k].name)}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="field">
              <label>ACCOUNT EQUITY ($)</label>
              <input id="rEquity" type="number" step="100" value="${capital}" oninput="NZ_Risk.calculate()">
            </div>
            <div class="field">
              <label>RISK PER TRADE (%)</label>
              <input id="rPercent" type="number" step="0.1" value="${policy.maxRisk || 0.5}" oninput="NZ_Risk.calculate()">
            </div>
            <div class="field">
              <label>ENTRY PRICE</label>
              <input id="rEntry" type="number" step="any" value="2650.00" oninput="NZ_Risk.calculate()">
            </div>
            <div class="field">
              <label>STOP LOSS PRICE</label>
              <input id="rStop" type="number" step="any" value="2642.00" oninput="NZ_Risk.calculate()">
            </div>
            <div class="field">
              <label>TAKE PROFIT TARGET</label>
              <input id="rTarget" type="number" step="any" value="2674.00" oninput="NZ_Risk.calculate()">
            </div>
            <div class="field" style="grid-column:1/-1">
              <label>PIP / POINT VALUE PER LOT IN USD</label>
              <input id="rValue" type="number" step="any" value="10" oninput="NZ_Risk.calculate()">
            </div>
          </div>

          <div style="margin-top:16px;display:flex;justify-content:flex-end">
            <button class="btn primary" onclick="NZ_Risk.calculate()">Recalculate Position</button>
          </div>
        </div>

        <!-- Calculation Diagnostic Result Card -->
        <div class="card">
          <h3>Calculated Execution Parameters</h3>
          <div class="detail-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0">
            <div style="background:#0c1520;padding:12px;border-radius:var(--radius)">
              <small class="muted" style="display:block;font-size:9px">CAPITAL AT RISK</small>
              <b id="riskCash" style="font-size:18px">—</b>
            </div>
            <div style="background:#0c1520;padding:12px;border-radius:var(--radius)">
              <small class="muted" style="display:block;font-size:9px">RECOMMENDED LOT SIZE</small>
              <b id="lotSize" style="font-size:18px;color:var(--blue)">—</b>
            </div>
            <div style="background:#0c1520;padding:12px;border-radius:var(--radius)">
              <small class="muted" style="display:block;font-size:9px">RISK : REWARD RATIO</small>
              <b id="riskReward" style="font-size:18px">—</b>
            </div>
            <div style="background:#0c1520;padding:12px;border-radius:var(--radius)">
              <small class="muted" style="display:block;font-size:9px">TARGET CASH PROFIT</small>
              <b id="targetCash" style="font-size:18px;color:var(--green)">—</b>
            </div>
          </div>

          <p class="note" id="riskWarning" style="margin-top:14px">
            Adjust pip/point values according to your broker's contract specification and leverage conditions before executing.
          </p>
        </div>
      </div>

      <!-- Institutional Risk Policy Settings -->
      <div class="card" style="margin-top:16px">
        <h3>Account Risk Policy & Circuit Breakers</h3>
        <p class="muted" style="font-size:11px;margin-bottom:16px">Configure hard safety thresholds for this specific account.</p>

        <form id="riskPolicyForm" class="form-grid">
          <div class="field">
            <label>DAILY LOSS LIMIT (%)</label>
            <input id="polDaily" type="number" step="0.5" value="${policy.dailyLimit || 2}">
          </div>
          <div class="field">
            <label>WEEKLY LOSS LIMIT (%)</label>
            <input id="polWeekly" type="number" step="0.5" value="${policy.weeklyLimit || 5}">
          </div>
          <div class="field">
            <label>MAX DRAWDOWN LIMIT (%)</label>
            <input id="polDrawdown" type="number" step="1" value="${policy.maxDrawdown || 10}">
          </div>
          <div class="field">
            <label>MAX RISK PER TRADE (%)</label>
            <input id="polRisk" type="number" step="0.1" value="${policy.maxRisk || 1}">
          </div>
          <div style="grid-column:1/-1;display:flex;justify-content:flex-end;margin-top:10px">
            <button type="submit" class="btn primary">Update Risk Policy</button>
          </div>
        </form>
      </div>
    `;

    $('main').innerHTML = content;
    calculate();

    const form = $('riskPolicyForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const active = window.NZ_Storage.getActiveAccount();
        active.riskPolicy = {
          dailyLimit: Number($('polDaily').value) || 2,
          weeklyLimit: Number($('polWeekly').value) || 5,
          maxDrawdown: Number($('polDrawdown').value) || 10,
          maxRisk: Number($('polRisk').value) || 1,
        };
        window.NZ_Storage.saveUsers();
        toast('Risk policy rules saved for this account.');
        render();
      };
    }
  }

  function applyPreset(symbol) {
    const p = PRESETS[symbol];
    if (!p) return;
    if ($('rValue')) $('rValue').value = p.unitValue;
    calculate();
  }

  function calculate() {
    const val = (id) => Number($(id)?.value) || 0;
    const eq = val('rEquity');
    const pct = val('rPercent');
    const entry = val('rEntry');
    const stop = val('rStop');
    const target = val('rTarget');
    const unit = val('rValue');

    const res = Calc.calcPositionSize({
      equity: eq,
      riskPercent: pct,
      entry,
      stop,
      target,
      unitValue: unit,
    });

    if ($('riskCash')) $('riskCash').textContent = money(res.cashAtRisk);
    if ($('lotSize')) $('lotSize').textContent = res.isValid ? res.lotSize.toFixed(2) + ' Lots' : '—';
    if ($('riskReward')) $('riskReward').textContent = res.isValid ? res.rewardRiskRatio.toFixed(2) + 'R' : '—';
    if ($('targetCash')) $('targetCash').textContent = res.isValid ? money(res.targetCashProfit) : '—';

    if ($('riskWarning')) {
      $('riskWarning').textContent = res.isValid
        ? `Valid lot sizing. Risk: ${money(res.cashAtRisk)} (${pct}%). Ensure broker tick value corresponds to $${unit}.`
        : 'Ensure entry price and stop loss price are distinct positive numbers.';
    }
  }

  return {
    render,
    applyPreset,
    calculate,
  };
})();
