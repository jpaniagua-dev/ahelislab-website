# Ahelis Lab — Website

Première intégration du site vitrine Ahelis Lab, à partir du prototype retenu et de `BRAND_IDENTITY.md`. Le branding original est conservé. Le français suisse est la langue de cette première version.

## Choix technique

HTML pré-généré, CSS et JavaScript natif. Un petit build Node assemble les composants communs et les contenus. Aucun framework client ni dépendance de production : le navigateur reçoit directement les pages et leurs textes. Les animations enrichissent la présentation sans conditionner l’accès au contenu.

La planète du prototype est conservée comme asset CSS et animée avec `requestAnimationFrame`. Le même objet suit une trajectoire entre les sections, réagit au pointeur et aux actions, puis devient une présence discrète sur mobile. Pas de WebGL ni de chargement de moteur 3D pour cette première intégration.

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

Node 24 est indiqué dans `.nvmrc`. Le workflow GitHub Actions exécute le build,
la vérification des pages et les contrôles de syntaxe à chaque push et pull request.

## Contexte et versions

`AGENTS.md` et `CLAUDE.md` décrivent le chargement d’un contexte de travail privé
lorsqu’il est fourni localement. Aucun chemin privé ni fiche personnelle n’est publié ici.
`BRAND_IDENTITY.md` reste la référence de marque propre à Ahelis Lab.
La version de cette première intégration est `0.1.0` ; les évolutions suivent SemVer
et sont consignées dans `CHANGELOG.md`.

## Structure

- `src/config.mjs` : origine du site, e-mail de contact et mode d’indexation.
- `src/components/shared.mjs` : navigation, footer, planète, FAQ et document HTML.
- `src/pages/` : accueil, pages d’expertise, confidentialité et 404.
- `src/data/services.mjs` : contenu français des expertises et questions fréquentes.
- `src/styles/main.css` : palette validée, mise en page et responsive.
- `src/scripts/site.js` : planète, menu mobile, révélations et préparation locale du brief.
- `scripts/build.mjs` : assemblage statique, empreintes des assets, sitemap et robots.
- `scripts/verify.mjs` : contrôle du résultat généré et des liens internes.

## Pages

- `/`
- `/services/creation-site-web/`
- `/services/design-ux-ui/`
- `/services/developpement-sur-mesure/`
- `/services/ia-automatisation/`
- `/confidentialite/`
- `/404.html`

## Motion et accessibilité

- Animation du même objet entre des emplacements réservés, sans bloquer le défilement.
- Réaction au pointeur, aux survols et aux actions principales.
- Version mobile discrète après la section d’ouverture.
- Contrôle pause/reprise avec préférence locale.
- Préférence système `prefers-reduced-motion` respectée par défaut.
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

Site statique compatible avec un hébergeur de fichiers statiques. `.openai/hosting.json` conserve l’identité de la version de consultation Sites et sa sortie `dist/`. La configuration de cet aperçu ne remplace pas le domaine public final.

## Dépôt GitHub

Dépôt public : [jpaniagua-dev/ahelislab-website](https://github.com/jpaniagua-dev/ahelislab-website),
créé par Julio le 2026-10-08. La branche `main` porte les sources de la première
intégration `0.1.0`. Le build généré reste hors versionnement.
La présence du code sur GitHub ne déploie pas le site : la publication de l’aperçu
Sites et le lancement sur le domaine public restent à effectuer.
