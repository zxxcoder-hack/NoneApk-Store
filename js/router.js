(function() {
  function parsePath(pathname) {
    const clean = pathname.replace(/^\/+|\/+$/g, '');
    return clean ? clean.split('/') : [];
  }
  
  function currentRoute() {
    // file:// guard — bail out early with a clear signal
    if (window.location.protocol === 'file:') {
      return { __fileProtocol: true };
    }
    return parsePath(window.location.pathname);
  }
  
  function navigate(path, options = {}) {
    if (options.replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    window.dispatchEvent(new Event('routechange'));
  }
  
  window.Router = { currentRoute, navigate, parsePath };
  
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || link.target === '_blank') return;
    e.preventDefault();
    navigate(href);
  });
})();