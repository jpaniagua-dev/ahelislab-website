# Préparation du VPS

Le site est statique : seul le contenu de `dist/` doit être servi par Nginx.
Le build reste local ou en CI ; aucun processus Node, port applicatif ou base de
données supplémentaire n’est nécessaire sur le serveur.

## Préparation effectuée le 2026-10-14

- `/srv/ahelislab-website`, `releases/` et `shared/` : `ubuntu:www-data`, mode `0750`.
- `/var/www/ahelislab-acme` : dossier réservé aux validations de certificat.
- `nginx-preview.conf` installé sous `/etc/nginx/sites-available/ahelislab-website.conf`.
- Configuration prévue pour `ahelis.ch` et `ahelislab.ch`, avec `noindex` et `nofollow`.
- Syntaxe du candidat et configuration globale Nginx validées.

Le vhost est **inactif** : aucun lien dans `sites-enabled`, aucun rechargement
Nginx, aucun contenu installé et aucun service existant redémarré.
Après mise à jour DNS par Julio, les deux domaines ont un A vers le VPS ;
`ahelislab.ch` a également un AAAA. Le AAAA d’`ahelis.ch` n’était pas encore visible
lors du contrôle du 2026-10-14. Ces enregistrements n’activent pas le vhost.

## Avant activation

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
