-- ============================================================
--  AZUREA — Contenu initial (seed)
--  À exécuter APRÈS schema.sql.
--  Reprend le contenu actuel du site. Modifiable ensuite via /admin.
-- ============================================================

-- ---------- SETTINGS ----------
insert into public.settings (id, site_title, site_description, email, phone, address,
                             instagram, tiktok, devis_url, footer)
values (1,
  'AZUREA — Agence de communication digitale premium',
  'AZUREA, agence de communication digitale premium. Branding, réseaux sociaux et expériences digitales pour les maisons d''exception — France & International, à distance.',
  'contact@agence-azurea.com', '', '',
  'https://instagram.com/azurea.fr', 'https://www.tiktok.com/@azureaagency',
  'https://tally.so/r/nP7PR0',
  '{"lead":"Performez avec style. De la stratégie à l''esthétique, une vision globale du digital — en France et à l''international, à distance.","copyright":"© 2026 AZUREA — France & International · à distance"}'::jsonb)
on conflict (id) do nothing;

-- ---------- SECTIONS ----------
insert into public.sections (key, label, data) values
('home_hero', 'Accueil — Hero',
 '{"eyebrow":"","title":"Azurea","subtitle":"Nous façonnons le digital <em>autrement.</em>","button_label":"Découvrir nos services","button_link":"#/expertises","image":"/assets/images/dunes.jpg","video":""}'::jsonb),

('home_intro', 'Accueil — Intro',
 '{"eyebrow":"L''agence","lead":"AZUREA accompagne les marques d''exception dans une présence digitale <em class=\"accent\">cohérente</em> et désirable.","p1":"Ancrée à Bordeaux et à Marrakech, l''agence travaille à distance pour des clients en France et à l''international — hôtels, restaurants, marques lifestyle, immobilier premium et maisons d''exception.","p2":"Du branding à la stratégie réseaux sociaux et aux expériences digitales sur mesure, chaque geste renforce la visibilité, l''impact et la désirabilité de la marque."}'::jsonb),

('home_univers', 'Accueil — Univers en images',
 '{"image1":"/assets/images/website-trends.jpg","image2":"/assets/images/kclub-resort.jpg"}'::jsonb),

('marquee', 'Accueil — Marquee',
 '{"text":"Imaginer · Créer · Sublimer"}'::jsonb),

('fullbleed', 'Accueil — Bande plein écran',
 '{"text":"Une communication à la hauteur de votre <em>exigence.</em>","image":"/assets/images/canyon.jpg"}'::jsonb),

('distance', 'Accueil — À distance',
 '{"eyebrow":"À distance","lead":"Un accompagnement <em class=\"accent\">100% à distance</em>, sans concession sur l''exigence.","points":["Échanges en visio & espace partagé","Suivi structuré, livrables réguliers","Réactivité au quotidien","Déplacements ponctuels pour shootings & tournages"]}'::jsonb),

('cta_home', 'Accueil — CTA',
 '{"eyebrow":"Créons ensemble","title":"Quelque chose <em>d''exceptionnel.</em>","sub":"Votre univers, votre impact.","button_label":"Démarrer un projet","button_link":"#/contact"}'::jsonb),

('expertises_preview', 'Accueil — Expertises (aperçu)',
 '{"title":"Trois savoir-faire,<br>une <em>vision</em> globale.","cards":[
    {"num":"01","title":"Réseaux sociaux","desc":"Stratégie éditoriale et gestion social media haut de gamme.","image":"https://static.showit.co/1600/4HjGAdxIYD-8azK2DEio1A/323843/agence-communication-marrakech.jpg"},
    {"num":"02","title":"Branding","desc":"Identités visuelles fortes, cohérentes et durables.","image":"https://static.showit.co/1600/GE_OfwzT1MgRNvASydTzbQ/323843/agencedecom.jpg"},
    {"num":"03","title":"Expérience digitale","desc":"Sites, contenus et dispositifs sur mesure.","image":"https://static.showit.co/1600/x--zoGqqwptXwp8hvRZG-Q/323843/agence-digi.jpg"}
  ]}'::jsonb),

('agence', 'Agence',
 '{"founder_quote":"« La perception d''une marque ne repose pas seulement sur ce qu''elle propose, mais sur la manière dont elle se présente au monde. »","founder_text":"AZUREA est née d''une conviction : accompagner des marques ambitieuses dans une présence digitale distinctive, cohérente et alignée sur leurs objectifs.","founder_extra":"Cinq années d''études supérieures en commerce & communication nourrissent chaque projet : une exigence à la fois stratégique et esthétique.","differentiators":["Une vision stratégique globale","Une direction artistique forte","Un accompagnement 360°","Une agence à taille humaine","Une dimension internationale, à distance"],"cities":[{"name":"Bordeaux","region":"Ancrage · France"},{"name":"Marrakech","region":"Racines · Maroc"},{"name":"À distance","region":"Partout dans le monde"}]}'::jsonb),

('method', 'Méthode',
 '{"phases":[
    {"tag":"Phase 01","title":"Prise de contact & cadrage","steps":["Rendez-vous & échange","Analyse du projet","Définition de la direction","Envoi du devis","Signature & lancement"]},
    {"tag":"Phase 02","title":"Création","steps":["Direction artistique & univers visuel","Création des supports et contenus","Développement graphique & éditorial","Validation & ajustements"]},
    {"tag":"Phase 03","title":"Déploiement","steps":["Mise en ligne / publication","Implémentation des supports","Coordination & accompagnement au lancement"]},
    {"tag":"Phase 04","title":"Suivi & optimisation","steps":["Rendez-vous réguliers","Analyse des performances","Ajustements stratégiques","Anticipation & innovation"]}
  ],"delays":[{"num":"3–6 sem.","label":"Projet de branding"},{"num":"2–4 sem.","label":"Stratégie social media"},{"num":"4–8 sem.","label":"Création d''un site web"}]}'::jsonb),

('partners', 'Logos partenaires',
 '{"logos":[{"name":"Château Picon"},{"name":"Maison Bonté"},{"name":"Clair Lagon"},{"name":"K-Club"},{"name":"La Casaque"},{"name":"LAB"},{"name":"Studio 06:56"},{"name":"Citadelle"}]}'::jsonb)

on conflict (key) do nothing;

-- ---------- PROJECTS (réalisations réelles) ----------
insert into public.projects (position, name, category, location, description, cover_url, prestations) values
(1,'K-Club','social','Ubud, Bali','Un an de gestion de la communication de plusieurs comptes : le restaurant Sardine by K-Club et le resort de luxe. Ligne éditoriale, contenus, reels et animation des réseaux.','/assets/images/kclub.jpg','["Community management","Contenu","Reels"]'::jsonb),
(2,'Clair Lagon','social','Vendée','Gestion des réseaux sociaux d''un lagon paysager haut de gamme — direction artistique du feed et production de contenu.','/assets/images/clairlagon.jpg','["Réseaux sociaux","Contenu"]'::jsonb),
(3,'Château Picon','web','Vignoble bordelais','Site web et présence réseaux d''une propriété viticole — gîtes, expériences et art de vivre.','/assets/images/picon.jpg','["Site web","Réseaux sociaux"]'::jsonb),
(4,'Maison Bonté','web','Dordogne','Création du site d''une maison d''hôtes haut de gamme : direction artistique, landing page immersive et parcours de réservation.','/assets/images/bonte.jpg','["Site web","Direction artistique"]'::jsonb),
(5,'AG Consulting to Action','web','France','Refonte du site d''un cabinet de conseil en énergies renouvelables (projet en cours).','/assets/images/ag-consulting.jpg','["Refonte de site","UX/UI"]'::jsonb),
(6,'La Casaque','web','France','Projet digital & IA autour des courses hippiques : marketing, Brevo, animation du site, application, réseaux sociaux et ads.','/assets/images/lacasaque.jpg','["Digital","IA","Marketing","Ads"]'::jsonb),
(7,'Citadelle','branding','Saint-Émilion','Identité complète d''une maison viticole de Saint-Émilion : logotype gravé, univers éditorial et déclinaisons print.','/assets/images/citadelle-grid.jpg','["Branding","Print"]'::jsonb),
(8,'LAB','branding','Saint-Barthélemy','Branding d''un atelier de matières à Saint-Barthélemy (en cours).','/assets/images/canyon.jpg','["Branding"]'::jsonb)
on conflict do nothing;
