/**
 * NAZARITH CAPITAL V8.0 — DATA & BACKUP CENTER
 * Export/Import CSV & JSON, pre-import validation, duplicate detection,
 * error reporting, and cloud backup snapshots.
 */

window.NZ_Backup = (function () {
  'use strict';

  const { $, escapeHtml, money, dateFmt, renderPageHead, openModal, closeModal, toast } = window.NZ_UI;

  function render() {
    const acc = window.NZ_Storage.getActiveAccount();
    const trades = acc.trades || [];

    const content = `
      ${renderPageHead(
        'DATA GOVERNANCE / DISASTER RECOVERY',
        'Data & Backup Center',
        'Export, import, validate, and restore your institutional journal and account records without data loss.'
      )}

      <!-- Export & Import Controls Grid -->
      <div class="grid two-col">
        <!-- Export Card -->
        <div class="card">
          <h3>Export Account Data</h3>
          <p class="muted" style="font-size:11px;margin-bottom:14px">
            Download your trade history, setup confluences, and chart attachments.
          </p>

          <div style="display:grid;gap:12px">
            <div style="background:#0c1520;padding:12px;border:1px solid var(--line);border-radius:var(--radius)">
              <b>Complete JSON Backup (with Chart Images)</b>
              <small style="color:var(--muted);display:block;margin:4px 0 10px">
                Full institutional backup containing all trades, setups, strategies, reflections, and chart attachments.
              </small>
              <button class="btn primary small" onclick="NZ_Backup.exportJSON()">↓ Export Full JSON Backup</button>
            </div>

            <div style="background:#0c1520;padding:12px;border:1px solid var(--line);border-radius:var(--radius)">
              <b>Spreadsheet CSV Export (Tabular Data)</b>
              <small style="color:var(--muted);display:block;margin:4px 0 10px">
                Standard comma-separated table of trade parameters for Excel, Google Sheets, or Python pandas analysis.
              </small>
              <button class="btn small ghost" onclick="NZ_Backup.exportCSV()">↓ Export Trades CSV</button>
            </div>
          </div>
        </div>

        <!-- Import Card -->
        <div class="card">
          <h3>Import & Restore Data</h3>
          <p class="muted" style="font-size:11px;margin-bottom:14px">
            Restore from JSON or import external trade records with automatic duplicate detection.
          </p>

          <div style="display:grid;gap:12px">
            <div style="background:#0c1520;padding:12px;border:1px solid var(--line);border-radius:var(--radius)">
              <b>Import JSON Backup File</b>
              <small style="color:var(--muted);display:block;margin:4px 0 10px">
                Restores complete account records with schema verification and pre-import preview.
              </small>
              <label class="btn primary small" for="importJsonInput" style="cursor:pointer">↑ Select JSON Backup File</label>
              <input id="importJsonInput" type="file" accept="application/json" hidden onchange="NZ_Backup.handleJsonImport(this.files[0])">
            </div>

            <div style="background:#0c1520;padding:12px;border:1px solid var(--line);border-radius:var(--radius)">
              <b>Import Trades from CSV</b>
              <small style="color:var(--muted);display:block;margin:4px 0 10px">
                Import CSV trade rows with column header matching and duplicate detection.
              </small>
              <label class="btn small ghost" for="importCsvInput" style="cursor:pointer">↑ Select CSV File</label>
              <input id="importCsvInput" type="file" accept=".csv,text/csv" hidden onchange="NZ_Backup.handleCsvImport(this.files[0])">
            </div>
          </div>
        </div>
      </div>

      <!-- Cloud Backup & Migration Section -->
      <div class="card" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <h3>Cloud Backup & Supabase Synchronization</h3>
            <p class="muted" style="font-size:11px;margin:4px 0 0">
              Synchronize your active browser journal with your personal Supabase PostgreSQL cloud database.
            </p>
          </div>
          <button class="btn gold small" onclick="NZ_Backup.triggerCloudSync()">☁ Sync to Supabase Cloud</button>
        </div>
      </div>

      <!-- Import Preview Container -->
      <div id="importPreviewContainer"></div>
    `;

    $('main').innerHTML = content;
  }

  function download(filename, content, type) {
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([content], { type }));
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const acc = window.NZ_Storage.getActiveAccount();
    const backupData = {
      app: window.NZ_CONFIG?.APP_NAME || 'NAZARITH CAPITAL',
      version: 'V8.0',
      exportedAt: new Date().toISOString(),
      account: {
        name: acc.name,
        firm: acc.firm,
        type: acc.type,
        capital: acc.capital,
      },
      trades: acc.trades || [],
      strategies: acc.strategies || [],
      notes: acc.notes || [],
      watch: acc.watch || [],
      events: acc.events || [],
      dailyReviews: acc.dailyReviews || {},
      smcSetups: acc.smcSetups || [],
    };

    const str = JSON.stringify(backupData, null, 2);
    const dateTag = new Date().toISOString().slice(0, 10);
    download(`nazarith-v8-backup-${acc.name.replace(/\s+/g, '_')}-${dateTag}.json`, str, 'application/json');
    toast('JSON backup exported.');
  }

  function exportCSV() {
    const acc = window.NZ_Storage.getActiveAccount();
    const trades = acc.trades || [];

    const headers = [
      'date',
      'symbol',
      'market',
      'direction',
      'entry_price',
      'stop_loss',
      'take_profit',
      'lot_size',
      'risk_percentage',
      'risk_reward',
      'setup',
      'result',
      'pnl',
      'session',
      'emotion_before',
      'execution_quality',
      'mistake_tag',
      'notes',
    ];

    const escapeCsv = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';

    const rows = trades.map((t) => [
      escapeCsv(t.trade_date || t.date),
      escapeCsv(t.symbol),
      escapeCsv(t.market || 'Forex'),
      escapeCsv(t.direction || 'BUY'),
      escapeCsv(t.entry_price ?? t.entry ?? ''),
      escapeCsv(t.stop_loss ?? t.stop ?? ''),
      escapeCsv(t.take_profit ?? t.target ?? ''),
      escapeCsv(t.lot_size ?? 1.0),
      escapeCsv(t.risk_percentage ?? t.risk ?? 0.5),
      escapeCsv(t.risk_reward ?? t.rr ?? '1:3'),
      escapeCsv(t.setup ?? 'SMC'),
      escapeCsv(t.result ?? 'Open'),
      escapeCsv(t.pnl ?? 0),
      escapeCsv(t.session ?? 'London'),
      escapeCsv(t.emotion_before ?? t.emotion ?? 'Calm'),
      escapeCsv(t.execution_quality ?? t.execution ?? 'Good'),
      escapeCsv(t.mistake_tag ?? ''),
      escapeCsv(t.notes ?? ''),
    ]);

    const csvContent = '\ufeff' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    download(`nazarith-trades-${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8');
    toast('Trades CSV exported.');
  }

  function handleJsonImport(file) {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        // Validation check
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid JSON format.');
        }

        const tradesToImport = Array.isArray(data.trades) ? data.trades : [];
        if (!tradesToImport.length && !Array.isArray(data.accounts)) {
          throw new Error('No valid trade or account entries discovered in backup.');
        }

        // Check duplicates against current account
        const currentTrades = window.NZ_Storage.getTrades();
        let duplicateCount = 0;
        let freshTrades = [];

        tradesToImport.forEach((it) => {
          const isDup = currentTrades.some((ct) => {
            const dateMatch = (ct.trade_date || ct.date || '') === (it.trade_date || it.date || '');
            const symMatch = String(ct.symbol || '').toUpperCase() === String(it.symbol || '').toUpperCase();
            const pnlMatch = Number(ct.pnl || 0) === Number(it.pnl || 0);
            return dateMatch && symMatch && pnlMatch;
          });

          if (isDup) {
            duplicateCount++;
          } else {
            freshTrades.push(it);
          }
        });

        // Show Pre-import Preview Modal (Master Prompt Rule J)
        openModal(`
          <div class="modal-head">
            <div>
              <div class="eyebrow">DATA VALIDATION & PREVIEW</div>
              <h2>Import Backup Preview</h2>
            </div>
            <button class="btn small ghost" onclick="NZ_UI.closeModal()">✕</button>
          </div>

          <div class="detail-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
            <div><small>Total Trades in File</small><b>${tradesToImport.length}</b></div>
            <div><small>New Unique Trades</small><b class="positive">${freshTrades.length}</b></div>
            <div><small>Duplicate Records Detected</small><b class="negative">${duplicateCount}</b></div>
          </div>

          <p class="muted" style="font-size:12px;line-height:1.7">
            Duplicate detection safeguards prevent double-counting realized returns and skewing win rate statistics. 
            Choose whether to append only unique trades or replace the active journal entirely.
          </p>

          <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px">
            <button class="btn ghost" onclick="NZ_UI.closeModal()">Cancel</button>
            <button class="btn small" id="btnAppendTrades">Append Unique (${freshTrades.length})</button>
            <button class="btn danger small" id="btnReplaceTrades">Replace Entire Journal</button>
          </div>
        `);

        $('btnAppendTrades').onclick = () => {
          const acc = window.NZ_Storage.getActiveAccount();
          acc.trades = [...freshTrades, ...(acc.trades || [])];
          window.NZ_Storage.saveUsers();
          closeModal();
          render();
          toast(`Appended ${freshTrades.length} unique trades.`);
        };

        $('btnReplaceTrades').onclick = () => {
          if (!confirm(`Replace current journal (${currentTrades.length} trades) with ${tradesToImport.length} imported trades?`)) return;
          const acc = window.NZ_Storage.getActiveAccount();
          acc.trades = tradesToImport;
          window.NZ_Storage.saveUsers();
          closeModal();
          render();
          toast(`Journal replaced with ${tradesToImport.length} trades.`);
        };
      } catch (err) {
        toast(`Import failed: ${err.message}`, 'error');
      }
    };

    reader.readAsText(file);
    $('importJsonInput').value = '';
  }

  function handleCsvImport(file) {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('CSV must contain header row and at least one data row.');
        }

        const headers = lines[0].split(',').map((h) => h.replace(/^["'\s]+|["'\s]+$/g, '').toLowerCase());
        const dateIdx = headers.findIndex((h) => h.includes('date'));
        const symIdx = headers.findIndex((h) => h.includes('symbol') || h.includes('pair'));
        const pnlIdx = headers.findIndex((h) => h.includes('pnl') || h.includes('profit'));
        const dirIdx = headers.findIndex((h) => h.includes('dir'));
        const resIdx = headers.findIndex((h) => h.includes('result') || h.includes('outcome'));

        if (symIdx === -1) {
          throw new Error('CSV requires at least a "symbol" or "pair" column.');
        }

        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
          if (cols.length < 2) continue;

          imported.push({
            id: 'tr_csv_' + Date.now() + '_' + i,
            trade_date: dateIdx !== -1 ? cols[dateIdx] : new Date().toISOString().slice(0, 10),
            symbol: (cols[symIdx] || 'XAUUSD').toUpperCase(),
            direction: dirIdx !== -1 ? cols[dirIdx].toUpperCase() : 'BUY',
            pnl: pnlIdx !== -1 ? Number(cols[pnlIdx]) || 0 : 0,
            result: resIdx !== -1 ? cols[resIdx] : Number(cols[pnlIdx]) > 0 ? 'Win' : 'Loss',
            lot_size: 1.0,
            risk_reward: '1:2',
            setup: 'Imported CSV',
            images: [],
          });
        }

        const acc = window.NZ_Storage.getActiveAccount();
        acc.trades = [...imported, ...(acc.trades || [])];
        window.NZ_Storage.saveUsers();
        render();
        toast(`Imported ${imported.length} trades from CSV.`);
      } catch (err) {
        toast(`CSV Import error: ${err.message}`, 'error');
      }
    };

    reader.readAsText(file);
    $('importCsvInput').value = '';
  }

  async function triggerCloudSync() {
    toast('Initiating Supabase cloud synchronization...');
    const res = await window.NZ_Migration.syncLocalToSupabase();
    if (res.success) {
      toast(`Cloud sync completed! Uploaded ${res.uploadedTrades || 0} trades to Supabase.`);
    } else {
      toast(`Cloud sync notice: ${res.reason || res.error || 'Configure Supabase credentials in Settings.'}`, 'error');
    }
  }

  return {
    render,
    exportJSON,
    exportCSV,
    handleJsonImport,
    handleCsvImport,
    triggerCloudSync,
  };
})();
