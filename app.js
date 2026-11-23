/**
 * NAZARITH CAPITAL V8.0 — MAIN ROUTER & SYSTEM ORCHESTRATOR
 * Coordinates global state, 14 institutional modules, local authentication and browser storage.
 */

window.NZ_App = (function () {
  'use strict';

  const { $, toast } = window.NZ_UI;

  let currentPage = 'dashboard';
  let authMode = 'login'; // 'login' or 'register'

  const routes = {
    dashboard: () => window.NZ_Portfolio.render(),
    journal: () => window.NZ_Journal.render(),
    analytics: () => window.NZ_Analytics.render(),
    backtest: () => window.NZ_Backtest.render(),
    risk: () => window.NZ_Risk.render(),
    analyst: () => window.NZ_Analyst.render(),
    smclab: () => window.NZ_SMCLab.render(),
    strategy: () => window.NZ_Strategy.render(),
    research: () => window.NZ_Research.render(),
    watchlist: () => window.NZ_Watchlist.render(),
    calendar: () => window.NZ_Calendar.render(),
    psychology: () => window.NZ_Psychology.render(),
    capital: () => window.NZ_Capital.render(),
    reports: () => window.NZ_Reports.render(),
    events: () => window.NZ_Events.render(),
    backup: () => window.NZ_Backup.render(),
    settings: () => window.NZ_Settings.render(),
  };

  function getCurrentPage() {
    return currentPage;
  }

  function navigate(page) {
    if (!routes[page]) page = 'dashboard';
    currentPage = page;

    // Update sidebar navigation active state
    document.querySelectorAll('.sidebar .nav').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Execute route
    try {
      routes[page]();
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error rendering page:', page, err);
      $('main').innerHTML = `
        <div class="card" style="border-color:var(--red);margin-top:20px">
          <h3 class="negative">Module Execution Error</h3>
          <p class="muted">An error occurred while loading this module: ${err.message}</p>
          <button class="btn small primary" onclick="NZ_App.navigate('dashboard')">Return to Overview</button>
        </div>
      `;
    }
  }

  function syncView() {
    const sessionEmail = window.NZ_Storage.getSessionEmail();
    const currentUser = window.NZ_Storage.getCurrentUser();
    const isLogged = !!sessionEmail && !!currentUser;

    const discoverEl = $('discover');
    const authEl = $('auth');
    const workspaceEl = $('workspace');
    const topLoginBtn = $('topLogin');
    const topStartBtn = $('topStart');
    const topUserSpan = $('topUser');

    if (discoverEl) discoverEl.classList.toggle('hidden', isLogged || authEl?.classList.contains('visible'));
    if (authEl) authEl.classList.toggle('hidden', isLogged || !authEl.classList.contains('visible'));
    if (workspaceEl) workspaceEl.classList.toggle('hidden', !isLogged);

    if (topLoginBtn) topLoginBtn.classList.toggle('hidden', isLogged);
    if (topStartBtn) topStartBtn.classList.toggle('hidden', isLogged);
    if (topUserSpan) topUserSpan.textContent = isLogged ? currentUser.name : '';

    if (isLogged) {
      window.NZ_Accounts.renderAccountSwitcher();
      navigate(currentPage);
    }
  }

  function showAuth(mode = 'login') {
    authMode = mode;
    $('discover')?.classList.add('hidden');
    $('auth')?.classList.remove('hidden');
    $('auth')?.classList.add('visible');
    setAuthMode(mode);
    if ($('authEmail')) $('authEmail').value = '';
    if ($('authPassword')) $('authPassword').value = '';
  }

  function backDiscover() {
    $('auth')?.classList.add('hidden');
    $('auth')?.classList.remove('visible');
    $('discover')?.classList.remove('hidden');
  }

  function setAuthMode(mode) {
    const isReg = mode === 'register';
    authMode = mode;
    if ($('authTitle')) $('authTitle').textContent = isReg ? 'Create your account.' : 'Welcome back.';
    if ($('authSub'))
      $('authSub').textContent = isReg
        ? 'Establish your private institutional trading workspace.'
        : 'Sign in to your private workspace.';
    if ($('nameField')) $('nameField').classList.toggle('hidden', !isReg);
    if ($('authName')) $('authName').required = isReg;
    if ($('authSubmit')) $('authSubmit').textContent = isReg ? 'Create Account' : 'Sign In';
    if ($('authSwitchText')) $('authSwitchText').textContent = isReg ? 'Already have an account?' : 'New to Nazarith?';
    if ($('authSwitch')) $('authSwitch').textContent = isReg ? 'Sign In' : 'Create Account';
  }

  function toggleAuthMode(e) {
    if (e) e.preventDefault();
    authMode = authMode === 'login' ? 'register' : 'login';
    setAuthMode(authMode);
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = ($('authEmail')?.value || '').trim().toLowerCase();
    const pass = $('authPassword')?.value || '';
    const name = ($('authName')?.value || '').trim();

    if (!email || !pass) {
      toast('Please enter your email and password.', 'error');
      return;
    }

    if (pass.length < 6) {
      toast('Password must be at least 6 characters.', 'error');
      return;
    }

    // Standalone edition: local browser authentication only.
    // Local-only authentication
    const rawUsers = window.NZ_Storage.rawUsers();

    if (authMode === 'register') {
      if (rawUsers[email]) {
        toast('Email already registered in this browser. Choose Sign In.', 'error');
        return;
      }
      rawUsers[email] = {
        name: name || 'Trader',
        password: pass,
        accounts: [],
      };
      window.NZ_Storage.setCurrentSession(email);
      window.NZ_Storage.saveUsers();
      toast('Account established. Welcome to Nazarith Capital.');
    } else {
      const user = rawUsers[email];
      if (!user) {
        toast('Account not found in this browser. Choose Create Account to register.', 'error');
        return;
      }
      if (user.password !== pass) {
        toast('Incorrect password. Please try again.', 'error');
        return;
      }
      window.NZ_Storage.setCurrentSession(email);
      toast('Welcome back.');
    }

    $('auth')?.classList.remove('visible');
    syncView();
  }

  function logout() {
    window.NZ_Storage.setCurrentSession('');
    syncView();
    toast('Signed out of workspace.');
  }

  // Initialize Landing Page Scroll Reveal
  function initScrollReveal() {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = document.querySelectorAll(
      '#discover .landing-section, #discover .landing-card, #discover .landing-product, #discover .founder-profile'
    );
    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );
    elements.forEach((el) => {
      el.setAttribute('data-reveal', '');
      observer.observe(el);
    });
  }

  // Bootstrapping
  function init() {
    $('authForm')?.addEventListener('submit', handleAuthSubmit);
    initScrollReveal();
    syncView();
  }

  return {
    init,
    navigate,
    getCurrentPage,
    syncView,
    showAuth,
    backDiscover,
    toggleAuthMode,
    logout,
  };
})();

// Auto-run bootstrap when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.NZ_App.init());
} else {
  window.NZ_App.init();
}
