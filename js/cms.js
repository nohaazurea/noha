/* ===================================================================
   AZUREA — cms.js  (chargeur de contenu dynamique, côté public)
   ------------------------------------------------------------------
   Rôle : remplacer les contenus codés en dur par ceux de Supabase.
   • N'altère NI la direction artistique, NI les animations, NI le
     routing, NI GSAP/Lenis : il ne fait que réécrire du texte, des
     src d'images, des fonds et reconstruire des listes (projets, logos)
     en réutilisant EXACTEMENT les mêmes classes/markup.
   • Repli intégral : si Supabase n'est pas configuré ou injoignable,
     le site garde son contenu d'origine (aucune régression).

   Conventions d'attributs dans le HTML :
     data-cms="cle.champ"        -> textContent
     data-cms-html="cle.champ"   -> innerHTML
     data-cms-img="cle.champ"    -> attribut src (sur une <img>)
     data-cms-bg="cle.champ"     -> background-image (sur un div)
     data-cms-href="settings.email|instagram|tiktok|devis" -> href
   =================================================================== */
(function () {
  const cfg = window.AZUREA_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey) return; // pas configuré -> contenu d'origine

  const REST = cfg.url.replace(/\/$/, '') + '/rest/v1';
  const headers = { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey };

  const get = (table, query) =>
    fetch(`${REST}/${table}?${query}`, { headers }).then(r => r.ok ? r.json() : []);

  function resolve(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);
  }

  function applyBindings(C) {
    document.querySelectorAll('[data-cms]').forEach(el => {
      const v = resolve(C, el.dataset.cms); if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-cms-html]').forEach(el => {
      const v = resolve(C, el.dataset.cmsHtml); if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-cms-img]').forEach(el => {
      const v = resolve(C, el.dataset.cmsImg); if (v != null) el.setAttribute('src', v);
    });
    document.querySelectorAll('[data-cms-bg]').forEach(el => {
      const v = resolve(C, el.dataset.cmsBg); if (v != null) el.style.backgroundImage = `url('${v}')`;
    });
    document.querySelectorAll('[data-cms-href]').forEach(el => {
      const key = el.dataset.cmsHref.replace('settings.', '');
      const s = C.settings || {}; let v = s[key];
      if (key === 'email' && v) v = 'mailto:' + v;
      if (v != null) el.setAttribute('href', v);
    });
  }

  function applySettings(s) {
    if (!s) return;
    if (s.site_title) document.title = s.site_title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && s.site_description) meta.setAttribute('content', s.site_description);
    if (s.favicon_url) {
      let l = document.querySelector('link[rel="icon"]'); if (l) l.setAttribute('href', s.favicon_url);
    }
    if (s.analytics_id && !window.__azAnalytics) {
      window.__azAnalytics = true;
      const g = document.createElement('script'); g.async = true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=' + s.analytics_id;
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      gtag('js', new Date()); gtag('config', s.analytics_id);
    }
    // logo (le logo du site est un masque CSS : on remplace l'image du masque)
    if (s.logo_url) {
      document.querySelectorAll('.logo').forEach(el => {
        el.style.webkitMaskImage = `url('${s.logo_url}')`;
        el.style.maskImage = `url('${s.logo_url}')`;
      });
    }
    // footer
    const fl = document.querySelector('[data-cms="footer.lead"]');
    if (fl && s.footer && s.footer.lead) fl.textContent = s.footer.lead;
  }

  // ---- Reconstruction de la liste de projets (page Réalisations) ----
  function renderProjects(projects) {
    const list = document.getElementById('projectsList');
    if (!list || !projects || !projects.length) return;
    const html = projects.map((p, i) => {
      const rev = i % 2 === 1 ? ' rev' : '';
      const cover = p.cover_url || '';
      const cat = [p.category === 'social' ? 'Réseaux sociaux' : p.category === 'web' ? 'Web' : 'Branding', p.location].filter(Boolean).join(' · ');
      return `
      <div class="proj proj--split${rev}" data-cat="${p.category || ''}" data-reveal>
        <a href="#/projet" data-link data-cursor="Voir le projet" class="proj__media"><img src="${cover}" alt="${escapeHtml(p.name)}" loading="lazy" data-zoom /></a>
        <div class="proj__side">
          <span class="proj__cat">${escapeHtml(cat)}</span>
          <h3 class="proj__title" style="margin-top:.8rem">${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.description || '')}</p>
        </div>
      </div>`;
    }).join('');
    list.innerHTML = html;
    rebindLinks(list);
  }

  // ---- Reconstruction des bandeaux logos ----
  function renderPartners(partners) {
    if (!partners || !partners.logos) return;
    const cells = partners.logos.map(l => `<div>${escapeHtml(l.name || '')}</div>`).join('');
    document.querySelectorAll('.logos').forEach(el => { el.innerHTML = cells; });
  }

  // Les liens créés dynamiquement doivent être pris en charge par le router.
  function rebindLinks(scope) {
    scope.querySelectorAll('[data-link]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const href = a.getAttribute('href');
        if (window.AZUREA && window.AZUREA.toggleMenu) window.AZUREA.toggleMenu(false);
        location.hash = href;
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  // ---- Chargement ----
  Promise.all([
    get('settings', 'id=eq.1&select=*').then(r => r[0]),
    get('sections', 'select=key,data'),
    get('projects', 'published=eq.true&order=position.asc&select=*')
  ]).then(([settings, sections, projects]) => {
    const C = { settings: settings || {} };
    (sections || []).forEach(s => { C[s.key] = s.data; });
    applyBindings(C);
    applySettings(settings);
    if (C.partners) renderPartners(C.partners);
    renderProjects(projects);
    // rafraîchit les déclencheurs d'animation après injection
    setTimeout(() => { try { if (window.ScrollTrigger) ScrollTrigger.refresh(); } catch (e) {} }, 60);
  }).catch(() => { /* repli : contenu d'origine conservé */ });
})();
