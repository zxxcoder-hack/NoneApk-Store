(function () {
  const appEl = document.getElementById('app');
  const navBack = document.getElementById('navBack');
  const yearEl = document.getElementById('year');
  const BASE_TITLE = 'noneapk.xyz';

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  let appData = null;

  function setBackLink(href, label) {
    if (!navBack) return;
    if (href) {
      navBack.hidden = false;
      navBack.setAttribute('href', href);
      navBack.textContent = label || '← Back';
    } else {
      navBack.hidden = true;
    }
  }

  function setTitle(t) {
    document.title = t ? `${t} · ${BASE_TITLE}` : BASE_TITLE;
  }

  function render() {
    // Guard: file:// protocol
    if (window.location.protocol === 'file:') {
      appEl.innerHTML = `
        <div class="empty">
          <div class="empty-icon">▢</div>
          <div class="empty-title">This site must be served over HTTP</div>
          <div class="empty-desc">
            Run <code>python3 -m http.server 8000</code> then open
            <code>http://localhost:8000</code>.
          </div>
        </div>
      `;
      return;
    }

    // Guard: data not loaded yet
    if (!appData) {
      appEl.innerHTML = `
        <div class="empty">
          <div class="empty-title">No data loaded</div>
          <div class="empty-desc">Could not load apps.json. Check the console for errors.</div>
        </div>
      `;
      return;
    }

    const route = window.Router.currentRoute();
    const appId = route[0];
    const sub = route[1];

    window.scrollTo(0, 0);

    // Landing page
    if (!appId) {
      setBackLink(null);
      setTitle('');
      appEl.innerHTML = window.Views.landingView(appData);
      return;
    }

    const app = appData[appId];

    // App not found
    if (!app) {
      setBackLink('/', '← All apps');
      setTitle('Not found');
      appEl.innerHTML = window.Views.notFoundView(appId);
      return;
    }

    // Purchase page
    if (sub === 'purchase') {
      setBackLink(`/${appId}`, '← Back');
      setTitle(`Products for ${app.name}`);
      appEl.innerHTML = window.Views.purchaseView(app);
      return;
    }

    // App detail page
    if (!sub) {
      setBackLink('/', '← All apps');
      setTitle(app.name);
      appEl.innerHTML = window.Views.appDetailView(app);
      return;
    }

    // Unknown sub-path
    setBackLink('/', '← All apps');
    setTitle('Not found');
    appEl.innerHTML = window.Views.notFoundView(appId);
  }

  // Purchase button delegation
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-purchase]');
    if (btn) {
      const appId = btn.getAttribute('data-app-id');
      const productId = btn.getAttribute('data-product-id');
      const app = appData && appData[appId];
      if (!app) return;
      const product = (app.products || []).find(p => p.id === productId);
      if (!product) return;
      window.Paykassma.startPayment({ appId, product });
      return;
    }
    if (e.target.closest('[data-action="close-payment"]')) {
      window.Paykassma.closeOverlay();
    }
  });

  window.addEventListener('routechange', render);
  window.addEventListener('popstate', render);

  // BOOTSTRAP — this MUST run on page load
  (async function init() {
    console.log('[main] init start');
    console.log('[main] APP_CONFIG:', window.APP_CONFIG);
    console.log('[main] DataLoader:', window.DataLoader);
    console.log('[main] Router:', window.Router);
    console.log('[main] Views:', window.Views);
    console.log('[main] Paykassma:', window.Paykassma);

    try {
      appData = await window.DataLoader.loadApps();
      console.log('[main] apps loaded:', Object.keys(appData));
      render();
    } catch (err) {
      console.error('[main] init failed:', err);
      appEl.innerHTML = window.Views.errorView(err.message || 'Unknown error');
    }
  })();
})();