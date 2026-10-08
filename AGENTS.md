# Ahelis Lab — consignes locales

## Contexte de travail

Lorsqu’un contexte de travail privé a été fourni par Julio, le charger avant une tâche
non triviale : contrat du hub, identification de la machine, index, profil et fiche
du projet. Utiliser uniquement le chemin communiqué localement ou le connecteur autorisé.
Ce dépôt indépendant n’hérite pas automatiquement des instructions d’un autre dépôt.
Signaler un contexte inaccessible au lieu de prétendre l’avoir chargé.
Ne publier ni chemin du hub privé, ni copie de ses fiches, ni secret dans ce dépôt public.

## Décisions techniques de ce site

- Lire `README.md` et `BRAND_IDENTITY.md` avant de modifier le rendu.
- Ce site vitrine utilise des pages HTML générées avec Node, du CSS et du JavaScript natif.
  Conserver ce choix pour la première intégration. La stack n’est pas imposée par le hub.
- L’identité Ahelis Lab et le prototype fourni font référence pour ce projet.
  La charte Paniagua.dev appartient à une autre marque.
- Garder les textes et les liens essentiels dans le HTML initial, ainsi que la navigation
  utilisable sans JavaScript. Les contenus publics sont en français suisse (`fr-CH`).
- Respecter la réduction des mouvements, le bouton pause, le clavier et la version mobile.
  La planète enrichit le parcours sans masquer les contenus ni bloquer le défilement.
- Conserver le mode non indexable pour les aperçus. L’activation publique nécessite
  une origine et un contact confirmés, des canoniques et des données structurées cohérentes.
- Ne pas inventer de témoignages, de résultats commerciaux ou de coordonnées de l’agence.
- `dist/` est généré ; modifier les sources. Préserver le `project_id` de l’aperçu Sites
  si `.openai/hosting.json` est utilisé ; il ne désigne pas le domaine public final.
- Vérifier avec `npm run build`, `npm run check` et `node --check src/scripts/site.js`.
  Une modification visuelle ou interactive doit aussi être vérifiée dans le navigateur.
- Suivre SemVer dans `package.json` et consigner les versions dans `CHANGELOG.md`.
