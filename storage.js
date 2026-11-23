/**
 * NAZARITH CAPITAL V8.0 — LOCAL-FIRST STORAGE & ISOLATION ENGINE
 * Ensures data isolation per account, offline persistence, and seamless cloud syncing.
 */

window.NZ_Storage = (function () {
  'use strict';

  const STORE = window.NZ_CONFIG?.STORAGE_PREFIX || 'nazarith_v8';
  const memoryStore = {};

  const localAdapter = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return memoryStore[key] ?? null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        memoryStore[key] = String(value);
        if (window.NZ_UI && typeof window.NZ_UI.toast === 'function') {
          window.NZ_UI.toast('Browser local storage full or unavailable. Data stored in memory for this session.');
        }
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        delete memoryStore[key];
      }
    },
  };

  /**
   * Read users from local storage with backward compatibility for V1, V2, and V3 keys.
   */
  function readLocalUsers() {
    const keys = [
      STORE + '_users',
      'nazareth_capital_v1_users',
      'nazarith_capital_v1_users',
      'NAZARITH_CAPITAL_users',
    ];

    for (const key of keys) {
      const raw = localAdapter.get(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.warn('Could not parse user store key:', key, e);
      }
    }
    return {};
  }

  let users = readLocalUsers();
  let currentSessionEmail =
    localAdapter.get(STORE + '_session') ||
    localAdapter.get('nazareth_capital_v1_session') ||
    localAdapter.get('nazarith_capital_v1_session') ||
    '';
  let activeAccountId = '';

  function saveUsers() {
    localAdapter.set(STORE + '_users', JSON.stringify(users));
  }

  function getCurrentUser() {
    if (!currentSessionEmail || !users[currentSessionEmail]) return null;
    return users[currentSessionEmail];
  }

  function setCurrentSession(email) {
    currentSessionEmail = (email || '').toLowerCase().trim();
    if (currentSessionEmail) {
      localAdapter.set(STORE + '_session', currentSessionEmail);
      ensureAccounts();
    } else {
      localAdapter.remove(STORE + '_session');
      activeAccountId = '';
    }
  }

  function getSessionEmail() {
    return currentSessionEmail;
  }

  /**
   * Ensure account structure is complete with isolated datasets.
   */
  function ensureAccounts() {
    const u = getCurrentUser();
    if (!u) return;

    if (!Array.isArray(u.accounts) || !u.accounts.length) {
      u.accounts = [
        {
          id: 'acc_' + Date.now(),
          name: 'Main Institutional Account',
          firm: 'Personal Portfolio',
          type: 'Personal',
          capital: Number(u.capital) || window.NZ_CONFIG.DEFAULT_CAPITAL,
          trades: Array.isArray(u.trades) ? u.trades : [],
          strategies: u.strategies || [],
          notes: u.notes || [],
          watch: u.watch || [],
          events: u.events || [],
          dailyReviews: u.dailyReviews || {},
          riskPolicy: u.riskPolicy || {
            dailyLimit: 2,
            weeklyLimit: 5,
            maxRisk: 1,
            maxDrawdown: 10,
          },
          smcSetups: u.smcSetups || [],
          backtests: u.backtests || [],
        },
      ];
      u.activeAccountId = u.accounts[0].id;
    }

    // Default missing properties on each account
    u.accounts.forEach((a) => {
      if (!Array.isArray(a.trades)) a.trades = [];
      if (!Array.isArray(a.strategies)) a.strategies = [];
      if (!Array.isArray(a.notes)) a.notes = [];
      if (!Array.isArray(a.watch)) a.watch = [];
      if (!Array.isArray(a.events)) a.events = [];
      if (!a.dailyReviews || typeof a.dailyReviews !== 'object') a.dailyReviews = {};
      if (!a.riskPolicy) a.riskPolicy = { dailyLimit: 2, weeklyLimit: 5, maxRisk: 1, maxDrawdown: 10 };
      if (!Array.isArray(a.smcSetups)) a.smcSetups = [];
      if (!Array.isArray(a.backtests)) a.backtests = [];
      if (a.capital == null) a.capital = window.NZ_CONFIG.DEFAULT_CAPITAL;
    });

    if (!u.accounts.some((a) => a.id === u.activeAccountId)) {
      u.activeAccountId = u.accounts[0].id;
    }
    activeAccountId = u.activeAccountId;
    saveUsers();
  }

  function getActiveAccount() {
    ensureAccounts();
    const u = getCurrentUser();
    if (!u) {
      return {
        id: 'acc_guest',
        name: 'Guest Portfolio',
        firm: 'Demo',
        type: 'Personal',
        capital: 10000,
        trades: [],
        strategies: [],
        notes: [],
        watch: [],
        events: [],
        dailyReviews: {},
        riskPolicy: { dailyLimit: 2, weeklyLimit: 5, maxRisk: 1, maxDrawdown: 10 },
        smcSetups: [],
        backtests: [],
      };
    }
    return u.accounts.find((a) => a.id === activeAccountId) || u.accounts[0];
  }

  function setActiveAccountId(accId) {
    const u = getCurrentUser();
    if (!u || !u.accounts.some((a) => a.id === accId)) return false;
    u.activeAccountId = accId;
    activeAccountId = accId;
    saveUsers();
    return true;
  }

  function getAccounts() {
    const u = getCurrentUser();
    return u?.accounts || [];
  }

  function saveAccount(accData) {
    const u = getCurrentUser();
    if (!u) return null;

    if (accData.id) {
      const idx = u.accounts.findIndex((a) => a.id === accData.id);
      if (idx !== -1) {
        u.accounts[idx] = { ...u.accounts[idx], ...accData };
        saveUsers();
        return u.accounts[idx];
      }
    }

    // New account
    const fresh = {
      id: 'acc_' + Date.now(),
      name: accData.name || 'New Account',
      firm: accData.firm || 'Independent',
      type: accData.type || 'Challenge',
      capital: Number(accData.capital) || window.NZ_CONFIG.DEFAULT_CAPITAL,
      trades: [],
      strategies: [],
      notes: [],
      watch: [],
      events: [],
      dailyReviews: {},
      riskPolicy: { dailyLimit: 2, weeklyLimit: 5, maxRisk: 1, maxDrawdown: 10 },
      smcSetups: [],
      backtests: [],
    };
    u.accounts.push(fresh);
    u.activeAccountId = fresh.id;
    activeAccountId = fresh.id;
    saveUsers();
    return fresh;
  }

  function deleteAccount(accId) {
    const u = getCurrentUser();
    if (!u || u.accounts.length <= 1) return false;
    u.accounts = u.accounts.filter((a) => a.id !== accId);
    if (u.activeAccountId === accId) {
      u.activeAccountId = u.accounts[0].id;
      activeAccountId = u.activeAccountId;
    }
    saveUsers();
    return true;
  }

  // =========================================================================
  // TRADES CRUD (Scoped strictly to active account)
  // =========================================================================
  function getTrades() {
    return getActiveAccount().trades || [];
  }

  function saveTrade(tradeItem) {
    const acc = getActiveAccount();
    if (!acc.trades) acc.trades = [];

    if (tradeItem.id) {
      const idx = acc.trades.findIndex((t) => t.id === tradeItem.id);
      if (idx !== -1) {
        acc.trades[idx] = { ...acc.trades[idx], ...tradeItem, updated_at: new Date().toISOString() };
      } else {
        acc.trades.unshift({ ...tradeItem, created_at: new Date().toISOString() });
      }
    } else {
      tradeItem.id = 'tr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      tradeItem.created_at = new Date().toISOString();
      acc.trades.unshift(tradeItem);
    }

    saveUsers();
    return tradeItem;
  }

  function deleteTrade(tradeId) {
    const acc = getActiveAccount();
    acc.trades = (acc.trades || []).filter((t) => t.id !== tradeId);
    saveUsers();
  }

  return {
    rawUsers: () => users,
    saveUsers,
    getCurrentUser,
    setCurrentSession,
    getSessionEmail,
    getActiveAccount,
    setActiveAccountId,
    getAccounts,
    saveAccount,
    deleteAccount,
    getTrades,
    saveTrade,
    deleteTrade,
    localAdapter,
  };
})();
