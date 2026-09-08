# Audit SEO et stratégie — 7 septembre 2026

## Périmètre et méthode (avant modification SEO)

- Site publié : `https://maxlananas.is-a.dev/`, dépôt `MaxLananas/maxlananass`, `main` au commit `fc628512069597ef06d35fc859a7817349d26ec8`.
- Pages API : domaine personnalisé correct, publication **legacy / main / root**. Les optimisations de performance du tour précédent n’étaient ni commitées ni poussées ; elles constituent désormais le commit `07a793a` dans la PR #4, avant cette refonte SEO.
- Inspection du HTML, CSS, scripts, manifeste, robots, sitemap, 404, service worker, générateur, pipeline et tests. Lecture du site rendu et des sources publiques des projets via l’API GitHub.
- Lecture des documentations Google sur JavaScript, ProfilePage et les fonctionnalités IA. La documentation FAQPage consultée redirige désormais vers l’annonce de retrait de la fonctionnalité FAQ rich result ; aucune promesse d’extrait FAQ n’est donc pertinente.
- Les connexions HTTP directes aux domaines publics échouent dans ce sandbox. Le contenu rendu est accessible par l’outil de lecture web ; **les statuts/chaînes de redirection en production, CrUX, impressions, backlinks, couverture d’indexation, positions réelles, Bing Webmaster Tools et Search Console ne sont pas vérifiables ici**. Une absence de résultat dans une recherche ponctuelle ne prouve pas une désindexation.

## Constats et traitement

| Priorité | Constat vérifié | Conséquence / traitement |
| --- | --- | --- |
| P0 | Une seule URL dans le sitemap ; navigation exclusivement par fragments | Créer de vraies pages statiques, auto-canoniques, reliées depuis l’accueil et entre elles. Ne pas prétendre que `#work` est une page enfant de `#contact`. |
| P0 | Galerie construite après exécution JS ; images sans `src` avant intersection | Conserver la galerie rapide, mais fournir une galerie HTML paginée complète, avec de vrais `img src`, captions, crédits et liens sans JS. Pas de rendu différent pour les robots. |
| P0 | Presque aucun contenu sur les logiciels malgré des dépôts publics documentés | Fiches utiles : finalité, environnement, usages, dépendances, limites, sources vérifiables et projets connexes. Pas de fiche artificielle pour chaque dépôt vide ou screenshot anonyme. |
| P0 | H1 « Portfolio », identité principalement dans la barre de navigation | Accueil centré sur MaxLananas, page profil, relations explicites entre création Minecraft et développement. |
| P1 | Graphe Person/WebSite incomplet ; Discord communautaire dans `sameAs`, savoir-faire non étayé | Identifiant Person stable `/#person`, profils personnels seulement dans `sameAs`, contact Discord séparé, données correspondant au texte visible. |
| P1 | Fil d’Ariane constitué de trois ancres sur la même page | Vrais BreadcrumbList cohérents avec des fils visibles sur les pages internes. Pas de breadcrumb artificiel sur l’accueil. |
| P1 | Offers/FAQ/SearchAction sans bénéfice démontré pour ce portfolio | Retirer le balisage décoratif et les offres sans détail ; conserver la FAQ utile en HTML. SoftwareSourceCode/SoftwareApplication seulement pour les vrais logiciels, Article seulement pour un véritable guide. |
| P1 | PNG 180×180 utilisé comme grande image sociale | Carte PNG locale 1200×630, texte alternatif social et dimensions explicites ; favicon 96×96 et icônes PWA correctes. |
| P1 | 101 photos assimilées à 101 projets | Parler de screenshots/images ; ne pas inventer 101 réalisations distinctes ou des chiffres d’utilisateurs. |
| P1 | Variantes `index.html`, paramètres de recherche et futures pages paginées | Canonicals absolues vers HTTPS et slash final ; chaque page de galerie a son propre canonical. Recherche dédiée noindex, non bloquée par robots ; anciens `?q` conservés avec canonical accueil. |
| P1 | Service worker prévu pour une seule page | Cache des pages réellement visitées, clés séparées par route, pas de retour de l’accueil en réponse à une URL inexistante. Pas de précache de toutes les nouvelles photos/pages. |
| P1 | Pas de tests SEO du HTML servi | Crawl automatisé sans JS : routes, liens/ancres, H1, canonicals, schemas, sitemaps, robots, images, alternates et 404. Vérification de parité entre agents utilisateurs. |
| P2 | Alt générique ou filename technique ; attributions uniquement dynamiques | Libellés fondés sur le catalogue (sans inventer les scènes anonymes), captions et crédits rendus en HTML. Sitemaps d’images correspondant aux images réellement affichées. |
| P2 | Navigation mobile cache la recherche et certains liens | Liens vers les rubriques et recherche statique accessibles dans le contenu et le pied de page, sans changer la galerie existante. |
| P2 | Deux langues potentielles, mais site initial entièrement anglais | Anglais conservé pour les projets ; véritable profil français équivalent au profil anglais, avec hreflang réciproque uniquement pour cette paire. Pas de fausses traductions de tout le site. |
| P2 | Profil GitHub renvoie à Discord ; description du dépôt très courte, homepage HTTP | Aligner la homepage HTTPS et la description du dépôt du portfolio. Recommander l’ajout d’un lien portfolio sur les autres profils sans modifier d’office les autres dépôts/comptes. |
| P2 | Pas de mesure SEO propriétaire | Brancher des champs de vérification optionnels, sans faux tokens ; contrôle post-déploiement des URLs et checklist Search Console/Bing. Ne pas inventer de statistiques ou de score Lighthouse. |

## Architecture retenue

- `/` : identité + galerie interactive, projets sélectionnés, liens vers les rubriques et contenu de commande existant.
- `/about/` et `/fr/a-propos/` : profil de la même personne, comptes vérifiables, périmètre des activités, crédits et contact.
- `/projects/` : catalogue éditorial, pas une copie automatique de tous les dépôts.
- `/buildtheearth/` : contributions et outils reliés au projet collectif, statut non officiel clairement indiqué.
- `/development/` : mods client, plugins serveur, addon Axiom, outils web et expérimentation logicielle.
- `/projects/<slug>/` : sept projets logiciels/documentaires documentés et une collection de builds du Mans.
- `/builds/`, `/builds/page/2/`… : catalogue photographique complet, 16 images par page, ordre stable et pagination HTML.
- `/guides/minecraft-mods-plugins-addons/` : comparaison pratique des environnements à partir des vrais projets.
- `/search/` : recherche interne noindex ; pas de liens indexables par combinaison de filtres.
- `/404.html` : statut 404 réel, noindex, liens de récupération ; aucune redirection vers la home pour masquer une absence.

Les fichiers HTML générés sont versionnés **car Pages publie actuellement la racine sans compiler**. Ils proviennent d’un générateur unique ; le mode optimisé les régénère dans `dist/` avec les variantes d’images. Les originaux et gros fichiers restent exclus de Git.

## Sources et limites des affirmations

Sources consultées le 2026-09-07. Les SHA désignent la révision vérifiée, pas une promesse de compatibilité avec toute version future.

| Projet | Révision de référence | Éléments utilisables |
| --- | --- | --- |
| [HomeGUI](https://github.com/MaxLananas/HomeGui) | `8c76984bcd0d1b401b1c1b1d39aa03b9022c8813` | Client Fabric 1.21.1, `/homes`/`/home`, recherche/favoris/historique, lien Modrinth. Ne contourne pas les permissions serveur. |
| [TraceBTE](https://github.com/MaxLananas/tracebte-plugin) | `dd35c16ea514223f2b77f5851c3dcf811992bc1b` | Tutoriel Paper, Java 21, FAWE, GPS, `/tpll`, WorldEdit, commandes `/tuto`. |
| [Railway Tools](https://github.com/MaxLananas/railwaytoolV2) | `6220e980f351b58a0a5d8fdb38247d290435f75e` | Addon Axiom/Fabric, contrôle par points, spline Catmull–Rom, aperçu, suivi du terrain. Axiom non inclus. |
| [BTE Distorsion Calculator](https://github.com/MaxLananas/BTE-Distorsion-Calculator) | `794ae8572d15e7da528fd809019ec1526d7e6d32` | Interface web française, modes théorique/empirique, `conformal.lzma`. Ne pas revendiquer une précision topographique certifiée. |
| [Normalisation BTE France](https://github.com/MaxLananas/bte-fr-normalisation) | `6b214c1e1261125fd608cec0aa9cd53d1395cbc5` | Wiki explicitement non officiel, routes, bâtiments, transports, mobilier urbain ; footer « Fait par MaxLananas ». |
| [PineappleUI](https://github.com/MaxLananas/PineappleUI) | `c0d055b66fad86cc7b2f4c7a07d7e6fab525ea8a` | Transpileur Python d’interfaces HTML/CSS-like vers Java Swing. JavaFX et Android XML restent une roadmap. |
| [BuildersUtilities BT Corsica](https://github.com/MaxLananas/BuildersUtilities-BTCorsica) | `e100c989d2fe527c48527c99dab28f304556a621` | Fork de TehBrian/Arcaniax adapté ; ne pas attribuer l’original à MaxLananas. README MIT et métadonnée GitHub GPL divergent : lien vers LICENSE, pas d’étiquette de licence péremptoire. |
| Collection Le Mans | `gallery-data.js`, catalogue d’origine | Images et tags existants, crédit BTE ; pas de durée, commande, nombre de blocs ou rôle de responsable inventé. |

Les autres dépôts (README vide/répétitif, forks sans contribution détaillée, expérimentations sans documentation) ne deviennent pas automatiquement des pages. Ils restent accessibles via le profil GitHub.

## Décisions explicites, pas d’« optimisation » artificielle

- **Pas de LocalBusiness, adresse, localisation, employeur ou rôle officiel** : aucune information publique vérifiée ne les justifie. Le lieu approximatif du visiteur/auteur n’est pas une donnée à publier.
- **Pas de faux avis, étoiles, téléchargements, références client ou backlinks.** Les collaborations sont créditées, pas transformées en partenariats commerciaux.
- `Project` représente une organisation de projet dans Schema.org : inutile de typer chaque capture comme une organisation. Utiliser CreativeWork/CollectionPage selon le cas.
- Pas d’Offers/prix fictifs pour rendre artificiellement un logiciel éligible à un résultat enrichi. Un schema valide ne garantit pas un rich result.
- Pas de `meta keywords`, de texte caché, de pages satellites, de contenu dépendant de l’User-Agent ou de fichiers magiques pour l’IA. Google indique que les fondamentaux SEO s’appliquent aussi aux fonctions IA.
- Pas de fausses redirections de domaine dans `_redirects` : Cloudflare Pages ne les prend pas en charge. Les règles de chemins générées sont utilisables par Cloudflare, mais ignorées par GitHub Pages ; le serveur local teste la normalisation réelle. Les canonicals restent présents dans le HTML et les statuts en production ne sont pas supposés.
- Pas de changement des DNS, comptes Search Console, paramètres Pages, autres dépôts ou fusions automatiques dans `main`.

## Validation et suivi

Le code doit être contrôlé par `seo:check`, les tests unitaires et navigateur, le build de test, puis par le SHA distant et l’inventaire de fichiers de la PR. Après publication réelle : inspecter l’accueil, le profil, un logiciel, le hub BTE et une page de galerie dans Search Console ; soumettre les sitemaps à Google et Bing ; vérifier le choix du canonical, les images et les redirections HTTP/www/github.io. Mesurer ensuite requêtes de marque, requêtes par projet, CTR et pages indexées — pas une position garantie.

Références : [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [fonctionnalités IA](https://developers.google.com/search/docs/appearance/ai-features), [mises à jour Search Central](https://developers.google.com/search/updates), [canonicals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [images](https://developers.google.com/search/docs/appearance/google-images).

## Complément d’audit : second hébergement détecté dans la PR

Le check GitHub « Cloudflare Pages » du commit `07a793a` confirme une intégration supplémentaire : preview `https://1f869cff.maxlananas-builds.pages.dev` et alias de branche `https://arena-01a07ce9-maxlananass.maxlananas-builds.pages.dev`. La déclaration publique `is-a-dev/register/domains/maxlananas.json` et la résolution DNS confirment cependant que le domaine canonique pointe toujours sur `maxlananas.github.io` (GitHub Pages).

Traitement implémenté : `_headers` exclut les domaines `pages.dev` et leurs previews de l’index avec `X-Robots-Tag: noindex`, sans appliquer cette exclusion au domaine personnalisé. Il ajoute un cache immutable **uniquement aux variantes d’images à empreinte**. `_redirects` ne contient que des normalisations de chemins existants, aucun catch-all vers l’accueil, aucune fausse règle de domaine, aucune redirection de preview vers la production. Ces deux fichiers sont livrés à la racine et dans `dist/`. Aucun paramètre Cloudflare ni DNS n’est modifié.

Références vérifiées : [headers Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/headers/) et [redirects Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/redirects/). La première série de tests (commit performance) est également passée sur GitHub Actions, notamment avec Firefox et WebKit disponibles sur le runner ; les résultats du commit SEO final seront vérifiés séparément.

## Paramètres GitHub : limite d’autorisation constatée

La tentative d’aligner la description et la homepage du dépôt avec `gh repo edit` a retourné **HTTP 403 — Resource not accessible by integration**. Une relecture a confirmé que la homepage reste `http://maxlananas.is-a.dev/` et la description « My MC/Dev Portfolio ». Ce changement de paramètre **n’est pas annoncé comme effectué**. Le README contient bien un lien HTTPS canonique, et la connexion autorise les commits, push et Pull Requests. Le propriétaire peut corriger le champ About dans GitHub ou réautoriser la connexion Arena pour l’administration du dépôt ; aucun secret n’est nécessaire dans la conversation.
