/* ===================================================================
   AZUREA — router.js
   Routage par VRAIES URLs (History API) + SEO par page.
   /  /expertises  /realisations  /methode  /agence  /contact
   /projet/<slug>  (étude de cas)
   Compatible avec les anciennes URLs #/ (redirigées proprement).
   =================================================================== */

window.AZUREA = window.AZUREA || {};
(function (A) {

  const ROUTES = ['accueil', 'expertises', 'realisations', 'projet', 'methode', 'agence', 'contact'];
  const ORIGIN = 'https://agence-azurea.netlify.app';

  const TITLES = {
    accueil:      'AZUREA — Agence de communication digitale premium',
    expertises:   'Nos prestations — Branding, réseaux sociaux & sites web | AZUREA',
    realisations: 'Réalisations & études de cas | AZUREA',
    projet:       'Étude de cas | AZUREA',
    methode:      'Notre méthode | AZUREA',
    agence:       "L'agence — Noha Guiraud | AZUREA",
    contact:      'Contact — Parlons de votre projet | AZUREA'
  };
  const DESC = {
    accueil:      "AZUREA, agence de communication digitale premium : branding, réseaux sociaux, sites web et création de contenu pour les marques et maisons d'exception, en France et à l'international.",
    expertises:   "Nos prestations : branding, gestion des réseaux sociaux, création de contenu et sites web premium. Une image forte, cohérente et désirable pour attirer les bons clients.",
    realisations: "Les réalisations d'AZUREA : études de cas de branding, réseaux sociaux et sites web menées pour des marques, entreprises et lieux d'exception.",
    projet:       "Étude de cas AZUREA — un projet de communication accompagné de la stratégie à l'exécution.",
    methode:      "La méthode AZUREA : une collaboration structurée et sur mesure, menée à distance, du cadrage à la mise en ligne et au suivi des performances.",
    agence:       "AZUREA, agence fondée par Noha Guiraud. Vision stratégique et direction artistique premium pour une présence digitale à la hauteur de vos ambitions.",
    contact:      "Contactez AZUREA pour votre projet de communication : branding, réseaux sociaux, site web. Réservez un appel ou demandez un devis gratuit."
  };

  let sections = {};
  let current  = null;

  /* Lit la route depuis le chemin réel (et accepte les anciennes URLs #/) */
  A.parseHash = function () {
    let path = (location.pathname || '/').replace(/^\/+/, '').replace(/\/+$/, '');
    if (!path && location.hash) path = location.hash.replace(/^#\/?/, '');
    const parts = path.split('/').filter(Boolean);
    const r = parts[0] || 'accueil';
    A.projectSlug = (r === 'projet' && parts[1]) ? parts[1] : null;
    return ROUTES.includes(r) ? r : 'accueil';
  };

  /* ---- SEO : met à jour titre + meta + canonical + Open Graph par page ---- */
  function setTag(sel, attr, val) { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); }
  function setLink(rel, href) {
    let el = document.querySelector('link[rel="' + rel + '"]');
    if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
    el.setAttribute('href', href);
  }
  A.setMeta = function (route, extra) {
    extra = extra || {};
    const path  = location.pathname || '/';
    const url   = ORIGIN + (path === '/' ? '/' : path.replace(/\/+$/, ''));
    const title = extra.title || TITLES[route] || TITLES.accueil;
    const desc  = extra.desc  || DESC[route]  || DESC.accueil;
    document.title = title;
    setTag('meta[name="description"]', 'content', desc);
    setTag('meta[property="og:title"]', 'content', title);
    setTag('meta[property="og:description"]', 'content', desc);
    setTag('meta[property="og:url"]', 'content', url);
    setTag('meta[name="twitter:title"]', 'content', title);
    setTag('meta[name="twitter:description"]', 'content', desc);
    setLink('canonical', url);
  };

  function playVideos(section)  { section.querySelectorAll('video').forEach(v => { try { v.play().catch(() => {}); } catch (e) {} }); }
  function pauseVideos(section) { section.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (e) {} }); }

  /* Affiche une route (masque les autres, met à jour titre / nav / vidéos / animations) */
  function show(route) {
    Object.entries(sections).forEach(([k, s]) => { if (k !== route) { s.classList.remove('is-active'); pauseVideos(s); } });
    const sec = sections[route];
    sec.classList.add('is-active');
    A.setMeta(route);
    document.querySelectorAll('[data-route-link]').forEach(a => a.classList.toggle('active', a.dataset.routeLink === route));
    /* nav opaque partout sauf sur les pages à hero sombre plein écran */
    document.body.classList.toggle('solid-nav', !(route === 'accueil' || route === 'projet' || route === 'contact'));

    A.clearTriggers();  // js/animations.js
    A.scrollTop();      // js/main.js
    A.onScroll();       // js/main.js
    playVideos(sec);
    if (route === 'projet' && window.__AZ_fillProjectPage) window.__AZ_fillProjectPage();
    A.animateIn(sec);   // js/animations.js
  }

  /* Navigation avec transition de page (rideau + logo) */
  A.navigate = function (route, wipe) {
    if (route === current) { A.scrollTop(); return; }
    const run = () => { show(route); current = route; };

    if (wipe && !A.reduce && A.hasGsap) {
      const pt = document.getElementById('pt');
      const logo = pt.querySelector('.logo');
      gsap.timeline()
        .set(pt, { transformOrigin: 'bottom' })
        .to(pt, { scaleY: 1, duration: .5, ease: 'power4.inOut' })
        .to(logo, { opacity: 1, duration: .25 }, '-=.25')
        .add(run)
        .to(logo, { opacity: 0, duration: .2 }, '+=.05')
        .set(pt, { transformOrigin: 'top' })
        .to(pt, { scaleY: 0, duration: .5, ease: 'power4.inOut' });
    } else {
      run();
    }
  };

  /* Navigue vers une vraie URL (pushState) puis affiche la route */
  A.go = function (href, wipe) {
    if (!href) return;
    href = href.replace(/^#/, '');
    if (href.charAt(0) !== '/') href = '/' + href;
    if (href !== location.pathname) history.pushState({}, '', href);
    A.navigate(A.parseHash(), wipe !== false);
  };

  /* Branche routes, liens, navigation et filtres projets */
  A.initRouter = function () {
    document.querySelectorAll('.route').forEach(s => sections[s.dataset.route] = s);

    document.querySelectorAll('[data-link]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const href = a.getAttribute('href');
        A.toggleMenu(false);
        if (a.hasAttribute('data-close')) setTimeout(() => A.go(href), 120);
        else A.go(href);
      });
    });

    /* Bouton précédent / suivant du navigateur */
    window.addEventListener('popstate', () => A.navigate(A.parseHash(), true));

    /* Filtres de la page Réalisations */
    const filters = document.getElementById('filters');
    if (filters) {
      filters.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        filters.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        const f = b.dataset.filter;
        document.querySelectorAll('#projectsList .proj').forEach(c =>
          c.classList.toggle('is-hidden', f !== 'all' && c.dataset.cat !== f));
        if (A.hasST) ScrollTrigger.refresh();
      });
    }
  };

})(window.AZUREA);
