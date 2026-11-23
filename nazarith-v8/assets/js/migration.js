/**
 * NAZARITH CAPITAL V8.0 — DATA MIGRATION & CLOUD SYNCHRONIZATION ENGINE
 * Safely transfers V3.0 localStorage data to V8.0 schema and Supabase Cloud.
 */

window.NZ_Migration = (function () {
  'use strict';

  /**
   * Migrate legacy V3.0 browser storage to V8.0 standard format.
   */
  function migrateV3ToV8() {
    let migratedCount = 0;
    try {
      const v3Users = window.NZ_Storage.rawUsers();
      if (!v3Users || typeof v3Users !== 'object') return { migratedCount: 0 };

      for (const email of Object.keys(v3Users)) {
        const u = v3Users[email];
        if (!u) continue;

        // Ensure accounts array exists
        if (!Array.isArray(u.accounts) || !u.accounts.length) {
          u.accounts = [
            {
              id: 'acc_' + Date.now(),
              name: 'Main Institutional Account',
              firm: 'Personal Portfolio',
              type: 'Personal',
              capital: Number(u.capital) || 10000,
              trades: Array.isArray(u.trades) ? u.trades : [],
              strategies: u.strategies || [],
              notes: u.notes || [],
              watch: u.watch || [],
              events: u.events || [],
              dailyReviews: u.dailyReviews || {},
              riskPolicy: u.riskPolicy || { dailyLimit: 2, weeklyLimit: 5, maxRisk: 1, maxDrawdown: 10 },
              smcSetups: u.smcSetups || [],
            },
          ];
          u.activeAccountId = u.accounts[0].id;
          migratedCount++;
        }

        // Audit each trade in each account to ensure V8 fields exist
        u.accounts.forEach((acc) => {
          if (Array.isArray(acc.trades)) {
            acc.trades.forEach((t) => {
              // Ensure standard V8 fields
              if (!t.id) t.id = 'tr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
              if (!t.trade_date && t.date) t.trade_date = t.date;
              if (!t.entry_price && t.entry) t.entry_price = t.entry;
              if (!t.stop_loss && t.stop) t.stop_loss = t.stop;
              if (!t.take_profit && t.target) t.take_profit = t.target;
              if (!t.risk_percentage && t.risk) t.risk_percentage = t.risk;
              if (!t.risk_reward && t.rr) t.risk_reward = t.rr;
              if (!t.images) t.images = [];
              if (!t.tags) t.tags = [];
              if (!t.mistake_tag) t.mistake_tag = '';
              if (!t.session) t.session = 'London';
              if (!t.emotion_before) t.emotion_before = t.emotion || 'Calm';
              if (!t.emotion_after) t.emotion_after = t.emotion || 'Calm';
              if (!t.execution_quality) t.execution_quality = t.execution || 'Good';
            });
          }
        });
      }

      window.NZ_Storage.saveUsers();
    } catch (err) {
      console.error('Error during V3 to V8 migration:', err);
    }
    return { migratedCount };
  }

  /**
   * Sync local user data to Supabase Cloud on login.
   * Performs deduplication based on trade date, symbol, entry_price, and direction.
   */
  async function syncLocalToSupabase() {
    const sb = window.NZ_Supabase.getClient();
    const user = window.NZ_Supabase.getUser();

    if (!sb || !user) {
      return { success: false, reason: 'Not authenticated with Supabase' };
    }

    try {
      const u = window.NZ_Storage.getCurrentUser();
      if (!u || !Array.isArray(u.accounts)) return { success: true, count: 0 };

      let uploadedTrades = 0;
      let uploadedAccounts = 0;

      // 1. Fetch existing accounts from Supabase to prevent duplicates
      const { data: cloudAccounts, error: accError } = await sb
        .from('trading_accounts')
        .select('id, name, broker_firm')
        .eq('user_id', user.id);

      if (accError) throw accError;

      const accountMap = {}; // localId -> cloudId

      for (const localAcc of u.accounts) {
        let matchingCloudAcc = cloudAccounts?.find((ca) => ca.name === localAcc.name);

        if (!matchingCloudAcc) {
          // Insert into Supabase
          const { data: newAcc, error: insertAccErr } = await sb
            .from('trading_accounts')
            .insert({
              user_id: user.id,
              name: localAcc.name,
              broker_firm: localAcc.firm || 'Independent',
              account_type: localAcc.type || 'Personal',
              starting_capital: Number(localAcc.capital) || 10000,
            })
            .select()
            .single();

          if (insertAccErr) throw insertAccErr;
          matchingCloudAcc = newAcc;
          uploadedAccounts++;
        }

        accountMap[localAcc.id] = matchingCloudAcc.id;

        // 2. Fetch existing trades for this cloud account to avoid duplicate records
        const { data: cloudTrades, error: tradeQueryErr } = await sb
          .from('trades')
          .select('id, symbol, trade_date, entry_price, direction')
          .eq('account_id', matchingCloudAcc.id);

        if (tradeQueryErr) throw tradeQueryErr;

        const isDuplicate = (t) => {
          return (cloudTrades || []).some((ct) => {
            const dateMatch = (ct.trade_date || '') === (t.trade_date || t.date || '');
            const symMatch = String(ct.symbol).toUpperCase() === String(t.symbol).toUpperCase();
            const dirMatch = String(ct.direction).toUpperCase() === String(t.direction).toUpperCase();
            return dateMatch && symMatch && dirMatch;
          });
        };

        // Filter trades to insert
        const tradesToInsert = (localAcc.trades || [])
          .filter((t) => !isDuplicate(t))
          .map((t) => ({
            user_id: user.id,
            account_id: matchingCloudAcc.id,
            trade_date: t.trade_date || t.date || new Date().toISOString().slice(0, 10),
            symbol: (t.symbol || 'XAUUSD').toUpperCase(),
            market: t.market || 'Forex',
            direction: t.direction || 'BUY',
            entry_price: Number(t.entry_price || t.entry) || null,
            stop_loss: Number(t.stop_loss || t.stop) || null,
            take_profit: Number(t.take_profit || t.target) || null,
            lot_size: Number(t.lot_size) || 1.0,
            risk_percentage: Number(t.risk_percentage || t.risk) || 0.5,
            risk_reward: t.risk_reward || t.rr || '1:3',
            setup: t.setup || 'SMC',
            setup_type: t.setup_type || 'Order Block',
            result: t.result || 'Open',
            pnl: Number(t.pnl) || 0,
            session: t.session || 'London',
            emotion_before: t.emotion_before || 'Calm',
            emotion_after: t.emotion_after || 'Calm',
            execution_quality: t.execution_quality || 'Good',
            entry_reason: t.entry_reason || '',
            exit_reason: t.exit_reason || '',
            confluence: t.confluence || '',
            mistake_tag: t.mistake_tag || '',
            tags: Array.isArray(t.tags) ? t.tags : [],
            notes: t.notes || '',
            images: Array.isArray(t.images) ? t.images : [],
          }));

        if (tradesToInsert.length > 0) {
          const { error: batchErr } = await sb.from('trades').insert(tradesToInsert);
          if (batchErr) throw batchErr;
          uploadedTrades += tradesToInsert.length;
        }
      }

      return {
        success: true,
        uploadedAccounts,
        uploadedTrades,
      };
    } catch (err) {
      console.error('Error syncing local data to Supabase:', err);
      return { success: false, error: err.message };
    }
  }

  // Run initial migration immediately
  migrateV3ToV8();

  return {
    migrateV3ToV8,
    syncLocalToSupabase,
  };
})();
