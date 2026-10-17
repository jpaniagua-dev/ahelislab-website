# Préparation du VPS

## Publication automatique — 0.11.0

Le workflow `Verify and deploy websites` publie les trois sorties `dist`, `dist-vault`
et `dist-business` après tous les contrôles, à chaque push sur `main`. Les branches
et pull requests ne publient pas. Une exécution manuelle est aussi disponible dans
GitHub Actions sur `main`, notamment pour relancer une publication après correction.
La concurrence est sérialisée par référence pour éviter les bascules simultanées.

La CI construit avec les origines HTTPS connues et conserve le mode non indexable.
Elle transmet un paquet contenant les trois builds publics, le serveur de contact
et un manifeste version/commit/empreintes via `deploy/publish.sh`. Les secrets GitHub
`WEBSITE_DEPLOY_KEY` et `WEBSITE_KNOWN_HOSTS` portent uniquement l’accès dédié et
l’identité SSH vérifiée du serveur. Ne jamais y copier la clé générale d’administration.

Installation initiale administrative : transférer `deploy/receive.sh`, `receive.py`,
`install-receiver.sh` et la **clé publique dédiée**, puis exécuter
`sudo bash install-receiver.sh /chemin/cle.pub`. Le récepteur est installé sous
`/usr/local/lib/ahelis-websites`, root et non modifiable par l’utilisateur SSH.
La ligne `authorized_keys` impose la commande et l’option `restrict` : pas de shell,
de tunnel, de transfert SCP/SFTP ni d’exécution de commande arbitraire avec cette clé.
Révoquer l’accès en retirant uniquement cette ligne et les deux secrets GitHub.

Le récepteur refuse traversées de répertoires, liens, fichiers spéciaux, doublons,
empreintes erronées, directives Nginx inattendues et origines incorrectes. Il régénère
les en-têtes depuis une liste autorisée. Aucun vhost, certificat ou environnement
n’est remplacé ; les raccordements `/login`, `/manager` et `/api/contact` restent en place.
Le service de contact ne redémarre que si son code change. Aucun e-mail n’est envoyé
par les contrôles de publication. Les téléchargements Vault existants ne peuvent pas
être supprimés silencieusement par un build dépourvu de son installateur validé.

Les précédentes releases restent disponibles. Les liens antérieurs et la révision
publiée sont enregistrés dans `/var/backups/ahelis-websites/<release>/`. Si Nginx,
la readiness, les empreintes HTML/assets, les en-têtes ou la protection Business
échouent, le récepteur restaure les liens et recharge la configuration précédente.
Une reprise administrative peut également rétablir ces liens depuis le reçu, puis
exécuter `nginx -t` et recharger Nginx ; redémarrer le contact seulement si son code change.

Tests sans serveur : `python3 -m unittest discover -s tests -p test_deploy.py`.
La suite couvre les frontières d’archive et les échecs après bascule partielle ou
contrôle HTTP. Les sections suivantes conservent l’historique de préparation initiale.

Le site est statique : seul le contenu de `dist/` doit être servi par Nginx.
Le build reste local ou en CI. L’envoi automatique du formulaire utilise désormais
une petite API Node sur un port local ; aucune base de données supplémentaire.

## Préparation effectuée le 2026-10-14

- `/srv/ahelislab-website`, `releases/` et `shared/` : `ubuntu:www-data`, mode `0750`.
- `/var/www/ahelislab-acme` : dossier réservé aux validations de certificat.
- `nginx-preview.conf` installé sous `/etc/nginx/sites-available/ahelislab-website.conf`.
- Configuration prévue pour `ahelis.ch` et `ahelislab.ch`, avec `noindex` et `nofollow`.
- Syntaxe du candidat et configuration globale Nginx validées.

À cette étape, le vhost était **inactif** : aucun lien dans `sites-enabled`, aucun rechargement
Nginx, aucun contenu installé et aucun service existant redémarré.
Après mise à jour DNS par Julio, les deux domaines ont un A vers le VPS ;
`ahelislab.ch` a également un AAAA. Le AAAA d’`ahelis.ch` n’était pas encore visible
lors du contrôle du 2026-10-14. Ces enregistrements n’activent pas le vhost.

## Installation et HTTPS effectués le 2026-10-14

- Version de consultation `0.5.0`, commit `2c75b65`, installée dans
  `/srv/ahelislab-website/releases/0.5.0-2c75b65/dist/` depuis l’archive de release vérifiée.
  `current` pointait initialement vers cette release.
- Modèle `nginx-https.conf` actif sous `sites-available/ahelislab-website.conf`,
  avec lien `sites-enabled/zz-ahelislab-website.conf` pour conserver l’ordre des vhosts existants.
- Certificat Let’s Encrypt couvrant `ahelis.ch` et `ahelislab.ch`, valable jusqu’au
  2027-01-12 ; HTTP redirige vers HTTPS sur le même domaine, chemin et paramètres conservés.
- Renouvellement via `certbot.timer` actif ; simulation réussie avec le hook global
  de validation et rechargement Nginx déjà installé sur le VPS.
- Les en-têtes globaux de `dist/_headers` ont été convertis en directives `add_header`
  dans `current/nginx-security-headers.conf`, avec `always`, et inclus par le vhost.
  Ce fichier doit être régénéré dans chaque release : les empreintes CSP suivent le HTML.
  Le cache annuel reste limité aux assets à empreinte ; les en-têtes de sécurité y sont hérités.
- Mode `noindex,nofollow` conservé, sans origine canonique ni adresse de contact configurée.
  Le domaine principal reste à choisir ; les deux domaines servent actuellement le même aperçu.
- Contrôle des 22 pages sur les deux domaines en IPv4 et IPv6, 404 localisées, assets,
  redirections et en-têtes réussi. Les fichiers de configuration des autres vhosts sont
  inchangés et les quatre services existants répondent comme avant.

La configuration inactive précédente et les empreintes des autres vhosts sont sauvegardées
dans `shared/https-backup-20261014T214338Z/`. Pour revenir à la préparation inactive,
retirer uniquement le lien Ahelis de `sites-enabled`, restaurer son fichier depuis cette
sauvegarde, vérifier `nginx -t` et recharger Nginx. Conserver le contenu et le certificat
permet une réactivation ultérieure.

## Correction mobile et éditoriale du 2026-10-14

La consultation `0.5.1` est installée dans `releases/0.5.1-footer/` et `current`
pointe désormais vers cette release. Le footer est centré sur mobile, avec la signature
en dernière ligne ; l’introduction des services est reformulée sans deux-points dans les
deux langues. Build, contrôle des 22 pages et vérifications Chrome responsive réussis.
Les pages des deux domaines et les services existants ont été contrôlés après bascule.
Les en-têtes CSP ont été régénérés et Nginx rechargé ; le vhost et le certificat sont inchangés.
La release `0.5.0-2c75b65` reste disponible pour retour arrière. Les sources `0.5.1`
sont versionnées sur `main` ; aucune nouvelle release GitHub n’a été créée.

## Procédure de déploiement

### API de contact `0.6.0`

Le site reste statique ; seule la route `/api/contact` est relayée vers le service
`ahelis-contact.service`, lié à `127.0.0.1:4201`. Copier `server/contact.mjs` dans
la release en plus de `dist/`, installer le modèle systemd et le vhost HTTPS.
Le service utilise un utilisateur dynamique, une mémoire limitée à 128 Mio et un
quota CPU de 25 %. Il ne partage aucune clé ni aucun processus avec les autres applications.

La clé Resend dédiée est restreinte au domaine vérifié `ahelislab.ch`. L’environnement
`/etc/ahelis-contact.env` appartient à root, mode `0600`. `store-contact-key.py` permet
de le créer avec un prompt masqué sur SSH ; ne pas passer de clé en argument ni l’afficher.
Les origines autorisées sont les deux domaines HTTPS, et le destinataire fixe est
`hello@ahelislab.ch`. L’expéditeur est `Ahelis Lab <hello@ahelislab.ch>`.

Après transfert, valider le service, régénérer les en-têtes CSP, basculer `current`,
démarrer le service et vérifier sa readiness locale avant activation du proxy Nginx.
En cas d’échec, restaurer le lien `current` et le vhost précédent puis arrêter le service.
Ne pas publier le formulaire direct avec un backend indisponible. La CI vérifie l’API
avec un prestataire simulé ; elle ne peut pas attester la réception d’un e-mail réel.

La consultation `0.5.2`, dans `releases/0.5.2-contact/`, suivait la configuration
du destinataire `hello@ahelislab.ch` le 2026-10-15. Le formulaire prépare un e-mail à ouvrir
dans la messagerie du visiteur ; aucun service d’envoi serveur n’a été ajouté.
L’adresse apparaît aussi sur Contact, Confidentialité et dans les données structurées.
Les en-têtes CSP ont été régénérés, Nginx validé puis rechargé ; `0.5.1-footer` est conservée
pour retour arrière. Les sources de cette étape restaient locales, sans nouveau commit ou tag.

La consultation actuelle est `0.6.1`, avec API active et activée au démarrage système.
Cette correction retire le soulignement du crédit Paniagua.dev ; l’API est conservée sans redémarrage.
Le test technique unique du 2026-10-15 a reçu un identifiant Resend puis le statut
`delivered`. Les autres sites ont été vérifiés après activation. Sources versionnées sur `main`,
mode non indexable conservé. La validation visuelle locale du succès et de l’erreur
en français a réussi ; le navigateur de contrôle a ensuite cessé de répondre.
La vérification publique de cette session porte sur HTTP, le service et la livraison e-mail.
API et déduplication : [documentation Resend](https://resend.com/docs/api-reference/emails/send-email),
[clés d’idempotence](https://resend.com/docs/dashboard/emails/idempotency-keys).

1. Choisir le domaine principal et la redirection de l’autre domaine.
2. Construire et vérifier `dist/` avec l’origine choisie, en conservant le mode non indexable.
3. Transférer une release dans `releases/<version>/dist/`, puis créer `current`
   comme lien vers cette release ; conserver la release précédente pour retour arrière.
4. Reporter les en-têtes de sécurité de `dist/_headers` dans la configuration Nginx,
   notamment la CSP et ses empreintes JSON-LD. Nginx ne lit pas `_headers` automatiquement.
5. Vérifier le DNS, synchroniser le modèle local de vhost (dont la 404 anglaise sous `/en/`),
   valider le certificat des domaines retenus et compléter le vhost HTTPS.
   Le fichier fourni est une préparation HTTP pour la validation ACME, pas une configuration
   de publication finale.
6. Sur autorisation de mise en ligne, activer uniquement ce vhost, exécuter `nginx -t`,
   puis recharger Nginx et vérifier les routes, les assets, la 404, les en-têtes et les
   sites existants. Une origine et un contact validés restent nécessaires avant indexation.

Pour annuler la préparation inactive : retirer uniquement ce fichier de
`sites-available` et les dossiers Ahelis après avoir vérifié qu’ils sont toujours vides.
Les configurations et données des autres sites ne sont pas concernées.
