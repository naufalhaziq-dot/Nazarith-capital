/**
 * NAZARITH CAPITAL V8.0 — SETTINGS & CLOUD CONFIGURATION
 * User profiles, Supabase Cloud configuration, external API keys,
 * active account parameters, and session management.
 */

window.NZ_Settings = (function () {
  'use strict';

  const { $, escapeHtml, money, renderPageHead, toast } = window.NZ_UI;

  function render() {
    const user = window.NZ_Storage.getCurrentUser() || { name: 'Institutional Trader', email: 'offline@nazarith.local' };
    const email = window.NZ_Storage.getSessionEmail() || 'offline@nazarith.local';
    const acc = window.NZ_Storage.getActiveAccount();
    const trades = window.NZ_Storage.getTrades();
    const sbConfig = window.NZ_Supabase.getSavedConfig();
    const isSbAvailable = window.NZ_Supabase.isAvailable();

    const content = `
      ${renderPageHead(
        'WORKSPACE PREFERENCES / CLOUD INFRASTRUCTURE',
        'Settings & System Architecture',
        'Configure Supabase Cloud connection, external market data providers, and account parameters.'
      )}

      <!-- User Profile Card -->
      <div class="card">
        <h3>Trader Profile</h3>
        <div class="detail-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
          <div><small>TRADER NAME</small><b>${escapeHtml(user.name || 'Institutional Trader')}</b></div>
          <div><small>EMAIL IDENTIFIER</small><b>${escapeHtml(email)}</b></div>
        </div>
      </div>

      <!-- Active Trading Account Card -->
      <div class="card" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Active Trading Account</h3>
          <button class="btn small primary" onclick="NZ_Accounts.form('${escapeHtml(acc.id)}')">Edit Active Account</button>
        </div>
        <div class="detail-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          <div><small>ACCOUNT</small><b>${escapeHtml(acc.name)}</b></div>
          <div><small>PROP FIRM / BROKER</small><b>${escapeHtml(acc.firm || 'Independent')}</b></div>
          <div><small>CLASSIFICATION</small><b class="pill neutral">${escapeHtml(acc.type || 'Personal')}</b></div>
          <div><small>STARTING CAPITAL</small><b>${money(acc.capital)}</b></div>
        </div>
        <div style="margin-top:14px;color:var(--muted);font-size:11px">
          Currently tracking ${trades.length} recorded trade executions in this isolated workspace.
        </div>
      </div>

      <!-- Cloud Infrastructure — Supabase Configuration (Master Prompt Rule I) -->
      <div class="card" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3>Cloud Infrastructure — Supabase Backend</h3>
          <span class="pill ${isSbAvailable ? 'win' : 'neutral'}">
            ${isSbAvailable ? '● Connected to Supabase Cloud' : '○ Local-First Offline Mode'}
          </span>
        </div>
        <p class="muted" style="font-size:11.5px;line-height:1.7;margin-bottom:16px">
          Connect your personal Supabase project to enable multi-device synchronization, PostgreSQL cloud backups, 
          and cloud storage for chart attachments with strict Row-Level Security (RLS).
        </p>

        <form id="supabaseConfigForm" class="form-grid">
          <div class="field" style="grid-column:1/-1">
            <label>SUPABASE PROJECT URL</label>
            <input id="sbUrl" placeholder="https://your-project-id.supabase.co" value="${escapeHtml(sbConfig.url || '')}">
          </div>
          <div class="field" style="grid-column:1/-1">
            <label>SUPABASE ANON / PUBLISHABLE KEY</label>
            <input id="sbKey" type="password" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${escapeHtml(sbConfig.key || '')}">
            <small style="color:var(--muted);font-size:10px;display:block;margin-top:4px">
              Security notice: Always use your <b>anon public key</b> here. NEVER enter your secret <code>service_role</code> key in the frontend.
            </small>
          </div>
          <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;margin-top:10px">
            <button type="submit" class="btn primary">Save & Connect Supabase</button>
          </div>
        </form>
      </div>

      <!-- External API Integrations (Master Prompt Rule 7) -->
      <div class="card" style="margin-top:16px">
        <h3>External Market & AI Providers</h3>
        <p class="muted" style="font-size:11px;margin-bottom:14px">
          Configure optional external data sources. When unconfigured, modules operate safely in local tracking mode without synthetic data.
        </p>

        <form id="externalApiForm" class="form-grid">
          <div class="field">
            <label>FINNHUB API KEY (MARKET QUOTES & CALENDAR)</label>
            <input id="finnhubKey" placeholder="Optional: Finnhub API Key" value="${escapeHtml(window.NZ_CONFIG?.FINNHUB_KEY || '')}">
          </div>
          <div class="field">
            <label>AI ANALYST PROVIDER PREFERENCE</label>
            <select id="aiProviderSelect">
              <option value="groq" ${window.NZ_CONFIG?.AI_PROVIDER === 'groq' ? 'selected' : ''}>Groq (LLaMA-3.3 70B via Supabase Edge)</option>
              <option value="openai" ${window.NZ_CONFIG?.AI_PROVIDER === 'openai' ? 'selected' : ''}>OpenAI (GPT-4o Mini via Supabase Edge)</option>
              <option value="local" ${window.NZ_CONFIG?.AI_PROVIDER === 'local' ? 'selected' : ''}>Local Mathematical Engine Only</option>
            </select>
          </div>
          <div style="grid-column:1/-1;display:flex;justify-content:flex-end;margin-top:10px">
            <button type="submit" class="btn ghost">Save Provider Preferences</button>
          </div>
        </form>
      </div>

      <!-- Session & Logout -->
      <div class="card" style="margin-top:16px">
        <h3>Session Governance</h3>
        <p class="muted" style="font-size:11px;margin-bottom:14px">
          Sign out of this browser profile. Local offline accounts remain securely cached on this device.
        </p>
        <button class="btn danger" onclick="NZ_App.logout()">Sign Out of Workspace</button>
      </div>

      <!-- About Nazarith Capital V8.0 -->
      <div class="card" style="margin-top:16px">
        <h3>About Nazarith Capital</h3>
        <p class="muted" style="font-size:11px;line-height:1.9">
          <b>NAZARITH CAPITAL · Institutional Trading Intelligence V8.0</b><br>
          Architected for discipline, quantitative rigor, and generational continuity.<br>
          Founder: Naufalhaziq Azfarimifdhal Agfi
        </p>
      </div>
    `;

    $('main').innerHTML = content;

    // Handle Supabase Config Submit
    $('supabaseConfigForm').onsubmit = (e) => {
      e.preventDefault();
      const url = $('sbUrl').value.trim();
      const key = $('sbKey').value.trim();
      window.NZ_Supabase.setSavedConfig(url, key);
      toast('Supabase cloud configuration updated.');
      render();
    };

    // Handle External API Form Submit
    $('externalApiForm').onsubmit = (e) => {
      e.preventDefault();
      window.NZ_CONFIG.FINNHUB_KEY = $('finnhubKey').value.trim();
      window.NZ_CONFIG.AI_PROVIDER = $('aiProviderSelect').value;
      toast('External provider preferences updated.');
    };
  }

  return {
    render,
  };
})();
