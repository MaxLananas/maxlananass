# Validation avant fusion

## Périmètre approuvé

1. Vrai build des 101 originaux Minecraft, sans publication depuis la branche.
2. Suppression des workflows/permissions temporaires et absence d’encodage inutile en legacy.
3. Contrôle automatique des réponses publiques après publication.
4. Dates par page, séparation publication/modification/revue, balisage fondé sur les informations disponibles.
7. Étude de cas iProf originale en anglais et en français, avec les médias fournis.
8. Vidéo native, sans lecteur Drive.

La balise Google demandée est persistée dans la configuration et contrôlée dans le HTML. Les touches de DA utilisent de petits SVG locaux (ananas voxel, cube, code, repère) : pas de police d’icônes, de décor animé lourd ou de contenu réservé aux robots. Les SVG sont décoratifs pour les technologies d’assistance.

## Ce que les tests couvrent

- Données, crédits et 101 screenshots d’origine inchangés.
- Références et fichiers de l’ensemble des pages, canonicals, hreflang des deux paires EN/FR, sitemaps, dates propres aux pages et absence de pages orphelines.
- Article iProf localisé, relation vers la même création, auteurs et dates cohérents avec le texte visible.
- MP4 réel : empreinte, taille, codec, durée, métadonnées fast-start avant les données ; lecture et recherche temporelle dans les navigateurs de test.
- HTTP 206, suffixes/plages ouvertes, 416, HEAD sans corps et absence de stockage du film dans le CacheStorage de l’interface.
- Zéro chargement de la vidéo avant demande, pas d’iframe Google, galerie clavier et retour du focus.
- Borne des retries de publication, empreinte du contenu, vérification Google, status 404 et ressources du déploiement.
- Décisions de publication : validation jamais déployée ; aucun encodage automatique du mode legacy ; déploiement réservé à main avec la bonne configuration.
- Tests de régression et WCAG automatisés. Ils complètent, sans remplacer, une revue d’accessibilité humaine.

## Preuves du build réel

La demande de validation réelle est tracée dans GitHub Actions. Les résultats définitifs et le SHA exécuté sont indiqués dans la PR après la fin du job, pas déduits d’un simple lancement. `real-image-validation` contient les tailles et le nombre de SHA-256 vérifiés ; `validated-site` contient le site produit sans déploiement. `tools/validate-real-build.mjs` refuse les fixtures comme preuve d’un vrai build et vérifie les fichiers encodés.

Les validations du contenu et de l’interface peuvent être renouvelées rapidement ; le premier encodage haute qualité de l’album est une opération longue. Les caches de variantes sont indexés par les sources et paramètres d’encodage.

## Limites explicites

- Aucune promesse de première place, de score CrUX ou d’absence absolue de bug.
- Les captures de la maquette iProf ne prouvent pas une mise en production ministérielle, des résultats métier ou une certification RGAA. L’étude de cas n’invente pas d’entretiens ni de comparaison avec une version précédente non fournie.
- La description visuelle de la vidéo n’est pas une transcription vérifiée de sa piste audio.
- La configuration Pages actuelle reste legacy jusqu’à une décision du propriétaire. Aucun DNS ni paramètre d’hébergement n’est changé silencieusement.
- La PR reste non fusionnée ; les checks sur le domaine de production auront lieu à la publication réelle.
