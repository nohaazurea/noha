# AZUREA — Site vitrine

Studio créatif & agence de communication premium.
Site mono-page (SPA) en **HTML / CSS / JavaScript** + **GSAP** (animations), **ScrollTrigger** (scroll) et **Lenis** (smooth scroll).
Aucun build, aucune dépendance à installer : c'est du statique, prêt à publier.

---

## 🗂 Structure du projet

```
azurea/
│
├── index.html            → structure du site (toutes les sections, commentées)
│
├── css/
│   ├── style.css         → design, mise en page, composants, couleurs, typographie
│   ├── animations.css    → keyframes, loader, transition de page, curseur, prefers-reduced-motion
│   └── responsive.css    → toutes les media-queries (chargé en dernier)
│
├── js/
│   ├── main.js           → point d'entrée : état partagé, smooth scroll, nav, menu, démarrage
│   ├── animations.js     → loader + animations GSAP (reveals, parallaxe, timeline, boutons magnétiques)
│   ├── router.js         → routeur SPA (pages, transitions, filtres projets)
│   └── cursor.js         → curseur personnalisé
│
├── assets/
│   ├── images/           → visuels du site (dunes, canyon, projets Citadelle…)
│   ├── videos/           → (vide) tes vidéos : portrait fondatrice, backstage, shootings…
│   ├── logos/            → logo officiel (masque colorisé en CSS) + fichier source
│   └── fonts/            → police Belleza (woff2) + licence OFL
│
├── favicon/              → favicon
│
└── README.md
```

Les scripts sont volontairement chargés dans cet ordre (voir bas de `index.html`) :
`animations.js → cursor.js → router.js → main.js`.
Tous partagent un même espace de noms global **`window.AZUREA`** (état + fonctions).
`main.js` orchestre tout au chargement de la page.

---

## ✏️ Modifier facilement

| Je veux changer…            | Où aller                                                                 |
|-----------------------------|--------------------------------------------------------------------------|
| **un texte**                | `index.html` — chaque section est balisée par un commentaire (HERO, INTRO, EXPERTISES, RÉALISATIONS, MÉTHODE, AGENCE, CONTACT…) |
| **une image**               | remplace le fichier dans `assets/images/` (même nom) **ou** change le `src` / la classe `.bg-…` dans `css/style.css` |
| **une vidéo**               | dépose-la dans `assets/videos/` puis pointe le `<source src="…">` correspondant dans `index.html` |
| **le logo**                 | remplace `assets/logos/logo-mask.png` (silhouette blanche sur fond transparent — il est recoloré automatiquement en CSS) |
| **une couleur / la typo**   | variables en haut de `css/style.css` (`:root { --bg, --ink, --accent … }`) |
| **une animation**           | `js/animations.js` (durées, eases, valeurs) ou `css/animations.css` (keyframes) |
| **ajouter une page**        | voir l'en-tête de `js/router.js` (3 étapes) |

> 💡 Les images sont référencées par des classes CSS `.bg-dunes`, `.bg-canyon`, `.bg-citgrid`… dans `css/style.css`. Modifier une seule ligne suffit pour changer un visuel partout où il est utilisé.

### ⚠️ Photos encore hébergées à l'extérieur
Certaines images (galeries, feed réseaux sociaux) pointent encore vers `static.showit.co`.
Pour une mise en production 100 % autonome, télécharge-les dans `assets/images/` et remplace les URL `https://static.showit.co/…` par des chemins locaux `assets/images/…`.

---

## ▶️ Lancer en local

Ouvrir simplement `index.html` dans un navigateur suffit **presque** — mais comme le site charge des fichiers CSS/JS séparés, il vaut mieux passer par un petit serveur local :

- **VS Code** : extension **Live Server** → clic droit sur `index.html` → *Open with Live Server*.
- **ou** en ligne de commande :
  ```bash
  npx serve .
  # ou
  python3 -m http.server
  ```

---

## 🚀 Déployer

Le site étant 100 % statique, il se publie tel quel :

- **Netlify** : glisser-déposer le dossier `azurea/` sur https://app.netlify.com/drop.
- **Vercel** : `vercel` à la racine du dossier (framework preset : *Other*), ou import du dépôt Git.
- **GitHub Pages / OVH / tout hébergeur** : uploader le contenu du dossier.

Aucune commande de build n'est nécessaire.

---

## 🧩 Vers des composants (plus tard)

L'architecture est prête pour une future migration en composants :
- chaque page est une `<section class="route" data-route="…">` isolée dans `index.html` ;
- chaque grande section est délimitée par un commentaire clair ;
- la logique JS est déjà séparée par rôle (router / animations / cursor / main) et exposée via `window.AZUREA`.

Le jour où tu passes à un framework (Astro, Vue, React…), il suffit d'extraire chaque `<section>` en composant et de rebrancher les hooks GSAP existants (`data-reveal`, `data-split`, `data-zoom`, `data-magnetic`, `data-timeline`…).

---

## 📄 Licences
- Police **Belleza** — SIL Open Font License 1.1 (voir `assets/fonts/OFL.txt`).
- GSAP / ScrollTrigger / Lenis — chargés via CDN.

---

# 🛠 Back-office administrable (Supabase + /admin)

Le site reste **strictement identique** (design, animations, routing, GSAP, Lenis, responsive). Une couche de contenu dynamique remplace seulement les textes/images/listes codés en dur par des données Supabase, éditables depuis un back-office premium sur **`/admin`**.

## Architecture
```
azurea/
├── index.html                  → site (contenus balisés data-cms, inchangé visuellement)
├── js/
│   ├── supabase-config.js       → URL + clé anon Supabase (à remplir)
│   └── cms.js                   → chargeur dynamique (repli sur le contenu d'origine)
├── admin/                       → back-office premium
│   ├── index.html               → connexion (Supabase Auth)
│   ├── app.html                 → tableau de bord (SPA)
│   ├── admin.js                 → sections · projets (drag&drop) · médias · paramètres
│   └── admin.css
├── supabase/
│   ├── schema.sql               → tables, RLS, Storage, triggers
│   └── seed.sql                 → contenu initial (reprend le site actuel)
├── netlify.toml · .env.example
```

## Installation pas à pas

**1. Créer le projet Supabase** — https://supabase.com → New project.

**2. Base de données** — Supabase > *SQL Editor* :
- colle le contenu de `supabase/schema.sql` → **Run** ;
- colle le contenu de `supabase/seed.sql` → **Run**.
(Le bucket Storage `media` public est créé automatiquement par le schéma.)

**3. Créer ton compte admin** — Supabase > *Authentication* > *Users* > **Add user** : ton email + un mot de passe (coche « Auto Confirm User »).

**4. Récupérer les clés** — Supabase > *Project Settings* > *API* : copie **Project URL** et la clé **anon public**.

**5. Renseigner les clés** — ouvre `js/supabase-config.js` et colle :
```js
window.AZUREA_SUPABASE = {
  url: "https://xxxx.supabase.co",
  anonKey: "eyJhbGciOi..."
};
```

**6. Déployer sur Netlify** — glisse-dépose le dossier `azurea/` sur https://app.netlify.com/drop (ou connecte un dépôt Git ; *publish directory* = racine, aucune commande de build).

**7. Administrer** — va sur `https://ton-site.netlify.app/admin/` → connecte-toi → édite. **Les modifications apparaissent immédiatement sur le site** (au rechargement de la page).

## Ce que gère le back-office
- **Contenu / Sections** : hero, intro, univers, bande plein écran, à distance, aperçu expertises, CTA, agence, méthode, logos partenaires… (champs simples + listes en JSON validé).
- **Réalisations** : gestionnaire complet — ajouter / modifier / supprimer / **réordonner par drag & drop**, image de couverture + galerie (upload), catégorie, lieu, description, prestations, vidéo, étude de cas, SEO, publication.
- **Médias** : upload (avec **optimisation automatique** : redimension ≤ 1600 px + compression), prévisualisation, copie d'URL, suppression.
- **Paramètres** : logo, favicon, SEO, OpenGraph, Analytics, email, téléphone, adresse, réseaux sociaux, footer.

## Sécurité
- Lecture publique / écriture réservée aux utilisateurs connectés (**RLS**).
- La clé `anon` est publique par conception (protégée par RLS). Ne mets **jamais** la clé `service_role` dans le front.

## Étendre (rendre un nouveau texte éditable)
1. Dans `index.html`, ajoute un attribut sur l'élément : `data-cms="ma_section.mon_champ"` (ou `data-cms-html`, `data-cms-img`, `data-cms-bg`).
2. Dans l'admin (ou via `seed.sql`), ajoute la clé/section correspondante.
C'est tout — `cms.js` s'occupe de l'injection sans toucher aux animations.

## Repli de sécurité
Tant que `js/supabase-config.js` est vide (ou en cas d'erreur réseau), le site affiche le **contenu d'origine codé en dur** : aucune régression possible.
