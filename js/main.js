/* ===================================================================
   AZUREA — main.js
   Point d'entrée. Initialise l'état partagé (namespace window.AZUREA),
   le smooth scroll (Lenis), la barre de navigation, le menu mobile,
   puis orchestre les modules (curseur, animations, router) au chargement.

   Ordre de chargement des scripts (voir index.html) :
     animations.js → cursor.js → router.js → main.js (ce fichier, en dernier)
   =================================================================== */

window.AZUREA = window.AZUREA || {};

window.addEventListener('load', function () {
  const A = window.AZUREA;

  /* ---- Détection des capacités ---- */
  A.reduce   = matchMedia('(prefers-reduced-motion: reduce)').matches;
  A.canHover = matchMedia('(hover:hover) and (pointer:fine)').matches;
  A.hasGsap  = typeof gsap !== 'undefined';
  A.hasST    = typeof ScrollTrigger !== 'undefined';
  if (A.hasGsap && A.hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---- Smooth scroll (Lenis) ---- */
  A.lenis = null;
  if (!A.reduce && A.hasGsap && typeof Lenis !== 'undefined') {
    A.lenis = new Lenis({
      duration: 1.25,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    if (A.hasST) A.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => A.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  A.scrollTop = function () {
    if (A.lenis) A.lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  };

  /* ---- Barre de navigation : fond opaque au scroll ---- */
  A.onScroll = function () {
    document.body.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', A.onScroll, { passive: true });

  /* ---- Menu mobile ---- */
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('menu');
  A.toggleMenu = function (open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
  };
  if (burger) burger.addEventListener('click', () =>
    A.toggleMenu(!document.body.classList.contains('menu-open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') A.toggleMenu(false); });

  /* ---- Initialisation des modules ---- */
  A.initMagnetic();   // js/animations.js — boutons magnétiques
  A.initCursor();     // js/cursor.js     — curseur personnalisé
  A.initRouter();     // js/router.js     — routes, liens, filtres

  // Contrôles vidéo (Agence) : lecture/pause + son
  document.querySelectorAll('[data-vid]').forEach(btn => {
    btn.addEventListener('click', () => {
      const media = btn.closest('.founder__media');
      const v = media && media.querySelector('video');
      if (!v) return;
      if (btn.dataset.vid === 'mute') { v.muted = !v.muted; btn.textContent = v.muted ? '♪' : '♫'; }
      else { if (v.paused) { v.play(); btn.textContent = '❚❚'; } else { v.pause(); btn.textContent = '▸'; } }
    });
  });

  /* ---- Démarrage : loader puis affichage de la route courante ---- */
  if (!location.hash) location.hash = '#/';
  A.runLoader(function () {          // js/animations.js
    A.navigate(A.parseHash(), false); // js/router.js
  });
});
