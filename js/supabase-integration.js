(function(){
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

  // If admin password modal exists, add an email input above the password field so users can sign in with Supabase credentials.
  document.addEventListener('DOMContentLoaded', function() {
    const adminModal = document.getElementById('adminPasswordModal');
    if (adminModal) {
      const box = adminModal.querySelector('.admin-password-box');
      const pw = document.getElementById('adminPasswordInput');
      if (pw && !document.getElementById('adminEmailInput')) {
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.id = 'adminEmailInput';
        emailInput.placeholder = 'Admin email';
        emailInput.style.marginBottom = '0.5rem';
        pw.parentNode.insertBefore(emailInput, pw);
      }

      const submitBtn = document.getElementById('adminPasswordSubmit');
      if (submitBtn) {
        submitBtn.addEventListener('click', async function onClick(e) {
          if (!window.supabaseClient) return; // fallback to existing behaviour
          const emailEl = document.getElementById('adminEmailInput');
          const email = emailEl ? emailEl.value.trim() : '';
          const pwEl = document.getElementById('adminPasswordInput');
          const password = pwEl ? pwEl.value : '';
          if (!email || !password) {
            const err = document.getElementById('adminError'); if (err) { err.style.display = 'block'; err.textContent = 'Enter email and password.'; }
            return;
          }
          submitBtn.disabled = true;
          const res = await window.supabaseSignIn(email, password);
          submitBtn.disabled = false;
          if (res.error) {
            const err = document.getElementById('adminError'); if (err) { err.style.display = 'block'; err.textContent = 'Sign-in failed.'; }
            console.error('supabase sign-in error', res.error);
            return;
          }
          // success: close modal, mark admin UI on page
          try { adminModal.classList.remove('active'); } catch(e){}
          try { document.getElementById('adminToggle').checked = true; } catch(e){}
          localStorage.setItem('ieeeacm_is_admin','true');
          try {
            const adminBar = document.getElementById('adminBar'); if (adminBar) adminBar.classList.add('admin-active');
            const adminActions = document.getElementById('adminActions'); if (adminActions) adminActions.style.display = 'flex';
          } catch(e){}
          if (typeof showToast === 'function') showToast('Signed in (Supabase). Admin mode enabled.', 'success');
        });
      }
    }

    // If a session already exists, seed silently
    (async function() {
      try {
        if (!window.supabaseClient || !window.supabaseClient.auth) return;
        const { data } = await window.supabaseClient.auth.getSession();
        const session = data && data.session;
        if (session && session.access_token) {
          await fetchAndSeed(session.access_token);
          // check admin
          try {
            const uid = session.user && session.user.id;
            if (uid) {
              const adminUrl = window.SUPABASE_URL.replace(/\/+$/,'') + '/rest/v1/admins?select=user_id&user_id=eq.' + uid;
              const adminResp = await fetch(adminUrl, { headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + session.access_token } });
              if (adminResp.ok) {
                const arr = await adminResp.json(); if (arr && arr.length) localStorage.setItem('ieeeacm_is_admin','true');
              }
            }
          } catch(e){}
        }
      } catch(e) { console.error('supabase session check failed', e); }
    })();
  });
})();
