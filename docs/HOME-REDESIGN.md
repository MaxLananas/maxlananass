# Refonte de la page d’accueil — note de conception & d’intégration

Direction artistique : **« TERRAIN » — l’atlas d’un constructeur de mondes.**

Concept en une phrase : *le portfolio est la carte d’un territoire en construction —
on y navigue par secteurs numérotés, chaque œuvre porte des coordonnées réelles,
et le marqueur (graticule, croix de relevé, coordonnées en mono) relie le fait de
construire au 1:1 et le fait d’écrire du logiciel dans le même espace quadrillé.*

## Fichiers livrés (accueil autonome)

- `index.html`  — nouvelle page d’accueil (au lieu de l’ancien hero-galerie).
- `home.css`    — design system « papier de terrain » de la page d’accueil.
- `home.js`     — motion GSAP progressive + renfort d’images (secours) + année.

Les pages d’archives (`/projects/`, `/about/`, `/development/`, `/buildtheearth/`,
`/builds/`, fiches de projets, galerie paginée, `style.css`, `page.js`, sitemaps,
`robots.txt`, SEO/JSON-LD) ne sont **pas** modifiées : elles restent la source de
contenu profond consultable.

## Principes

- **Excellent immobile d’abord.** Sans JS, sans GSAP ou avec `prefers-reduced-motion`,
  tout le contenu est visible : un garde-fou (`html.static` / `.no-motion`) lève les
  états de départ si GSAP ne charge pas.
- **Motion = mise en scène.** Entrée du hero (lignes, trait de relevé, coordonnées),
  révélations au scroll via GSAP ScrollTrigger (fallback IntersectionObserver),
  micro-interactions de survol. `transform`/`opacity` privilégiés.
- **Identité réelle conservée.** Tous les faits, projets, liens (GitHub, Modrinth,
  Instagram, Discord), crédits de collaborations (BuildTheEarth, Endorah, Fight4Glory)
  et mentions légales d’indépendance sont repris sans invention de métrique ou de client.
- **Coordonnées.** Les lieux 1:1 portent des coordonnées *approximatives* réelles
  (Le Mans, Larressingle, Mont-Blanc…), présentées comme « approx. ».

## Ressources utilisées

- Police locale `assets/fonts/FFFlauta-200.woff2` (affiche), + piles système (mono/sans).
- Covers locaux commités pour la section dev (`assets/projects/*.webp`).
- Photos de builds : pipeline existant du site — original GitHub release → `wsrv.nl`
  optimisé → secours sur l’original GitHub → fond quadrillé si tout échoue.

## ⚠️ Limite d’intégration (à lire)

Le dépôt possède **deux modes de publication** :

1. **Mode actuel « branch root » (servi aujourd’hui)** : la page rendue est le
   `index.html` à la racine. → **Cette refonte est effective dès la publication.**
2. **Mode « optimisé » GitHub Actions** (`tools/seo-render.mjs` + `templates/home.html`)
   : il régénère une accueil « legacy » à partir de `templates/home.html` + injections
   `seo-content.mjs`. Ce pipeline n’a **pas** été modifié (il n’était pas exécutable ici,
   outillage indisponible hors-ligne). Si le mode 2 est activé plus tard, la nouvelle
   accueil devra être intégrée dans ce pipeline (template + styles/app + head) pour ne
   pas être écrasée.

## Vérifications réellement effectuées

- `node --check home.js` → OK.
- Balance des accolades CSS, références locales d’assets vérifiées (aucune manquante),
  classes HTML présentes dans la CSS, pas d’ID dupliqués, balises équilibrées.
- Serveur statique démarré (`node tools/serve.mjs --preview`) : `/`, `home.css`,
  `home.js`, la police et les couverts locaux répondent en `200`.

**Non vérifié ici (pas de navigateur dans l’environnement) — checklist restante :**
- [ ] Rendu desktop ~1440 px et intermédiaire ~1024 px
- [ ] Mobile ~390 px et ~360 px (wordmark, captions empilées, menu `<details>`)
- [ ] GSAP chargé : entrée hero + révélations scroll ; `prefers-reduced-motion` actif
- [ ] Chargement des photos builds (wsrv → GitHub) et affichage du fond quadrillé en secours
- [ ] Focus clavier, ordre de tabulation, menu mobile ouvert/fermé
- [ ] Redimensionnement entre breakpoints (860 / 640 / 560 px)
- [ ] Césures/retours à la ligne sur les gros titres (FFFlauta)
- [ ] Axe/a11y rapide (contraste, landmarks, heading order)
