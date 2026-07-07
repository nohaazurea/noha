/* ===================================================================
   AZUREA — cursor.js
   Curseur personnalisé (anneau qui suit la souris, s'agrandit au survol
   des liens/boutons/cartes et affiche un libellé via data-cursor="…").
   Désactivé sur tactile et si l'utilisateur préfère réduire les animations.
   =================================================================== */

window.AZUREA = window.AZUREA || {};
(function (A) {

  A.initCursor = function () {
    if (!(A.canHover && !A.reduce)) return;

    const c = document.createElement('div');
    c.className = 'cursor';
    c.innerHTML = '<div class="cursor__ring"><span class="cursor__label"></span></div>';
    document.body.appendChild(c);
    document.body.classList.add('has-cursor');
    const label = c.querySelector('.cursor__label');

    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; c.style.opacity = '1'; });

    (function loop() {
      cx += (mx - cx) * .18;
      cy += (my - cy) * .18;
      c.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', e => {
      const el = e.target.closest('a,button,.card');
      if (!el) return;
      const v = el.getAttribute('data-cursor');
      if (v) { c.classList.add('is-view'); label.textContent = v; }
      else c.classList.add('is-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a,button,.card')) c.classList.remove('is-hover', 'is-view');
    });
  };

})(window.AZUREA);
