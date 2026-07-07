/* ===================================================================
   AZUREA — animations.js
   Toutes les animations GSAP :
     • runLoader   → écran de chargement d'ouverture
     • animateIn   → reveals au scroll de la route active (titres, textes,
                     parallaxe, zoom lent, marquee, timeline…)
     • initMagnetic→ boutons magnétiques

   ⚙️  Pour régler une animation : c'est ici. Les durées / eases / valeurs
       sont volontairement regroupées dans animateIn().
   =================================================================== */

window.AZUREA = window.AZUREA || {};
(function (A) {

  /* Liste des ScrollTriggers de la route courante (détruits au changement de page) */
  A._triggers = [];
  A.clearTriggers = function () {
    A._triggers.forEach(t => t.kill && t.kill());
    A._triggers = [];
  };

  /* -----------------------------------------------------------------
     Loader d'ouverture
     ----------------------------------------------------------------- */
  A.runLoader = function (done) {
    const loader = document.getElementById('loader');
    const logo = loader.querySelector('.logo');
    const bar  = loader.querySelector('.loader__bar i');
    const pct  = loader.querySelector('.loader__pct');

    if (A.reduce || !A.hasGsap) { document.body.classList.remove('loading'); done(); return; }

    const tl = gsap.timeline({ onComplete: () => { document.body.classList.remove('loading'); done(); } });
    const counter = { v: 0 };
    tl.to(logo, { opacity: 1, duration: .6, ease: 'power2.out' })
      .to(bar,  { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, '-=.2')
      .to(counter, { v: 100, duration: 1.1, ease: 'power2.inOut',
          onUpdate: () => { pct.textContent = String(Math.round(counter.v)).padStart(2, '0'); } }, '<')
      .to(loader, { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '+=.15');
  };

  /* -----------------------------------------------------------------
     Animations d'entrée + scroll de la route active
     ----------------------------------------------------------------- */
  A.animateIn = function (section) {
    if (A.reduce || !A.hasGsap) return;
    const T = A._triggers;

    /* Titre de hero révélé ligne par ligne */
    const ht = section.querySelector('[data-hero-title]');
    if (ht) {
      const lines = ht.querySelectorAll('.lm > span');
      if (lines.length) gsap.from(lines, { yPercent: 115, duration: 1.15, ease: 'power4.out', stagger: .1, delay: .05 });
    }
    /* Éléments de hero (eyebrow, sous-titre, bouton) */
    gsap.from(section.querySelectorAll('[data-hero]'), { y: 26, opacity: 0, duration: 1, ease: 'power3.out', stagger: .08, delay: .15 });

    /* Fond de hero / contact : parallaxe + léger zoom d'entrée */
    const media = section.querySelector('.hero__media, .end__media');
    if (media && A.hasST) {
      T.push(ScrollTrigger.create({ trigger: media.closest('.hero, .end'), start: 'top top', end: 'bottom top', scrub: true,
        animation: gsap.to(media, { yPercent: 8, ease: 'none' }) }));
      const el = media.querySelector('video,img,.bg-cover');
      if (el) gsap.fromTo(el, { scale: 1.12 }, { scale: 1, duration: 2.4, ease: 'power2.out' });
    }
    if (!A.hasST) return;

    /* Grands titres / phrases */
    section.querySelectorAll('[data-split]').forEach(el => {
      T.push(ScrollTrigger.create({ trigger: el, start: 'top 86%',
        animation: gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out' }) }));
    });
    /* Éléments simples */
    section.querySelectorAll('[data-reveal]').forEach(el => {
      T.push(ScrollTrigger.create({ trigger: el, start: 'top 88%',
        animation: gsap.from(el, { y: 34, opacity: 0, duration: 1.05, ease: 'power3.out' }) }));
    });
    /* Groupes (enfants animés en cascade) */
    section.querySelectorAll('[data-reveal-group]').forEach(g => {
      T.push(ScrollTrigger.create({ trigger: g, start: 'top 85%',
        animation: gsap.from(g.children, { y: 26, opacity: 0, duration: 1, ease: 'power3.out', stagger: .09 }) }));
    });
    /* Images : zoom lent au scroll */
    section.querySelectorAll('[data-zoom]').forEach(img => {
      T.push(ScrollTrigger.create({ trigger: img, start: 'top bottom', end: 'bottom top', scrub: true,
        animation: gsap.fromTo(img, { scale: 1.14 }, { scale: 1, ease: 'none' }) }));
    });
    /* Images flottantes (hero) : parallaxe */
    section.querySelectorAll('[data-float]').forEach(f => {
      T.push(ScrollTrigger.create({ trigger: f.closest('.hero'), start: 'top top', end: 'bottom top', scrub: true,
        animation: gsap.to(f, { yPercent: -30, ease: 'none' }) }));
    });
    /* Bandeau défilant (marquee) */
    section.querySelectorAll('[data-marquee]').forEach(row => {
      T.push(ScrollTrigger.create({ trigger: row, start: 'top bottom', end: 'bottom top', scrub: 1,
        animation: gsap.fromTo(row, { xPercent: 0 }, { xPercent: -25, ease: 'none' }) }));
    });
    /* Timeline Méthode : ligne qui se remplit + points activés */
    const tl = section.querySelector('[data-timeline]');
    if (tl) {
      const fill = tl.querySelector('[data-timeline-fill]');
      T.push(ScrollTrigger.create({ trigger: tl, start: 'top 65%', end: 'bottom 70%', scrub: true,
        animation: gsap.to(fill, { scaleY: 1, ease: 'none' }) }));
      tl.querySelectorAll('.phase').forEach(p => {
        T.push(ScrollTrigger.create({ trigger: p, start: 'top 70%',
          onEnter: () => p.classList.add('on'), onLeaveBack: () => p.classList.remove('on') }));
      });
    }
    ScrollTrigger.refresh();
  };

  /* -----------------------------------------------------------------
     Boutons magnétiques
     ----------------------------------------------------------------- */
  A.initMagnetic = function () {
    if (!(A.canHover && !A.reduce && A.hasGsap)) return;
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .4, duration: .5, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
    });
  };

})(window.AZUREA);
