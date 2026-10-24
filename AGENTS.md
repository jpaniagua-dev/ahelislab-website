# Ahelis Lab — consignes locales

## Contexte de travail

Lorsqu’un contexte de travail privé a été fourni par Julio, le charger avant une tâche
non triviale : contrat du hub, identification de la machine, index, profil et fiche
du projet. Utiliser uniquement le chemin communiqué localement ou le connecteur autorisé.
Ce dépôt indépendant n’hérite pas automatiquement des instructions d’un autre dépôt.
Signaler un contexte inaccessible au lieu de prétendre l’avoir chargé.
Ne publier ni chemin du hub privé, ni copie de ses fiches, ni secret dans ce dépôt public.

## Décisions techniques de ce site

### Composants communs Ahelis

Avant une modification d’interface, lire `AGENTS.md` et `README.md` du dépôt privé
canonique [ahelis-ui](https://github.com/jpaniagua-dev/ahelis-ui), depuis son checkout
local voisin s’il existe ou via l’accès GitHub autorisé. Ces consignes régissent les
composants partagés. Un accès manquant doit être signalé.

Les sites HTML consomment `@ahelis/brand` depuis l’archive versionnée dans `vendor/`.
Réutiliser ses renderers et son CSS pour `.language-switcher`, `.footer-bottom` et
`.footer-swiss`. Ne pas en maintenir une copie locale. Faire évoluer une variante
commune dans `ahelis-ui`, reconstruire le paquet et actualiser dépendance/lockfile.
Garder ici la composition des pages, les destinations des liens et la localisation.
Une règle de mise en page du conteneur est permise ; une nouvelle apparence du
composant doit passer par sa source commune. Vérifier les trois sites en FR/EN,
sur mobile et dans les thèmes concernés. Le rendu essentiel reste dans le HTML initial.

### Règles du site

- Lire `README.md` et `BRAND_IDENTITY.md` avant de modifier le rendu.
- Ce site vitrine utilise des pages HTML générées avec Node, du CSS et du JavaScript natif.
  Conserver ce choix pour la première intégration. La stack n’est pas imposée par le hub.
- L’identité Ahelis Lab et le prototype fourni font référence pour ce projet.
  La charte Paniagua.dev appartient à une autre marque.
- Les sites produits utilisent le footer commun `footer({ config, locale, product: true })`
  de `src/components/shared.mjs`, rendu par `src/components/footer.mjs`. Conserver le badge suisse,
  la signature au cœur rouge et les liens Studio / Tous nos produits / Confidentialité.
  La confidentialité des sites de présentation est une page bilingue unique sur
  `https://ahelislab.ch/privacy/`. Les anciens chemins y redirigent ; ne pas recréer de page produit.
- Garder les textes et les liens essentiels dans le HTML initial, ainsi que la navigation
  utilisable sans JavaScript. Les contenus publics sont en français suisse (`fr-CH`)
  par défaut et en anglais (`en`) sous `/en/`, avec des liens vers la page équivalente.
- Respecter la réduction des mouvements, le clavier et la version mobile.
  La planète enrichit le parcours sans masquer les contenus ni bloquer le défilement.
- Conserver le mode non indexable pour les aperçus. L’activation publique nécessite
  une origine et un contact confirmés, des canoniques et des données structurées cohérentes.
- Ne pas inventer de témoignages, de résultats commerciaux ou de coordonnées de l’agence.
- Le formulaire envoie via l’API Node dédiée et Resend au destinataire fixe
  `hello@ahelislab.ch`. Conserver la validation, les limites, l’origine et la déduplication ;
  afficher le succès uniquement après acceptation du prestataire. Les secrets restent sur le serveur.
- `dist/` est généré ; modifier les sources. Préserver le `project_id` de l’aperçu Sites
  si `.openai/hosting.json` est utilisé ; il ne désigne pas le domaine public final.
- Vérifier avec `npm run build`, `npm run check` et `node --check src/scripts/site.js`.
  Une modification visuelle ou interactive doit aussi être vérifiée dans le navigateur.
- Suivre SemVer dans `package.json` et consigner les versions dans `CHANGELOG.md`.
- Vérifier l’API avec `npm run test:contact` ; les tests utilisent un prestataire simulé.
