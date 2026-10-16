# Historique des versions

## 0.9.2 — 2026-10-16

- Signature du footer Vault avec une icône de cœur rouge et attribution Ahelis Lab, en français et en anglais.
- Alternance automatique des produits sur ordinateur, avec l’image à gauche et le texte à droite pour les produits en position paire.
- Ordre texte puis image conservé sur mobile, en français et en anglais.

## 0.9.1 — 2026-10-16

- Signature Ahelis Lab du site Business avec une icône de cœur rouge.
- Captures de démonstration actualisées après la même correction dans l’application.

## 0.9.0 — 2026-10-16

- Site Business distinct sur `business.ahelislab.ch`, avec accueil, confidentialité et erreurs FR/EN.
- Liens Produits dirigés vers le sous-domaine et conservation de la langue choisie.
- Build, aperçu, vérification et configurations Nginx dédiés au site Business.

## 0.8.0 — 2026-10-16

- Ajout de la présentation Ahelis Business en français et en anglais et de son entrée dans les produits.
- Présentation du budget personnel en CHF, des récurrents et de la facturation facultative, avec statut de bêta accompagnée.
- Captures de l’application avec données fictives et formulaire de contact dédié à Business.

## 0.7.1 — 2026-10-16

- Introduction de la page Contact Vault reformulée en français et anglais pour éviter les deux-points explicatifs.

## 0.7.0 — 2026-10-16

- Rubrique Produits FR/EN et présentation de Vault dans la navigation et le footer du studio.
- Introduction des produits précisant leur origine dans les besoins concrets des clients et leur ouverture aux personnes rencontrant les mêmes défis.
- Site produit Vault distinct : accueil, sécurité, téléchargement, contact et confidentialité, en français et anglais.
- Offre locale gratuite, abonnement d’organisation sur devis et personnalisation en option ; aucune intégration de paiement.
- Deux builds indépendants, aperçu non indexable, configuration HTTPS et en-têtes Nginx générés pour le sous-domaine.
- Formulaire Vault réutilisant les protections du service existant ; destinataire inchangé.
- Activation du téléchargement public conditionnée à un installateur générique dont signature, éditeur et SHA-256 sont vérifiés ; aucun build client distribué.
- Contrôles du site produit et des téléchargements intégrés à la CI.

## 0.6.1 — 2026-10-15

- Soulignement du lien Paniagua.dev supprimé dans le crédit du footer, en français et en anglais.

## 0.6.0 — 2026-10-15

- Envoi direct du formulaire à `hello@ahelislab.ch` par une API Node dédiée et Resend, sans ouverture de messagerie.
- Validation serveur, destinataire fixe, champ anti-robot, vérification d’origine et limites par IP et globales.
- Clé d’envoi dédiée au domaine vérifié `ahelislab.ch`, adresse du visiteur utilisée uniquement pour la réponse, protection contre les doublons de nouvelle tentative.
- États d’envoi, succès et échec en français et anglais ; champs conservés lors d’un échec, réinitialisation après succès.
- Confidentialité adaptée au traitement des demandes, aucun contenu de message dans les logs de l’application.
- Service systemd limité au port local 4201, proxy Nginx et tests de livraison/sécurité ajoutés à la CI.

## 0.5.2 — 2026-10-15

- Adresse de contact confirmée `hello@ahelislab.ch` utilisée par défaut pour la préparation des e-mails, les liens Contact et Confidentialité et les données du studio.
- Destinataire commun aux formulaires français et anglais ; ouverture de la messagerie du visiteur, puis envoi après sa validation.
- Possibilité de remplacer l’adresse avec `CONTACT_EMAIL`, ou de désactiver les liens de messagerie avec une valeur explicitement vide.

## 0.5.1 — 2026-10-14

- Footer centré sur mobile : présentation du studio, colonnes de navigation, badge suisse et mentions légales.
- Signature conservée au centre de la dernière ligne mobile ; disposition sur ordinateur inchangée.
- Phrase d’introduction des services reformulée sans deux-points, en français et en anglais.
- Modèle HTTPS et documentation de l’installation VPS ajoutés après activation de la consultation non indexable.

## 0.5.0 — 2026-10-14

- Internationalisation français/anglais, français par défaut et URLs françaises conservées.
- Version anglaise complète sous `/en/`, avec sélecteur de langue vers la page équivalente.
- Textes, formulaire, messages préparés, labels accessibles, footer, métadonnées et FAQ structurées traduits au build.
- Canoniques propres à chaque langue, `hreflang` réciproques et sitemap de vingt pages ; deux 404 localisées.
- Traductions manquantes bloquantes, contrôles étendus aux 22 pages et adaptation de la 404 du serveur local et du vhost Nginx modèle.
- Aperçu toujours non indexable ; aucune publication ni activation sur le VPS.

## 0.4.6 — 2026-10-14

- Signature du footer corrigée vers Paniagua.dev, avec lien vers `https://paniagua.dev/`.

## 0.4.5 — 2026-10-14

- Bouton de pause des animations supprimé, avec ses styles, événements et préférence stockée localement.
- Réduction des mouvements pilotée uniquement par la préférence système, avec prise en compte des changements en cours de navigation.
- Signature Paniagua.ch centrée dans la ligne du footer sur ordinateur et sur la dernière ligne sur mobile.
- Texte de confidentialité et contrôles motion adaptés à la suppression de la préférence locale.

## 0.4.4 — 2026-10-14

- Signature discrète « Made with ♥ by Paniagua.ch » ajoutée sous le copyright du footer.
- Cœur SVG rouge avec nom accessible « love » et lien vers Paniagua.ch, sur toutes les pages.

## 0.4.3 — 2026-10-14

- Configuration Nginx inactive préparée pour `ahelis.ch` et `ahelislab.ch`, avec aperçu non indexable.
- Dossiers de releases et de validation ACME préparés sur le VPS après contrôle de capacité et des sites existants.
- Procédure d’activation documentée ; aucun contenu installé, aucune publication ni modification des services existants.

## 0.4.2 — 2026-10-14

- Badge complété par « Conçu, opéré et hébergé en Suisse » pour la version destinée à l’hébergement suisse prévu sur Infomaniak.
- L’aperçu publié sur Sites reste inchangé ; aucune migration ni publication effectuée.

## 0.4.1 — 2026-10-14

- Footer inspiré de Keypr : présentation du studio, colonnes Services et Ahelis Lab, liens de confidentialité et copyright.
- Badge suisse discret, adapté à la palette du site, avec mention « Conçu et opéré en Suisse ».
- Mise en page responsive et navigation statique sur toutes les pages.

## 0.4.0 — 2026-10-14

- Site réparti sur dix pages et une 404, avec les nouveaux index Services, Studio, Approche et Contact.
- Accueil de 270 mots : aperçus et liens explicites, ancres historiques conservées ; formulaire et FAQ déplacés sur Contact.
- Formulaire, présentation du studio et étapes extraits en composants réutilisables ; préparation locale du message conservée.
- Navigation par URLs, page active accessible, fils d’Ariane à trois niveaux pour les services, métadonnées et sitemap étendus.
- FAQ structurée limitée aux pages qui présentent les réponses ; retrait de celle de l’accueil.
- Compositions dédiées, titres secondaires plafonnés à 40 px sur ordinateur et animation limitée aux cadres réservés.
- Vérifications étendues aux dix pages et à la 404, accès direct/rechargement à 390 et 1440 px, formulaire, motion et navigation avec scripts bloqués.
- Livraison locale non indexable ; aucune publication.

## 0.3.7 — 2026-10-14

- Titre « De l’idée à la mise en ligne » rétabli : la demande concernait sa présentation.
- Taille du titre réduite sur ordinateur et espacement supérieur de la section rétabli.

## 0.3.6 — 2026-10-14

- Textes de l’accueil rééquilibrés vers 75 % du volume initial, avec davantage de précisions sur les services, le studio et l’accompagnement.
- Titre de la méthode remplacé par « Comment nous travaillons ».

## 0.3.5 — 2026-10-14

- Accueil allégé : services explicites, présentation du studio raccourcie et méthode en quatre phrases.
- Suppression des offres redondantes et réduction de la FAQ d’accueil à trois questions pratiques.
- Textes des pages de services raccourcis, informations utiles et navigation conservées.

## 0.3.4 — 2026-10-14

- Retrait du texte « Explorez son orbite » sous la planète.
- Suppression du suivi de la souris et des réactions au survol ; réaction au défilement conservée.

## 0.3.3 — 2026-10-14

- Signature personnelle remplacée par Ahelis Lab et les disciplines du studio.

## 0.3.2 — 2026-10-14

- Retrait du texte « Touchez la planète » sur mobile.

## 0.3.1 — 2026-10-14

- Orbites plus épaisses et contrastées, avec une hiérarchie ivoire, bleu et jaune.
- Épaisseur compensée selon la taille de la planète pour préserver la lisibilité mobile.
- Deux repères attachés aux orbites rendent leurs réactions plus perceptibles.
- Mouvement, confinement, pause et réduction des animations conservés.

## 0.3.0 — 2026-10-14

- Skill officiel LottieFiles appliqué à la planète, personnalité Premium.
- Réponse locale au pointeur, orbites à retard contrôlé et retour progressif au repos.
- Interaction directe au toucher et au clavier, inclinaison liée au défilement.
- Cadre réservé conservé, marge accrue, pause et réduction des mouvements respectées.

## 0.2.0 — 2026-10-12

- Direction visuelle revue avec Taste : typographie Manrope auto-hébergée, hero condensé.
- Expertises en index ouvert, offres asymétriques et rythme de sections différencié.
- Illustration originale de marque dans le chapitre du studio.
- Retrait des numéros et décorations répétitives ; planète conservée dans le hero et le contact.
- URLs, navigation, formulaire, confidentialité et indexation préservés.

## 0.1.2 — 2026-10-09

- Présence permanente de la planète dans le hero : chaque espace possède son visuel.
- Un changement de section ne peut plus retirer la planète du hero encore visible.
- Animation des visuels visibles uniquement ; pause appliquée à tous les emplacements.

## 0.1.1 — 2026-10-09

- Planète confinée aux espaces visuels réservés : aucune trajectoire devant les textes.
- Espaces de planète visibles sur mobile dans les sections du parcours.
- Rotation autonome, satellites en mouvement et réaction au défilement et au toucher.
- Pause et préférence de réduction des mouvements conservées.

## 0.1.0 — 2026-10-07

Première intégration de consultation privée, à valider avant le lancement public.

- Accueil français, quatre pages d’expertise, confidentialité et page 404.
- Identité Ahelis Lab et planète du prototype, réactive au défilement et au pointeur.
- Animation adaptée au mobile, réduction des mouvements et bouton pause.
- HTML statique, métadonnées par page, JSON-LD, sitemap et contrôle d’indexation.
- Préparation locale d’un brief ; l’envoi par messagerie dépend d’un contact configuré.
- Conventions du hub, points d’entrée des agents et vérification GitHub Actions.
