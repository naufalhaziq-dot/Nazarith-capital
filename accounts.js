/**
 * NAZARITH CAPITAL V8.0 — MULTI-ACCOUNT MANAGEMENT
 * Supports Prop Firm Challenges, Funded accounts, Evaluations, and Personal Portfolios.
 */

window.NZ_Accounts = (function () {
  'use strict';

  const { $, escapeHtml, money, toast, openModal, closeModal, confirmDialog } = window.NZ_UI;

  function renderAccountSwitcher() {
    const el = $('accountSwitcher');
    if (!el) return;

    const currentAcc = window.NZ_Storage.getActiveAccount();
    const accounts = window.NZ_Storage.getAccounts();

    el.innerHTML = `
      <div class="account-label">ACTIVE TRADING ACCOUNT</div>
      <select id="activeAccountSelect" onchange="NZ_Accounts.switchAccount(this.value)">
        ${accounts
          .map(
            (a) => `
          <option value="${escapeHtml(a.id)}" ${a.id === currentAcc.id ? 'selected' : ''}>
            ${escapeHtml(a.name)} (${escapeHtml(a.type || 'Personal')})
          </option>
        `
          )
          .join('')}
      </select>
      <div class="account-meta">
        ${escapeHtml(currentAcc.firm || 'Independent')} · ${escapeHtml(currentAcc.type || 'Personal')} · ${money(currentAcc.capital)}
      </div>
      <button class="account-add" onclick="NZ_Accounts.openManager()">＋ Add / Manage Accounts</button>
    `;
  }

  function switchAccount(accId) {
    const success = window.NZ_Storage.setActiveAccountId(accId);
    if (success) {
      renderAccountSwitcher();
      window.NZ_App.navigate(window.NZ_App.getCurrentPage());
      toast('Switched account. Journal and analytics are now isolated.');
    }
  }

  function openManager() {
    const list = window.NZ_Storage.getAccounts();
    const active = window.NZ_Storage.getActiveAccount();

    openModal(`
      <div class="modal-head">
        <div>
          <div class="eyebrow">PORTFOLIO ISOLATION</div>
          <h2>Multi-Account Management</h2>
        </div>
        <button class="btn small ghost" onclick="NZ_UI.closeModal()">✕</button>
      </div>
      <p class="muted" style="margin-bottom:18px">
        Manage separate accounts for Prop Firms (FTMO, The5ers, FundingPips, etc.) and Personal funds. 
        Each account maintains its own isolated journal, analytics, equity history, and risk policies.
      </p>

      <div class="account-list" style="display:grid;gap:10px">
        ${list
          .map((a) => {
            const pnl = (a.trades || []).reduce((s, t) => s + (Number(t.pnl) || 0), 0);
            const totalEq = (Number(a.capital) || 0) + pnl;
            const isCurrent = a.id === active.id;
            return `
              <div class="account-row" style="display:flex;justify-content:space-between;align-items:center;background:#0d1522;border:1px solid ${isCurrent ? 'var(--blue)' : 'var(--line)'};padding:12px 14px;border-radius:var(--radius)">
                <div>
                  <div style="font-weight:600;font-size:13px;display:flex;align-items:center;gap:8px">
                    ${escapeHtml(a.name)}
                    ${isCurrent ? '<span class="pill gold" style="font-size:8px">ACTIVE</span>' : ''}
                  </div>
                  <small style="color:var(--muted);display:block;margin-top:4px">
                    ${escapeHtml(a.firm || 'Independent')} · ${escapeHtml(a.type || 'Personal')} · ${(a.trades || []).length} recorded trades · Initial: ${money(a.capital)}
                  </small>
                </div>
                <div style="display:flex;align-items:center;gap:12px">
                  <div style="text-align:right">
                    <b style="font-size:13px">${money(totalEq)}</b>
                    <div class="${pnl >= 0 ? 'positive' : 'negative'}" style="font-size:10px">${pnl >= 0 ? '+' : ''}${money(pnl)}</div>
                  </div>
                  <button class="btn small ghost" onclick="NZ_Accounts.form('${escapeHtml(a.id)}')">Edit</button>
                  ${
                    list.length > 1
                      ? `<button class="btn small danger" onclick="NZ_Accounts.delete('${escapeHtml(a.id)}')">×</button>`
                      : ''
                  }
                </div>
              </div>
            `;
          })
          .join('')}
      </div>

      <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center">
        <button class="btn ghost small" onclick="NZ_UI.closeModal()">Close</button>
        <button class="btn primary" onclick="NZ_Accounts.form()">＋ Create New Account</button>
      </div>
    `);
  }

  function form(accId = '') {
    const list = window.NZ_Storage.getAccounts();
    const acc = accId ? list.find((a) => a.id === accId) : null;

    openModal(`
      <div class="modal-head">
        <div>
          <div class="eyebrow">${acc ? 'UPDATE PORTFOLIO' : 'NEW TRADING ACCOUNT'}</div>
          <h2>${acc ? 'Edit Trading Account' : 'Establish Trading Account'}</h2>
        </div>
        <button class="btn small ghost" onclick="NZ_Accounts.openManager()">← Back</button>
      </div>

      <form id="nzAccountForm" class="form-grid">
        <div class="field">
          <label>ACCOUNT NAME</label>
          <input name="name" required maxlength="45" value="${escapeHtml(acc?.name || '')}" placeholder="e.g. FTMO 100K Challenge">
        </div>
        <div class="field">
          <label>PROP FIRM / BROKER</label>
          <input name="firm" required maxlength="45" value="${escapeHtml(acc?.firm || '')}" placeholder="e.g. FTMO, The5ers, IC Markets">
        </div>
        <div class="field">
          <label>ACCOUNT CLASSIFICATION</label>
          <select name="type">
            <option ${acc?.type === 'Challenge' ? 'selected' : ''}>Challenge</option>
            <option ${acc?.type === 'Funded' ? 'selected' : ''}>Funded</option>
            <option ${acc?.type === 'Evaluation' ? 'selected' : ''}>Evaluation</option>
            <option ${acc?.type === 'Personal' ? 'selected' : ''}>Personal</option>
          </select>
        </div>
        <div class="field">
          <label>STARTING CAPITAL (USD)</label>
          <input name="capital" type="number" min="0" step="0.01" required value="${Number(acc?.capital) || 10000}">
        </div>
        <div style="grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
          <button type="button" class="btn ghost" onclick="NZ_Accounts.openManager()">Cancel</button>
          <button type="submit" class="btn primary">Save Account</button>
        </div>
      </form>
    `);

    $('nzAccountForm').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const data = {
        name: String(fd.get('name')).trim(),
        firm: String(fd.get('firm')).trim(),
        type: String(fd.get('type')),
        capital: Number(fd.get('capital')) || 10000,
      };

      if (acc) {
        data.id = acc.id;
      }

      window.NZ_Storage.saveAccount(data);
      renderAccountSwitcher();
      closeModal();
      window.NZ_App.navigate(window.NZ_App.getCurrentPage());
      toast(acc ? 'Account details updated.' : 'New trading account initialized.');
    };
  }

  function deleteAccountAction(accId) {
    const list = window.NZ_Storage.getAccounts();
    const acc = list.find((a) => a.id === accId);
    if (!acc) return;

    confirmDialog({
      title: 'Delete Trading Account',
      message: `Permanently delete "${acc.name}" and all of its recorded trades? This action cannot be reversed.`,
      confirmText: 'Delete Account',
      onConfirm: () => {
        const ok = window.NZ_Storage.deleteAccount(accId);
        if (ok) {
          renderAccountSwitcher();
          openManager();
          window.NZ_App.navigate(window.NZ_App.getCurrentPage());
          toast('Account deleted.');
        } else {
          toast('Cannot delete the only remaining account.', 'error');
        }
      },
    });
  }

  return {
    renderAccountSwitcher,
    switchAccount,
    openManager,
    form,
    delete: deleteAccountAction,
  };
})();
