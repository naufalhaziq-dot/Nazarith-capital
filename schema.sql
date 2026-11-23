-- ============================================================================
-- NAZARITH CAPITAL V8.0 — POSTGRESQL CLOUD DATABASE SCHEMA
-- Compatible with Supabase PostgreSQL (Standard SQL Editor execution)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Trader Identity & Global Workspace Settings)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT DEFAULT 'Institutional Trader',
    avatar_url TEXT,
    preferred_currency TEXT DEFAULT 'USD',
    theme TEXT DEFAULT 'institutional-dark',
    risk_mode TEXT DEFAULT 'conservative',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. WORKSPACES (Institutional Teams or Individual Isolation)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Default Workspace',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TRADING ACCOUNTS (Multi-account: Prop Firm Challenge, Funded, Evaluation, Personal)
CREATE TABLE IF NOT EXISTS public.trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    broker_firm TEXT NOT NULL DEFAULT 'Independent',
    account_type TEXT NOT NULL DEFAULT 'Personal' CHECK (account_type IN ('Challenge', 'Funded', 'Evaluation', 'Personal')),
    starting_capital NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
    current_equity NUMERIC(15, 2) DEFAULT 10000.00,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. TRADES (Institutional Trade Journal)
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    trade_date DATE NOT NULL DEFAULT CURRENT_DATE,
    symbol TEXT NOT NULL,
    market TEXT DEFAULT 'Forex' CHECK (market IN ('Forex', 'Crypto', 'Indices', 'Commodities', 'Stocks', 'Other')),
    direction TEXT NOT NULL CHECK (direction IN ('BUY', 'SELL', 'LONG', 'SHORT')),
    entry_price NUMERIC(15, 5),
    stop_loss NUMERIC(15, 5),
    take_profit NUMERIC(15, 5),
    exit_price NUMERIC(15, 5),
    lot_size NUMERIC(10, 3) DEFAULT 1.0,
    risk_percentage NUMERIC(6, 2) DEFAULT 0.50,
    risk_reward TEXT DEFAULT '1:3',
    setup TEXT DEFAULT 'SMC',
    setup_type TEXT DEFAULT 'Liquidity Sweep + MSS',
    result TEXT NOT NULL DEFAULT 'Open' CHECK (result IN ('Win', 'Loss', 'Breakeven', 'Open')),
    pnl NUMERIC(15, 2) DEFAULT 0.00,
    commission NUMERIC(10, 2) DEFAULT 0.00,
    swap NUMERIC(10, 2) DEFAULT 0.00,
    session TEXT DEFAULT 'London' CHECK (session IN ('Asia', 'London', 'New York', 'Overlap', 'Other')),
    emotion_before TEXT DEFAULT 'Calm',
    emotion_after TEXT DEFAULT 'Calm',
    execution_quality TEXT DEFAULT 'Good' CHECK (execution_quality IN ('Excellent', 'Good', 'Average', 'Poor')),
    entry_reason TEXT,
    exit_reason TEXT,
    confluence TEXT,
    mistake_tag TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    images JSONB DEFAULT '[]'::JSONB, -- Array of image URLs or base64 data
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TRADE SCREENSHOTS (Explicit storage metadata for charts)
CREATE TABLE IF NOT EXISTS public.trade_screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    caption TEXT,
    image_type TEXT DEFAULT 'entry' CHECK (image_type IN ('entry', 'exit', 'htf_context', 'review')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. STRATEGIES (Trading Playbook & Methodologies)
CREATE TABLE IF NOT EXISTS public.strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rules JSONB DEFAULT '[]'::JSONB,
    timeframe TEXT DEFAULT 'M15',
    win_rate_target NUMERIC(5, 2) DEFAULT 60.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. WATCHLISTS (Multi-Asset Observation & Bias)
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    timeframe TEXT DEFAULT 'H1 / M15',
    bias TEXT DEFAULT 'Neutral' CHECK (bias IN ('Bullish', 'Bearish', 'Neutral')),
    key_level TEXT,
    support_resistance TEXT,
    notes TEXT,
    alert_price NUMERIC(15, 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 8. RESEARCH NOTES (Knowledge Vault & Market Intelligence)
CREATE TABLE IF NOT EXISTS public.research_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Market Study',
    body TEXT,
    chart_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    linked_trade_id UUID REFERENCES public.trades(id) ON DELETE SET NULL,
    note_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. RISK SETTINGS (Capital Preservation & Policy Guardrails)
CREATE TABLE IF NOT EXISTS public.risk_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    daily_loss_limit NUMERIC(5, 2) DEFAULT 2.00,
    weekly_loss_limit NUMERIC(5, 2) DEFAULT 5.00,
    max_drawdown_limit NUMERIC(5, 2) DEFAULT 10.00,
    max_risk_per_trade NUMERIC(5, 2) DEFAULT 1.00,
    consecutive_loss_limit INT DEFAULT 3,
    risk_of_ruin_threshold NUMERIC(5, 2) DEFAULT 1.00,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_account_risk UNIQUE (account_id)
);

-- 10. PSYCHOLOGY LOGS (Behavioral Finance & Daily Reflections)
CREATE TABLE IF NOT EXISTS public.psychology_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    discipline_score INT CHECK (discipline_score BETWEEN 1 AND 10),
    session_quality TEXT DEFAULT 'Focused' CHECK (session_quality IN ('Focused', 'Mixed', 'Undisciplined')),
    emotional_state TEXT DEFAULT 'Calm',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_account_log_date UNIQUE (account_id, log_date)
);

-- 11. SMC SETUPS (Smart Money Concept Lab Evaluation)
CREATE TABLE IF NOT EXISTS public.smc_setups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    evaluation_date DATE DEFAULT CURRENT_DATE,
    symbol TEXT NOT NULL,
    bias TEXT NOT NULL DEFAULT 'Buy',
    planned_rr NUMERIC(6, 2) DEFAULT 2.00,
    timeframe TEXT DEFAULT 'M15',
    setup_type TEXT DEFAULT 'Liquidity Sweep + MSS',
    notes TEXT,
    score INT NOT NULL DEFAULT 0,
    grade TEXT NOT NULL DEFAULT 'C',
    factors TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 12. BACKTEST SESSIONS (Backtest Lab & Monte Carlo Results)
CREATE TABLE IF NOT EXISTS public.backtest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Simulation Session',
    strategy_name TEXT,
    initial_capital NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
    risk_per_trade NUMERIC(5, 2) DEFAULT 1.00,
    trade_count INT DEFAULT 0,
    win_rate NUMERIC(6, 2) DEFAULT 0.00,
    profit_factor NUMERIC(8, 2) DEFAULT 0.00,
    max_drawdown NUMERIC(6, 2) DEFAULT 0.00,
    expectancy NUMERIC(15, 2) DEFAULT 0.00,
    monte_carlo_p5 NUMERIC(15, 2),
    monte_carlo_p50 NUMERIC(15, 2),
    monte_carlo_p95 NUMERIC(15, 2),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 13. ECONOMIC EVENTS (Macro Schedule & Trading Restrictions)
CREATE TABLE IF NOT EXISTS public.economic_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TEXT,
    currency TEXT DEFAULT 'USD',
    impact TEXT DEFAULT 'High' CHECK (impact IN ('High', 'Medium', 'Low', 'Non-Economic')),
    note TEXT,
    is_custom BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 14. APP SETTINGS (User Specific Global Config)
CREATE TABLE IF NOT EXISTS public.app_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user ON public.trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_account ON public.trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_date ON public.trades(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON public.trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_result ON public.trades(result);
CREATE INDEX IF NOT EXISTS idx_watchlists_account ON public.watchlists(account_id);
CREATE INDEX IF NOT EXISTS idx_research_account ON public.research_notes(account_id);
CREATE INDEX IF NOT EXISTS idx_smc_account ON public.smc_setups(account_id);

-- ============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGN-UP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Trader')
    );
    
    -- Auto-create default primary trading account
    INSERT INTO public.trading_accounts (user_id, name, broker_firm, account_type, starting_capital)
    VALUES (
        NEW.id,
        'Main Institutional Account',
        'Personal Portfolio',
        'Personal',
        10000.00
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
