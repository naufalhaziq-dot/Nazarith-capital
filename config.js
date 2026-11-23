/**
 * NAZARITH CAPITAL V8.0 — CONFIGURATION & CONSTANTS
 * Secure defaults, feature flags, and standalone local settings.
 */

window.NZ_CONFIG = {
  APP_NAME: 'NAZARITH CAPITAL',
  VERSION: 'V8.0 Institutional',
  RELEASE_STAGE: 'Production Ready',

  // Local-First Storage Keys (Retaining backward-compatibility with V3.0)
  STORAGE_PREFIX: 'nazarith_v8',
  LEGACY_STORE_KEYS: ['nazareth_capital_v1', 'nazarith_capital_v1', 'NAZARITH_CAPITAL'],

  // External API Connectors (Status: Optional / Plug-in)
  FINNHUB_KEY: '', // Optional for live market quotes or economic calendar
  AI_PROVIDER: 'groq', // Options: 'groq', 'openai', 'gemini', 'local'

  // Risk and Account Constants
  DEFAULT_CAPITAL: 10000,
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_RISK_PER_TRADE: 0.5,
  MAX_ATTACHMENT_SIZE_MB: 5,
  MAX_ATTACHMENTS_PER_TRADE: 3,

  // Feature Flags
  FEATURES: {
    MONTE_CARLO: true,
    SMC_LAB: true,
    RISK_INTELLIGENCE: true,
    AI_ANALYST: true,
    RESEARCH_VAULT: true,
    WATCHLIST: true,
    MACRO_PLANNER: true,
    CLOUD_SYNC: false,
  },
};
