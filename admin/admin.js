/* ===================================================================
   AZUREA — admin.js  (back-office /admin)
   Auth Supabase · Sections · Réalisations (CRUD + drag&drop) ·
   Médias (Storage + optimisation) · Paramètres.
   =================================================================== */
(function () {
  const cfg = window.AZUREA_SUPABASE || {};
  const panel = document.getElementById('panel');
  if (!cfg.url || !cfg.anonKey) {
    panel.innerHTML = '<div class="hint">⚠ Configure d\'abord <b>js/supabase-config.js</b> (URL + clé anon Supabase).</div>';
    return;
  }
  const sb = window.supabase.createClient(cfg.url, cfg.anonKey);

  /* ---------- Helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const openModal = html => { $('#modalCard').innerHTML = html; $('#modal').classList.add('open'); };
  const closeModal = () => $('#modal').classList.remove('open');
  window.AZADMIN = { close: closeModal };
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

  /* ---------- Optimisation + upload image ---------- */
  function optimizeImage(file, max = 1600, q = 0.82) {
    return new Promise(res => {
      if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') { res(file); return; }
      const isPng = file.type === 'image/png';
      const img = new Image(); const url = URL.createObjectURL(file);
      img.onload = () => {
        let w = img.width, h = img.height;
        if (Math.max(w, h) > max) { if (w >= h) { h = Math.round(h * max / w); w = max; } else { w = Math.round(w * max / h); h = max; } }
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        c.toBlob(b => { URL.revokeObjectURL(url); res(b || file); }, isPng ? 'image/png' : 'image/jpeg', q);
      };
      img.onerror = () => res(file);
      img.src = url;
    });
  }
  async function uploadToStorage(file) {
    const blob = await optimizeImage(file);
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() || 'bin');
    const path = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    const { error } = await sb.storage.from('media').upload(path, blob, { upsert: false, contentType: blob.type });
    if (error) { toast('Erreur upload'); throw error; }
    return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
  }

  /* ---------- Auth guard ---------- */
  sb.auth.getSession().then(({ data }) => {
    if (!data.session) { location.href = 'index.html'; return; }
    $('#logout').onclick = async e => { e.preventDefault(); await sb.auth.signOut(); location.href = 'index.html'; };
    window.addEventListener('hashchange', route); route();
  });

  /* ---------- Router ---------- */
  function route() {
    const h = (location.hash || '#dashboard').slice(1);
    document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + h));
    ({ dashboard: renderDashboard, contenu: renderContenu, projets: renderProjets, medias: renderMedias, parametres: renderParametres }[h] || renderDashboard)();
  }

  /* ---------- Tableau de bord ---------- */
  async function renderDashboard() {
    const { count } = await sb.from('projects').select('*', { count: 'exact', head: true });
    panel.innerHTML = `<div class="head"><div><div class="eyebrow">Back-office</div><h1>Tableau de bord</h1></div></div>
      <div class="grid">
        <div class="stat"><div class="n">${count || 0}</div><div class="l">Réalisations</div></div>
        <div class="stat"><div class="n"><a href="#projets">Gérer ›</a></div><div class="l">Projets (drag & drop)</div></div>
        <div class="stat"><div class="n"><a href="../index.html" target="_blank">↗</a></div><div class="l">Voir le site</div></div>
      </div>
      <div class="hint mt">Les modifications enregistrées ici apparaissent immédiatement sur le site (au rechargement de la page). Le site conserve son design et ses animations : seul le contenu est dynamique.</div>`;
  }

  /* ---------- Contenu (sections) ---------- */
  async function renderContenu() {
    const { data } = await sb.from('sections').select('key,label').order('key');
    panel.innerHTML = `<div class="head"><div><div class="eyebrow">Contenu</div><h1>Sections</h1></div></div>
      <div class="section-list">${(data || []).map(s => `<a href="#" data-sec="${esc(s.key)}"><span>${esc(s.label || s.key)}</span><span class="muted">${esc(s.key)} ›</span></a>`).join('')}</div>
      <div class="hint mt">Champs simples éditables directement ; listes et blocs structurés éditables en JSON (indenté, avec validation).</div>`;
    panel.querySelectorAll('[data-sec]').forEach(a => a.onclick = e => { e.preventDefault(); editSection(a.dataset.sec); });
  }
  async function editSection(key) {
    const { data } = await sb.from('sections').select('*').eq('key', key).single();
    const d = data.data || {};
    const fields = Object.keys(d).map(k => {
      const v = d[k];
      if (typeof v === 'string') {
        const long = v.length > 60 || v.includes('<');
        return `<div class="field"><label>${esc(k)}</label>${long ? `<textarea data-k="${esc(k)}">${esc(v)}</textarea>` : `<input data-k="${esc(k)}" value="${esc(v)}"/>`}</div>`;
      }
      return `<div class="field"><label>${esc(k)} — JSON</label><textarea class="code" data-k="${esc(k)}" data-json="1">${esc(JSON.stringify(v, null, 2))}</textarea></div>`;
    }).join('');
    openModal(`<h2>${esc(data.label || key)}</h2>${fields}
      <div class="mt"><button class="btn" id="save">Enregistrer</button> <button class="btn btn--ghost" onclick="AZADMIN.close()">Annuler</button></div>`);
    $('#save').onclick = async () => {
      const out = {}; let bad = false;
      $('#modalCard').querySelectorAll('[data-k]').forEach(el => {
        const k = el.dataset.k;
        if (el.dataset.json) { try { out[k] = JSON.parse(el.value); } catch (e) { bad = k; out[k] = d[k]; } }
        else out[k] = el.value;
      });
      if (bad) { toast('JSON invalide : ' + bad); return; }
      const { error } = await sb.from('sections').update({ data: out }).eq('key', key);
      if (error) toast('Erreur'); else { toast('Section enregistrée'); closeModal(); }
    };
  }

  /* ---------- Réalisations (projets) ---------- */
  async function renderProjets() {
    const { data: projects } = await sb.from('projects').select('*').order('position');
    panel.innerHTML = `<div class="head"><div><div class="eyebrow">Réalisations</div><h1>Projets</h1></div>
        <button class="btn" id="add">+ Nouveau projet</button></div>
      <div class="plist" id="plist">${(projects || []).map(rowHtml).join('')}</div>
      <div class="hint mt">Glisse-dépose les projets par la poignée ⠿ pour changer l'ordre (enregistré automatiquement).</div>`;
    $('#add').onclick = () => editProject(null);
    bindDrag();
    panel.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => editProject(b.dataset.edit));
    panel.querySelectorAll('[data-del]').forEach(b => b.onclick = () => delProject(b.dataset.del));
  }
  function rowHtml(p) {
    return `<div class="pitem" draggable="true" data-id="${p.id}">
      <div class="pitem__handle" title="Glisser">⠿</div>
      <img class="pitem__thumb" src="${esc(p.cover_url || '')}" alt=""/>
      <div><div class="pitem__name">${esc(p.name)} ${p.published ? '' : '<span class="muted">· masqué</span>'}</div>
        <div class="pitem__meta"><span class="tag">${esc(p.category || '')}</span> ${esc(p.location || '')}</div></div>
      <div style="display:flex;gap:.5rem"><button class="btn btn--ghost btn--sm" data-edit="${p.id}">Modifier</button>
        <button class="btn btn--danger btn--sm" data-del="${p.id}">Suppr.</button></div>
    </div>`;
  }
  function bindDrag() {
    const list = $('#plist'); let dragEl = null;
    list.querySelectorAll('.pitem').forEach(it => {
      it.addEventListener('dragstart', () => { dragEl = it; it.classList.add('dragging'); });
      it.addEventListener('dragover', e => {
        e.preventDefault();
        const after = [...list.querySelectorAll('.pitem:not(.dragging)')].find(x => {
          const r = x.getBoundingClientRect(); return e.clientY < r.top + r.height / 2;
        });
        if (after) list.insertBefore(dragEl, after); else list.appendChild(dragEl);
      });
      it.addEventListener('dragend', async () => {
        it.classList.remove('dragging');
        const ids = [...list.querySelectorAll('.pitem')].map(x => x.dataset.id);
        await Promise.all(ids.map((id, i) => sb.from('projects').update({ position: i + 1 }).eq('id', id)));
        toast('Ordre enregistré');
      });
    });
  }
  async function editProject(id) {
    let p = { name:'', category:'social', location:'', description:'', cover_url:'', gallery:[], video_url:'', prestations:[], case_study:{}, seo:{}, published:true };
    if (id) { const { data } = await sb.from('projects').select('*').eq('id', id).single(); p = data; }
    let gallery = [...(p.gallery || [])]; let coverUrl = p.cover_url || '';
    openModal(`<h2>${id ? 'Modifier' : 'Nouveau'} projet</h2>
      <div class="field"><label>Nom</label><input id="f_name" value="${esc(p.name)}"/></div>
      <div class="row">
        <div class="field"><label>Catégorie</label><select id="f_cat">${['social','web','branding'].map(c => `<option value="${c}" ${p.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="field"><label>Lieu</label><input id="f_loc" value="${esc(p.location)}"/></div>
      </div>
      <div class="field"><label>Description</label><textarea id="f_desc">${esc(p.description)}</textarea></div>
      <div class="field"><label>Image de couverture</label>
        <div class="thumbline"><div class="t" id="coverT">${coverUrl ? `<img src="${esc(coverUrl)}"/>` : ''}</div></div>
        <input type="file" accept="image/*" id="f_cover" class="mt"/></div>
      <div class="field"><label>Galerie</label>
        <div class="thumbline" id="galT"></div>
        <input type="file" accept="image/*" multiple id="f_gal" class="mt"/></div>
      <div class="row">
        <div class="field"><label>Vidéo (URL)</label><input id="f_video" value="${esc(p.video_url || '')}"/></div>
        <div class="field"><label>Prestations (une par ligne)</label><textarea id="f_prest">${esc((p.prestations || []).join('\n'))}</textarea></div>
      </div>
      <div class="field"><label>Étude de cas — JSON { context, response, results:[], quote, author }</label><textarea class="code" id="f_case">${esc(JSON.stringify(p.case_study || {}, null, 2))}</textarea></div>
      <div class="row">
        <div class="field"><label>SEO — titre</label><input id="f_seotitle" value="${esc((p.seo || {}).title || '')}"/></div>
        <div class="field"><label>SEO — description</label><input id="f_seodesc" value="${esc((p.seo || {}).description || '')}"/></div>
      </div>
      <div class="field"><label><input type="checkbox" id="f_pub" ${p.published ? 'checked' : ''}/> &nbsp;Publié</label></div>
      <div class="mt"><button class="btn" id="save">Enregistrer</button> <button class="btn btn--ghost" onclick="AZADMIN.close()">Annuler</button></div>`);

    function rerenderGal() {
      $('#galT').innerHTML = gallery.map((u, i) => `<div class="t"><img src="${esc(u)}"/><button data-g="${i}">×</button></div>`).join('');
      $('#galT').querySelectorAll('[data-g]').forEach(b => b.onclick = () => { gallery.splice(+b.dataset.g, 1); rerenderGal(); });
    }
    rerenderGal();
    $('#f_cover').onchange = async e => { if (e.target.files[0]) { toast('Upload…'); coverUrl = await uploadToStorage(e.target.files[0]); $('#coverT').innerHTML = `<img src="${coverUrl}"/>`; toast('Image ajoutée'); } };
    $('#f_gal').onchange = async e => { for (const f of e.target.files) { toast('Upload…'); gallery.push(await uploadToStorage(f)); } rerenderGal(); toast('Galerie mise à jour'); };
    $('#save').onclick = async () => {
      let cs = {}; try { cs = JSON.parse($('#f_case').value || '{}'); } catch (e) { toast('JSON étude de cas invalide'); return; }
      const rec = {
        name: $('#f_name').value, category: $('#f_cat').value, location: $('#f_loc').value, description: $('#f_desc').value,
        cover_url: coverUrl, gallery, video_url: $('#f_video').value,
        prestations: $('#f_prest').value.split('\n').map(x => x.trim()).filter(Boolean),
        case_study: cs, seo: { title: $('#f_seotitle').value, description: $('#f_seodesc').value }, published: $('#f_pub').checked
      };
      let error;
      if (id) { ({ error } = await sb.from('projects').update(rec).eq('id', id)); }
      else { rec.position = 999; ({ error } = await sb.from('projects').insert(rec)); }
      if (error) toast('Erreur'); else { toast('Projet enregistré'); closeModal(); renderProjets(); }
    };
  }
  async function delProject(id) {
    if (!confirm('Supprimer définitivement ce projet ?')) return;
    const { error } = await sb.from('projects').delete().eq('id', id);
    if (error) toast('Erreur'); else { toast('Projet supprimé'); renderProjets(); }
  }

  /* ---------- Médias ---------- */
  async function renderMedias() {
    panel.innerHTML = `<div class="head"><div><div class="eyebrow">Bibliothèque</div><h1>Médias</h1></div>
        <label class="btn" for="up">+ Uploader</label></div>
      <input type="file" id="up" accept="image/*" multiple style="display:none"/>
      <div class="grid" id="mgrid"><p class="muted">Chargement…</p></div>
      <div class="hint mt">Les images sont automatiquement redimensionnées (≤ 1600 px) et compressées à l'upload.</div>`;
    $('#up').onchange = async e => { for (const f of e.target.files) { toast('Upload…'); await uploadToStorage(f); } toast('Ajouté'); loadMedia(); };
    loadMedia();
  }
  async function loadMedia() {
    const { data } = await sb.storage.from('media').list('', { limit: 300, sortBy: { column: 'created_at', order: 'desc' } });
    const grid = $('#mgrid');
    const files = (data || []).filter(f => f.name && f.name !== '.emptyFolderPlaceholder');
    if (!files.length) { grid.innerHTML = '<p class="muted">Aucun média pour l\'instant.</p>'; return; }
    grid.innerHTML = files.map(f => {
      const url = sb.storage.from('media').getPublicUrl(f.name).data.publicUrl;
      return `<div class="media"><img src="${esc(url)}" loading="lazy"/><div class="media__bar">
        <button data-copy="${esc(url)}">Copier</button><button data-del="${esc(f.name)}">Suppr.</button></div></div>`;
    }).join('');
    grid.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => { navigator.clipboard.writeText(b.dataset.copy); toast('URL copiée'); });
    grid.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      if (!confirm('Supprimer ce média ?')) return;
      await sb.storage.from('media').remove([b.dataset.del]); toast('Supprimé'); loadMedia();
    });
  }

  /* ---------- Paramètres ---------- */
  async function renderParametres() {
    const { data: s } = await sb.from('settings').select('*').eq('id', 1).single();
    const f = (s && s.footer) || {};
    panel.innerHTML = `<div class="head"><div><div class="eyebrow">Configuration</div><h1>Paramètres</h1></div></div>
      <div class="row">
        <div class="field"><label>Logo (URL)</label><input id="p_logo" value="${esc(s.logo_url || '')}"/><input type="file" accept="image/*" id="up_logo" class="mt"/></div>
        <div class="field"><label>Favicon (URL)</label><input id="p_fav" value="${esc(s.favicon_url || '')}"/><input type="file" accept="image/*" id="up_fav" class="mt"/></div>
      </div>
      <div class="field"><label>Titre du site (SEO)</label><input id="p_title" value="${esc(s.site_title || '')}"/></div>
      <div class="field"><label>Description (SEO)</label><textarea id="p_desc">${esc(s.site_description || '')}</textarea></div>
      <div class="row">
        <div class="field"><label>Image OpenGraph (URL)</label><input id="p_og" value="${esc(s.og_image || '')}"/></div>
        <div class="field"><label>Google Analytics (G-XXXX)</label><input id="p_ga" value="${esc(s.analytics_id || '')}"/></div>
      </div>
      <div class="row">
        <div class="field"><label>Email</label><input id="p_email" value="${esc(s.email || '')}"/></div>
        <div class="field"><label>Téléphone</label><input id="p_phone" value="${esc(s.phone || '')}"/></div>
      </div>
      <div class="field"><label>Adresse</label><input id="p_addr" value="${esc(s.address || '')}"/></div>
      <div class="row">
        <div class="field"><label>Instagram (URL)</label><input id="p_ig" value="${esc(s.instagram || '')}"/></div>
        <div class="field"><label>TikTok (URL)</label><input id="p_tt" value="${esc(s.tiktok || '')}"/></div>
      </div>
      <div class="row">
        <div class="field"><label>LinkedIn (URL)</label><input id="p_li" value="${esc(s.linkedin || '')}"/></div>
        <div class="field"><label>Lien devis (URL)</label><input id="p_devis" value="${esc(s.devis_url || '')}"/></div>
      </div>
      <div class="field"><label>Footer — accroche</label><textarea id="p_flead">${esc(f.lead || '')}</textarea></div>
      <div class="field"><label>Footer — copyright</label><input id="p_fcopy" value="${esc(f.copyright || '')}"/></div>
      <div class="mt"><button class="btn" id="save">Enregistrer</button></div>`;
    $('#up_logo').onchange = async e => { if (e.target.files[0]) { toast('Upload…'); $('#p_logo').value = await uploadToStorage(e.target.files[0]); toast('Logo ajouté'); } };
    $('#up_fav').onchange = async e => { if (e.target.files[0]) { toast('Upload…'); $('#p_fav').value = await uploadToStorage(e.target.files[0]); toast('Favicon ajouté'); } };
    $('#save').onclick = async () => {
      const rec = {
        logo_url: $('#p_logo').value, favicon_url: $('#p_fav').value, site_title: $('#p_title').value, site_description: $('#p_desc').value,
        og_image: $('#p_og').value, analytics_id: $('#p_ga').value, email: $('#p_email').value, phone: $('#p_phone').value, address: $('#p_addr').value,
        instagram: $('#p_ig').value, tiktok: $('#p_tt').value, linkedin: $('#p_li').value, devis_url: $('#p_devis').value,
        footer: { lead: $('#p_flead').value, copyright: $('#p_fcopy').value }
      };
      const { error } = await sb.from('settings').update(rec).eq('id', 1);
      if (error) toast('Erreur'); else toast('Paramètres enregistrés');
    };
  }
})();
