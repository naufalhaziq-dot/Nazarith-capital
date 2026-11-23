/**
 * NAZARITH CAPITAL V8.0 — QUANTITATIVE TRADING ENGINE & CALCULATIONS
 * Pure, reliable, and mathematically tested financial calculations.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TradingCalc = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const outcome = (t) => String(t.result || '').trim().toLowerCase();

  /**
   * Filter trades that are closed for win rate calculation.
   * Open trades and Breakeven trades are strictly excluded from the win-rate denominator.
   */
  function getClosedTrades(trades = []) {
    return trades.filter((t) => ['win', 'loss'].includes(outcome(t)));
  }

  /**
   * Win rate calculation: (winning trades / total closed trades) * 100%
   */
  function calcWinRate(trades = []) {
    const closed = getClosedTrades(trades);
    if (!closed.length) return 0;
    const wins = closed.filter((t) => outcome(t) === 'win').length;
    return (wins / closed.length) * 100;
  }

  /**
   * Net Realized P&L from closed & realized transactions
   */
  function calcNetPnl(trades = []) {
    return trades.reduce((acc, t) => {
      // Exclude purely open trades with null/undefined PnL unless explicitly realized
      const val = Number(t.pnl);
      return acc + (Number.isFinite(val) ? val : 0);
    }, 0);
  }

  /**
   * Gross profit and gross loss
   */
  function calcGrossMetrics(trades = []) {
    let grossWin = 0;
    let grossLoss = 0;
    trades.forEach((t) => {
      const pnl = Number(t.pnl) || 0;
      if (pnl > 0) grossWin += pnl;
      else if (pnl < 0) grossLoss += Math.abs(pnl);
    });
    return { grossWin, grossLoss };
  }

  /**
   * Profit Factor: gross profit / absolute gross loss
   */
  function calcProfitFactor(trades = []) {
    const { grossWin, grossLoss } = calcGrossMetrics(trades);
    if (grossLoss === 0) {
      return grossWin > 0 ? Infinity : 0;
    }
    return grossWin / grossLoss;
  }

  /**
   * Expectancy: average expected return per closed trade
   */
  function calcExpectancy(trades = []) {
    const closed = trades.filter((t) => ['win', 'loss', 'breakeven'].includes(outcome(t)));
    if (!closed.length) return 0;
    const net = closed.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0);
    return net / closed.length;
  }

  /**
   * Chronological Maximum Drawdown calculation:
   * Peak-to-trough decline from highest historical equity curve peak.
   */
  function calcDrawdown(trades = [], startingCapital = 10000) {
    const capital = Number(startingCapital) || 10000;
    let currentEquity = capital;
    let peakEquity = capital;
    let maxDrawdownPct = 0;
    let maxDrawdownCash = 0;

    // Chronologically sorted
    const sorted = [...trades].sort((a, b) => {
      const da = a.date || a.trade_date || '';
      const db = b.date || b.trade_date || '';
      return da.localeCompare(db);
    });

    sorted.forEach((t) => {
      const pnl = Number(t.pnl) || 0;
      currentEquity += pnl;
      if (currentEquity > peakEquity) {
        peakEquity = currentEquity;
      }
      const decline = peakEquity - currentEquity;
      if (peakEquity > 0) {
        const declinePct = (decline / peakEquity) * 100;
        if (declinePct > maxDrawdownPct) {
          maxDrawdownPct = declinePct;
          maxDrawdownCash = decline;
        }
      }
    });

    const currentDrawdownPct = peakEquity > 0 ? ((peakEquity - currentEquity) / peakEquity) * 100 : 0;

    return {
      maxDrawdownPct,
      maxDrawdownCash,
      currentEquity,
      peakEquity,
      currentDrawdownPct: Math.max(0, currentDrawdownPct),
    };
  }

  /**
   * Maximum consecutive wins and consecutive losses
   */
  function calcStreaks(trades = []) {
    const sorted = [...trades].sort((a, b) => {
      const da = a.date || a.trade_date || '';
      const db = b.date || b.trade_date || '';
      return da.localeCompare(db);
    });

    let currentWinStreak = 0;
    let maxWinStreak = 0;
    let currentLossStreak = 0;
    let maxLossStreak = 0;

    sorted.forEach((t) => {
      const res = outcome(t);
      if (res === 'win') {
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
      } else if (res === 'loss') {
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
      }
    });

    return { maxWinStreak, maxLossStreak, currentWinStreak, currentLossStreak };
  }

  /**
   * Average Win vs Average Loss & Win/Loss Ratio
   */
  function calcWinLossAverages(trades = []) {
    const wins = trades.filter((t) => outcome(t) === 'win' || Number(t.pnl) > 0);
    const losses = trades.filter((t) => outcome(t) === 'loss' || Number(t.pnl) < 0);

    const grossWin = wins.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + (Number(t.pnl) || 0), 0));

    const avgWin = wins.length ? grossWin / wins.length : 0;
    const avgLoss = losses.length ? grossLoss / losses.length : 0;
    const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    return { avgWin, avgLoss, winLossRatio, winCount: wins.length, lossCount: losses.length };
  }

  /**
   * Extract numeric R-multiple values from trade records (e.g. "1:3" -> 3, "2.5R" -> 2.5)
   */
  function parseRMultiple(rrStr) {
    if (typeof rrStr === 'number') return rrStr;
    if (!rrStr) return 0;
    const str = String(rrStr).trim();
    if (str.includes(':')) {
      const parts = str.split(':');
      const r = parseFloat(parts[1]);
      const risk = parseFloat(parts[0]) || 1;
      return Number.isFinite(r) && risk > 0 ? r / risk : 0;
    }
    const clean = parseFloat(str.replace(/[^\d.-]/g, ''));
    return Number.isFinite(clean) ? clean : 0;
  }

  /**
   * Position Sizing and Lot Calculator:
   * Supports standard Forex (100,000 units), Gold / Commodities (100 oz), Indices, Crypto.
   */
  function calcPositionSize({
    equity = 10000,
    riskPercent = 0.5,
    entry = 0,
    stop = 0,
    target = 0,
    unitValue = 100, // Pip/Tick value per lot in account currency
    contractMultiplier = 1,
  }) {
    const eq = Number(equity) || 0;
    const riskPct = Number(riskPercent) || 0;
    const pEntry = Number(entry) || 0;
    const pStop = Number(stop) || 0;
    const pTarget = Number(target) || 0;
    const uVal = Number(unitValue) || 1;

    const stopDistance = Math.abs(pEntry - pStop);
    const targetDistance = Math.abs(pTarget - pEntry);
    const cashAtRisk = (eq * riskPct) / 100;

    const isValid = eq > 0 && riskPct > 0 && stopDistance > 0 && uVal > 0;
    let lotSize = 0;
    let rewardRiskRatio = 0;
    let targetCashProfit = 0;

    if (isValid) {
      lotSize = cashAtRisk / (stopDistance * uVal * (contractMultiplier || 1));
      rewardRiskRatio = stopDistance > 0 && targetDistance > 0 ? targetDistance / stopDistance : 0;
      targetCashProfit = cashAtRisk * rewardRiskRatio;
    }

    return {
      isValid,
      cashAtRisk,
      stopDistance,
      targetDistance,
      lotSize: Math.max(0, lotSize),
      rewardRiskRatio,
      targetCashProfit,
    };
  }

  /**
   * Risk of Ruin Estimation:
   * Based on Ralph Vince and Perry Kaufman statistical models.
   * Formula: RoR = ((1 - A) / (1 + A)) ^ U
   * where A = Advantage (Edge) = WinRate - LossRate * (AvgLoss/AvgWin)
   * U = Number of risk units (e.g. 100% / riskPercent)
   */
  function calcRiskOfRuin({ winRatePercent = 50, avgWin = 200, avgLoss = 100, riskPercent = 1 }) {
    const wr = Math.max(0, Math.min(100, Number(winRatePercent) || 0)) / 100;
    const lr = 1 - wr;
    const aw = Number(avgWin) || 1;
    const al = Number(avgLoss) || 1;
    const rp = Math.max(0.01, Number(riskPercent) || 1);

    if (aw <= 0 || al <= 0 || wr <= 0) return 100; // Certain ruin if no wins

    const payoffRatio = aw / al;
    const edge = wr - lr / payoffRatio;

    if (edge <= 0) {
      return 100.0; // Negative or zero mathematical expectancy = 100% ruin over infinite trials
    }

    const units = Math.max(1, 100 / rp);
    const p = wr;
    const q = lr;

    // Standard formula for equal units or payoff adjusted:
    const ratio = (q / (p * payoffRatio));
    if (ratio >= 1) return 100.0;

    const ror = Math.pow(ratio, units) * 100;
    return Math.min(100, Math.max(0, parseFloat(ror.toFixed(2))));
  }

  /**
   * Monte Carlo Simulation Engine:
   * Resamples actual historical trade returns over N iterations (e.g. 1,000 runs)
   * to project 5th percentile (worst case), 50th percentile (median), and 95th percentile (best case).
   */
  function runMonteCarlo({
    trades = [],
    initialCapital = 10000,
    iterations = 1000,
    simTradeLength = 50,
  }) {
    const returns = trades.map((t) => Number(t.pnl) || 0);

    // If fewer than 5 trades exist, return synthetic fallback projection
    if (returns.length < 3) {
      return {
        hasData: false,
        iterations: 0,
        curves: [],
        p5: initialCapital,
        p50: initialCapital,
        p95: initialCapital,
        maxSimDrawdown: 0,
        ruinProbability: 0,
      };
    }

    const simLength = Math.max(10, Math.min(200, simTradeLength || returns.length));
    const allTerminalEquities = [];
    const allCurves = [];
    let maxDrawdownSeen = 0;
    let ruinCount = 0;
    const ruinLevel = initialCapital * 0.5; // 50% capital destruction defined as ruin for challenge

    for (let iter = 0; iter < iterations; iter++) {
      let equity = initialCapital;
      let peak = initialCapital;
      const curve = [equity];

      for (let step = 0; step < simLength; step++) {
        // Randomly resample a trade return with replacement
        const randIndex = Math.floor(Math.random() * returns.length);
        const tradePnl = returns[randIndex];
        equity += tradePnl;
        curve.push(equity);

        if (equity > peak) peak = equity;
        const dd = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
        if (dd > maxDrawdownSeen) maxDrawdownSeen = dd;
      }

      if (equity <= ruinLevel) {
        ruinCount++;
      }

      allTerminalEquities.push(equity);
      // Sample 25 curves for SVG visualization
      if (iter < 25) {
        allCurves.push(curve);
      }
    }

    allTerminalEquities.sort((a, b) => a - b);
    const p5Index = Math.floor(iterations * 0.05);
    const p50Index = Math.floor(iterations * 0.5);
    const p95Index = Math.floor(iterations * 0.95);

    return {
      hasData: true,
      iterations,
      simLength,
      sampleCurves: allCurves,
      p5: allTerminalEquities[p5Index],
      p50: allTerminalEquities[p50Index],
      p95: allTerminalEquities[p95Index],
      maxSimDrawdown: maxDrawdownSeen,
      ruinProbability: (ruinCount / iterations) * 100,
    };
  }

  return {
    getClosedTrades,
    calcWinRate,
    calcNetPnl,
    calcGrossMetrics,
    calcProfitFactor,
    calcExpectancy,
    calcDrawdown,
    calcStreaks,
    calcWinLossAverages,
    parseRMultiple,
    calcPositionSize,
    calcRiskOfRuin,
    runMonteCarlo,
  };
});
