# Ahelis Lab — Website

Site vitrine Ahelis Lab, à partir du prototype retenu et de `BRAND_IDENTITY.md`. Le branding original est conservé. Le français suisse est la langue par défaut, avec une version anglaise complète.

## Choix technique

HTML pré-généré, CSS et JavaScript natif. Un petit build Node assemble les composants communs et les contenus. Aucun framework client ni dépendance de production : le navigateur reçoit directement les pages et leurs textes. Les animations enrichissent la présentation sans conditionner l’accès au contenu.

La planète du prototype est conservée comme asset CSS et animée avec `requestAnimationFrame`. Chaque espace réservé possède sa planète, dont le hero en permanence, sans traverser les textes. Chaque planète tourne de manière autonome sur ordinateur et mobile et réagit au défilement, au toucher et aux actions explicites, sans suivre les mouvements de la souris ni les survols. Pas de WebGL ni de chargement de moteur 3D pour cette première intégration.

## Lancer le projet

Node 22 ou supérieur. Aucune installation de dépendances nécessaire.

```bash
npm run dev
```

Le serveur utilise le port 3000 par défaut et accepte `--port`, `--host` et `PORT`. En environnement Sites géré, utiliser `sites-preview start` pour la prévisualisation supervisée.

```bash
npm run build
npm run check
```

Le dossier `dist/` contient la version déployable. Il est généré et n’est pas commité.

Node 24 est indiqué dans `.nvmrc`. Le workflow GitHub Actions exécute les contrôles
de syntaxe, le build, la vérification des 22 pages (liens, métadonnées, langues et
données structurées) et les régressions de la planète à chaque push et pull request.
La CI vérifie le code ; elle ne déploie pas sur le VPS et ne crée pas de release GitHub.
Le modèle Nginx est validé sur le serveur lors du déploiement, hors de cette CI.

## Contexte et versions

`AGENTS.md` et `CLAUDE.md` décrivent le chargement d’un contexte de travail privé
lorsqu’il est fourni localement. Aucun chemin privé ni fiche personnelle n’est publié ici.
`BRAND_IDENTITY.md` reste la référence de marque propre à Ahelis Lab.
La version est `0.5.1` ; les évolutions suivent SemVer
et sont consignées dans `CHANGELOG.md`.

## Structure

- `src/config.mjs` : origine du site, e-mail de contact et mode d’indexation.
- `src/components/shared.mjs` : navigation, footer, planète, FAQ et document HTML.
- `src/components/contact-form.mjs`, `process.mjs` et `studio.mjs` : formulaire, étapes et présentation du studio réutilisables.
- `src/pages/` : accueil, index Services, Studio, Approche, Contact, pages d’expertise, confidentialité et 404.
- `src/data/services.mjs` : contenu français des expertises et questions fréquentes.
- `src/i18n/` : catalogue anglais, traduction statique, routes par langue et messages du formulaire.
- `src/styles/main.css` : palette validée, mise en page et responsive.
- `src/scripts/site.js` : planète, menu mobile, révélations et préparation locale du brief.
- `scripts/build.mjs` : assemblage statique, empreintes des assets, sitemap et robots.
- `scripts/verify.mjs` : contrôle du résultat généré et des liens internes.

## Pages

- `/`
- `/services/`
- `/studio/`
- `/approche/`
- `/contact/`
- `/services/creation-site-web/`
- `/services/design-ux-ui/`
- `/services/developpement-sur-mesure/`
- `/services/ia-automatisation/`
- `/confidentialite/`
- `/404.html`

Les mêmes pages existent en anglais sous `/en/`, avec `/en/approach/`,
`/en/privacy/` et les quatre URLs de service traduites. Le sélecteur FR/EN mène
à la page équivalente et fonctionne sans JavaScript. Le français garde toutes
ses URLs existantes ; aucune redirection automatique ni préférence de langue
stockée dans le navigateur.

Le build traduit les textes et attributs accessibles des templates, ainsi que les
métadonnées et messages dynamiques. Le catalogue anglais utilise les textes sources
français comme clés ; une traduction manquante fait échouer le build.
La signature du footer devient « Créé avec ♥ par Paniagua.dev » en français et
« Made with ♥ by Paniagua.dev » en anglais. Les messages préparés et leur objet
suivent la langue du formulaire ; les textes saisis par le visiteur restent inchangés.

Avec `SITE_URL`, chaque page possède sa propre canonique et des liens `hreflang`
réciproques `fr-CH`, `en` et `x-default` (français). Le sitemap contient les vingt
pages de contenu ; les deux 404 restent non indexables et hors sitemap.
Le serveur de développement choisit la 404 anglaise pour une URL inconnue sous `/en/`.

## Motion et accessibilité

- Planètes confinées aux emplacements réservés, sans recouvrir les textes.
- Réaction au défilement, au toucher et aux actions principales ; aucun suivi de la souris ni réaction au survol.
- Planète animée dans les sections sur mobile, avec des espaces dédiés.
- Préférence système `prefers-reduced-motion` respectée, y compris lorsqu’elle change pendant la navigation.
- Animation suspendue lorsque l’onglet n’est pas visible.
- Contenu statique, navigation au clavier, lien d’évitement, formulaire avec labels et FAQ native `details`.
- Sans JavaScript, le contenu et les liens restent accessibles ; le menu mobile est développé et la planète reste statique.

## SEO et GEO

Le build produit un H1 par page, des titres et descriptions propres à chaque expertise, des URLs canoniques, des métadonnées Open Graph, un sitemap, un fichier robots et du JSON-LD `Organization`, `WebSite`, `WebPage`, `Service`, `BreadcrumbList` et `FAQPage` correspondant aux contenus visibles. Le JSON-LD n’implique aucune garantie de résultats enrichis.

Le contenu est disponible dans le HTML initial. Pas de pages artificielles par commune, de témoignages inventés, de statistiques commerciales non vérifiées ou de coordonnées fictives. Les réponses apportent un contexte explicite sur les services, le public et la zone d’intervention.

Le GEO reprend les fondamentaux du référencement. Google ne demande ni `llms.txt` ni balisage spécifique pour apparaître dans ses réponses génératives. Référence : [documentation Google Search Central](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

### Consultation privée

La version de consultation utilise `noindex,nofollow` et `Disallow: /`. Elle ne peut pas servir au référencement de l’agence. Son rôle est de valider le site avant sa mise en ligne publique sur le domaine choisi.

### Préparer la mise en ligne publique

Fournir l’origine publique exacte et une adresse e-mail vérifiée, puis construire explicitement la version indexable :

```bash
SITE_URL=https://votre-domaine.ch \
CONTACT_EMAIL=contact@votre-domaine.ch \
SITE_INDEXABLE=true \
npm run build
npm run check
```

Le build refuse le mode indexable si l’origine ou l’adresse de contact manque. Il lit les variables de l’environnement ; `.env.example` est un modèle et n’est pas chargé automatiquement.

Avant le lancement : compléter les mentions légales et les informations de confidentialité selon l’entité réelle et l’hébergement retenu, vérifier le domaine dans Search Console, soumettre le sitemap et ajouter des réalisations documentées au fur et à mesure. Le classement dépend aussi des contenus, des références et de la concurrence ; aucun classement n’est garanti.

## Contact

Le formulaire prépare un brief dans le navigateur, sans stockage ni requête d’envoi. Si `CONTACT_EMAIL` est renseigné, il propose un lien `mailto:` : le visiteur relit puis envoie lui-même le message dans sa messagerie. Sinon, seule la copie du brief est proposée. Aucun envoi n’est simulé. Un formulaire avec livraison serveur pourra être ajouté dans un périmètre ultérieur.

## Hébergement

Préparation, installation et vérifications du VPS : [`deploy/README.md`](deploy/README.md).
La consultation `0.5.1` est servie en HTTPS sur `ahelis.ch` et `ahelislab.ch`,
avec certificat renouvelable et mode non indexable. Le domaine principal reste à choisir.

Site statique compatible avec un hébergeur de fichiers statiques. `.openai/hosting.json` conserve l’identité de la version de consultation Sites et sa sortie `dist/`. La configuration de cet aperçu ne remplace pas le domaine public final.

## Dépôt GitHub

Dépôt public : [jpaniagua-dev/ahelislab-website](https://github.com/jpaniagua-dev/ahelislab-website),
créé par Julio le 2026-10-08. La branche `main` porte les sources `0.5.1` ; le tag
`v0.5.0` conserve la précédente release multilingue. Le build généré reste hors versionnement.
La version de consultation `0.3.3` reste publiée en privé sur [Sites](https://ahelis-lab.jjpsoft-julio.chatgpt.site).
La [release GitHub](https://github.com/jpaniagua-dev/ahelislab-website/releases/tag/v0.5.0)
fournit aussi une archive statique non indexable ; elle n’active aucun hébergement.
Le lancement indexable sur le domaine public reste à préparer.

## Direction visuelle

La révision multipage conserve la marque avec une composition éditoriale,
un index de services et un accueil allégé, sans section d’offres redondante. Manrope est auto-hébergée sous OFL ;
sa sélection reste un choix de site, pas une modification définitive de la charte.
L’illustration de marque est originale et générée, sans représenter de réalisation client.
L’accueil français contient 272 mots, avec un aperçu des services, du studio et de la méthode,
ainsi qu’une invitation à prendre contact. Les détails sont répartis sur les pages dédiées.
Le formulaire et les trois questions pratiques sont sur `/contact/`. Les pages de
services conservent leurs URLs et leurs FAQ spécifiques. Le menu indique la page active ;
Services reste actif sur les sous-pages. Les fils d’Ariane suivent Accueil → Services → Service.
Les titres secondaires sont plafonnés à 40 px sur ordinateur, avec un espace généreux en haut des sections.
Audit, arbitrages et limites de vérification : `DESIGN_REVIEW.md`.

La révision motion utilise les principes du [skill LottieFiles](https://github.com/LottieFiles/motion-design-skill),
avec interactions directes sur la planète (souris, toucher, clavier), orbites en suivi
et retour au repos. Le skill ne nécessite aucun lecteur Lottie dans le navigateur.
