(function(){
  // TEMPORARY: Hard-coded Supabase publishable key and URL for testing (remove before production)
  // Supplied by user: https://enpjddbytfqykqywaqcc.supabase.co
  // Publishable key: sb_publishable_yfQJ8i1XldTUePghSPobeQ_V9UhqGO
  try {
    window.SUPABASE_URL = 'https://enpjddbytfqykqywaqcc.supabase.co';
    window.SUPABASE_ANON_KEY = 'sb_publishable_yfQJ8i1XldTUePghSPobeQ_V9UhqGOs';
  } catch(e) { /* ignore in non-browser contexts */ }

  // Minimal Supabase client integration for seeding events into existing calendar app.
  // Normalize runtime placeholders and fail gracefully with helpful logs.
  let _url = (window.SUPABASE_URL || '').trim();
  let _anon = (window.SUPABASE_ANON_KEY || '').trim();

  if (!_url || !_anon) {
    console.warn('supabase-integration: SUPABASE_URL or SUPABASE_ANON_KEY not set; skipping Supabase initialization.');
  } else {
    // Ensure protocol and strip trailing slashes
    if (!/^https?:\/\//i.test(_url)) _url = 'https://' + _url;
    _url = _url.replace(/\/+$/,'');

    // Validate URL
    try { new URL(_url); } catch (e) {
      console.error('supabase client create failed: invalid SUPABASE_URL ->', _url);
    }

    // Persist normalized values back to window so the rest of the script can use them
    window.SUPABASE_URL = _url;
    window.SUPABASE_ANON_KEY = _anon;

    // Create client if UMD 'supabase' is available
    if (window.supabase) {
      try { window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY); console.log('supabase client created'); } catch(e) { console.error('supabase client create failed', e); }
    } else {
      console.warn('supabase-integration: supabase UMD not found; ensure the supabase script is loaded before this integration script.');
    }
  }

  async function fetchAndSeed(accessToken) {
    try {
      const headers = { 'apikey': window.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = 'Bearer ' + accessToken;
      const url = window.SUPABASE_URL.replace(/\/+$/,'') + '/rest/v1/events?select=*';
      const resp = await fetch(url, { headers });
      if (!resp.ok) throw new Error('Failed to fetch events: ' + resp.status);
      const data = await resp.json();
      // Save raw events to localStorage so existing app can use them
      localStorage.setItem('ieeeacm_events', JSON.stringify(data));

      // Derive categories from event.category values (fallback)
      const names = Array.from(new Set(data.map(e => e.category || 'Other')));
      const cats = names.map((name, idx) => ({ id: (name || 'other').toString().toLowerCase().replace(/[^a-z0-9]+/g,'-'), name: name || 'Other', color: '#5B6770' }));
      localStorage.setItem('ieeeacm_categories', JSON.stringify(cats));

      localStorage.setItem('ieeeacm_seeded', 'true');
      // reload to let the calendar app load from localStorage
      try { location.reload(); } catch(e) { console.log('reload failed', e); }
    } catch (e) {
      console.error('supabase fetchAndSeed error', e);
    }
  }

  window.supabaseSignIn = async function(email, password) {
    if (!window.supabaseClient) return { error: 'no client' };
    try {
      const res = await window.supabaseClient.auth.signInWithPassword({ email: email, password: password });
      if (res.error || !res.data || !res.data.session) return res;
      const token = res.data.session.access_token;
      await fetchAndSeed(token);
      // Check if user is in admins table and mark admin flag
      try {
        const uid = res.data.user && res.data.user.id;
        if (uid) {
          const adminUrl = window.SUPABASE_URL.replace(/\/+$/,'') + '/rest/v1/admins?select=user_id&user_id=eq.' + uid;
          const adminResp = await fetch(adminUrl, { headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token } });
          if (adminResp.ok) {
            const arr = await adminResp.json();
            if (arr && arr.length) localStorage.setItem('ieeeacm_is_admin', 'true');
          }
        }
      } catch (e) { console.error('admin check failed', e); }
      return res;
    } catch (e) { return { error: e.message || String(e) }; }
  };

  document.addEventListener('DOMContentLoaded', function() {

    // If a Supabase session already exists, auto-restore admin mode.
    // Use a short delay to ensure events-calendar.js has exposed window.setAdminMode.
    setTimeout(async function() {
      try {
        if (!window.supabaseClient || !window.supabaseClient.auth) return;
        const { data } = await window.supabaseClient.auth.getSession();
        const session = data && data.session;
        if (session && session.access_token) {
          const uid = session.user && session.user.id;
          if (uid) {
            const adminUrl = window.SUPABASE_URL.replace(/\/+$/,'') + '/rest/v1/admins?select=user_id&user_id=eq.' + uid;
            const adminResp = await fetch(adminUrl, {
              headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + session.access_token }
            });
            if (adminResp.ok) {
              const arr = await adminResp.json();
              if (arr && arr.length) {
                // Auto-enable admin mode if user has an active admin session
                const toggle = document.getElementById('adminToggle');
                if (toggle) toggle.checked = true;
                if (typeof window.setAdminMode === 'function') window.setAdminMode(true);
              }
            }
          }
        }
      } catch(e) { console.error('supabase session check failed', e); }
    }, 0);
  });
})();
