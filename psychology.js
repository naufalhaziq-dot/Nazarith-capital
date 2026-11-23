/**
 * NAZARITH CAPITAL V8.0 — PSYCHOLOGY TRACKER & BEHAVIORAL AUDIT
 * Preserved & elevated from V3.0: Emotional state distribution,
 * execution quality meters, daily reflection log (score 1-10), and behavioral discipline.
 */

window.NZ_Psychology = (function () {
  'use strict';

  const { $, escapeHtml, dateFmt, renderPageHead, toast } = window.NZ_UI;

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const trades = acc.trades || [];
    const reviews = acc.dailyReviews || {};

    const emotionCounts = {};
    trades.forEach((t) => {
      const em = t.emotion_before || t.emotion || 'Not recorded';
      emotionCounts[em] = (emotionCounts[em] || 0) + 1;
    });

    const highRiskEmotions = trades.filter((t) => {
      const em = (t.emotion_before || t.emotion || '').toLowerCase();
      return ['fomo', 'revenge trading', 'overconfident', 'fearful', 'fatigued'].includes(em);
    }).length;

    const goodExecutions = trades.filter((t) => {
      const eq = (t.execution_quality || t.execution || '').toLowerCase();
      return eq === 'excellent' || eq === 'good';
    }).length;

    const content = `
      ${renderPageHead(
        'BEHAVIORAL FINANCE / EXECUTION DISCIPLINE',
        'Psychology Tracker',
        'Audit psychological triggers, emotional impulses, and daily execution consistency.'
      )}

      <!-- Psychology Overview Stats -->
      <div class="grid stats">
        <div class="stat">
          <div class="label">TRADES REVIEWED</div>
          <div class="value">${trades.length}</div>
          <div class="sub">Audited trade executions</div>
        </div>
        <div class="stat">
          <div class="label">HIGH-RISK EMOTIONS</div>
          <div class="value ${highRiskEmotions > 0 ? 'negative' : 'positive'}">${highRiskEmotions}</div>
          <div class="sub">${trades.length ? ((highRiskEmotions / trades.length) * 100).toFixed(1) : '0.0'}% of recorded trades</div>
        </div>
        <div class="stat">
          <div class="label">DISCIPLINED EXECUTION</div>
          <div class="value positive">${goodExecutions}</div>
          <div class="sub">${trades.length ? ((goodExecutions / trades.length) * 100).toFixed(1) : '0.0'}% Excellent / Good</div>
        </div>
        <div class="stat">
          <div class="label">SAVED REFLECTIONS</div>
          <div class="value">${Object.keys(reviews).length}</div>
          <div class="sub">Daily journaling entries</div>
        </div>
      </div>

      <!-- Emotional Breakdown & Execution Quality Meters -->
      <div class="grid two-col" style="margin-top:16px">
        <div class="card">
          <h3>Emotional State Distribution</h3>
          ${
            Object.keys(emotionCounts).length
              ? Object.entries(emotionCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(
                    ([k, v]) => `
                <div class="list-item">
                  <span>${escapeHtml(k)}</span>
                  <b>${v} <span class="muted" style="font-size:10px">(${trades.length ? ((v / trades.length) * 100).toFixed(1) : '0'}%)</span></b>
                </div>
              `
                  )
                  .join('')
              : '<div class="empty">Log emotional states when entering trades in the journal.</div>'
          }
        </div>

        <div class="card">
          <h3>Execution Quality Assessment</h3>
          ${['Excellent', 'Good', 'Average', 'Poor']
            .map((k) => {
              const n = trades.filter((t) => (t.execution_quality || t.execution || '').toLowerCase() === k.toLowerCase()).length;
              const pct = trades.length ? (n / trades.length) * 100 : 0;
              return `
                <div style="margin:14px 0">
                  <div style="display:flex;justify-content:space-between;font-size:11px">
                    <span>${k}</span>
                    <b>${n} (${pct.toFixed(1)}%)</b>
                  </div>
                  <div class="nc2-meter">
                    <span style="width:${pct}%;background:${k === 'Excellent' ? '#53c99a' : k === 'Good' ? '#9dbbd8' : k === 'Average' ? '#e8b65c' : '#ee7777'}"></span>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>

      <!-- Daily Reflection Input Form -->
      <div class="card" style="margin-top:16px">
        <h3>Daily Execution Reflection</h3>
        <p class="muted" style="font-size:11px;margin-bottom:14px">
          Conclude each session by recording your discipline score, cognitive state, and one specific rule to hone tomorrow.
        </p>

        <form id="dailyReviewForm" class="form-grid">
          <div class="field">
            <label>SESSION DATE</label>
            <input id="revDate" type="date" required value="${new Date().toISOString().slice(0, 10)}">
          </div>
          <div class="field">
            <label>DISCIPLINE SCORE (1 – 10)</label>
            <input id="revScore" type="number" min="1" max="10" required value="8">
          </div>
          <div class="field">
            <label>SESSION FOCUS QUALITY</label>
            <select id="revQuality">
              <option>Focused</option>
              <option>Mixed / Distracted</option>
              <option>Undisciplined</option>
            </select>
          </div>
          <div class="field">
            <label>PRIMARY MENTAL STATE</label>
            <input id="revState" placeholder="e.g. Calm, patient, accepted risk" value="Calm">
          </div>
          <div class="field" style="grid-column:1/-1">
            <label>REFLECTIVE NOTES</label>
            <textarea id="revBody" required placeholder="What went well today? Did you adhere to stop losses? What will you refine for tomorrow?"></textarea>
          </div>
          <div style="grid-column:1/-1;display:flex;justify-content:flex-end">
            <button type="submit" class="btn primary">Save Daily Reflection</button>
          </div>
        </form>
      </div>

      <!-- Saved Daily Reflections -->
      <div class="card" style="margin-top:16px">
        <h3>Historical Reflections Archive</h3>
        ${
          Object.keys(reviews).length
            ? Object.entries(reviews)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(
                  ([d, r]) => `
              <div class="list-item" style="align-items:flex-start">
                <div>
                  <b style="font-size:13px">${dateFmt(d)}</b>
                  <div class="muted" style="font-size:10.5px;margin-top:3px">
                    Focus: ${escapeHtml(r.quality || 'Focused')} · Discipline: ${r.score || 7}/10 · State: ${escapeHtml(r.state || 'Calm')}
                  </div>
                  <p style="font-size:12px;color:#cbd6e2;margin:6px 0 0;white-space:pre-wrap">${escapeHtml(r.body)}</p>
                </div>
                <button class="btn small danger" onclick="NZ_Psychology.deleteReview('${escapeHtml(d)}')">Delete</button>
              </div>
            `
                )
                .join('')
            : '<div class="empty">No daily reflections recorded yet.</div>'
        }
      </div>
    `;

    $('main').innerHTML = content;

    const form = $('dailyReviewForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const d = $('revDate').value;
        const score = Math.max(1, Math.min(10, Number($('revScore').value) || 1));
        const quality = $('revQuality').value;
        const state = $('revState').value.trim();
        const body = $('revBody').value.trim();

        const active = window.NZ_Storage.getActiveAccount();
        if (!active.dailyReviews) active.dailyReviews = {};

        active.dailyReviews[d] = {
          score,
          quality,
          state,
          body,
          updatedAt: new Date().toISOString(),
        };

        window.NZ_Storage.saveUsers();
        toast('Daily reflection saved.');
        render();
      };
    }
  }

  function deleteReview(d) {
    if (!confirm('Permanently delete reflection for ' + d + '?')) return;
    const active = window.NZ_Storage.getActiveAccount();
    if (active.dailyReviews) {
      delete active.dailyReviews[d];
      window.NZ_Storage.saveUsers();
      render();
      toast('Reflection deleted.');
    }
  }

  return {
    render,
    deleteReview,
  };
})();
