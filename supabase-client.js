/**
 * NAZARITH CAPITAL V8.0 — SUPABASE CLIENT & CLOUD SYNC ENGINE
 * Full Auth, PostgreSQL, RLS integration and cloud storage for screenshots.
 */

window.NZ_Supabase = (function () {
  'use strict';

  let client = null;
  let isConnected = false;
  let currentSession = null;
  let syncListeners = [];

  function getSavedConfig() {
    try {
      const stored = localStorage.getItem('nazarith_supabase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          url: parsed.url || window.NZ_CONFIG?.SUPABASE_URL || '',
          key: parsed.key || window.NZ_CONFIG?.SUPABASE_ANON_KEY || '',
        };
      }
    } catch (e) {
      console.warn('Could not read Supabase stored config:', e);
    }
    return {
      url: window.NZ_CONFIG?.SUPABASE_URL || '',
      key: window.NZ_CONFIG?.SUPABASE_ANON_KEY || '',
    };
  }

  function setSavedConfig(url, key) {
    try {
      localStorage.setItem('nazarith_supabase_config', JSON.stringify({ url: url.trim(), key: key.trim() }));
      initClient(url.trim(), key.trim());
    } catch (e) {
      console.error('Failed to save Supabase config:', e);
    }
  }

  function initClient(customUrl, customKey) {
    const { url, key } = customUrl && customKey ? { url: customUrl, key: customKey } : getSavedConfig();

    if (!url || !key) {
      client = null;
      isConnected = false;
      notifySyncStatus('disconnected', 'Supabase credentials not configured. Running in Local-First Offline Mode.');
      return null;
    }

    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        client = window.supabase.createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
        isConnected = true;
        notifySyncStatus('connected', 'Connected to Supabase Cloud.');

        // Listen to Auth State Changes
        client.auth.onAuthStateChange((event, session) => {
          currentSession = session;
          if (event === 'SIGNED_IN' && session) {
            notifySyncStatus('authenticated', `Signed in as ${session.user.email}`);
            window.dispatchEvent(new CustomEvent('nz-supabase-auth-change', { detail: { event, session } }));
          } else if (event === 'SIGNED_OUT') {
            notifySyncStatus('signed_out', 'Signed out of Supabase.');
            window.dispatchEvent(new CustomEvent('nz-supabase-auth-change', { detail: { event, session: null } }));
          }
        });

        // Check active session immediately
        client.auth.getSession().then(({ data }) => {
          if (data && data.session) {
            currentSession = data.session;
          }
        });
      } else {
        console.warn('Supabase JS SDK library not found in window. Loading offline mode.');
        client = null;
        isConnected = false;
        notifySyncStatus('offline', 'Supabase CDN script unavailable. Running offline.');
      }
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      client = null;
      isConnected = false;
      notifySyncStatus('error', err.message);
    }

    return client;
  }

  function notifySyncStatus(state, message) {
    syncListeners.forEach((fn) => {
      try {
        fn({ state, message, isConnected: isConnected && !!client });
      } catch (e) {
        console.error(e);
      }
    });
  }

  function onSyncStatusChange(fn) {
    if (typeof fn === 'function') syncListeners.push(fn);
  }

  // =========================================================================
  // AUTHENTICATION METHODS
  // =========================================================================
  async function signUp(email, password, fullName) {
    if (!client) throw new Error('Supabase is not configured. Please add URL & Anon Key in Settings.');
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || 'Institutional Trader',
        },
      },
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    if (!client) throw new Error('Supabase is not configured. Please add URL & Anon Key in Settings.');
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    currentSession = data.session;
    return data;
  }

  async function signOut() {
    if (client) {
      await client.auth.signOut();
    }
    currentSession = null;
  }

  async function resetPassword(email) {
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    return data;
  }

  function getClient() {
    if (!client) initClient();
    return client;
  }

  function isAvailable() {
    return isConnected && !!client;
  }

  function getUser() {
    return currentSession?.user || null;
  }

  // =========================================================================
  // STORAGE ATTACHMENT METHODS (Chart Screenshots)
  // =========================================================================
  async function uploadScreenshot(fileOrBase64, filename) {
    if (!client || !currentSession?.user) {
      // Local fallback: return base64 string directly
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
    }

    try {
      let fileBody;
      let contentType = 'image/jpeg';

      if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
        // Convert Base64 data URL to Blob
        const parts = fileOrBase64.split(';base64,');
        contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const uInt8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        fileBody = new Blob([uInt8Array], { type: contentType });
      } else {
        fileBody = fileOrBase64;
        contentType = fileOrBase64.type || 'image/jpeg';
      }

      const userId = currentSession.user.id;
      const cleanName = (filename || `chart_${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${userId}/${Date.now()}_${cleanName}`;

      const { data, error } = await client.storage
        .from(window.NZ_CONFIG.SUPABASE_BUCKET || 'trade-attachments')
        .upload(storagePath, fileBody, {
          contentType,
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = client.storage
        .from(window.NZ_CONFIG.SUPABASE_BUCKET || 'trade-attachments')
        .getPublicUrl(storagePath);

      return urlData?.publicUrl || storagePath;
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to local image:', err);
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
    }
  }

  // Initialize on script load
  setTimeout(() => initClient(), 100);

  return {
    initClient,
    getSavedConfig,
    setSavedConfig,
    getClient,
    isAvailable,
    getUser,
    signUp,
    signIn,
    signOut,
    resetPassword,
    uploadScreenshot,
    onSyncStatusChange,
  };
})();
