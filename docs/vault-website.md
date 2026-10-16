# Site Ahelis Vault

## Offre retenue le 2026-10-16

Petites équipes et PME ; local gratuit, abonnement par organisation sur devis ;
activation et facturation manuelles. Français et anglais ; marque blanche en option.
Pas de paiement, de portail client ni d’accès aux coffres depuis ce site.

Le dépôt conserve le site du studio et ajoute une sortie indépendante pour Vault.
Le domaine cible est `https://vault.ahelislab.ch` ; le site reste non indexable par défaut.
Le footer est commun aux sites produits et reprend la composition de l’agence.
La confidentialité des sites de présentation est centralisée sur `https://ahelislab.ch/privacy/` ;
les anciennes pages de Vault redirigent vers cette page bilingue. Aucun contenu de coffre
n’est accessible depuis ce site de présentation.

## Prévisualisation locale

Deux terminaux PowerShell, avec les mêmes variables dans chacun :

```powershell
$env:AGENCY_SITE_URL='http://localhost:3010'
$env:VAULT_SITE_URL='http://localhost:3011'
# Terminal 1
npm.cmd run dev -- --port 3010 --host 127.0.0.1
# Terminal 2
npm.cmd run dev:vault -- --host 127.0.0.1
```

Produits : `http://localhost:3010/produits/` ; Vault : `http://localhost:3011/`.
Après un changement, reconstruire la sortie concernée puis recharger le navigateur.
Le serveur de preview n’envoie aucun e-mail sans une API locale explicitement configurée.
`CONTACT_API_ORIGIN` permet de désigner cette API. Aucun secret n’est nécessaire pour construire.

## Construire et vérifier

```powershell
npm.cmd run build
npm.cmd run check
npm.cmd run build:vault
npm.cmd run check:vault
npm.cmd run test:contact
npm.cmd run test:download
npm.cmd run check:motion
```

`dist/` : 22 pages + 2 erreurs localisées ; `dist-vault/` : 10 pages + 2 erreurs.
Les builds ne modifient pas les sources et n’installent aucune dépendance.
Variables distinctes : `SITE_URL`/`SITE_INDEXABLE` pour le studio ;
`VAULT_SITE_URL`/`VAULT_SITE_INDEXABLE` pour Vault ; `AGENCY_SITE_URL` pour le lien retour.
Les aperçus ne doivent pas activer l’indexation. `CONTACT_EMAIL` configure les liens visibles ;
le destinataire du service d’envoi reste fixé à `hello@ahelislab.ch`.

## Visuels et confidentialité

`public/vault/vault-demo.png` est une capture réelle de l’application Ahelis dans le
scénario hors ligne du vérificateur `scripts/verify-electron.mjs`, source produit
`e91799c`. Organisation et comptes fictifs, mots de passe masqués, aucune marque client.
Le texte sous l’image précise qu’il s’agit de données de démonstration ; l’interface
capturée est en anglais et l’application est disponible dans les deux langues.
L’illustration et l’icône proviennent du branding neutre du même produit.
Ne jamais remplacer ces ressources par une capture d’un coffre ou d’un build client réel.

## Téléchargement public

Sans `VAULT_DOWNLOAD_MANIFEST`, aucune URL d’installateur n’est publiée.
Le dossier `public/downloads/` est ignoré par Git et exclu de la copie générique des deux builds.
Seul l’installateur actif validé est copié dans le build Vault.

Le manifeste local, hors Git et hors répertoire public, comporte :

```json
{
  "product": "Ahelis Vault",
  "version": "0.4.0",
  "url": "/downloads/0.4.0/Ahelis-Vault-0.4.0-setup.exe",
  "sha256": "<empreinte SHA-256 réelle, 64 caractères hexadécimaux minuscules>",
  "publisher": "<sujet exact du certificat de signature approuvé>"
}
```

Ce modèle n’active aucun téléchargement. Fournir le fichier correspondant sous
`public/downloads/<version>/` et définir `VAULT_DOWNLOAD_MANIFEST` vers le manifeste.
Le build vérifie le chemin versionné, l’existence, le checksum, la signature Authenticode
valide, le sujet exact de l’éditeur et le nom produit Windows `Ahelis Vault`.
L’activation nécessite Windows ; les autres environnements construisent l’aperçu sans manifeste.
Les tests remplacent uniquement la frontière de signature par un faux vérificateur ;
le build réel n’expose aucun contournement par variable d’environnement.

La signature et la publication de l’application sont des opérations distinctes.
Ne pas utiliser les builds non signés, les builds clients ou les flux privés de mise à jour.

## Préparer la publication VPS

1. Confirmer le contenu, les informations de l’exploitant, les conditions d’abonnement
   et les modalités de conservation avant l’ouverture commerciale. Aucun prix inventé.
2. Après autorisation de publication, créer l’enregistrement DNS du sous-domaine vers le VPS
   et obtenir son certificat TLS. Le modèle exige un certificat propre à ce sous-domaine.
   Pendant cette étape, `deploy/nginx-vault-http.conf` sert uniquement les challenges ACME ;
   le reste répond 503 pour ne pas exposer le formulaire sans HTTPS.
3. Construire avec les origines HTTPS publiques, sans variables localhost, et vérifier les sorties.
   Conserver `VAULT_SITE_INDEXABLE` absent tant que le lancement public n’est pas validé.
4. Copier la release dans `/srv/ahelis-vault-website/releases/<identifiant>/` avec sa sortie
   `dist-vault/`. Conserver la précédente et basculer le lien `current` atomiquement.
5. Mettre à jour le service de contact du studio avec la catégorie `vault` ; ajouter
   `https://vault.ahelislab.ch` à sa variable protégée `CONTACT_ALLOWED_ORIGINS` en conservant
   les origines existantes. Aucune modification des secrets d’envoi nécessaire.
6. Installer `deploy/nginx-vault-https.conf`, vérifier les chemins et permissions,
   exécuter `nginx -t`, puis recharger Nginx. L’include des en-têtes est généré dans la sortie Vault.
7. Contrôler HTTPS, redirection HTTP, 404 FR/EN, CSP, formulaire et absence d’indexation.
   Un véritable e-mail de vérification nécessite une autorisation d’envoi séparée.
8. Publier la rubrique Produits du studio dans sa release habituelle.

L’API métier Vault, sa base et ses téléchargements authentifiés ne sont pas modifiés.
Retour arrière : ancien lien de release, ancien vhost et ancienne configuration du service
de contact, puis validation Nginx et rechargement. Aucun changement DNS/VPS n’a été exécuté
par la réalisation locale de cette version.
