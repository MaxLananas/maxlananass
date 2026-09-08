# MaxLananas — portfolio

**Site : [maxlananas.is-a.dev](https://maxlananas.is-a.dev/)** — Minecraft builder, contributions BuildTheEarth et projets de développement.

Portfolio statique, sans framework ni dépendance JavaScript côté visiteur. Les **101 photos, crédits, tags de recherche, liens et sections du portfolio d’origine sont conservés**.

Les originaux restent dans la release [`Asset-Portfolio / images-v1`](https://github.com/MaxLananas/Asset-Portfolio/releases/tag/images-v1). Aucun original n’est modifié, supprimé, déplacé ou ajouté au dépôt du site.

## Architecture SEO et contenu

Le site comprend maintenant **35 pages statiques (34 indexables)** : profil MaxLananas et étude de cas iProf en anglais/français, catalogue de projets, rubriques BuildTheEarth et développement, dix-neuf fiches de projets et collections, un guide technique et une galerie paginée contenant les 101 screenshots. Le contenu essentiel est disponible sans JavaScript ; la galerie interactive reste en place.

- Sources éditoriales : `content/`, `templates/home.html`, `tools/seo-content.mjs` et `image-labels.js`.
- Génération : `npm run seo:render`. Ne pas modifier les snapshots HTML à la main.
- Contrôle : `npm run seo:check` (canonicals, langues, liens/ancres, schemas, sitemaps, absence de pages orphelines).
- [Audit et stratégie avant implémentation](docs/SEO-AUDIT.md).
- [Publication, vérification et suivi SEO](docs/SEO-OPERATIONS.md).

Ces améliorations SEO fonctionnent également dans le mode de publication actuel, sans activation du pipeline d’images. Les règles Cloudflare livrées protègent les miroirs/previews de l’indexation ; GitHub Pages ignore ces fichiers et conserve les canonicals HTML.

## Nouvelle sélection développement

- **iProf 2026** est le projet d’interface mis en avant, avec les **11 visuels fournis** et un lecteur vidéo natif H.264 à chargement différé.
- Les **10 projets publiés sur Modrinth** sont regroupés ensemble, avec liens de versions : Colorflow, Nostalgia Ultra Shader, Sculk Vision, JukeBoxPlus, Now Playing IRL, HomeGUI, Railway Tools, BidVault, BedrockHeightGuard et DeathPoint.
- SENTINEL, MaxOS et PineappleUI forment une section **Software lab**, distincte des sorties publiées.
- Les anciennes URLs BTE et les crédits restent accessibles, sans dominer la sélection dev.

Voir [la sélection et les médias](docs/DEVELOPMENT-SHOWCASE.md) pour les sources, l’import et les limites de validation.

## Publication : deux modes compatibles

### 1. Publication actuelle, sans étape de compilation

Les fichiers à la racine continuent de fonctionner avec **Pages → Deploy from a branch → main / root**.

Améliorations déjà présentes dans ce mode : WebP explicitement demandé au proxy, tailles partagées, chargement natif priorisé, adaptation aux connexions lentes, cache borné, aperçu immédiat dans la visionneuse, police WOFF2 et petits logos. `npm install` n’est pas nécessaire pour héberger ces fichiers.

Ce mode utilise encore **wsrv.nl**. Les dimensions sont mémorisées localement après un premier affichage. Si le proxy échoue, une tentative sur l’original est conservée, puis un lien de secours est proposé : pas de boucle infinie.

### 2. Publication optimisée, recommandée

Le workflow `.github/workflows/pages.yml` prépare les photos **avant** la visite et publie le résultat statique sur GitHub Pages. Aucun serveur applicatif, abonnement CDN ou secret supplémentaire à configurer.

**Une seule configuration à effectuer, une fois les changements intégrés dans `main` :**

1. Dans le dépôt du portfolio : **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Dans **Actions → Portfolio — checks and optimized Pages → Run workflow**, sélectionner `main` et lancer le workflow.
3. Les prochains changements sur `main` déclenchent automatiquement les tests, la préparation et la publication.

Le code ne modifie pas tes paramètres GitHub et ne publie rien à distance à lui seul. Si Pages reste en mode « branch », le workflow n’écrase pas cette publication et affiche un message explicatif. Le domaine personnalisé (`CNAME`), les URL et le manifeste sont conservés.

**Dans ce mode optimisé :**

- Le navigateur choisit **AVIF**, ou **WebP** si nécessaire, à la taille appropriée.
- Les images préparées sont servies depuis **le même domaine que le site** : pas de redirection GitHub ni de conversion à la demande pour le parcours normal.
- Dimensions réelles et mini-aperçus sont inclus dans le code : la grille ne se réorganise plus à chaque décodage d’une photo.
- JavaScript/CSS sont minifiés ; les fichiers et images portent une empreinte de contenu qui invalide correctement leur cache lorsqu’ils changent.
- Une publication incomplète n’est jamais déployée : toute photo absente, corrompue ou incohérente fait échouer la préparation.
- Les originaux et variantes intermédiaires sont dans `.cache/`, le site produit dans `dist/`. **Ces gros fichiers sont exclus de Git.** Seuls les petits logos/police nécessaires au mode sans compilation sont versionnés.

Le premier encodage de l’album peut prendre plusieurs dizaines de minutes. Les suivants réutilisent les originaux vérifiés et les variantes déjà encodées. Cela coûte du temps **à la compilation**, pas au visiteur. Un échec du build laisse la dernière publication réussie en place.

## Ce qui accélère réellement les photos

### Réduire les octets, pas ajouter des filtres visuels

L’ancien proxy recevait `w` et `q`, mais pas `output`. Pour une source PNG, il renvoyait donc du PNG et **le réglage `q` ne s’appliquait pas**. Le mode compatible demande maintenant du WebP haute qualité ; la compilation prépare aussi de l’AVIF.

Les largeurs partagées sont **320, 640, 960, 1600 et 2560 pixels**, limitées à la largeur native de chaque original. La grille utilise les variantes jusqu’à 960 px ; la visionneuse va jusqu’à 2560 px selon son espace réel et la densité de l’écran. Une petite image n’est jamais artificiellement agrandie par l’encodeur.

Un `<picture>` / `srcset` laisse le navigateur choisir le format et la résolution. Une fois une vignette chargée, sa source est figée : un changement de densité d’écran ne recharge pas toutes les photos déjà vues, maintenant hors écran. Les vignettes redevenues visibles sont mises à niveau par la file de chargement si nécessaire.

### Préserver la qualité

- Pas de filtre de netteté, de débruitage, de contraste ou de saturation ajouté aux photos.
- Orientation corrigée et couleurs converties en sRGB pour l’affichage web ; transparence conservée.
- WebP qualité **90**, AVIF qualité **70 en 4:4:4** ; mini-aperçus légers remplacés après décodage.
- **Pas de baisse arbitraire de qualité/résolution à 55 % sur les connexions lentes**, contrairement à l’ancien code. L’économie porte d’abord sur les téléchargements inutiles.
- Le lien **Open original** donne toujours accès au fichier original, dans sa résolution et sa qualité exactes.

AVIF/WebP à ces réglages restent des compressions **avec pertes**, même en haute qualité. Les variantes redimensionnées ne sont pas des copies pixel pour pixel des originaux. Aucune technique ne peut promettre à la fois zéro perte mathématique, fichiers minuscules et téléchargement instantané sur toute connexion. Pour une exigence strictement sans perte, `RECIPE` dans `tools/prepare-images.mjs` peut utiliser `lossless: true` pour les deux encodeurs, au prix de fichiers généralement plus lourds ; l’original reste inchangé dans tous les cas.

### Éviter les téléchargements inutiles

- File de **2 à 4 images maximum**, avec les photos effectivement visibles avant les photos proches.
- `Save-Data` / 2G : **aucune marge de préchargement**, deux téléchargements au maximum. 3G : marge réduite et trois téléchargements.
- Connexion inconnue : aucun préchargement spéculatif HD.
- Arrêt des demandes en attente pour les tuiles filtrées/éloignées ; les octets déjà en cours de transfert ne sont pas systématiquement jetés au moindre scroll.
- Pause des nouvelles vignettes quand l’onglet est masqué ou la visionneuse ouverte.
- Au plus **une** photo suivante préchargée, après l’affichage de la photo demandée, seulement sur une connexion explicitement rapide. Pas de téléchargement spéculatif d’un original.
- Dans la visionneuse, l’aperçu chargé reste visible pendant l’arrivée de la version plus grande. Navigation rapide et fermeture annulent les demandes devenues inutiles.

### Moins de travail et de mémoire

- Suppression du circuit `fetch → blob → createImageBitmap → objectURL` côté interface : le navigateur gère directement le réseau, le décodage et son cache d’images.
- Plus d’URL d’objet accumulées sans libération.
- Événements de galerie délégués ; géométrie lue en lots ; scroll regroupé par `requestAnimationFrame` ; recherche temporisée.
- Le code de la visionneuse ne fait pas partie du JavaScript initial.
- Police **WOFF2 de 10 260 octets**, contre 17 764 octets pour l’OTF ; logos adaptés à leur taille réelle, environ **23 Ko au lieu de 353 Ko**. Les fichiers sources sont conservés.

### Un cache utile, sans mauvaises surprises

Le service worker précache seulement la petite interface, **jamais les 101 originaux ou toutes leurs variantes**.

- Photos consultées : cache-first, **sans retéléchargement en arrière-plan sur chaque hit**.
- Cache d’images plafonné à **180 entrées ET 48 Mio**, avec exclusion des réponses opaques, erreurs, faux fichiers HTML et fichiers de plus de 6 Mio.
- Écritures maintenues en arrière-plan sans retarder l’affichage de l’image ; une erreur de quota ne casse pas le réseau.
- HTML et fichiers source non versionnés vérifiés sur le réseau pour éviter le site figé sur une ancienne version ; repli hors ligne sur le cache.
- Les variantes/fichiers à empreinte sont immuables. Un changement d’image produit une nouvelle URL.
- Seuls les caches préfixés `maxlananas-` sont nettoyés. Les caches d’autres applications ne sont pas supprimés.
- Pas de rechargement forcé d’un onglet pendant la consultation. La nouvelle version du worker s’active une fois les anciens onglets fermés.

Une consultation hors ligne suppose que l’interface et les photos concernées aient déjà été chargées et mises en cache. Le navigateur peut aussi évincer son stockage ; toutes les photos ne sont pas promises hors ligne.

## Développement et préparation locale

Prérequis pour les outils : **Node.js 22+**. Les dépendances sont uniquement des outils de compilation/test.

```sh
npm ci
npm run dev                 # http://localhost:4173, écoute sur 0.0.0.0
```

Le serveur accepte le domaine d’aperçu Arena et n’impose pas de restriction d’intégration dans une iframe. Le code livré au navigateur n’utilise aucun `localhost` pour accéder aux photos/services.

```sh
npm run build               # récupère les originaux publics, prépare et compile vers dist/
node tools/serve.mjs --root dist --port 4173
```

Si les originaux sont déjà sur le disque :

```sh
npm run build -- --source-dir /chemin/vers/les/originaux
```

Le dossier doit contenir **tous les noms déclarés dans `gallery-data.js`**. Pour réutiliser uniquement un téléchargement précédemment vérifié, sans réseau :

```sh
npm run build -- --offline
```

La release et ses fichiers doivent être publics pour la publication normale. Sur CI, le `GITHUB_TOKEN` standard évite les limites de l’API ; il n’est jamais transmis aux téléchargements d’images ni intégré au site. Les tailles et, lorsqu’elles sont disponibles, les empreintes SHA-256 des assets sont contrôlées.

### Ajouter des photos

1. Ajouter les originaux à la release.
2. Ajouter leurs noms, crédits et tags dans `gallery-data.js`.
3. Publier le changement du catalogue ; le workflow construit les variantes. Après un remplacement de fichier sans modification du catalogue, relancer manuellement le workflow.

Préférer un nouveau nom ou tag de release pour un original modifié : cela évite aussi les caches externes périmés dans le mode de compatibilité. La compilation détecte les changements d’octets et d’encodeur via les empreintes.

Pour mettre à jour les petits logos/la police après modification de leurs sources : `npm run images:static`. Le build optimisé les régénère également.

## Vérifications et mesures

```sh
npm run check               # références locales, syntaxe, catalogue, budget JS initial
npm test                    # file, cache/SW, données, préparation d’images
npx playwright install --with-deps chromium firefox webkit
npm run test:browser         # vrais navigateurs sur des fixtures isolées
npm run test:all
```

Les tests navigateur génèrent des **images synthétiques uniquement dans `.cache/test-site`**, jamais dans `dist/` ni dans le portfolio publié. Ils testent les deux modes, les filtres, la recherche et les accents, les dates, les crédits, la densité, le clavier, les gestes, les changements rapides, les erreurs, les connexions bridées/Save-Data, les changements Retina et le cache hors ligne. Le catalogue est comparé à une empreinte de la version d’origine. Des contrôles SEO sans JS, des tests de parité entre user-agents, de pagination, de navigation multipage hors ligne et des audits WCAG automatisés complètent cette base.

La configuration complète prévoit Chromium bureau/mobile, Firefox bureau et WebKit mobile sur CI. Pour utiliser un Chromium déjà installé, définir `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` : seuls les projets Chromium sont alors exécutés.

### Mesure réelle, à largeur identique

Sur `2025-01-27_20.55.35.png` — original de **5 011 916 octets**, empreinte SHA-256 vérifiée contre celle de la release :

| Largeur | PNG redimensionné | WebP Q90 | AVIF Q70 / 4:4:4 |
| --- | ---: | ---: | ---: |
| 320 px | 192 598 o | 30 430 o (**−84,2 %**) | 19 819 o (**−89,7 %**) |
| 640 px | 740 530 o | 116 132 o (**−84,3 %**) | 75 014 o (**−89,9 %**) |

Reproduction :

```sh
node tools/measure-image.mjs /chemin/vers/2025-01-27_20.55.35.png
```

Ce sont des **mesures d’encodage sur une photo**, pas une moyenne sur tout l’album, un score Lighthouse ou une promesse de temps de chargement. Les gains dépendent de la photo, de l’écran et de la connexion. Le rapport de tout l’album, produit par un build complet, est dans `.cache/build-report.json` et dans l’artifact GitHub Actions `image-performance-report`.

La première intervention a validé 27 tests unitaires et 36 scénarios Chromium bureau/mobile. La suite SEO étend ces tests. Après chaque push, vérifier les résultats et le SHA exact dans la Pull Request et les checks GitHub Actions ; un résultat d’un ancien commit ne valide pas les suivants. Les téléchargements directs des assets de release et des navigateurs Firefox/WebKit étaient indisponibles depuis le sandbox : **le build de production des 101 vrais originaux n’a donc pas été exécuté ici**, et aucun score de performance en production n’est revendiqué. La photo de mesure a pu être récupérée dans l’historique du dépôt et son empreinte correspond exactement à l’asset de release. Le pipeline complet a été exercé localement avec les fixtures ; GitHub Actions ou un dossier local complet d’originaux permet la préparation réelle.

## Licence

Voir [LICENSE](LICENSE). Les attributions du portfolio et les droits sur les créations restent inchangés.

## Derniers garde-fous avant publication

- La valeur Search Console fournie par le propriétaire est intégrée aux pages.
- Les dates sont indépendantes par URL dans `content/page-dates.json` ; une reconstruction ne republie pas les articles.
- La vidéo iProf est servie localement en MP4 H.264, sans iframe Google, avec lecture progressive et gestion HTTP des plages d’octets.
- La validation de l’album réel peut être demandée sans déploiement, par le mode `validate` du workflow ou la case de PR documentée.
- Le mode legacy est conservé tant que le propriétaire ne change pas Pages ; aucun encodage inutilisé n’est lancé dans ce mode.
- Le contrôle du site public est exécuté après publication et vérifie aussi l’empreinte du contenu, la balise Google et les réponses 206 de la vidéo.
- Les workflows et le transport GitHub temporaires d’import ont été retirés. Les outils locaux explicites restent disponibles.

Voir `docs/PREMERGE-VALIDATION.md` pour les garanties testées et les limites.
