/**
 * NAZARITH CAPITAL V8.0 — BACKTEST LAB & MONTE CARLO SIMULATION
 * Statistical equity resampler, risk variation testing, R-Multiple distribution,
 * and transparent disclosure regarding historical journal vs OHLC candle backtesting.
 */

window.NZ_Backtest = (function () {
  'use strict';

  const { $, escapeHtml, money, renderPageHead } = window.NZ_UI;
  const Calc = window.TradingCalc;

  let currentSimResult = null;

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const trades = acc.trades || [];
    const capital = Number(acc.capital) || 10000;

    const content = `
      ${renderPageHead(
        'SIMULATION LAB / STOCHASTIC ANALYSIS',
        'Backtest & Monte Carlo Lab',
        'Stress-test your historical edge across 1,000 randomized execution sequences, sample variation, and probability cones.'
      )}

      <!-- Institutional Transparency Notice (Master Prompt Rule D) -->
      <div class="note" style="border-left-color:var(--amber);background:#1a150c;color:#e8d1a0">
        <b>INSTITUTIONAL METHODOLOGY DISCLOSURE:</b>
        This module operates as a <b>Journal Return Distribution & Monte Carlo Simulator</b>. 
        It resamples and stress-tests your recorded transactions and R-multiple probabilities under randomized sequence order. 
        This is distinguished from tick-by-tick candle (OHLC) backtesting, which requires an external high-resolution historical price feed and scripted execution rules.
      </div>

      <!-- Simulation Parameter Configuration -->
      <div class="card" style="margin-top:16px">
        <h3>Simulation Parameters</h3>
        <div class="form-grid">
          <div class="field">
            <label>STARTING SIMULATION EQUITY ($)</label>
            <input id="simCapital" type="number" step="100" value="${capital}">
          </div>
          <div class="field">
            <label>MONTE CARLO ITERATIONS</label>
            <select id="simIterations">
              <option value="500">500 Iterations (Fast)</option>
              <option value="1000" selected>1,000 Iterations (Institutional Standard)</option>
              <option value="2500">2,500 Iterations (Deep Quantitative)</option>
            </select>
          </div>
          <div class="field">
            <label>SIMULATION TRADE HORIZON (SAMPLE SIZE)</label>
            <input id="simHorizon" type="number" min="20" max="300" value="${Math.max(30, trades.length || 50)}">
          </div>
          <div class="field">
            <label>DATA SOURCE</label>
            <select id="simSource">
              <option value="journal">Active Account Journal (${trades.length} recorded trades)</option>
            </select>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
          <button class="btn primary" onclick="NZ_Backtest.runSimulation()">▶ RUN MONTE CARLO SIMULATION</button>
        </div>
      </div>

      <!-- Simulation Results Container -->
      <div id="simResultsContainer">
        ${renderSimulationView(trades, capital)}
      </div>

      <!-- R-Multiple Distribution Histogram -->
      <div class="card" style="margin-top:16px">
        <h3>R-Multiple Realization Histogram</h3>
        <p class="muted" style="font-size:11px;margin-bottom:14px">Distribution of recorded Risk-to-Reward outcomes across your closed trades.</p>
        ${renderRMultipleDistribution(trades)}
      </div>
    `;

    $('main').innerHTML = content;
  }

  function runSimulation() {
    const trades = window.NZ_Storage.getTrades();
    const capital = Number($('simCapital')?.value) || 10000;
    const iterations = Number($('simIterations')?.value) || 1000;
    const horizon = Number($('simHorizon')?.value) || 50;

    const result = Calc.runMonteCarlo({
      trades,
      initialCapital: capital,
      iterations,
      simTradeLength: horizon,
    });

    currentSimResult = result;
    const container = $('simResultsContainer');
    if (container) {
      container.innerHTML = renderSimulationView(trades, capital, result);
    }
  }

  function renderSimulationView(trades, capital, simResult = currentSimResult) {
    if (!simResult) {
      simResult = Calc.runMonteCarlo({
        trades,
        initialCapital: capital,
        iterations: 1000,
        simTradeLength: Math.max(30, trades.length || 50),
      });
      currentSimResult = simResult;
    }

    if (!simResult.hasData) {
      return `
        <div class="card" style="margin-top:16px">
          <div class="empty">
            At least 3 closed trades are required in this account to execute a valid Monte Carlo resample.
          </div>
        </div>
      `;
    }

    return `
      <div class="card" style="margin-top:16px">
        <h3>Monte Carlo Trajectory & Probability Cones (${simResult.iterations} Runs)</h3>
        
        <div class="monte-carlo-metrics">
          <div>
            <small>5TH PERCENTILE (WORST CASE)</small>
            <b class="${simResult.p5 >= capital ? 'positive' : 'negative'}">${money(simResult.p5)}</b>
          </div>
          <div>
            <small>50TH PERCENTILE (MEDIAN)</small>
            <b class="${simResult.p50 >= capital ? 'positive' : 'negative'}">${money(simResult.p50)}</b>
          </div>
          <div>
            <small>95TH PERCENTILE (BEST CASE)</small>
            <b class="positive">${money(simResult.p95)}</b>
          </div>
          <div>
            <small>MAX ANTICIPATED DRAWDOWN</small>
            <b class="negative">${simResult.maxSimDrawdown.toFixed(2)}%</b>
          </div>
        </div>

        <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
          <span class="muted" style="font-size:11px">Probability of 50% Account Destruction (Ruin): <b class="${simResult.ruinProbability > 5 ? 'negative' : 'positive'}">${simResult.ruinProbability.toFixed(2)}%</b></span>
          <span class="muted" style="font-size:10px">Showing 25 resampled paths + Percentile bounds</span>
        </div>

        ${renderMonteCarloSvg(simResult, capital)}
      </div>
    `;
  }

  function renderMonteCarloSvg(sim, capital) {
    const W = 760;
    const H = 240;
    const L = 60;
    const R = 20;
    const T = 16;
    const B = 30;
    const plotW = W - L - R;
    const plotH = H - T - B;

    const curves = sim.sampleCurves || [];
    if (!curves.length) return '';

    const allPoints = curves.flat();
    allPoints.push(sim.p5, sim.p50, sim.p95, capital);
    const minVal = Math.min(...allPoints);
    const maxVal = Math.max(...allPoints);
    const range = Math.max(1, maxVal - minVal);

    const step = plotW / Math.max(1, (curves[0]?.length || 1) - 1);
    const yVal = (v) => T + plotH - ((v - minVal) / range) * plotH;

    const samplePaths = curves
      .map((c) => {
        const d = c.map((val, idx) => `${idx === 0 ? 'M' : 'L'}${(L + idx * step).toFixed(1)},${yVal(val).toFixed(1)}`).join(' ');
        return `<path d="${d}" fill="none" stroke="#3d5878" stroke-width="1" opacity="0.35"/>`;
      })
      .join('');

    // Percentile lines
    const p5Y = yVal(sim.p5);
    const p50Y = yVal(sim.p50);
    const p95Y = yVal(sim.p95);
    const capY = yVal(capital);

    const grid = [0, 0.5, 1]
      .map((pct) => {
        const y = T + plotH * pct;
        const val = minVal + range * (1 - pct);
        return `
          <line x1="${L}" y1="${y}" x2="${W - R}" y2="${y}" stroke="#233244" stroke-dasharray="3 5"/>
          <text x="${L - 8}" y="${y + 4}" text-anchor="end" fill="#8294aa" font-size="9">${money(val)}</text>
        `;
      })
      .join('');

    return `
      <div style="background:#09101a;padding:12px;border:1px solid #233142;border-radius:var(--radius)">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Monte Carlo probability simulation" style="width:100%;height:auto">
          ${grid}

          <!-- Starting capital baseline -->
          <line x1="${L}" y1="${capY}" x2="${W - R}" y2="${capY}" stroke="#52677e" stroke-width="1.2" stroke-dasharray="2 3"/>

          <!-- 25 Sample Curves -->
          <g>${samplePaths}</g>

          <!-- 5th Percentile Line (Worst Case) -->
          <line x1="${L}" y1="${p5Y}" x2="${W - R}" y2="${p5Y}" stroke="#ee7777" stroke-width="2"/>
          <text x="${W - R + 4}" y="${p5Y + 4}" fill="#ee7777" font-size="9" font-weight="700">P5</text>

          <!-- 50th Percentile Line (Median) -->
          <line x1="${L}" y1="${p50Y}" x2="${W - R}" y2="${p50Y}" stroke="#d4af37" stroke-width="2"/>
          <text x="${W - R + 4}" y="${p50Y + 4}" fill="#d4af37" font-size="9" font-weight="700">P50</text>

          <!-- 95th Percentile Line (Best Case) -->
          <line x1="${L}" y1="${p95Y}" x2="${W - R}" y2="${p95Y}" stroke="#53c99a" stroke-width="2"/>
          <text x="${W - R + 4}" y="${p95Y + 4}" fill="#53c99a" font-size="9" font-weight="700">P95</text>
        </svg>

        <div class="chart-legend" style="margin-top:8px">
          <span><i style="background:#53c99a"></i> 95th Percentile (${money(sim.p95)})</span>
          <span><i style="background:#d4af37"></i> 50th Percentile Median (${money(sim.p50)})</span>
          <span><i style="background:#ee7777"></i> 5th Percentile (${money(sim.p5)} Worst Case)</span>
          <span><i style="background:#52677e"></i> Starting Capital (${money(capital)})</span>
        </div>
      </div>
    `;
  }

  function renderRMultipleDistribution(trades) {
    const buckets = {
      'Loss (<= -1R)': 0,
      'Small Loss (-0.5R)': 0,
      'Breakeven (0R)': 0,
      '1R - 2R': 0,
      '2R - 3R': 0,
      '3R - 5R': 0,
      '5R+ (Home Run)': 0,
    };

    trades.forEach((t) => {
      const res = String(t.result || '').toLowerCase();
      if (res === 'breakeven') {
        buckets['Breakeven (0R)']++;
        return;
      }
      if (res === 'loss') {
        buckets['Loss (<= -1R)']++;
        return;
      }
      const r = Calc.parseRMultiple(t.risk_reward || t.rr);
      if (r >= 5) buckets['5R+ (Home Run)']++;
      else if (r >= 3) buckets['3R - 5R']++;
      else if (r >= 2) buckets['2R - 3R']++;
      else if (r >= 1) buckets['1R - 2R']++;
      else if (r > 0) buckets['Small Loss (-0.5R)']++;
      else buckets['Loss (<= -1R)']++;
    });

    const maxCount = Math.max(1, ...Object.values(buckets));

    return `
      <div style="display:grid;gap:8px">
        ${Object.entries(buckets)
          .map(([label, count]) => {
            const pct = (count / maxCount) * 100;
            const isLoss = label.includes('Loss');
            return `
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                  <span>${label}</span>
                  <b>${count} executions</b>
                </div>
                <div style="height:6px;background:#172433;border-radius:2px;overflow:hidden">
                  <div style="width:${pct}%;height:100%;background:${isLoss ? '#ee7777' : '#53c99a'}"></div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  return {
    render,
    runSimulation,
  };
})();
