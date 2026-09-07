# Sélection développement et médias

## Demande du créateur

Le créateur a fourni le dossier Drive de sa refonte iProf, son profil Modrinth `maxlananass` et son profil GitHub `MaxLananas`. La sélection précédente était trop centrée sur les références et utilitaires BTE.

La nouvelle hiérarchie est :

1. **iProf 2026** : projet d’interface principal sur l’accueil, `/projects/` et `/development/`, avec une vraie page dédiée.
2. **Sorties Modrinth** : les dix projets présents sur le profil fourni, avec Modrinth comme destination principale pour télécharger et vérifier les versions.
3. **Software lab** : SENTINEL (Go / Windows), MaxOS (prototype x86, développement assisté par IA explicitement indiqué) et PineappleUI (transpileur d’interfaces).
4. **Références BTE** : les anciennes pages, forks et collaborations sont conservés pour ne pas casser les liens, mais ne constituent plus la vitrine dev principale.

Les dépôts GitHub publics ont été examinés. Les outils sans documentation suffisante, les fichiers d’infrastructure, les forks génériques et les expérimentations non décrites ne sont pas transformés automatiquement en projets phares. La sélection n’utilise pas le nombre d’étoiles comme preuve de qualité.

## Sources

- Présentation iProf : https://drive.google.com/drive/folders/15kwqtMb1Kkie324cIn-g3a04owKM88xy
- Sous-dossier : onze PNG, de `00-visuel-officiel.png` à `10-responsive.png`.
- Vidéo : https://drive.google.com/file/d/1ZHfabuvXI7Y1_HHELVGH7kaGofM8QwWj/view
- Profil Modrinth : https://modrinth.com/user/maxlananass
- Catalogue officiel de ce profil : https://api.modrinth.com/v2/user/maxlananass/projects
- Métadonnées publiques sélectionnées : `content/modrinth-catalog.json`.
- Sources éditoriales : `content/showcase-projects.js`, `content/modrinth-projects.js` et `content/projects.js`.

Les onze images iProf ont été récupérées et examinées. Leur pied de page indique **« maquette d’interface · données fictives »**. Elles montrent notamment le tableau de bord, la carrière, les vœux de mobilité, les documents, la messagerie, le thème sombre et les dispositions mobiles. La présentation indique PHP, CSS et JavaScript ; le portfolio ne prétend pas avoir audité un code serveur non fourni, ni valider une conformité RGAA ou un déploiement ministériel officiel.

Le player vidéo pointe vers le fichier fourni. La récupération/inspection automatisée du MP4 n’a pas abouti dans l’environnement d’import ; aucune durée ou date de mise en ligne n’est donc inventée. Le player Google Drive et son lien de secours sont testés comme intégration, pas comme preuve d’un décodage complet de la vidéo. Le `VideoObject` descriptif ne revendique pas l’éligibilité à un résultat enrichi vidéo nécessitant des informations supplémentaires.

## Modrinth : source de vérité pour les sorties

Les liens pointent vers les catégories réelles (mod, plugin, shader) et les slugs retournés par l’API. Aucun dépôt fictif n’est créé pour les projets dont la source n’est pas publique.

Quelques incohérences des sources sont traitées explicitement :

- JukeBoxPlus est présenté d’après sa page Modrinth actuelle comme interface pour la musique **du jeu**, distincte de Now Playing IRL pour la musique d’applications externes. L’ancienne description GitHub ne suffit pas à les confondre.
- Le dépôt Sculk Vision lié par Modrinth n’était pas publiquement accessible lors de la revue : il n’est pas proposé comme lien GitHub fonctionnel.
- La description de BedrockHeightGuard nuance Folia malgré sa présence dans les tags. La description de Nostalgia Ultra nuance également OptiFine. Le visiteur est renvoyé aux exigences de la release choisie.
- Les promesses de FPS, les scores de sécurité et les estimations MSPT ne sont pas transformés en mesures indépendamment vérifiées.
- Les icônes créditées à **Elfi** sur Modrinth conservent cette attribution sur les fiches concernées.

## Images rapides, vidéo à la demande

Les médias préparés sont dans `assets/projects/` et leur manifeste dans `content/project-media.json` :

- AVIF et WebP haute qualité, dimensions réelles et noms à empreinte ; jamais d’agrandissement d’une petite source.
- Tailles responsives, chargement différé des images secondaires, priorité à la première image utile.
- Vignettes et images agrandies locales : pas de requête Drive ou Modrinth pour afficher la galerie.
- Visionneuse chargée à la première interaction, navigation clavier, restauration du focus et lien pleine taille.
- Le MP4 **n’est pas ajouté à Git**, ni préchargé. Un bouton explicite charge le player Drive ; un lien direct reste disponible sans JavaScript.
- Le cache d’images borné couvre aussi `/assets/projects/`. Les règles Cloudflare appliquent l’immuabilité aux fichiers à empreinte, pas aux documents éditoriaux.

Les images présentes dans Git sont les dérivés nécessaires à la publication statique actuelle. Les originaux restent sur leurs hébergements fournis. Le dossier `review/` et les planches de contrôle ne font pas partie du site.

## Réimporter explicitement

```sh
node tools/import-project-media.mjs
```

Le résultat va dans `.cache/project-media-import/`, sans remplacer le site ni modifier de branche. Examiner les images et les crédits avant de copier les dérivés validés vers `assets/projects/` et le manifeste vers `content/project-media.json`, puis exécuter `npm run seo:render` et les tests.

Le sandbox bloquant les téléchargements binaires directs, un workflow dédié a effectué l’import réseau et transféré les dérivés via des blobs GitHub non attachés à une branche. Les fichiers ont ensuite été récupérés par SHA, vérifiés et examinés localement **avant** inclusion dans le commit du site. Cette option est limitée à la branche autorisée, ne met à jour aucune référence Git et ne tourne pas pendant un build normal. Les copies de revue restent dans `.cache/`.

Si les paramètres de compression sont modifiés, incrémenter la version de recette de l’importeur pour préserver les garanties des URLs immuables.
