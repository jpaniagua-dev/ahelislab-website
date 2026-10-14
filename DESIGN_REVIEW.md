# Direction visuelle du site

Révision du 2026-10-12, version 0.2.0, avec le plugin Taste.

## Lecture du brief

Site vitrine d’un studio digital indépendant pour les PME de Suisse romande,
indépendants et particuliers. Direction poétique, contemporaine et précise.
Évolution de la marque existante, sans changement de navigation ni de routes.

Réglages Taste : `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 6`, `VISUAL_DENSITY: 3`.
Fondation : HTML statique et CSS natif du projet existant.

## Audit de la version 0.1.2

- Palette et planète reconnaissables : à conserver.
- Cartes d’expertises et d’offres trop similaires ; rythme répétitif.
- Numérotation de presque tous les titres, coordonnées et signes décoratifs superflus.
- Hero à trois lignes, nombreux textes secondaires, typographie système variable selon l’appareil.
- Sept pages générées, liens et contenus essentiels dans le HTML initial.
- Routes, ancres, navigation, champs de formulaire et confidentialité déjà cohérents.
- Consultation privée non indexable : aucun classement public à migrer.

## Arbitrages appliqués

- Manrope variable auto-hébergée, OFL, comme choix de site encore révisable.
- Hero à deux lignes sur ordinateur, texte condensé, planète permanente.
- Expertises en index ouvert, avec intitulés et descriptions accessibles sans JavaScript.
- Offres asymétriques : la refonte occupe un panneau solaire, les deux autres restent ouvertes.
- Un chapitre ivoire pour le studio, conforme à la charte existante. Cette transition est volontaire.
- Illustration originale de marque, sans la présenter comme une réalisation client.
- Deux petites introductions de section sur sept, sans numérotation.
- Planète animée dans le hero et le contact ; moins de répétitions décoratives.
- Apparition du hero pour la hiérarchie, révélations pour la progression, réactions pour le feedback.
- Actions arrondies, contenu carré, champs à 6px. Réduction des mouvements et pause conservées.

## Illustration

Asset consommé : `public/images/ahelis-orbit-still-life.webp`, 1536 × 1024,
environ 66 Ko. Génération avec l’outil image intégré, puis encodage WebP pour le site.
La photographie sculpturale est une illustration, pas une photo d’un atelier réel.

Prompt de génération :

> Use case: stylized-concept. Asset type: bespoke editorial studio illustration for Ahelis Lab, a Swiss digital design studio. Create one sophisticated photographic 3D still life in a wide 3:2 horizontal composition: a beautifully textured solar yellow miniature sphere hovering just above an ivory folded paper arc, a very thin brushed metal orbital ring wraps the sphere diagonally. Set against a seamless deep midnight navy #08162B environment. Tactile materials: matte finely pitted ceramic yellow surface, sculptural ivory paper, precise soft shadows. The sphere sits slightly left of center, the paper arc enters from lower right. Strong directional natural studio light, restrained contemporary gallery photography, generous negative space, quiet poetic imagination recalling miniature worlds without any literal Little Prince character. Main palette midnight blue, solar yellow #FFD447, ivory #F8F6EF. No text, no logos, no stars, no generic sci-fi glow, no people, no decorative labels. This is an abstract brand illustration, not a photo of a real client project.

## Vérifications et limites

Build, liens internes, H1, métadonnées, JSON-LD, robots et sitemap vérifiés.
Présence permanente de la planète, rotation autonome et pause vérifiées par une
régression logique sur cinq largeurs et trente positions de défilement.
Champs et ordre du formulaire conservés ; aucune transmission ajoutée.
Contrastes calculés sur les associations principales : de 6,54:1 à 13,04:1.
Police locale et illustration dimensionnée, sans ajout de framework client.

Le navigateur de QA pris en charge n’est pas disponible dans cette session.
Le rendu visuel, les retours clavier en navigateur et Lighthouse ne sont donc
pas validés ; aucun score de performance ou conformité complète n’est revendiqué.
À confirmer sur ordinateur et téléphone avant la publication publique indexable.

## Révision motion LottieFiles, 0.3.0, 2026-10-14

Skill officiel : https://github.com/LottieFiles/motion-design-skill
Révision consultée : `f9a8a041b85185ee4881b3471d3415e939aac772`, licence MIT.
Le skill a été importé dans l’espace personnel de skills et synchronisé ; aucun
lecteur Lottie ou framework supplémentaire n’est ajouté au site.

- Intention : curiosité, élégance et confirmation immédiate du geste.
- Personnalité : Premium, sans rebonds exagérés.
- Couche primaire : inclinaison et suivi local de la planète, déplacement borné à 18px sur ordinateur.
- Couche secondaire : les orbites suivent avec un retard contrôlé et réagissent au défilement.
- Couche ambiante : flottement de 3px avec un cycle sinusoïdal de 4s.
- Feedback : 90ms de réponse ; orbites en suivi à 180ms ; impulsion décroissante avec constante de 400ms.
- Mobile : inclinaison et impulsion au toucher, sans translation parallax ; défilement natif préservé.
- Clavier : bouton natif sur la planète, activation Entrée/Espace et focus visible.
- Réduction des mouvements : scène statique et interaction animée désactivée ; pause toujours disponible.

La régression `npm run check:motion` vérifie cinq largeurs, le toucher, le pointeur,
le clavier, le défilement, le retour au repos, la présence du hero et la pause.
Elle ne mesure pas les FPS et ne remplace pas la validation visuelle en navigateur,
qui reste indisponible dans cet environnement.
