/**
 * NAZARITH CAPITAL V8.0 — TRADING CALCULATIONS UNIT TESTS
 * Verifies mathematical precision for win rate, profit factor, drawdown,
 * expectancy, position sizing, and Monte Carlo resampling.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const Calc = require('../assets/js/calculations.js');
    module.exports = factory(Calc);
  } else {
    root.TradingTests = factory(root.TradingCalc);
  }
})(typeof self !== 'undefined' ? self : this, function (Calc) {
  'use strict';

  const results = [];

  function assert(testName, actual, expected, tolerance = 0.001) {
    let passed = false;
    if (typeof expected === 'number' && typeof actual === 'number') {
      if (expected === Infinity) {
        passed = actual === Infinity;
      } else {
        passed = Math.abs(actual - expected) <= tolerance;
      }
    } else {
      passed = JSON.stringify(actual) === JSON.stringify(expected);
    }

    results.push({
      testName,
      passed,
      actual,
      expected,
      message: passed ? 'PASS' : `FAIL: Expected ${expected}, got ${actual}`,
    });
  }

  function runAllTests() {
    results.length = 0;

    // Test Dataset A (Standard mixed)
    const datasetA = [
      { date: '2026-11-01', symbol: 'XAUUSD', result: 'Win', pnl: 400, risk: 0.5, rr: '1:2' },
      { date: '2026-11-02', symbol: 'EURUSD', result: 'Loss', pnl: -200, risk: 0.5, rr: '1:2' },
      { date: '2026-11-03', symbol: 'GBPUSD', result: 'Win', pnl: 600, risk: 0.5, rr: '1:3' },
      { date: '2026-11-04', symbol: 'USDJPY', result: 'Breakeven', pnl: 0, risk: 0.5, rr: '1:2' },
      { date: '2026-11-05', symbol: 'US30', result: 'Open', pnl: null, risk: 0.5, rr: '1:2' },
      { date: '2026-11-06', symbol: 'XAUUSD', result: 'Win', pnl: 200, risk: 0.5, rr: '1:1' },
      { date: '2026-11-07', symbol: 'BTCUSD', result: 'Loss', pnl: -200, risk: 0.5, rr: '1:2' },
    ];

    // 1. Win Rate Test (Only Win & Loss count: 3 wins / 5 closed = 60.00%)
    const wr = Calc.calcWinRate(datasetA);
    assert('Win Rate ignores Open & Breakeven trades', wr, 60.0);

    // 2. Net Realized P&L Test (400 - 200 + 600 + 0 + 200 - 200 = 800)
    const netPnl = Calc.calcNetPnl(datasetA);
    assert('Net Realized P&L summation', netPnl, 800.0);

    // 3. Profit Factor Test (Gross Win = 1200, Gross Loss = 400 -> PF = 3.00)
    const pf = Calc.calcProfitFactor(datasetA);
    assert('Profit Factor calculation (1200 / 400)', pf, 3.0);

    // 4. Profit Factor Divide-By-Zero Handling
    const allWins = [
      { result: 'Win', pnl: 500 },
      { result: 'Win', pnl: 300 },
    ];
    assert('Profit Factor handles zero loss gracefully as Infinity', Calc.calcProfitFactor(allWins), Infinity);

    const allLosses = [
      { result: 'Loss', pnl: -500 },
      { result: 'Loss', pnl: -300 },
    ];
    assert('Profit Factor handles zero wins gracefully as 0', Calc.calcProfitFactor(allLosses), 0.0);

    // 5. Expectancy Test (Net 800 / 6 closed/BE trades = 133.33)
    const exp = Calc.calcExpectancy(datasetA);
    assert('Expectancy calculation per closed trade', Math.round(exp * 100) / 100, 133.33);

    // 6. Chronological Maximum Drawdown Test
    // Starting equity = 10,000.
    // +400 -> 10,400 (peak)
    // -200 -> 10,200 (decline: 200 / 10400 = 1.923%)
    // +600 -> 10,800 (new peak)
    // 0 -> 10,800
    // +200 -> 11,000 (new peak)
    // -200 -> 10,800 (decline: 200 / 11000 = 1.818%)
    // Max DD should be 1.923% from peak of 10,400
    const ddResult = Calc.calcDrawdown(datasetA, 10000);
    assert('Chronological Maximum Drawdown %', Math.round(ddResult.maxDrawdownPct * 1000) / 1000, 1.923);
    assert('Chronological Peak Equity', ddResult.peakEquity, 11000);
    assert('Current Equity', ddResult.currentEquity, 10800);

    // 7. Consecutive Streaks Test
    const streakTrades = [
      { date: '2026-11-01', result: 'Win' },
      { date: '2026-11-02', result: 'Win' },
      { date: '2026-11-03', result: 'Win' },
      { date: '2026-11-04', result: 'Loss' },
      { date: '2026-11-05', result: 'Loss' },
      { date: '2026-11-06', result: 'Win' },
    ];
    const streaks = Calc.calcStreaks(streakTrades);
    assert('Max Win Streak calculation', streaks.maxWinStreak, 3);
    assert('Max Loss Streak calculation', streaks.maxLossStreak, 2);

    // 8. Position Sizing & Lot Calculator Test
    // Equity: 10,000 | Risk: 1% ($100 cash) | Entry: 2600, Stop: 2595 (dist = 5) | unitValue = 10 (Gold 100oz pip)
    // Lot size = 100 / (5 * 10) = 2.00 Lots
    const pos = Calc.calcPositionSize({
      equity: 10000,
      riskPercent: 1.0,
      entry: 2600,
      stop: 2595,
      target: 2615, // dist = 15 -> RR = 3
      unitValue: 10,
    });
    assert('Position Sizing Lot Size for Gold', Math.round(pos.lotSize * 100) / 100, 2.0);
    assert('Position Sizing Reward:Risk Ratio', pos.rewardRiskRatio, 3.0);
    assert('Position Sizing Cash at Risk', pos.cashAtRisk, 100.0);
    assert('Position Sizing Target Cash Profit', pos.targetCashProfit, 300.0);

    // 9. Risk of Ruin Test (High edge setup should have low ruin probability)
    const rorSafe = Calc.calcRiskOfRuin({
      winRatePercent: 60,
      avgWin: 300,
      avgLoss: 100,
      riskPercent: 1.0,
    });
    assert('Risk of Ruin for 60% WR with 3:1 payoff is near 0%', rorSafe < 0.1, true);

    const rorUnprofitable = Calc.calcRiskOfRuin({
      winRatePercent: 30,
      avgWin: 100,
      avgLoss: 200,
      riskPercent: 2.0,
    });
    assert('Risk of Ruin with negative expectancy is 100%', rorUnprofitable, 100.0);

    // 10. Monte Carlo Simulation Engine Test
    const mc = Calc.runMonteCarlo({
      trades: datasetA,
      initialCapital: 10000,
      iterations: 500,
      simTradeLength: 30,
    });
    assert('Monte Carlo completes iterations with data', mc.hasData, true);
    assert('Monte Carlo generates sample curves', mc.sampleCurves.length > 0, true);
    assert('Monte Carlo percentiles monotonic (P5 <= P50 <= P95)', mc.p5 <= mc.p50 && mc.p50 <= mc.p95, true);

    return results;
  }

  return {
    runAllTests,
  };
});
