# Maintenir et mesurer le référencement

## Ce qui est réellement livré

Le rendu n’est plus limité à la galerie interactive : **34 documents HTML, 33 URLs indexables**, dix-neuf fiches de projets et collections, deux profils équivalents EN/FR, un guide technique et sept pages de galerie couvrant les 101 captures. La recherche interne est noindex. La 404 reste hors sitemap.

Les versions à la racine fonctionnent immédiatement après fusion/publication, y compris avec GitHub Pages en mode legacy ou un déploiement Cloudflare sans build. Le build optimisé produit les mêmes pages dans `dist/`, avec les vrais formats/tailles préparés. Il n’est donc **pas nécessaire d’activer GitHub Actions pour bénéficier du nouveau contenu SEO** ; cette activation reste nécessaire pour le pipeline de variantes dans ce mode d’hébergement.

## Sources à modifier

| Fichier | Responsabilité |
| --- | --- |
| `content/site.js` | Nom, origine canonique, profils, date de revue et vérification de propriété optionnelle |
| `content/projects.js` | Sélection éditoriale, descriptions, dépendances, limites, sources épinglées, attribution et relations |
| `content/pages.js` | Routes, intentions, titles/descriptions, hiérarchie et langues |
| `tools/seo-content.mjs` | Texte des rubriques, profils, guide et présentation des données |
| `templates/home.html` | Structure de l’accueil et fonctionnalités de galerie conservées |
| `image-labels.js` | Descriptions d’images soutenues par le catalogue ; pas de lieu inventé pour une capture anonyme |
| `gallery-data.js` | Originaux, tags et crédits existants |
| `tools/seo-render.mjs` | HTML, graphe d’entités, canonicals, hreflang, sitemaps, robots et règles Cloudflare |

Après une modification :

```sh
npm ci
npm run seo:render
npm run seo:check
npm run test:all
```

**Ne pas éditer manuellement les snapshots HTML** : la CI détecte une divergence. Les dates de revue/modification ne changent pas automatiquement à chaque build. Les actualiser seulement après une modification/revue réelle du contenu. Ne pas retirer une URL établie sans préparer la redirection de remplacement adaptée à l’hébergeur.

Les descriptions de projet sont basées sur des révisions consultées. Lors d’une nouvelle release : vérifier les exigences, remplacer le SHA de référence, corriger le texte et conserver les distinctions entre fonctionnalités réelles et roadmap. Une nouvelle langue exige une vraie page traduite, des liens réciproques et un `lang` correct — pas une série d’alternates vers de l’anglais inchangé.

## Déploiement et duplication

Le domaine canonique reste **https://maxlananas.is-a.dev/**. L’API Pages, la déclaration is-a.dev et le DNS constatés lors de l’audit pointent sur GitHub Pages. Une intégration Cloudflare Pages produit également des previews du dépôt.

- GitHub Pages : `.nojekyll`, routes `dossier/index.html`, canonicals absolues et liens vers les formes avec slash. `_headers`/`_redirects` ne s’y exécutent pas ; ne pas présenter leurs règles comme des redirections HTTP GitHub configurées.
- Cloudflare Pages : `_headers` exclut les deux formes `projet.pages.dev` et `version.projet.pages.dev` de l’indexation, sans bloquer le domaine personnalisé. `_redirects` normalise seulement des chemins existants. Les redirections de domaine exigent une configuration Cloudflare dédiée, **pas** une règle de domaine dans ce fichier.
- Aperçu local/Arena : `npm run dev` envoie `X-Robots-Tag: noindex` et accepte l’intégration iframe. Il ne redirige pas l’utilisateur vers la production.
- Chaque page de pagination a son propre canonical et ses liens précédent/suivant. Aucune canonical globale vers la page 1.
- `/search/` porte noindex dans le HTML, mais reste crawlable pour que ce signal puisse être lu. Les anciens `/?q=` fonctionnent toujours et conservent le canonical de l’accueil. Les filtres ne génèrent pas de maillage de milliers de combinaisons d’URLs.
- Le service worker ne renvoie pas l’accueil pour une route inconnue. Chaque page visitée a sa propre entrée ; un document connu mais indisponible hors ligne est une 503, pas une fausse page trouvée.

Après la publication, vérification **en lecture seule** :

```sh
npm run seo:live
# Ou contrôler un aperçu Cloudflare (son header noindex est alors exigé) :
npm run seo:live -- --origin https://BRANCHE.maxlananas-builds.pages.dev/
```

Ce contrôle vérifie les pages publiées du catalogue, leur version/title, canonicals, directives d’indexation, ressources SEO, sitemaps et statut 404. Il échoue volontairement contre un ancien déploiement. Des restrictions réseau locales peuvent empêcher son exécution ; une erreur de connexion n’est pas un diagnostic de désindexation.

## Actions propriétaire : Search Console et Bing

Aucun token, compte propriétaire, statistique privée, soumission ou validation Search Console/Bing n’a été inventé.

1. Ajouter/vérifier le domaine ou la propriété HTTPS dans Google Search Console et Bing Webmaster Tools avec le compte du propriétaire.
2. En mode sans compilation, les valeurs **publiques** de vérification peuvent être définies dans `SITE.verification`, puis publiées avec `seo:render`.
3. Pour le build GitHub Actions, les variables de dépôt `GOOGLE_SITE_VERIFICATION` et `BING_SITE_VERIFICATION` sont transmises au générateur. Aucune balise vide ou valeur factice n’est émise par défaut. Il n’est pas nécessaire de communiquer ces informations dans une conversation.
4. Soumettre `https://maxlananas.is-a.dev/sitemap.xml` et `https://maxlananas.is-a.dev/sitemap-images.xml` via les outils propriétaires. Ne pas appeler les anciens endpoints de « ping sitemap » Google.
5. Inspecter le rendu et le canonical retenu de l’accueil, du profil, d’un logiciel, du hub BuildTheEarth et d’une page de galerie. Vérifier la découverte des images. Les images locales du build évitent la dépendance à un domaine CDN externe pour leur indexation ; le mode source reste dépendant du proxy/original.
6. Tester manuellement les variantes HTTP, www et github.io depuis un réseau autorisé. N’exiger une redirection www que si cet hôte est réellement configuré. Ne pas modifier le DNS sur la base d’une simple hypothèse.

Les validators locaux contrôlent la structure et sa cohérence avec le contenu ; ils ne remplacent pas le Rich Results Test ni l’inspection Google d’une URL publiée. SoftwareApplication sans avis/prix fictifs ne promet pas un rich result. La FAQ HTML est conservée pour les visiteurs, sans promettre un résultat enrichi FAQ retiré par Google.

## Mesures utiles, plutôt qu’une promesse de « position 1 »

Relever une base après publication, puis observer sur plusieurs semaines :

- Requête de marque exacte `MaxLananas`, variantes de casse et requêtes « MaxLananas portfolio / Minecraft / developer ».
- Requêtes par nom de projet : HomeGUI, TraceBTE, Railway Tools for Axiom, BTE Distorsion Calculator, PineappleUI.
- Intentions réellement couvertes : mod client pour homes, tutoriel de tracé BTE, chemins ferroviaires Axiom, différences mods/plugins/addons, documentation BTE France.
- Pages indexées, canonical choisi, motifs d’exclusion, impressions, clics, CTR et progression par rubrique.
- Core Web Vitals réels au 75e percentile (LCP, INP, CLS), si CrUX/Search Console disposent d’assez de données. Les tests de fixtures vérifient des régressions, **pas** le score de performance réel de tout l’album.

Une vérification ponctuelle dans un moteur ne fournit pas une mesure fiable de position globale. Localisation, langue, historique, concurrence, ancienneté et signaux externes comptent. Les moteurs gardent le contrôle de l’indexation, des snippets et des positions.

## Développer une autorité thématique progressivement

La priorité est de documenter du travail réel, pas de produire une page pour chaque mot-clé.

1. **Études de builds** : ajouter le rôle exact, les contraintes, choix techniques et images annotées des créations dont les faits sont confirmés. Ne pas déduire un temps de travail ou un nombre de blocs depuis une capture.
2. **Guides d’usage par problème** : installation d’une version réelle, diagnostic reproductible, gestion des permissions, choix du modèle de projection ; relier chaque guide au projet qui résout le problème.
3. **Notes de release** : changements vérifiés, compatibilité et migrations, pas des annonces de roadmap présentées comme livrées.
4. **Crédibilité vérifiable** : conserver les sources, licences et upstreams. Ajouter des démos ou captures authentiques quand elles sont disponibles, plutôt que des visuels inventés de logiciels.
5. **Cohérence des profils** : le dépôt du portfolio doit pointer vers l’URL HTTPS canonique. La tentative de modifier le champ About du dépôt par l’intégration a été refusée (403) : son lien doit être corrigé par le propriétaire ou après réautorisation appropriée de la connexion GitHub. Le README contient déjà le lien HTTPS. Le propriétaire peut aussi ajouter ce lien dans sa bio GitHub et ses profils existants ; ne pas créer de faux comptes/backlinks ni modifier d’office les autres dépôts.
6. **Revue trimestrielle ou lors d’une release** : confirmer que les projets sont toujours décrits correctement, que les liens/dépendances tiennent et que la traduction française reste équivalente.

L’HTML sémantique, les liens ordinaires, les entités cohérentes et les sources servent aussi aux systèmes de recherche basés sur l’IA. Aucun cloaking, contenu réservé aux bots ou fichier prétendument magique pour les rankings n’est ajouté.
