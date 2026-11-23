-- ============================================================================
-- NAZARITH CAPITAL V8.0 — ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Users can NEVER read, insert, update or delete other users' data.
-- ============================================================================

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smc_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. WORKSPACES POLICIES
DROP POLICY IF EXISTS "Users manage their own workspaces" ON public.workspaces;
CREATE POLICY "Users manage their own workspaces"
    ON public.workspaces FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. TRADING ACCOUNTS POLICIES
DROP POLICY IF EXISTS "Users manage their own trading accounts" ON public.trading_accounts;
CREATE POLICY "Users manage their own trading accounts"
    ON public.trading_accounts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. TRADES POLICIES
DROP POLICY IF EXISTS "Users manage their own trade journals" ON public.trades;
CREATE POLICY "Users manage their own trade journals"
    ON public.trades FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. TRADE SCREENSHOTS POLICIES
DROP POLICY IF EXISTS "Users manage their own trade screenshots" ON public.trade_screenshots;
CREATE POLICY "Users manage their own trade screenshots"
    ON public.trade_screenshots FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. STRATEGIES POLICIES
DROP POLICY IF EXISTS "Users manage their own strategies" ON public.strategies;
CREATE POLICY "Users manage their own strategies"
    ON public.strategies FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. WATCHLISTS POLICIES
DROP POLICY IF EXISTS "Users manage their own watchlists" ON public.watchlists;
CREATE POLICY "Users manage their own watchlists"
    ON public.watchlists FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. RESEARCH NOTES POLICIES
DROP POLICY IF EXISTS "Users manage their own research notes" ON public.research_notes;
CREATE POLICY "Users manage their own research notes"
    ON public.research_notes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 10. RISK SETTINGS POLICIES
DROP POLICY IF EXISTS "Users manage their own risk settings" ON public.risk_settings;
CREATE POLICY "Users manage their own risk settings"
    ON public.risk_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 11. PSYCHOLOGY LOGS POLICIES
DROP POLICY IF EXISTS "Users manage their own psychology logs" ON public.psychology_logs;
CREATE POLICY "Users manage their own psychology logs"
    ON public.psychology_logs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 12. SMC SETUPS POLICIES
DROP POLICY IF EXISTS "Users manage their own SMC setups" ON public.smc_setups;
CREATE POLICY "Users manage their own SMC setups"
    ON public.smc_setups FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 13. BACKTEST SESSIONS POLICIES
DROP POLICY IF EXISTS "Users manage their own backtest sessions" ON public.backtest_sessions;
CREATE POLICY "Users manage their own backtest sessions"
    ON public.backtest_sessions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 14. ECONOMIC EVENTS POLICIES
DROP POLICY IF EXISTS "Users manage their own economic events" ON public.economic_events;
CREATE POLICY "Users manage their own economic events"
    ON public.economic_events FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 15. APP SETTINGS POLICIES
DROP POLICY IF EXISTS "Users manage their own app settings" ON public.app_settings;
CREATE POLICY "Users manage their own app settings"
    ON public.app_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION & POLICIES
-- Bucket: 'trade-attachments'
-- ============================================================================

-- Create storage bucket if not exists via Supabase internal storage schema
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-attachments', 'trade-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for viewing storage objects
DROP POLICY IF EXISTS "Users can view trade screenshots" ON storage.objects;
CREATE POLICY "Users can view trade screenshots"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'trade-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for uploading trade screenshots
DROP POLICY IF EXISTS "Users can upload their own trade screenshots" ON storage.objects;
CREATE POLICY "Users can upload their own trade screenshots"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'trade-attachments' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy for deleting their trade screenshots
DROP POLICY IF EXISTS "Users can delete their own trade screenshots" ON storage.objects;
CREATE POLICY "Users can delete their own trade screenshots"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'trade-attachments' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
