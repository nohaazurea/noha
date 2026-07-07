/* ===================================================================
   AZUREA — router.js
   Routeur mono-page (SPA) par hash (#/accueil, #/expertises, …).
   Gère l'affichage des routes, la transition de page au logo,
   la lecture/pause des vidéos, l'état actif du menu et les filtres projets.

   ➕ Ajouter une page : créer une <section class="route" data-route="xxx">
      dans index.html, ajouter 'xxx' à ROUTES et son titre dans TITLES,
      puis un lien <a href="#/xxx" data-link data-route-link="xxx">.
   =================================================================== */

window.AZUREA = window.AZUREA || {};
(function (A) {

  const ROUTES = ['accueil', 'expertises', 'realisations', 'projet', 'methode', 'agence', 'contact'];
  const TITLES = {
    accueil:      'AZUREA — Agence de communication digitale premium',
    expertises:   'Expertises — AZUREA',
    realisations: 'Réalisations — AZUREA',
    projet:       'Étude de cas — AZUREA',
    methode:      'Méthode — AZUREA',
    agence:       "L'agence — AZUREA",
    contact:      'Contact — AZUREA'
  };

  let sections = {};
  let current  = null;

  A.parseHash = function () {
    const r = (location.hash || '#/').replace(/^#\//, '').replace(/^#/, '').split('/')[0] || 'accueil';
    return ROUTES.includes(r) ? r : 'accueil';
  };

  function playVideos(section)  { section.querySelectorAll('video').forEach(v => { try { v.play().catch(() => {}); } catch (e) {} }); }
  function pauseVideos(section) { section.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (e) {} }); }

  /* Affiche une route (masque les autres, met à jour titre / nav / vidéos / animations) */
  function show(route) {
    Object.entries(sections).forEach(([k, s]) => { if (k !== route) { s.classList.remove('is-active'); pauseVideos(s); } });
    const sec = sections[route];
    sec.classList.add('is-active');
    document.title = TITLES[route] || TITLES.accueil;
    document.querySelectorAll('[data-route-link]').forEach(a => a.classList.toggle('active', a.dataset.routeLink === route));
    /* nav opaque partout sauf sur les pages à hero sombre plein écran */
    document.body.classList.toggle('solid-nav', !(route === 'accueil' || route === 'projet' || route === 'contact'));

    A.clearTriggers();  // js/animations.js
    A.scrollTop();      // js/main.js
    A.onScroll();       // js/main.js
    playVideos(sec);
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

  /* Branche routes, liens, hashchange et filtres projets */
  A.initRouter = function () {
    document.querySelectorAll('.route').forEach(s => sections[s.dataset.route] = s);

    /* Liens internes (navigation SPA) */
    document.querySelectorAll('[data-link]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const href = a.getAttribute('href');
        A.toggleMenu(false);
        if (a.hasAttribute('data-close')) setTimeout(() => { location.hash = href; }, 120);
        else location.hash = href;
      });
    });
    window.addEventListener('hashchange', () => A.navigate(A.parseHash(), true));

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
