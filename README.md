# TP N°5 — Du monolithe aux microservices : LearnHub

*Module : Architecture logicielle et Microservices — Projet fil rouge LearnHub — Sprint 2 (Communication et données)*

| Durée | Pré-requis | Travail | Résultat attendu |
| --- | --- | --- | --- |
| 2 séances de 3 h (+ travail de groupe) | TP4 terminé (le monolithe fonctionne), Docker Desktop avec au moins 4 Go de mémoire | Équipe de 3 à 4 apprenants | LearnHub en **4 microservices + une gateway + RabbitMQ**, lancé avec `docker compose up`, avec **le même frontend qu'avant** |

## Table des matières

- [Partie 1 — Contexte et objectifs](#partie-1--contexte-et-objectifs)
- [Partie 2 — Monolithe ou microservices ? La différence expliquée simplement](#partie-2--monolithe-ou-microservices--la-différence-expliquée-simplement)
  - [2.1 — Une histoire de restaurant](#21--une-histoire-de-restaurant)
  - [2.2 — Le même LearnHub, dessiné de deux façons](#22--le-même-learnhub-dessiné-de-deux-façons)
  - [2.3 — Tableau de comparaison](#23--tableau-de-comparaison)
  - [2.4 — Ce qui ne change pas](#24--ce-qui-ne-change-pas)
  - [2.5 — Les idées reçues](#25--les-idées-reçues)
  - [2.6 — Quand choisir quoi ?](#26--quand-choisir-quoi-)
- [Partie 3 — Notions à connaître](#partie-3--notions-à-connaître)
- [Partie 4 — Pré-requis](#partie-4--pré-requis)
- [Partie 5 — Analyse : comment découper le monolithe](#partie-5--analyse--comment-découper-le-monolithe)
  - [5.1 — Le découpage par domaine métier](#51--le-découpage-par-domaine-métier)
  - [5.2 — Les 4 problèmes du monolithe, et leur solution](#52--les-4-problèmes-du-monolithe-et-leur-solution)
  - [5.3 — Où va chaque fichier du monolithe ?](#53--où-va-chaque-fichier-du-monolithe-)
- [Partie 6 — Architecture cible](#partie-6--architecture-cible)
  - [6.1 — Vue d'ensemble](#61--vue-densemble)
  - [6.2 — Ce qui est visible de l'extérieur](#62--ce-qui-est-visible-de-lextérieur)
  - [6.3 — Trois scénarios pour comprendre](#63--trois-scénarios-pour-comprendre)
  - [6.4 — Les événements (le « contrat » des messages)](#64--les-événements-le--contrat--des-messages)
  - [6.5 — Les routes internes (le « contrat » des appels)](#65--les-routes-internes-le--contrat--des-appels)
- [Partie 7 — Organisation de l'équipe et du Git](#partie-7--organisation-de-léquipe-et-du-git)
  - [7.1 — Répartition](#71--répartition)
  - [7.2 — Le déroulement](#72--le-déroulement)
- [Partie 8 — Structure du projet](#partie-8--structure-du-projet)
- [Partie 9 — Étape 1 : préparer le dépôt](#partie-9--étape-1--préparer-le-dépôt)
  - [9.1 — Marquer la version monolithe avec un tag](#91--marquer-la-version-monolithe-avec-un-tag)
  - [9.2 — Créer la branche de travail](#92--créer-la-branche-de-travail)
  - [9.3 — Créer la structure et copier le frontend](#93--créer-la-structure-et-copier-le-frontend)
- [Partie 10 — Étape 2 : Docker Compose et réglages](#partie-10--étape-2--docker-compose-et-réglages)
  - [10.1 — Les réglages : .env.example](#101--les-réglages--envexample)
  - [10.2 — docker-compose.yml](#102--docker-composeyml)
  - [10.3 — Les Dockerfiles](#103--les-dockerfiles)
  - [10.4 — Envoyer la base](#104--envoyer-la-base)
- [Partie 11 — Étape 3 : RabbitMQ et la messagerie](#partie-11--étape-3--rabbitmq-et-la-messagerie)
  - [11.1 — Comment ça marche](#111--comment-ça-marche)
  - [11.2 — Le code commun : messaging.js](#112--le-code-commun--messagingjs)
- [Partie 12 — Étape 4 : le user-service](#partie-12--étape-4--le-user-service)
  - [12.1 — package.json et configuration](#121--packagejson-et-configuration)
  - [12.2 — La base](#122--la-base)
  - [12.3 — Les middlewares](#123--les-middlewares)
  - [12.4 — Les routes](#124--les-routes)
  - [12.5 — Le point d'entrée](#125--le-point-dentrée)
- [Partie 13 — Étape 5 : le course-service](#partie-13--étape-5--le-course-service)
  - [13.1 — package.json, configuration, modèle](#131--packagejson-configuration-modèle)
  - [13.2 — Les routes publiques](#132--les-routes-publiques)
  - [13.3 — Les routes internes](#133--les-routes-internes)
  - [13.4 — Le point d'entrée](#134--le-point-dentrée)
- [Partie 14 — Étape 6 : l'enrollment-service](#partie-14--étape-6--lenrollment-service)
  - [14.1 — package.json, configuration, base](#141--packagejson-configuration-base)
  - [14.2 — Le client du course-service](#142--le-client-du-course-service)
  - [14.3 — Les routes](#143--les-routes)
  - [14.4 — L'écoute des événements](#144--lécoute-des-événements)
  - [14.5 — Le point d'entrée](#145--le-point-dentrée)
- [Partie 15 — Étape 7 : le notification-service](#partie-15--étape-7--le-notification-service)
- [Partie 16 — Étape 8 : la gateway](#partie-16--étape-8--la-gateway)
  - [16.1 — Pourquoi une gateway ?](#161--pourquoi-une-gateway-)
  - [16.2 — package.json et configuration](#162--packagejson-et-configuration)
  - [16.3 — La composition du tableau de bord](#163--la-composition-du-tableau-de-bord)
  - [16.4 — La table de routage](#164--la-table-de-routage)
- [Partie 17 — Étape 9 : le frontend (il ne change pas)](#partie-17--étape-9--le-frontend-il-ne-change-pas)
- [Partie 18 — Étape 10 : lancer et tester](#partie-18--étape-10--lancer-et-tester)
  - [18.1 — Démarrer](#181--démarrer)
  - [18.2 — Rejouer le scénario du TP4](#182--rejouer-le-scénario-du-tp4)
  - [18.3 — Observer les messages en direct](#183--observer-les-messages-en-direct)
  - [18.4 — Vérifier l'isolation des services](#184--vérifier-lisolation-des-services)
- [Partie 19 — Les expériences de panne](#partie-19--les-expériences-de-panne)
  - [Expérience 1 — Le notification-service tombe](#expérience-1--le-notification-service-tombe)
  - [Expérience 2 — Le course-service tombe](#expérience-2--le-course-service-tombe)
  - [Expérience 3 — Le user-service tombe](#expérience-3--le-user-service-tombe)
  - [Expérience 4 — RabbitMQ tombe](#expérience-4--rabbitmq-tombe)
  - [Expérience 5 — Le plantage du monolithe, pour comparer](#expérience-5--le-plantage-du-monolithe-pour-comparer)
- [Partie 20 — Référence : routes publiques](#partie-20--référence--routes-publiques)
- [Partie 21 — Travail demandé et livrables](#partie-21--travail-demandé-et-livrables)
  - [21.1 — Tableau d'observation des pannes](#211--tableau-dobservation-des-pannes)
  - [21.2 — Questions de compréhension](#212--questions-de-compréhension)
  - [21.3 — Exercices d'amélioration](#213--exercices-damélioration)
  - [21.4 — Livrable](#214--livrable)
  - [21.5 — Barème](#215--barème)
- [Partie 22 — Bilan : monolithe contre microservices](#partie-22--bilan--monolithe-contre-microservices)
  - [22.1 — Ce que vous venez de constater](#221--ce-que-vous-venez-de-constater)
  - [22.2 — Les pièges classiques](#222--les-pièges-classiques)
  - [22.3 — Ce qui vient ensuite](#223--ce-qui-vient-ensuite)
- [Partie 23 — Problèmes fréquents](#partie-23--problèmes-fréquents)
- [Partie 24 — Aide-mémoire](#partie-24--aide-mémoire)

---

## Partie 1 — Contexte et objectifs

Au TP4, vous avez construit LearnHub en **monolithe** : un seul backend qui contient les 4 domaines (utilisateurs, cours, inscriptions, notifications). Il marche. Mais la partie 14 du TP4 vous a montré ses limites : un bug peut tout arrêter, tout se déploie ensemble, les modules sont collés les uns aux autres.

Dans ce TP, vous **traduisez la même application en microservices** : chaque domaine devient un petit programme indépendant, avec **sa propre base de données**. Les fonctionnalités ne changent pas. Le frontend ne change pas. **Seule l'architecture change.** C'est ce qui rend la comparaison claire.

**À la fin de ce TP, vous saurez :**

- expliquer la différence entre un monolithe et des microservices, avec vos propres mots ;
- découper un monolithe en services selon les domaines métier ;
- donner à chaque service **sa propre base de données** ;
- faire communiquer deux services de **deux façons** : un appel direct (HTTP) et un message (RabbitMQ) ;
- placer une **gateway** devant les services pour garder une seule adresse pour le frontend ;
- lancer 11 conteneurs avec Docker Compose ;
- **provoquer des pannes** et constater ce qui continue de marcher (et ce qui s'arrête) ;
- dire honnêtement ce qu'on gagne et ce qu'on perd avec les microservices.

## Partie 2 — Monolithe ou microservices ? La différence expliquée simplement

### 2.1 — Une histoire de restaurant

**Le monolithe, c'est un grand restaurant avec une seule cuisine.** Tout le monde travaille dans la même cuisine : celui qui fait les entrées, celui qui fait les desserts, celui qui fait la caisse. Les ingrédients sont dans un seul frigo. C'est simple à organiser : tout le monde se voit, tout est au même endroit. Mais :

- si le four tombe en panne, **tout le restaurant s'arrête** ;
- si les desserts ont beaucoup de succès, il faut **agrandir toute la cuisine** (pas seulement le coin desserts) ;
- pour changer la recette d'un plat, il faut **fermer et rouvrir tout le restaurant** ;
- avec 30 cuisiniers, ils se marchent dessus.

**Les microservices, c'est une galerie de stands de nourriture** (un « food court »). Chaque stand a son cuisinier, son frigo, son menu. Il y a un plan à l'entrée pour trouver le bon stand, et un système pour se passer les commandes quand un plat demande deux stands. Alors :

- si le stand de desserts ferme, **les autres stands continuent** ;
- si les desserts ont du succès, on **ajoute un cuisinier seulement à ce stand** ;
- chaque stand peut **changer sa recette sans fermer les autres** ;
- chaque équipe gère son stand toute seule.

Mais il faut maintenant **un plan d'accès, un système de commandes entre stands, et plus de monde à coordonner**. Et si un plat demande deux stands, il faut qu'ils s'entendent. **Les microservices ne sont pas « meilleurs » : ils échangent de la simplicité contre de l'indépendance.**

### 2.2 — Le même LearnHub, dessiné de deux façons

```mermaid
flowchart TB
    subgraph MONO[MONOLITHE - TP4]
        direction TB
        FM[Frontend] --> BM
        subgraph BM[Un seul backend - un seul programme]
            A1[users] --- A2[courses] --- A3[enrollments] --- A4[notifications]
        end
        BM --> D1[(PostgreSQL)]
        BM --> D2[(MongoDB)]
    end
    subgraph MICRO[MICROSERVICES - TP5]
        direction TB
        FX[Frontend] --> G[Gateway]
        G --> S1[user-service]
        G --> S2[course-service]
        G --> S3[enrollment-service]
        G --> S4[notification-service]
        S1 --> P1[(PostgreSQL users)]
        S2 --> M1[(MongoDB courses)]
        S3 --> P2[(PostgreSQL enrollments)]
        S4 --> M2[(MongoDB notifications)]
        S2 -.message.-> R{{RabbitMQ}}
        S3 -.message.-> R
        R -.message.-> S3
        R -.message.-> S4
    end
```

### 2.3 — Tableau de comparaison

| Question | Monolithe (TP4) | Microservices (TP5) |
| --- | --- | --- |
| **Combien de programmes ?** | 1 backend | 4 services + 1 gateway |
| **Où est le code ?** | Un seul projet, des modules (dossiers) | Un projet par service, chacun avec son `package.json` et son `Dockerfile` |
| **Comment les parties se parlent-elles ?** | En appelant des fonctions, dans la même mémoire (instantané) | Par le réseau : HTTP ou messages (plus lent, peut échouer) |
| **Combien de bases de données ?** | 2 bases partagées par tous les modules | 4 bases : **chaque service a la sienne, personne d'autre n'y touche** |
| **Si un module plante ?** | Tout le programme s'arrête | Seul ce service s'arrête, les autres continuent |
| **Comment déployer un changement ?** | On redéploie toute l'application | On redéploie **un seul** service |
| **Si le catalogue reçoit beaucoup de visites ?** | On duplique toute l'application | On duplique **seulement** le course-service |
| **Technologies** | Une seule pour tout | Libre choix par service (autre langage, autre base) |
| **Travail en équipe** | Tout le monde modifie le même projet : conflits fréquents | Une équipe par service : moins de conflits |
| **Lancer l'application en local** | 4 conteneurs | 11 conteneurs : plus lourd |
| **Trouver un bug** | Simple : un seul journal (log), un seul programme | Plus dur : il faut suivre une requête à travers plusieurs services |
| **Garder les données cohérentes** | Facile : une seule transaction SQL | Difficile : plusieurs bases, il faut des messages et accepter des délais |
| **Complexité à comprendre** | Faible | Élevée : réseau, messages, pannes partielles |
| **Pour qui ?** | Petite équipe, début de projet, besoin simple | Grande équipe, gros trafic, parties qui évoluent à des rythmes différents |

### 2.4 — Ce qui ne change pas

Beaucoup de débutants pensent que « passer aux microservices » change tout. Faux. **Ne changent pas :**

- les **user stories** (US01 à US11) : l'utilisateur voit exactement les mêmes fonctions ;
- le **frontend** : pas une seule ligne ne sera modifiée ;
- les **adresses de l'API** (`/api/users/login`, `/api/courses`...) : grâce à la gateway ;
- la **logique métier** : le calcul de progression, les règles de rôle, les messages sont les mêmes.

**Ce qui change :** où vit le code, où vivent les données, et comment les parties se parlent.

### 2.5 — Les idées reçues

| Idée reçue | La réalité |
| --- | --- |
| « Les microservices sont toujours meilleurs. » | Non. Pour une petite équipe, un monolithe bien organisé est souvent **plus rapide à construire et à maintenir**. Beaucoup d'entreprises ont fait le chemin inverse. |
| « Un microservice = un tout petit fichier. » | Non. Un microservice est un **domaine métier complet** (ses routes, sa logique, sa base). |
| « Les microservices vont plus vite. » | Non. Un appel réseau est **beaucoup plus lent** qu'un appel de fonction. On gagne en indépendance, pas en vitesse brute. |
| « On découpe comme on veut. » | Non. On découpe selon les **domaines métier** (utilisateurs, cours, inscriptions...), pas selon des couches techniques. |
| « Si on a 4 services, on a des microservices. » | Pas forcément. Si les 4 services partagent **la même base** ou s'appellent tous entre eux pour chaque requête, on a un « **monolithe distribué** » : tous les défauts des deux mondes. |

### 2.6 — Quand choisir quoi ?

| Votre situation | Meilleur choix |
| --- | --- |
| Équipe de 2 à 5 personnes, produit qui démarre | **Monolithe** (bien organisé en modules) |
| Besoin de livrer vite une première version | **Monolithe** |
| Grande équipe qui se marche dessus | Microservices |
| Une partie reçoit 100 fois plus de trafic que les autres | Microservices (au moins pour cette partie) |
| Parties qui doivent être déployées à des rythmes très différents | Microservices |
| Équipe qui ne sait pas encore faire fonctionner et surveiller un système distribué | **Monolithe**, d'abord |

**Pourquoi alors faire LearnHub en microservices ?** Parce que c'est **le but pédagogique du module** : voir concrètement ce que cela change. Dans la vraie vie, vous auriez peut-être gardé le monolithe. Savoir dire pourquoi est justement ce qu'on attend d'un bon développeur.

## Partie 3 — Notions à connaître

| Terme | Définition simple |
| --- | --- |
| Microservice | Un petit programme **indépendant** qui s'occupe d'**un seul domaine métier**, avec sa propre base de données. Il se lance, s'arrête et se déploie seul. |
| Une base par service | Règle d'or : seul le service propriétaire lit et écrit dans sa base. Les autres services doivent **lui demander** par son API ou par un message. |
| Gateway (API Gateway) | La **porte d'entrée unique**. Le frontend ne parle qu'à elle ; elle envoie chaque requête au bon service. Comme l'accueil d'un immeuble de bureaux. |
| Reverse proxy | Un serveur qui reçoit les requêtes à la place d'autres serveurs et les leur transmet. Notre gateway en est un. |
| Communication synchrone (HTTP) | Un service **appelle** un autre et **attend la réponse** avant de continuer. Comme un **appel téléphonique**. Simple, mais si l'autre ne décroche pas, on est bloqué. |
| Communication asynchrone (message) | Un service **dépose un message** et continue **sans attendre**. Les autres le lisent quand ils peuvent. Comme **une lettre** ou un SMS. |
| RabbitMQ | Un « **bureau de poste** » pour messages. Les services y déposent des messages ; il les garde et les livre aux services intéressés, même s'ils sont arrêtés au moment de l'envoi. |
| Événement | Un message qui dit **« il s'est passé quelque chose »** : `enrollment.created` = « une inscription vient d'avoir lieu ». L'expéditeur ne sait pas qui va réagir. |
| Producteur / consommateur | Producteur : celui qui envoie un message. Consommateur : celui qui le lit et réagit. |
| Exchange | Le « centre de tri » de RabbitMQ : il reçoit les messages et les dirige selon leur **clé de routage**. |
| Clé de routage (routing key) | L'étiquette d'un message (`course.deleted`). Elle sert à décider qui le reçoit. |
| File (queue) | La « boîte aux lettres » d'un service. Les messages y attendent d'être lus. |
| Ack (accusé de réception) | Le consommateur dit à RabbitMQ « j'ai bien traité ce message, tu peux l'effacer ». |
| Route interne | Une route réservée aux **autres services** (`/internal/...`). La gateway ne la montre pas à l'extérieur. |
| Composition d'API | Quand une réponse demande des données de plusieurs services, **un seul programme** (ici la gateway) interroge chacun et **assemble** le résultat. |
| Timeout | Un délai maximum d'attente. Au-delà, on abandonne au lieu d'attendre toujours. |
| Résilience | La capacité du système à **continuer de fonctionner** (même en mode réduit) quand une partie tombe en panne. |
| Couplage | À quel point deux parties dépendent l'une de l'autre. On veut un **faible couplage**. |
| Cohérence éventuelle | Les données de plusieurs services ne sont pas toujours à jour **au même instant**, mais finissent par l'être. (Exemple : la notification arrive quelques instants après l'inscription.) |
| Nom de service Docker | Dans le réseau Docker, un service s'appelle par son **nom** : `http://course-service:3002`. Pas `localhost`. |

## Partie 4 — Pré-requis

- Le **TP4 terminé** : votre monolithe démarre avec `docker compose up` et le scénario de test passe.
- **Docker Desktop** avec au moins **4 Go de mémoire** (Settings, Resources). L'application lance 11 conteneurs : avec 2 Go, elle va ramer ou planter.
- Les règles Git du TP2 : branches, pull requests relues, pas de push direct sur main.
- Fermez tout autre conteneur : `docker compose down` dans le dossier du TP4, sinon les ports 5000 et 5173 seront déjà utilisés.

## Partie 5 — Analyse : comment découper le monolithe

### 5.1 — Le découpage par domaine métier

On découpe selon les **domaines métier**, exactement comme dans le backlog du Sprint 0. Chaque domaine devient un service, et **emporte ses données avec lui**.

| Service | Domaine | User stories | Sa base | Ce qu'elle contient |
| --- | --- | --- | --- | --- |
| user-service | Comptes, authentification, rôles | US01, US02, US03, US10 | PostgreSQL `users_db` | Table `users` |
| course-service | Catalogue de cours et chapitres | US04, US05, US06, US07 | MongoDB `courses_db` | Collection `courses` (avec leurs chapitres) |
| enrollment-service | Inscriptions et progression | US08, US09 | PostgreSQL `enrollments_db` | Tables `enrollments` et `completed_chapters` |
| notification-service | Confirmations asynchrones | US11 | MongoDB `notifications_db` | Collection `notifications` |
| gateway | Porte d'entrée, tableau de bord | (toutes) | aucune | — |

### 5.2 — Les 4 problèmes du monolithe, et leur solution

À la fin du TP4, vous deviez repérer les points de couplage. Voici les réponses. **Chacun est un vrai problème que l'on rencontre en découpant.**

| Problème dans le monolithe | Pourquoi ça casse dans les microservices | Solution dans ce TP |
| --- | --- | --- |
| `enrollments.js` appelait `Course.findById(...)` : il lisait **directement** la base des cours. | Le enrollment-service n'a plus le droit de toucher à la base des cours. | **Appel HTTP synchrone** vers une route interne du course-service : `GET /internal/courses/:id`. |
| `notifications.js` lisait la table `enrollments` pour savoir qui prévenir quand un cours est supprimé. | Le notification-service n'a plus accès à la base des inscriptions. | **Événements** : le course-service annonce `course.deleted`, l'enrollment-service réagit et annonce `enrollment.cancelled`, le notification-service réagit à son tour. |
| `authenticate` était un middleware **partagé** par tous les modules. | Chaque service est un programme séparé. | **Chaque service vérifie lui-même le token JWT** avec le même secret. Seul le user-service **fabrique** les tokens. |
| `stats.js` lisait **les deux bases** pour compter les utilisateurs, les cours et les inscriptions. | Les chiffres sont maintenant dans 4 bases différentes. | **Composition d'API** : la gateway interroge chaque service (routes internes `/internal/stats`) et assemble la réponse. |

Deux autres conséquences, plus discrètes :

- **`enrollments.user_id` n'a plus de clé étrangère** vers `users` : les deux tables sont dans des bases différentes. On stocke seulement l'identifiant.
- **Le nom du formateur est copié dans le cours** (`ownerName`) : on évite d'appeler le user-service à chaque affichage du catalogue. Compromis : si le formateur change de nom, l'ancien nom reste dans ses anciens cours. C'est un exemple de **données dupliquées** assumées.

### 5.3 — Où va chaque fichier du monolithe ?

| Dans le monolithe (TP4) | Dans les microservices (TP5) |
| --- | --- |
| `backend/src/modules/users.js` | `services/user-service/src/routes/users.js` |
| `backend/src/modules/courses.js`, `models/Course.js` | `services/course-service/src/routes/courses.js`, `models/Course.js` |
| `backend/src/modules/enrollments.js` | `services/enrollment-service/src/routes/enrollments.js` |
| `backend/src/modules/notifications.js`, `models/Notification.js` | `services/notification-service/src/consumers.js`, `models/Notification.js`, `routes/notifications.js` |
| `backend/src/modules/stats.js` | `gateway/src/stats.js` + une route `/internal/stats` dans chaque service |
| `backend/src/events.js` (événements en mémoire) | **supprimé** : remplacé par RabbitMQ (`messaging.js`) |
| `backend/src/middleware/auth.js` | recopié dans chaque service |
| `backend/src/db/postgres.js`, `db/mongo.js` | un `db/postgres.js` ou une connexion Mongo **par service** |
| `backend/src/index.js` | un `index.js` par service + `gateway/src/index.js` |
| `frontend/` | `frontend/` — **identique** |

## Partie 6 — Architecture cible

### 6.1 — Vue d'ensemble

```mermaid
flowchart LR
    U[Navigateur] --> F[Frontend React :5173]
    F -->|HTTP + JWT| G[Gateway :5000]
    G -->|/api/users| US[user-service]
    G -->|/api/courses| CS[course-service]
    G -->|/api/enrollments| ES[enrollment-service]
    G -->|/api/notifications| NS[notification-service]
    G -.composition /api/stats.-> US
    G -.-> CS
    G -.-> ES
    G -.-> NS
    ES -->|HTTP interne| CS
    US --> PU[(PostgreSQL users_db)]
    CS --> MC[(MongoDB courses_db)]
    ES --> PE[(PostgreSQL enrollments_db)]
    NS --> MN[(MongoDB notifications_db)]
    CS -.course.deleted.-> RQ{{RabbitMQ}}
    ES -.enrollment.created / cancelled.-> RQ
    RQ -.course.deleted.-> ES
    RQ -.enrollment.created / cancelled.-> NS
```

### 6.2 — Ce qui est visible de l'extérieur

| Conteneur | Port ouvert vers votre PC | Pourquoi |
| --- | --- | --- |
| frontend | 5173 | Vous ouvrez le site |
| gateway | 5000 | Le frontend appelle l'API |
| rabbitmq | 15672 | Interface web de RabbitMQ (pour observer les messages) |
| les 4 services et les 4 bases | **aucun** | Ils ne sont joignables que **depuis le réseau Docker**. Impossible de les appeler directement depuis le navigateur : la gateway est la seule porte. |

### 6.3 — Trois scénarios pour comprendre

**Scénario A — L'inscription à un cours (synchrone + asynchrone)**

1. L'étudiant clique sur « S'inscrire ». Le navigateur envoie `POST /api/enrollments` à la **gateway**.
2. La gateway transmet à l'**enrollment-service**.
3. L'enrollment-service vérifie le token, puis **appelle le course-service par HTTP** (`GET /internal/courses/:id`) pour savoir si le cours existe. *C'est synchrone : il attend la réponse.*
4. Il écrit l'inscription dans **sa** base, puis **dépose** le message `enrollment.created` dans RabbitMQ.
5. Il répond « 201 Créé » à l'étudiant. *Il n'attend pas la notification.*
6. RabbitMQ livre le message au **notification-service**, qui écrit la notification dans **sa** base. *C'est asynchrone.*

**Scénario B — La suppression d'un cours (chaîne d'événements)**

1. Le formateur supprime son cours : le **course-service** supprime le cours et publie `course.deleted`.
2. L'**enrollment-service** reçoit le message, supprime les inscriptions de ce cours, et publie `enrollment.cancelled` **pour chaque étudiant** concerné.
3. Le **notification-service** reçoit chaque message et crée la notification « Le cours a été supprimé ».

*Personne n'appelle directement personne : chaque service réagit à ce qu'il entend.*

**Scénario C — Le tableau de bord (composition d'API)**

1. Le navigateur appelle `GET /api/stats/me` sur la gateway.
2. La gateway lit le token pour connaître le rôle, puis interroge les routes internes des services concernés (en parallèle quand c'est possible).
3. Elle assemble les chiffres en **une seule réponse**, du même format qu'au TP4.

### 6.4 — Les événements (le « contrat » des messages)

| Événement | Envoyé par | Reçu par | Contenu du message | Réaction |
| --- | --- | --- | --- | --- |
| `enrollment.created` | enrollment-service | notification-service | `userId`, `courseId`, `courseTitle` | Crée la notification de confirmation |
| `course.deleted` | course-service | enrollment-service | `courseId`, `title` | Supprime les inscriptions, publie `enrollment.cancelled` |
| `enrollment.cancelled` | enrollment-service | notification-service | `userId`, `courseTitle` | Crée la notification « cours supprimé » |

### 6.5 — Les routes internes (le « contrat » des appels)

| Route | Service | Utilisée par | Rôle |
| --- | --- | --- | --- |
| `GET /internal/courses/:id` | course-service | enrollment-service | Résumé d'un cours (titres des chapitres, sans contenu) |
| `GET /internal/courses/batch?ids=a,b` | course-service | enrollment-service | Résumés de plusieurs cours d'un coup |
| `GET /internal/stats?ownerId=` | course-service | gateway | Nombre de cours, de chapitres, liste des identifiants |
| `GET /internal/stats?userId=` / `?courseIds=` / (rien) | enrollment-service | gateway | Chiffres d'un étudiant / d'un formateur / total |
| `GET /internal/stats?userId=` | notification-service | gateway | Nombre de notifications |
| `GET /internal/stats` | user-service | gateway | Nombre d'utilisateurs par rôle |

## Partie 7 — Organisation de l'équipe et du Git

### 7.1 — Répartition

Un service par membre. **Mettez-vous d'accord sur les contrats** (les deux tableaux 6.4 et 6.5) **avant** d'écrire du code : c'est ce qui permet de travailler en parallèle.

| Membre | Service | Fichiers | User stories |
| --- | --- | --- | --- |
| 1 (chef) | **Base du projet** + `user-service` | `docker-compose.yml`, `.env.example`, `user-service/` | US01, US02, US03, US10 |
| 2 | `course-service` | `services/course-service/` + `messaging.js` | US04, US05, US06, US07 |
| 3 | `enrollment-service` + `gateway` | `services/enrollment-service/`, `gateway/` | US08, US09, tableau de bord |
| 4 | `notification-service` | `services/notification-service/` | US11 |

Dans un groupe de 3, le membre 3 prend aussi les notifications. Le `messaging.js` est écrit par le membre 2, puis **copié** dans les deux autres services qui l'utilisent.

### 7.2 — Le déroulement

1. **Le chef marque la version monolithe** avec un **tag Git** (voir partie 9) : on pourra toujours y revenir.
2. **Le chef** crée la base (`docker-compose.yml`, `.env.example`, dossiers) sur `feature/microservices-base`, avec une PR relue et fusionnée.
3. Chaque membre crée sa branche (`feature/user-service`, `feature/course-service`, `feature/enrollment-service`, `feature/notification-service`), écrit son service, ouvre sa PR.
4. Chaque PR est relue par le membre suivant. **Le relecteur vérifie le contrat** : mêmes routes, mêmes noms d'événements, mêmes champs.
5. Le fichier `docker-compose.yml` sera modifié par plusieurs personnes : prévoyez des conflits, vous savez les résoudre (TP2, partie 10).
6. À la fin, **le chef supprime l'ancien dossier `backend/`** dans une dernière PR.

**Pourquoi c'est plus facile qu'au TP4 :** chacun travaille dans **son dossier**. Les conflits ne concernent plus que `docker-compose.yml`.

## Partie 8 — Structure du projet

```
LearnHub/
├── README.md
├── docker-compose.yml           <- 11 conteneurs
├── .env.example                 <- modèle des réglages (committé)
├── .env                         <- vos vrais réglages (JAMAIS committé)
├── .gitignore
├── frontend/                    <- IDENTIQUE au TP4
├── gateway/                     <- porte d'entrée unique
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js             <- table de routage (proxy)
│       ├── config.js
│       └── stats.js             <- composition du tableau de bord
└── services/
    ├── user-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── config.js
    │       ├── db/postgres.js
    │       ├── middleware/      <- auth.js, asyncHandler.js
    │       └── routes/          <- users.js, internal.js
    ├── course-service/
    │   ├── Dockerfile, package.json
    │   └── src/
    │       ├── index.js, config.js, messaging.js
    │       ├── models/Course.js
    │       ├── middleware/      <- auth.js, asyncHandler.js
    │       └── routes/          <- courses.js, internal.js
    ├── enrollment-service/
    │   ├── Dockerfile, package.json
    │   └── src/
    │       ├── index.js, config.js, messaging.js
    │       ├── courseClient.js  <- appels HTTP vers course-service
    │       ├── consumers.js     <- écoute les événements
    │       ├── db/postgres.js
    │       ├── middleware/      <- auth.js, asyncHandler.js
    │       └── routes/          <- enrollments.js, internal.js
    └── notification-service/
        ├── Dockerfile, package.json
        └── src/
            ├── index.js, config.js, messaging.js
            ├── consumers.js     <- écoute les événements
            ├── models/Notification.js
            ├── middleware/      <- auth.js, asyncHandler.js
            └── routes/          <- notifications.js, internal.js
```

**Remarquez :** chaque service est un **mini-projet complet** (son `package.json`, son `Dockerfile`, ses dépendances). Vous pourriez en sortir un et le mettre dans un autre dépôt. C'est exactement ce qu'on appelle l'**indépendance**.

**Pour créer tous les dossiers d'un coup** (depuis la racine de LearnHub, dans Git Bash) :

```
for s in user-service course-service enrollment-service notification-service; do
  mkdir -p services/$s/src/middleware services/$s/src/routes
done
mkdir -p services/user-service/src/db services/enrollment-service/src/db
mkdir -p services/course-service/src/models services/notification-service/src/models
mkdir -p gateway/src
```

## Partie 9 — Étape 1 : préparer le dépôt

| Qui fait cette partie ? |
| --- |
| Le chef, puis tout le monde récupère. |

### 9.1 — Marquer la version monolithe avec un tag

Un **tag** est une étiquette posée sur un commit précis. Contrairement à une branche, il ne bouge pas. Il sert à marquer une version importante. Ici : « le monolithe terminé ».

```
cd ~/projets/LearnHub
git switch main
git pull
git tag -a v1-monolithe -m 'Version monolithe terminee (TP4)'
git push origin v1-monolithe
git tag
```

La dernière commande doit afficher `v1-monolithe`. Sur GitHub, l'onglet **Releases** (ou « tags ») le montre. Pour revoir plus tard le monolithe : `git switch --detach v1-monolithe`, puis `git switch main` pour revenir.

### 9.2 — Créer la branche de travail

```
git switch -c feature/microservices-base
```

### 9.3 — Créer la structure et copier le frontend

Le frontend est déjà à sa place (`frontend/`) et **ne change pas**. On crée seulement les nouveaux dossiers (commande de la partie 8). L'ancien dossier `backend/` reste pour l'instant : vous pourrez y relire le code du monolithe. **Il sera supprimé à la dernière étape.**

## Partie 10 — Étape 2 : Docker Compose et réglages

| Qui fait cette partie ? |
| --- |
| Le chef, sur `feature/microservices-base`. |

### 10.1 — Les réglages : .env.example

Il y a un réglage de plus qu'au TP4 : le mot de passe de RabbitMQ. Les noms des bases n'y sont plus : ils sont écrits directement dans `docker-compose.yml`, car ils font partie de l'architecture (une base par service).

```env
POSTGRES_USER=learnhub
POSTGRES_PASSWORD=changez_moi
RABBITMQ_USER=learnhub
RABBITMQ_PASSWORD=changez_moi_aussi
JWT_SECRET=changez_ce_secret_long_et_aleatoire
ADMIN_EMAIL=admin@learnhub.local
ADMIN_PASSWORD=Admin1234
```

```
cp .env.example .env
```

Mettez vos propres valeurs (sans espaces ni guillemets, et sans les caractères `@ : / # ? %` dans les mots de passe).

### 10.2 — docker-compose.yml

Les 11 conteneurs : 4 bases, RabbitMQ, 4 services, la gateway, le frontend.

```yaml
services:
  # ---------- Les bases de données : UNE PAR SERVICE ----------
  postgres-users:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: users_db
    volumes:
      - pg_users:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d users_db"]
      interval: 5s
      timeout: 5s
      retries: 10

  postgres-enrollments:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: enrollments_db
    volumes:
      - pg_enrollments:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d enrollments_db"]
      interval: 5s
      timeout: 5s
      retries: 10

  mongo-courses:
    image: mongo:7
    volumes:
      - mongo_courses:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      timeout: 10s
      retries: 10

  mongo-notifications:
    image: mongo:7
    volumes:
      - mongo_notifications:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      timeout: 10s
      retries: 10

  # ---------- Le facteur : RabbitMQ transporte les messages entre services ----------
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    ports:
      - "15672:15672"   # interface web : http://localhost:15672
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 10s
      timeout: 10s
      retries: 12
      start_period: 20s

  # ---------- Les 4 microservices (aucun port publié : invisibles depuis l'extérieur) ----------
  user-service:
    build: ./services/user-service
    environment:
      PORT: 3001
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres-users:5432/users_db
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
    depends_on:
      postgres-users:
        condition: service_healthy
    volumes:
      - ./services/user-service:/app
      - /app/node_modules
    command: npm run dev

  course-service:
    build: ./services/course-service
    environment:
      PORT: 3002
      MONGO_URL: mongodb://mongo-courses:27017/courses_db
      RABBITMQ_URL: amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:5672
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      mongo-courses:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    volumes:
      - ./services/course-service:/app
      - /app/node_modules
    command: npm run dev

  enrollment-service:
    build: ./services/enrollment-service
    environment:
      PORT: 3003
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres-enrollments:5432/enrollments_db
      RABBITMQ_URL: amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:5672
      COURSE_SERVICE_URL: http://course-service:3002
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres-enrollments:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      course-service:
        condition: service_started
    volumes:
      - ./services/enrollment-service:/app
      - /app/node_modules
    command: npm run dev

  notification-service:
    build: ./services/notification-service
    environment:
      PORT: 3004
      MONGO_URL: mongodb://mongo-notifications:27017/notifications_db
      RABBITMQ_URL: amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:5672
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      mongo-notifications:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    volumes:
      - ./services/notification-service:/app
      - /app/node_modules
    command: npm run dev

  # ---------- La porte d'entrée unique ----------
  gateway:
    build: ./gateway
    ports:
      - "5000:5000"
    environment:
      PORT: 5000
      USER_SERVICE_URL: http://user-service:3001
      COURSE_SERVICE_URL: http://course-service:3002
      ENROLLMENT_SERVICE_URL: http://enrollment-service:3003
      NOTIFICATION_SERVICE_URL: http://notification-service:3004
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - user-service
      - course-service
      - enrollment-service
      - notification-service
    volumes:
      - ./gateway:/app
      - /app/node_modules
    command: npm run dev

  # ---------- Le frontend : IDENTIQUE à celui du monolithe ----------
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:5000/api
    depends_on:
      - gateway
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  pg_users:
  pg_enrollments:
  mongo_courses:
  mongo_notifications:
```

**Ce qui est nouveau par rapport au TP4 :**

| Élément | Explication |
| --- | --- |
| **4 bases** (`postgres-users`, `postgres-enrollments`, `mongo-courses`, `mongo-notifications`) | Une base **par service**. Le user-service ne connaît que `postgres-users`. Il lui est **impossible** de lire les inscriptions, même par erreur. |
| `rabbitmq` + `15672:15672` | Le bureau de poste des messages, avec son interface web (`http://localhost:15672`). Identifiants : `RABBITMQ_USER` et `RABBITMQ_PASSWORD` du `.env`. |
| `healthcheck` de RabbitMQ | RabbitMQ met 15 à 30 secondes à démarrer. Les services attendent qu'il soit prêt. |
| **Aucun `ports:` pour les services** | Ils ne sont pas joignables depuis votre PC, seulement depuis le réseau Docker. |
| `COURSE_SERVICE_URL: http://course-service:3002` | L'adresse du course-service **vue par l'enrollment-service** : le **nom du service Docker** sert d'adresse. |
| `JWT_SECRET` donné à tous | Chaque service doit pouvoir **vérifier** les tokens. Le même secret est partagé. |
| `depends_on` | Chaque service attend sa base (et RabbitMQ) avant de démarrer. |

### 10.3 — Les Dockerfiles

Les 5 programmes Node (4 services + gateway) utilisent **le même** `Dockerfile`. Copiez-le dans chacun des 5 dossiers :

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

Ajoutez aussi, dans chaque dossier, un fichier `.dockerignore` :

```
for d in services/user-service services/course-service services/enrollment-service services/notification-service gateway; do
  printf 'node_modules\nnpm-debug.log\n' > $d/.dockerignore
done
```

**Question à vous poser :** les 5 Dockerfiles sont identiques. Est-ce une **duplication** gênante ? C'est un vrai sujet des microservices : chaque service est autonome, donc on accepte de dupliquer un peu pour ne pas créer de dépendance entre eux.

### 10.4 — Envoyer la base

```
git add .
git commit -m 'chore: ajoute docker-compose des microservices'
git push -u origin feature/microservices-base
```

Ouvrez la PR, faites-la relire, fusionnez-la. Les autres membres font `git switch main` puis `git pull`.

## Partie 11 — Étape 3 : RabbitMQ et la messagerie

### 11.1 — Comment ça marche

Imaginez un **bureau de poste** :

- le **producteur** (par exemple l'enrollment-service) dépose une lettre au guichet (l'**exchange**) avec une étiquette (la **clé de routage** : `enrollment.created`) ;
- le bureau regarde l'étiquette et glisse la lettre dans la **boîte aux lettres** (la **file**) de chaque service intéressé ;
- le **consommateur** (par exemple le notification-service) relève sa boîte quand il est disponible, traite la lettre, puis dit « bien reçu » (**ack**) ;
- si le consommateur est absent, **la lettre reste dans sa boîte** jusqu'à son retour.

C'est cette dernière phrase qui rend les messages si utiles : **l'expéditeur et le destinataire n'ont pas besoin d'être en marche en même temps.**

| Élément | Dans LearnHub |
| --- | --- |
| Exchange | `learnhub.events` (de type `topic`) |
| Clés de routage | `course.deleted`, `enrollment.created`, `enrollment.cancelled` |
| Files | `enrollment-service.course-deleted`, `notification-service.enrollment-created`, `notification-service.enrollment-cancelled` |

### 11.2 — Le code commun : messaging.js

Ce petit module est **identique** dans les 3 services qui utilisent RabbitMQ. Il fait trois choses : se connecter (avec plusieurs essais), publier un événement, écouter un événement.

`services/course-service/src/messaging.js` (à recopier dans `enrollment-service/src/` et `notification-service/src/`) :

```js
// services/course-service/src/messaging.js
const amqp = require('amqplib');
const { rabbitUrl } = require('./config');

const EXCHANGE = 'learnhub.events'; // le "centre de tri" des messages
let channel = null;

// Se connecte à RabbitMQ, avec plusieurs essais (RabbitMQ peut démarrer après le service)
async function connectRabbit(retries = 20) {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      connection.on('close', () => { channel = null; console.error('Connexion RabbitMQ perdue'); });
      connection.on('error', () => {});
      channel = await connection.createChannel();
      channel.on('error', (err) => console.error('Erreur du canal RabbitMQ', err.message));
      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      console.log('RabbitMQ connecté');
      return;
    } catch {
      console.log(`RabbitMQ pas encore prêt (${i}/${retries}), nouvel essai dans 3 s`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  throw new Error('RabbitMQ injoignable');
}

// Envoie un événement. Si RabbitMQ est absent, on le note mais on ne fait pas échouer la requête.
function publish(routingKey, payload) {
  if (!channel) {
    console.warn(`Événement ${routingKey} perdu : RabbitMQ non connecté`);
    return false;
  }
  try {
    channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log(`[événement envoyé] ${routingKey}`, payload);
    return true;
  } catch (err) {
    console.warn(`Événement ${routingKey} perdu : ${err.message}`);
    return false;
  }
}

// Écoute un type d'événement dans une file qui appartient à ce service
async function subscribe(queue, routingKey, handler) {
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, EXCHANGE, routingKey);
  channel.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      await handler(JSON.parse(msg.content.toString()));
      channel.ack(msg); // "bien reçu et traité" : RabbitMQ peut effacer le message
    } catch (err) {
      console.error(`Erreur de traitement de ${routingKey}`, err);
      channel.nack(msg, false, false); // message abandonné (voir l'exercice sur la file d'erreurs)
    }
  });
}

module.exports = { connectRabbit, publish, subscribe };
```

**À observer :**

- `publish` ne fait **pas échouer** la requête si RabbitMQ est absent : il écrit un avertissement et continue. Choix de conception : l'inscription réussit, mais la notification est perdue (voir l'expérience de panne n°4).
- `{ persistent: true }` et `durable: true` : les messages et les files **survivent** à un redémarrage de RabbitMQ.
- `channel.ack(msg)` : accusé de réception, **uniquement après** le traitement réussi.
- Ce fichier est **copié** dans 3 services. C'est une duplication. Dans un vrai projet, on en ferait une **bibliothèque partagée** (un paquet npm). Mais attention : une bibliothèque partagée **recrée un couplage** entre les services (si on la change, tous doivent être mis à jour). Il n'y a pas de solution parfaite.

## Partie 12 — Étape 4 : le user-service

| Qui fait cette partie ? |
| --- |
| Membre 1 (chef), sur `feature/user-service`. |

Ce service reprend le module `users.js` du TP4, **sans changement de logique**. Il possède une seule table : `users`. C'est **lui seul** qui fabrique les tokens JWT.

### 12.1 — package.json et configuration

`services/user-service/package.json` : pas de `mongoose` ni de `amqplib`, ce service n'en a pas besoin.

```json
{
  "name": "learnhub-user-service",
  "version": "1.0.0",
  "description": "Comptes, authentification, roles (PostgreSQL)",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon -L src/index.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

`services/user-service/src/config.js` :

```js
// services/user-service/src/config.js
module.exports = {
  port: process.env.PORT || 3001,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
};
```

### 12.2 — La base

`services/user-service/src/db/postgres.js` : **une seule table**. Comparez avec le TP4 : les tables `enrollments` et `completed_chapters` ont disparu d'ici.

```js
// services/user-service/src/db/postgres.js
const { Pool } = require('pg');
const { databaseUrl } = require('../config');

const pool = new Pool({ connectionString: databaseUrl });

// Ce service ne possède QU'UNE table : users. Les inscriptions ne sont plus ici.
async function initPostgres() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(100) NOT NULL,
      role          VARCHAR(20)  NOT NULL CHECK (role IN ('etudiant', 'formateur', 'admin')),
      created_at    TIMESTAMP DEFAULT NOW()
    )`);
}

module.exports = { pool, initPostgres };
```

### 12.3 — Les middlewares

Les deux fichiers ci-dessous sont **identiques dans les 4 services** (pas dans la gateway). Copiez-les ensuite dans les autres :

```
cp services/user-service/src/middleware/*.js services/course-service/src/middleware/
cp services/user-service/src/middleware/*.js services/enrollment-service/src/middleware/
cp services/user-service/src/middleware/*.js services/notification-service/src/middleware/
```

`services/user-service/src/middleware/asyncHandler.js` :

```js
// services/user-service/src/middleware/asyncHandler.js
// Express 4 n'attrape pas les erreurs des fonctions async : on les transmet nous-mêmes.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

`services/user-service/src/middleware/auth.js` : chaque service **vérifie lui-même** le token avec le secret partagé. Il n'a **jamais besoin d'appeler** le user-service pour savoir qui est connecté : tout est dans le token. On dit que le token est **sans état** (stateless).

```js
// services/user-service/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

// Chaque service vérifie lui-même le token : il connaît le secret partagé (JWT_SECRET).
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Connexion requise' });
  try {
    req.user = jwt.verify(token, jwtSecret); // { id, name, role }
    next();
  } catch {
    res.status(401).json({ error: 'Session expirée, reconnectez-vous' });
  }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Accès refusé' });

module.exports = { authenticate, requireRole };
```

### 12.4 — Les routes

`services/user-service/src/routes/users.js` :

```js
// services/user-service/src/routes/users.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/postgres');
const { jwtSecret } = require('../config');
const { authenticate, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// US01 - Créer un compte
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe sont obligatoires' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }
  if (!['etudiant', 'formateur'].includes(role)) {
    return res.status(400).json({ error: 'Le rôle doit être étudiant ou formateur' });
  }
  const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (exists.rows.length > 0) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé' });
  }
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hash, role]
  );
  res.status(201).json(rows[0]);
}));

// US02 - Se connecter : c'est CE service qui fabrique le token JWT
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  const ok = user && (await bcrypt.compare(password || '', user.password_hash));
  if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, jwtSecret, { expiresIn: '4h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}));

// US03 - Consulter son profil
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
  res.json(rows[0]);
}));

// US03 - Modifier son profil
router.put('/me', authenticate, asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nom et email sont obligatoires' });
  const other = await pool.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, req.user.id]);
  if (other.rows.length > 0) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre compte' });
  }
  const { rows } = await pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role',
    [name, email, req.user.id]
  );
  res.json(rows[0]);
}));

// US10 - Lister les utilisateurs (admin), filtre ?role=etudiant
router.get('/', authenticate, requireRole('admin'), asyncHandler(async (req, res) => {
  const { role } = req.query;
  const { rows } = role
    ? await pool.query('SELECT id, name, email, role FROM users WHERE role = $1 ORDER BY id', [role])
    : await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
  res.json(rows);
}));

module.exports = router;
```

`services/user-service/src/routes/internal.js` : une route réservée aux autres services (la gateway l'utilise pour le tableau de bord admin).

```js
// services/user-service/src/routes/internal.js
const router = require('express').Router();
const { pool } = require('../db/postgres');
const asyncHandler = require('../middleware/asyncHandler');

// Routes INTERNES : appelées par la gateway pour composer le tableau de bord admin.
// Elles ne sont pas exposées par la gateway, donc invisibles depuis le navigateur.
router.get('/stats', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT role, COUNT(*)::int AS n FROM users GROUP BY role');
  const byRole = { etudiant: 0, formateur: 0, admin: 0 };
  rows.forEach((r) => { byRole[r.role] = r.n; });
  res.json({ ...byRole, total: byRole.etudiant + byRole.formateur + byRole.admin });
}));

module.exports = router;
```

### 12.5 — Le point d'entrée

`services/user-service/src/index.js` : notez la route `/health` (pour vérifier que le service est en vie) et le montage de `/internal`.

```js
// services/user-service/src/index.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { port, adminEmail, adminPassword } = require('./config');
const { pool, initPostgres } = require('./db/postgres');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'user-service', status: 'ok' }));
app.use('/api/users', require('./routes/users'));
app.use('/internal', require('./routes/internal'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Erreur serveur' });
});

// Crée le compte administrateur au premier démarrage
async function seedAdmin() {
  if (!adminEmail || !adminPassword) return;
  const exists = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (exists.rows.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('Administrateur', $1, $2, 'admin')",
      [adminEmail, hash]
    );
    console.log('Compte admin créé :', adminEmail);
  }
}

async function start() {
  await initPostgres();
  console.log('PostgreSQL (users_db) connecté, table prête');
  await seedAdmin();
  app.listen(port, () => console.log(`user-service sur le port ${port}`));
}

start().catch((err) => {
  console.error('Démarrage impossible', err);
  process.exit(1);
});
```

**Ce qui a changé par rapport au monolithe :** plus de `express.json` partagé, plus de modules des autres domaines, plus de connexion MongoDB. Ce service est **plus petit et ne sait rien** des cours ni des inscriptions.

## Partie 13 — Étape 5 : le course-service

| Qui fait cette partie ? |
| --- |
| Membre 2, sur `feature/course-service`. |

Il reprend `courses.js` et le modèle `Course`. Deux différences importantes :

1. Le nom du formateur (`ownerName`) vient **du token**, plus d'une requête SQL sur les utilisateurs.
2. À la suppression d'un cours, il **publie un événement** au lieu d'émettre un événement en mémoire.

### 13.1 — package.json, configuration, modèle

`services/course-service/package.json` :

```json
{
  "name": "learnhub-course-service",
  "version": "1.0.0",
  "description": "Catalogue de cours et chapitres (MongoDB)",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon -L src/index.js"
  },
  "dependencies": {
    "amqplib": "^0.10.4",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

`services/course-service/src/config.js` :

```js
// services/course-service/src/config.js
module.exports = {
  port: process.env.PORT || 3002,
  mongoUrl: process.env.MONGO_URL,
  rabbitUrl: process.env.RABBITMQ_URL,
  jwtSecret: process.env.JWT_SECRET,
};
```

`services/course-service/src/models/Course.js` :

```js
// services/course-service/src/models/Course.js
const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General', trim: true },
    ownerId: { type: Number, required: true }, // id du formateur (il vit dans le user-service)
    ownerName: { type: String, default: '' }, // copie du nom : on n'appelle pas le user-service à chaque affichage
    chapters: [chapterSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
```

### 13.2 — Les routes publiques

`services/course-service/src/routes/courses.js` : repérez `publish('course.deleted', ...)` dans la route `DELETE`. **C'est la seule vraie différence** avec le monolithe. Avant : `events.emit(...)` (en mémoire, dans le même programme). Maintenant : `publish(...)` (un vrai message qui traverse le réseau).

```js
// services/course-service/src/routes/courses.js
const router = require('express').Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { publish } = require('../messaging');
const { authenticate, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// Charge le cours et vérifie que l'utilisateur connecté en est le propriétaire
const loadOwnedCourse = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'Cours introuvable' });
  }
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Cours introuvable' });
  if (course.ownerId !== req.user.id) {
    return res.status(403).json({ error: "Vous n'êtes pas le propriétaire de ce cours" });
  }
  req.course = course;
  next();
});

// US07 - Catalogue (public) : sans le contenu des chapitres, avec leur nombre
router.get('/', asyncHandler(async (req, res) => {
  const match = req.query.category ? { category: req.query.category } : {};
  const courses = await Course.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        title: 1, description: 1, category: 1, ownerId: 1, ownerName: 1, createdAt: 1,
        chaptersCount: { $size: '$chapters' },
      },
    },
  ]);
  res.json(courses);
}));

// Catégories existantes (filtres du catalogue)
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Course.distinct('category');
  res.json(categories.filter(Boolean).sort());
}));

// US07 - Détail d'un cours avec ses chapitres (public)
router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'Cours introuvable' });
  }
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Cours introuvable' });
  res.json(course);
}));

// US04 - Créer un cours (formateur uniquement)
// Le nom du formateur vient du token : plus besoin d'interroger la base des utilisateurs
router.post('/', authenticate, requireRole('formateur'), asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Titre et description sont obligatoires' });
  }
  const course = await Course.create({
    title, description, category, ownerId: req.user.id, ownerName: req.user.name,
  });
  res.status(201).json(course);
}));

// US05 - Modifier un cours (propriétaire uniquement)
router.put('/:id', authenticate, requireRole('formateur'), loadOwnedCourse, asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (title) req.course.title = title;
  if (description) req.course.description = description;
  if (category) req.course.category = category;
  await req.course.save();
  res.json(req.course);
}));

// US05 - Supprimer un cours : on PRÉVIENT les autres services par un événement
router.delete('/:id', authenticate, requireRole('formateur'), loadOwnedCourse, asyncHandler(async (req, res) => {
  const { _id, title } = req.course;
  await req.course.deleteOne();
  publish('course.deleted', { courseId: String(_id), title });
  res.json({ message: 'Cours supprimé' });
}));

// US06 - Ajouter un chapitre
router.post('/:id/chapters', authenticate, requireRole('formateur'), loadOwnedCourse, asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Titre et contenu du chapitre sont obligatoires' });
  }
  req.course.chapters.push({ title, content });
  await req.course.save();
  res.status(201).json(req.course);
}));

// Supprimer un chapitre
router.delete('/:id/chapters/:chapterId', authenticate, requireRole('formateur'), loadOwnedCourse, asyncHandler(async (req, res) => {
  const chapter = req.course.chapters.id(req.params.chapterId);
  if (!chapter) return res.status(404).json({ error: 'Chapitre introuvable' });
  chapter.deleteOne();
  await req.course.save();
  res.json(req.course);
}));

module.exports = router;
```

### 13.3 — Les routes internes

`services/course-service/src/routes/internal.js` : ces routes sont l'**interface réservée aux autres services**. Elles renvoient une version **légère** du cours (titres des chapitres, sans leur contenu), car l'enrollment-service n'a pas besoin du texte.

```js
// services/course-service/src/routes/internal.js
const router = require('express').Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

// Routes INTERNES : appelées par les AUTRES SERVICES (pas par le navigateur).
// Elles renvoient une version "légère" du cours : les titres des chapitres, sans leur contenu.
const toSummary = (c) => ({
  _id: String(c._id),
  title: c.title,
  category: c.category,
  ownerName: c.ownerName,
  chapters: c.chapters.map((ch) => ({ _id: String(ch._id), title: ch.title })),
});

// Plusieurs cours d'un coup : GET /internal/courses/batch?ids=a,b,c
router.get('/courses/batch', asyncHandler(async (req, res) => {
  const ids = String(req.query.ids || '').split(',').filter((id) => mongoose.isValidObjectId(id));
  const courses = await Course.find({ _id: { $in: ids } });
  res.json(courses.map(toSummary));
}));

// Un seul cours
router.get('/courses/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Cours introuvable' });
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Cours introuvable' });
  res.json(toSummary(course));
}));

// Chiffres pour les tableaux de bord : ?ownerId=3 (un formateur) ou sans paramètre (tous les cours)
router.get('/stats', asyncHandler(async (req, res) => {
  const filter = req.query.ownerId ? { ownerId: Number(req.query.ownerId) } : {};
  const courses = await Course.find(filter).select('chapters');
  res.json({
    courses: courses.length,
    chapters: courses.reduce((sum, c) => sum + c.chapters.length, 0),
    courseIds: courses.map((c) => String(c._id)),
  });
}));

module.exports = router;
```

### 13.4 — Le point d'entrée

```js
// services/course-service/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const { port, mongoUrl } = require('./config');
const { connectRabbit } = require('./messaging');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'course-service', status: 'ok' }));
app.use('/api/courses', require('./routes/courses'));
app.use('/internal', require('./routes/internal'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Erreur serveur' });
});

async function start() {
  await mongoose.connect(mongoUrl);
  console.log('MongoDB (courses_db) connecté');
  await connectRabbit();
  app.listen(port, () => console.log(`course-service sur le port ${port}`));
}

start().catch((err) => {
  console.error('Démarrage impossible', err);
  process.exit(1);
});
```

Rappel : copiez `messaging.js` (partie 11) dans le dossier `src/` du service. Notez qu'**il n'écoute aucun événement** : ce service ne fait qu'en envoyer.

## Partie 14 — Étape 6 : l'enrollment-service

| Qui fait cette partie ? |
| --- |
| Membre 3, sur `feature/enrollment-service`. |

C'est le service **le plus intéressant** : il utilise les trois moyens de communication. Il **appelle** le course-service (HTTP synchrone), il **envoie** des messages (`enrollment.created`) et il **écoute** des messages (`course.deleted`).

### 14.1 — package.json, configuration, base

`services/enrollment-service/package.json` :

```json
{
  "name": "learnhub-enrollment-service",
  "version": "1.0.0",
  "description": "Inscriptions et progression (PostgreSQL)",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon -L src/index.js"
  },
  "dependencies": {
    "amqplib": "^0.10.4",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

`services/enrollment-service/src/config.js` :

```js
// services/enrollment-service/src/config.js
module.exports = {
  port: process.env.PORT || 3003,
  databaseUrl: process.env.DATABASE_URL,
  rabbitUrl: process.env.RABBITMQ_URL,
  courseServiceUrl: process.env.COURSE_SERVICE_URL,
  jwtSecret: process.env.JWT_SECRET,
};
```

`services/enrollment-service/src/db/postgres.js` : **pas de clé étrangère** vers `users` ni vers les cours. Ces données sont dans d'autres bases.

```js
// services/enrollment-service/src/db/postgres.js
const { Pool } = require('pg');
const { databaseUrl } = require('../config');

const pool = new Pool({ connectionString: databaseUrl });

// user_id et course_id viennent d'AUTRES services (et d'autres bases) :
// aucune clé étrangère possible. On stocke seulement leur identifiant.
async function initPostgres() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL,
      course_id  VARCHAR(30) NOT NULL,
      progress   INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, course_id)
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS completed_chapters (
      enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
      chapter_id    VARCHAR(30) NOT NULL,
      PRIMARY KEY (enrollment_id, chapter_id)
    )`);
}

module.exports = { pool, initPostgres };
```

### 14.2 — Le client du course-service

`services/enrollment-service/src/courseClient.js` : le « téléphone » vers le course-service. Deux points importants : le **timeout** de 3 secondes (on n'attend pas indéfiniment) et l'erreur **503** claire si le service est en panne.

```js
// services/enrollment-service/src/courseClient.js
const { courseServiceUrl } = require('./config');

// Le "téléphone" vers le course-service : un appel HTTP SYNCHRONE.
// Si le course-service ne répond pas, on renvoie une erreur claire (503) au lieu de planter.
async function call(path) {
  let res;
  try {
    res = await fetch(courseServiceUrl + path, { signal: AbortSignal.timeout(3000) });
  } catch {
    const err = new Error('Le service des cours est momentanément indisponible');
    err.status = 503;
    throw err;
  }
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = new Error('Erreur du service des cours');
    err.status = 502;
    throw err;
  }
  return res.json();
}

module.exports = {
  getCourse: (id) => call(`/internal/courses/${id}`),
  getCourses: (ids) => call(`/internal/courses/batch?ids=${ids.join(',')}`),
};
```

### 14.3 — Les routes

`services/enrollment-service/src/routes/enrollments.js` : comparez avec le monolithe. `Course.findById(courseId)` est devenu `getCourse(courseId)`. Le code ressemble, mais ce n'est plus du tout la même chose : **avant**, une lecture dans une base ; **maintenant**, un **appel réseau** qui peut échouer.

```js
// services/enrollment-service/src/routes/enrollments.js
const router = require('express').Router();
const { pool } = require('../db/postgres');
const { getCourse, getCourses } = require('../courseClient');
const { publish } = require('../messaging');
const { authenticate, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// Recalcule le pourcentage de progression d'une inscription
async function updateProgress(enrollmentId, totalChapters) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS done FROM completed_chapters WHERE enrollment_id = $1',
    [enrollmentId]
  );
  const progress = totalChapters ? Math.round((rows[0].done * 100) / totalChapters) : 0;
  await pool.query('UPDATE enrollments SET progress = $1 WHERE id = $2', [progress, enrollmentId]);
  return progress;
}

// US08 - S'inscrire à un cours
router.post('/', authenticate, requireRole('etudiant'), asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  // Appel SYNCHRONE : on a besoin de la réponse tout de suite pour savoir si le cours existe
  const course = courseId ? await getCourse(courseId) : null;
  if (!course) return res.status(404).json({ error: 'Cours introuvable' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING id, course_id, progress',
      [req.user.id, courseId]
    );
    // US11 - Message ASYNCHRONE : on prévient les autres services puis on répond sans attendre
    publish('enrollment.created', { userId: req.user.id, courseId, courseTitle: course.title });
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Vous êtes déjà inscrit à ce cours' });
    }
    throw err;
  }
}));

// US09 - Mes cours avec ma progression
router.get('/mine', authenticate, requireRole('etudiant'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, course_id, progress FROM enrollments WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  if (rows.length === 0) return res.json([]);
  // Les titres des cours ne sont pas dans NOTRE base : on les demande au course-service
  const courses = await getCourses(rows.map((r) => r.course_id));
  const done = await pool.query(
    'SELECT enrollment_id, chapter_id FROM completed_chapters WHERE enrollment_id = ANY($1::int[])',
    [rows.map((r) => r.id)]
  );
  res.json(rows.map((enr) => {
    const course = courses.find((c) => c._id === enr.course_id);
    const doneIds = done.rows.filter((d) => d.enrollment_id === enr.id).map((d) => d.chapter_id);
    return {
      enrollmentId: enr.id,
      courseId: enr.course_id,
      title: course ? course.title : '(cours supprimé)',
      category: course ? course.category : '',
      ownerName: course ? course.ownerName : '',
      progress: enr.progress,
      chapters: course
        ? course.chapters.map((ch) => ({ id: ch._id, title: ch.title, done: doneIds.includes(ch._id) }))
        : [],
    };
  }));
}));

// US09 - Marquer un chapitre comme terminé
router.post('/:courseId/chapters/:chapterId/complete', authenticate, requireRole('etudiant'), asyncHandler(async (req, res) => {
  const { courseId, chapterId } = req.params;
  const enr = await pool.query('SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2', [req.user.id, courseId]);
  if (!enr.rows[0]) return res.status(404).json({ error: "Vous n'êtes pas inscrit à ce cours" });
  const course = await getCourse(courseId);
  if (!course || !course.chapters.some((ch) => ch._id === chapterId)) {
    return res.status(404).json({ error: 'Chapitre introuvable' });
  }
  await pool.query(
    'INSERT INTO completed_chapters (enrollment_id, chapter_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [enr.rows[0].id, chapterId]
  );
  const progress = await updateProgress(enr.rows[0].id, course.chapters.length);
  res.json({ progress });
}));

module.exports = router;
```

`services/enrollment-service/src/routes/internal.js` :

```js
// services/enrollment-service/src/routes/internal.js
const router = require('express').Router();
const { pool } = require('../db/postgres');
const asyncHandler = require('../middleware/asyncHandler');

// Routes INTERNES pour les tableaux de bord (appelées par la gateway)
//   ?userId=3          -> chiffres d'un étudiant
//   ?courseIds=a,b     -> nombre d'étudiants distincts inscrits à ces cours (formateur)
//   (aucun paramètre)  -> nombre total d'inscriptions (admin)
router.get('/stats', asyncHandler(async (req, res) => {
  if (req.query.userId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS enrolled,
              COUNT(*) FILTER (WHERE progress = 100)::int AS completed,
              COALESCE(ROUND(AVG(progress)), 0)::int AS average
       FROM enrollments WHERE user_id = $1`,
      [Number(req.query.userId)]
    );
    return res.json(rows[0]);
  }
  if (req.query.courseIds !== undefined) {
    const ids = String(req.query.courseIds).split(',').filter(Boolean);
    const { rows } = await pool.query(
      'SELECT COUNT(DISTINCT user_id)::int AS students FROM enrollments WHERE course_id = ANY($1::text[])',
      [ids]
    );
    return res.json(rows[0]);
  }
  const { rows } = await pool.query('SELECT COUNT(*)::int AS enrollments FROM enrollments');
  res.json(rows[0]);
}));

module.exports = router;
```

### 14.4 — L'écoute des événements

`services/enrollment-service/src/consumers.js` : quand un cours est supprimé, ce service nettoie **sa propre base** (il ne laisse pas le course-service le faire à sa place), puis annonce `enrollment.cancelled` pour chaque étudiant touché. Remarquez `DELETE ... RETURNING user_id` : une seule requête supprime et renvoie la liste des étudiants.

```js
// services/enrollment-service/src/consumers.js
const { pool } = require('./db/postgres');
const { publish, subscribe } = require('./messaging');

// Ce service ÉCOUTE les événements des autres services.
async function startConsumers() {
  // Quand le course-service annonce "un cours a été supprimé",
  // on supprime les inscriptions correspondantes et on prévient chaque étudiant concerné.
  await subscribe('enrollment-service.course-deleted', 'course.deleted', async ({ courseId, title }) => {
    const { rows } = await pool.query('DELETE FROM enrollments WHERE course_id = $1 RETURNING user_id', [courseId]);
    rows.forEach((r) => publish('enrollment.cancelled', { userId: r.user_id, courseTitle: title }));
  });
}

module.exports = { startConsumers };
```

### 14.5 — Le point d'entrée

```js
// services/enrollment-service/src/index.js
const express = require('express');
const { port } = require('./config');
const { initPostgres } = require('./db/postgres');
const { connectRabbit } = require('./messaging');
const { startConsumers } = require('./consumers');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'enrollment-service', status: 'ok' }));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/internal', require('./routes/internal'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

async function start() {
  await initPostgres();
  console.log('PostgreSQL (enrollments_db) connecté, tables prêtes');
  await connectRabbit();
  await startConsumers();
  app.listen(port, () => console.log(`enrollment-service sur le port ${port}`));
}

start().catch((err) => {
  console.error('Démarrage impossible', err);
  process.exit(1);
});
```

Notez que le gestionnaire d'erreurs transforme les erreurs avec un `status` (503 du course-service) en réponse claire pour le client.

## Partie 15 — Étape 7 : le notification-service

| Qui fait cette partie ? |
| --- |
| Membre 4 (ou membre 3 dans un groupe de 3), sur `feature/notification-service`. |

Le plus **simple** des services, et le plus **indépendant** : il ne répond à aucune requête d'un autre service, il **écoute** seulement. Au TP4, il lisait la table des inscriptions : maintenant il n'en a plus besoin, **le message contient tout ce qu'il lui faut** (`userId`, `courseTitle`).

`services/notification-service/package.json` :

```json
{
  "name": "learnhub-notification-service",
  "version": "1.0.0",
  "description": "Notifications asynchrones (MongoDB)",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon -L src/index.js"
  },
  "dependencies": {
    "amqplib": "^0.10.4",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

`services/notification-service/src/config.js` :

```js
// services/notification-service/src/config.js
module.exports = {
  port: process.env.PORT || 3004,
  mongoUrl: process.env.MONGO_URL,
  rabbitUrl: process.env.RABBITMQ_URL,
  jwtSecret: process.env.JWT_SECRET,
};
```

`services/notification-service/src/models/Notification.js` :

```js
// services/notification-service/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
```

`services/notification-service/src/consumers.js` : deux écoutes, une par type de message.

```js
// services/notification-service/src/consumers.js
const Notification = require('./models/Notification');
const { subscribe } = require('./messaging');

// Ce service ne répond à AUCUNE requête d'un autre service : il écoute seulement des événements.
async function startConsumers() {
  // US11 - Confirmation après une inscription
  await subscribe('notification-service.enrollment-created', 'enrollment.created', async ({ userId, courseTitle }) => {
    const message = `Inscription confirmée au cours : ${courseTitle}`;
    await Notification.create({ userId, type: 'inscription', message });
    console.log(`[NOTIFICATION] utilisateur ${userId} : ${message}`);
  });

  // US05 - Prévenir un étudiant dont le cours a été supprimé
  await subscribe('notification-service.enrollment-cancelled', 'enrollment.cancelled', async ({ userId, courseTitle }) => {
    const message = `Le cours "${courseTitle}" a été supprimé par son formateur`;
    await Notification.create({ userId, type: 'cours_supprime', message });
    console.log(`[NOTIFICATION] utilisateur ${userId} : ${message}`);
  });
}

module.exports = { startConsumers };
```

`services/notification-service/src/routes/notifications.js` :

```js
// services/notification-service/src/routes/notifications.js
const router = require('express').Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// Mes notifications
router.get('/mine', authenticate, asyncHandler(async (req, res) => {
  const list = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(list);
}));

module.exports = router;
```

`services/notification-service/src/routes/internal.js` :

```js
// services/notification-service/src/routes/internal.js
const router = require('express').Router();
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

// Route INTERNE pour le tableau de bord étudiant : nombre de notifications
router.get('/stats', asyncHandler(async (req, res) => {
  const notifications = await Notification.countDocuments({ userId: Number(req.query.userId) });
  res.json({ notifications });
}));

module.exports = router;
```

`services/notification-service/src/index.js` :

```js
// services/notification-service/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const { port, mongoUrl } = require('./config');
const { connectRabbit } = require('./messaging');
const { startConsumers } = require('./consumers');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'notification-service', status: 'ok' }));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/internal', require('./routes/internal'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

async function start() {
  await mongoose.connect(mongoUrl);
  console.log('MongoDB (notifications_db) connecté');
  await connectRabbit();
  await startConsumers();
  app.listen(port, () => console.log(`notification-service sur le port ${port}`));
}

start().catch((err) => {
  console.error('Démarrage impossible', err);
  process.exit(1);
});
```

## Partie 16 — Étape 8 : la gateway

| Qui fait cette partie ? |
| --- |
| Membre 3, sur `feature/gateway`. |

### 16.1 — Pourquoi une gateway ?

Sans gateway, le frontend devrait connaître **4 adresses** (une par service), gérer 4 problèmes de CORS, et changer son code à chaque déplacement d'un service. Avec la gateway :

- le frontend garde **une seule adresse** (`http://localhost:5000/api`), exactement comme avant ;
- on peut **déplacer** un service sans toucher au frontend ;
- les routes `/internal/...` restent **cachées** ;
- on a **un point central** pour ajouter plus tard de la sécurité, des limites de débit, des journaux.

**Ce que la gateway ne fait pas (dans ce TP) :** elle ne vérifie pas les tokens (chaque service le fait). Elle ne lit pas le contenu des requêtes : elle les **transmet**. C'est pourquoi on n'y met **pas** `express.json()`.

### 16.2 — package.json et configuration

`gateway/package.json` : la bibliothèque `http-proxy-middleware` fait le gros du travail.

```json
{
  "name": "learnhub-gateway",
  "version": "1.0.0",
  "description": "Porte d entree unique de LearnHub",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon -L src/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "http-proxy-middleware": "^3.0.0",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

`gateway/src/config.js` :

```js
// gateway/src/config.js
module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  urls: {
    user: process.env.USER_SERVICE_URL,
    course: process.env.COURSE_SERVICE_URL,
    enrollment: process.env.ENROLLMENT_SERVICE_URL,
    notification: process.env.NOTIFICATION_SERVICE_URL,
  },
};
```

### 16.3 — La composition du tableau de bord

`gateway/src/stats.js` : au TP4, une seule fonction lisait les deux bases. Ici, la gateway **interroge plusieurs services** et assemble. Remarquez deux choses : `Promise.all` lance les appels **en parallèle**, et pour l'étudiant, si le notification-service est en panne, on affiche **0 notification** au lieu de tout faire échouer (**dégradation gracieuse**).

```js
// gateway/src/stats.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { jwtSecret, urls } = require('./config');

// Appel HTTP simple vers un service, avec un délai maximum
async function get(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) throw new Error(`${url} a répondu ${res.status}`);
  return res.json();
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Connexion requise' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Session expirée, reconnectez-vous' });
  }
}

// COMPOSITION D'API : dans le monolithe, une seule fonction lisait les deux bases.
// Ici, les données sont dans plusieurs services : la gateway les interroge et assemble la réponse.
router.get('/me', authenticate, async (req, res) => {
  const { id, role } = req.user;
  try {
    if (role === 'etudiant') {
      const [enrollments, notifications] = await Promise.all([
        get(`${urls.enrollment}/internal/stats?userId=${id}`),
        // Si le service des notifications est en panne, le tableau de bord s'affiche quand même (0 notification)
        get(`${urls.notification}/internal/stats?userId=${id}`).catch(() => ({ notifications: 0 })),
      ]);
      return res.json({ role, ...enrollments, ...notifications });
    }

    if (role === 'formateur') {
      const courses = await get(`${urls.course}/internal/stats?ownerId=${id}`);
      const enrollments = await get(`${urls.enrollment}/internal/stats?courseIds=${courses.courseIds.join(',')}`);
      return res.json({ role, courses: courses.courses, chapters: courses.chapters, students: enrollments.students });
    }

    // admin
    const [users, courses, enrollments] = await Promise.all([
      get(`${urls.user}/internal/stats`),
      get(`${urls.course}/internal/stats`),
      get(`${urls.enrollment}/internal/stats`),
    ]);
    res.json({
      role,
      users: users.total,
      students: users.etudiant,
      teachers: users.formateur,
      courses: courses.courses,
      enrollments: enrollments.enrollments,
    });
  } catch (err) {
    console.error('Composition des statistiques impossible :', err.message);
    res.status(503).json({ error: 'Un service est momentanément indisponible' });
  }
});

module.exports = router;
```

### 16.4 — La table de routage

`gateway/src/index.js` : une ligne par service. La route `/api/health` interroge chaque service : elle est très utile pour voir d'un coup qui est en vie.

```js
// gateway/src/index.js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { port, urls } = require('./config');

const app = express();
app.use(cors());
// IMPORTANT : pas de express.json() ici. La gateway ne lit pas les corps de requête,
// elle les fait simplement passer vers le bon service.

// Transmet toutes les requêtes dont l'adresse commence par "path" vers le service "target"
function route(path, target) {
  return createProxyMiddleware({
    pathFilter: path,
    target,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error(`Service injoignable (${target}) :`, err.message);
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Service momentanément indisponible' }));
      },
    },
  });
}

// Vérifie quels services répondent : http://localhost:5000/api/health
app.get('/api/health', async (req, res) => {
  const services = {};
  await Promise.all(
    Object.entries(urls).map(async ([name, url]) => {
      try {
        const r = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
        services[name] = r.ok ? 'ok' : 'erreur';
      } catch {
        services[name] = 'injoignable';
      }
    })
  );
  res.json({ gateway: 'ok', services });
});

// Les statistiques sont COMPOSÉES par la gateway (voir stats.js)
app.use('/api/stats', require('./stats'));

// Table de routage : quelle adresse va vers quel service
app.use(route('/api/users', urls.user));
app.use(route('/api/courses', urls.course));
app.use(route('/api/enrollments', urls.enrollment));
app.use(route('/api/notifications', urls.notification));

// Les routes /internal/... ne sont PAS dans cette table : elles restent invisibles de l'extérieur.
app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

app.listen(port, () => console.log(`gateway sur le port ${port}`));
```

## Partie 17 — Étape 9 : le frontend (il ne change pas)

**Aucune modification.** C'est la preuve que le découpage est réussi : le frontend du TP4 marche tel quel.

- `VITE_API_URL` reste `http://localhost:5000/api` : avant c'était l'adresse du monolithe, maintenant c'est celle de la **gateway**.
- Les réponses ont **le même format** qu'avant (`/enrollments/mine`, `/stats/me`...).
- Vérifiez avec Git : `git status` ne doit lister **aucun fichier** dans `frontend/`.

**Réfléchissez :** si vous aviez directement appelé les 4 services depuis le frontend, combien de fichiers auraient changé ?

## Partie 18 — Étape 10 : lancer et tester

### 18.1 — Démarrer

Arrêtez d'abord le monolithe du TP4 s'il tourne. Puis, depuis la racine :

```
docker compose up --build
```

La première fois, c'est **long** (téléchargement de 6 images, installation des dépendances de 5 programmes). Attendez ces lignes (l'ordre peut varier) :

```
user-service          | PostgreSQL (users_db) connecté, table prête
user-service          | Compte admin créé : admin@learnhub.local
user-service          | user-service sur le port 3001
course-service        | MongoDB (courses_db) connecté
course-service        | RabbitMQ connecté
course-service        | course-service sur le port 3002
enrollment-service    | RabbitMQ connecté
enrollment-service    | enrollment-service sur le port 3003
notification-service  | RabbitMQ connecté
notification-service  | notification-service sur le port 3004
gateway               | gateway sur le port 5000
```

Vérifiez :

| Adresse | Ce que vous devez voir |
| --- | --- |
| http://localhost:5000/api/health | `{"gateway":"ok","services":{"user":"ok","course":"ok","enrollment":"ok","notification":"ok"}}` |
| http://localhost:5173 | Le catalogue LearnHub, **identique** au TP4 |
| http://localhost:15672 | L'interface de RabbitMQ (identifiants du `.env`). Onglet **Queues** : vous devez voir les 3 files. |

```
docker compose ps
```

Vous devez compter **11 conteneurs** en cours d'exécution.

### 18.2 — Rejouer le scénario du TP4

Refaites **exactement** le scénario de test du TP4 (partie 11.2 du TP4) : formateur, cours, chapitres, étudiant, inscription, notification, progression, admin, suppression. **Tout doit marcher comme avant.** Si une étape échoue, regardez la partie 23.

### 18.3 — Observer les messages en direct

Ouvrez un terminal et suivez les trois services concernés :

```
docker compose logs -f course-service enrollment-service notification-service
```

Dans le navigateur, **inscrivez un étudiant** à un cours. Vous devez voir, dans cet ordre :

```
enrollment-service    | [événement envoyé] enrollment.created { userId: 2, courseId: '...', courseTitle: 'Git' }
notification-service  | [NOTIFICATION] utilisateur 2 : Inscription confirmée au cours : Git
```

Puis **supprimez le cours** avec le compte formateur. Vous voyez la chaîne :

```
course-service        | [événement envoyé] course.deleted { courseId: '...', title: 'Git' }
enrollment-service    | [événement envoyé] enrollment.cancelled { userId: 2, courseTitle: 'Git' }
notification-service  | [NOTIFICATION] utilisateur 2 : Le cours "Git" a été supprimé par son formateur
```

**C'est la chorégraphie des services** : chacun réagit à ce qu'il entend, personne ne dirige.

### 18.4 — Vérifier l'isolation des services

**Les services ne sont pas joignables depuis l'extérieur :**

```
curl http://localhost:3002/health
```

Résultat attendu : **échec de connexion**. Le course-service n'a aucun port ouvert. En revanche, depuis **un autre conteneur** du réseau Docker :

```
docker compose exec enrollment-service wget -qO- http://course-service:3002/health
```

Cette commande répond `{"service":"course-service","status":"ok"}`.

**Les routes internes ne sont pas exposées par la gateway :**

```
curl http://localhost:5000/internal/stats
```

Résultat attendu : `404 Route introuvable`.

**Chaque base ne contient que ses données :**

```
docker compose exec postgres-users psql -U learnhub -d users_db -c '\dt'
docker compose exec postgres-enrollments psql -U learnhub -d enrollments_db -c '\dt'
docker compose exec mongo-courses mongosh courses_db --quiet --eval 'db.getCollectionNames()'
docker compose exec mongo-notifications mongosh notifications_db --quiet --eval 'db.getCollectionNames()'
```

Remplacez `learnhub` par la valeur de `POSTGRES_USER` si vous l'avez changée. Vous devez voir : `users` seulement dans la première, `enrollments` et `completed_chapters` dans la deuxième, `courses` dans la troisième, `notifications` dans la quatrième. **Aucune base ne contient les données d'un autre domaine.**

## Partie 19 — Les expériences de panne

C'est **la partie la plus importante du TP**. Vous allez casser l'application exprès, pour comprendre ce qu'apporte (et coûte) l'architecture. Pour chaque expérience : faites l'action, **observez**, **notez** le résultat dans le tableau de la partie 21, puis remettez tout en marche.

Remettre un service en marche : `docker compose start NOM_DU_SERVICE`.

### Expérience 1 — Le notification-service tombe

```
docker compose stop notification-service
```

1. Connectez-vous en étudiant et **inscrivez-vous à un cours**. Est-ce que ça marche ?
2. Ouvrez http://localhost:15672, onglet **Queues** : la file `notification-service.enrollment-created` contient un message en attente (colonne **Ready**).
3. Allez sur le **tableau de bord** étudiant : il s'affiche, avec **0 notification**.
4. Redémarrez : `docker compose start notification-service`. Rafraîchissez les notifications de l'étudiant : **la notification est arrivée**, avec du retard.

**Ce que ça montre :** une panne du notification-service **n'empêche pas** les inscriptions. Le message **attend** dans la file. Au TP4, un plantage du module notifications arrêtait tout le programme.

### Expérience 2 — Le course-service tombe

```
docker compose stop course-service
```

1. Ouvrez le **catalogue** : que voyez-vous ?
2. Connectez-vous (compte existant) : est-ce que ça marche ?
3. En étudiant, essayez de **vous inscrire** à un cours : quel message d'erreur ?
4. Ouvrez le **tableau de bord** étudiant, puis celui du formateur : lequel marche ?

**Ce que ça montre :** une panne **partielle**. Ce qui dépend des cours s'arrête, mais la **connexion** continue de marcher, ainsi que le tableau de bord étudiant. L'erreur est un message clair (503), pas un plantage.

### Expérience 3 — Le user-service tombe

```
docker compose stop user-service
```

1. Essayez de **vous connecter** : que se passe-t-il ?
2. Si vous étiez **déjà connecté** avant la panne, naviguez : catalogue, mes cours, progression. Est-ce que ça marche ?

**Ce que ça montre :** les nouvelles connexions échouent, mais **les utilisateurs déjà connectés continuent**, car chaque service vérifie le token tout seul, sans appeler le user-service. C'est l'avantage d'un token **sans état**.

### Expérience 4 — RabbitMQ tombe

```
docker compose stop rabbitmq
```

1. En étudiant, **inscrivez-vous à un cours**. Est-ce que ça marche ?
2. Regardez les logs : `docker compose logs --tail 20 enrollment-service`. Que voyez-vous ?
3. Redémarrez RabbitMQ : `docker compose start rabbitmq`. La notification est-elle arrivée ?
4. Redémarrez les trois services concernés : `docker compose restart course-service enrollment-service notification-service`.

**Ce que ça montre :** l'inscription **réussit**, mais l'événement est **perdu** (« Événement ... perdu : RabbitMQ non connecté »). La notification n'arrivera jamais : on a choisi la **disponibilité** plutôt que la **cohérence**. Et après le retour de RabbitMQ, les services **ne se reconnectent pas tout seuls** : c'est un défaut volontaire, à corriger en exercice.

### Expérience 5 — Le plantage du monolithe, pour comparer

Si vous avez encore le tag `v1-monolithe` : `git stash`, `git switch --detach v1-monolithe`, `docker compose up --build`. Ajoutez `throw new Error('plantage')` au début du listener de `notifications.js`, observez, puis revenez : `git switch feature/microservices-base`. *(Facultatif, pour les plus rapides.)*

## Partie 20 — Référence : routes publiques

Toutes ces routes passent par la gateway (`http://localhost:5000`). Elles sont **les mêmes qu'au TP4**.

| Méthode | Route | Service | Accès |
| --- | --- | --- | --- |
| GET | `/api/health` | gateway | Public |
| POST | `/api/users/register` | user-service | Public |
| POST | `/api/users/login` | user-service | Public |
| GET, PUT | `/api/users/me` | user-service | Connecté |
| GET | `/api/users?role=` | user-service | Admin |
| GET | `/api/courses?category=` | course-service | Public |
| GET | `/api/courses/categories` | course-service | Public |
| GET | `/api/courses/:id` | course-service | Public |
| POST | `/api/courses` | course-service | Formateur |
| PUT, DELETE | `/api/courses/:id` | course-service | Propriétaire |
| POST | `/api/courses/:id/chapters` | course-service | Propriétaire |
| DELETE | `/api/courses/:id/chapters/:chapterId` | course-service | Propriétaire |
| POST | `/api/enrollments` | enrollment-service | Étudiant |
| GET | `/api/enrollments/mine` | enrollment-service | Étudiant |
| POST | `/api/enrollments/:courseId/chapters/:chapterId/complete` | enrollment-service | Étudiant |
| GET | `/api/notifications/mine` | notification-service | Connecté |
| GET | `/api/stats/me` | gateway (composition) | Connecté |

## Partie 21 — Travail demandé et livrables

### 21.1 — Tableau d'observation des pannes

Remplissez-le **avec ce que vous avez réellement vu**, pas avec ce que vous pensez qu'il faut répondre.

| Expérience | Ce qui a continué de marcher | Ce qui s'est arrêté | Message d'erreur ou comportement observé |
| --- | --- | --- | --- |
| 1 — notification-service arrêté | | | |
| 2 — course-service arrêté | | | |
| 3 — user-service arrêté | | | |
| 4 — RabbitMQ arrêté | | | |

### 21.2 — Questions de compréhension

| Question | Votre réponse |
| --- | --- |
| Expliquez la différence entre un monolithe et des microservices avec **vos propres mots** (ou avec une autre comparaison que le restaurant). | |
| Dans LearnHub, un étudiant s'inscrit à un cours. Quelle partie de l'opération est **synchrone** et laquelle est **asynchrone** ? Pourquoi ce choix ? | |
| Pourquoi la notification peut-elle arriver **après** la réponse « inscription réussie » ? Est-ce un problème ? | |
| Que veut dire « une base par service » ? Que se passerait-il si le user-service et l'enrollment-service partageaient la même base ? | |
| Pourquoi n'y a-t-il plus de clé étrangère entre `enrollments.user_id` et `users` ? Quel risque cela crée-t-il ? | |
| Pourquoi la gateway ne contient-elle pas `express.json()` ? | |
| Pourquoi les routes `/internal/...` ne sont-elles pas accessibles depuis le navigateur ? Que faudrait-il faire en production pour les protéger encore mieux ? | |
| Le frontend n'a pas changé. Quel élément de l'architecture l'a permis ? | |
| Citez **deux** choses plus **difficiles** avec les microservices qu'avec le monolithe, observées dans ce TP. | |
| Votre groupe créerait-il LearnHub en microservices pour un vrai client avec 2 développeurs ? Argumentez. | |

### 21.3 — Exercices d'amélioration

Pour chaque exercice : une **branche**, une **pull request** relue.

| N° | Exercice | Niveau |
| --- | --- | --- |
| 1 | **Reconnexion automatique** à RabbitMQ : quand la connexion se ferme, retenter de se connecter et de se réabonner (`messaging.js`). | Moyen |
| 2 | **File d'erreurs** (dead-letter queue) : au lieu d'abandonner un message qui échoue (`nack`), l'envoyer vers une file `*.dead` pour l'examiner. | Difficile |
| 3 | Ajouter une route `/health` plus complète : le service vérifie aussi **sa base** (`SELECT 1`) et répond 503 si elle est injoignable. | Facile |
| 4 | **Protéger les routes internes** : exiger un en-tête `X-Internal-Key` (une clé dans `.env`) sur toutes les routes `/internal/...`. | Moyen |
| 5 | Ajouter un **service de journalisation** qui écoute **tous** les événements (`#` comme clé de routage) et les enregistre dans un fichier. Aucun autre service ne doit changer. | Moyen |
| 6 | Ajouter la **désinscription** (`DELETE /api/enrollments/:courseId`) avec un événement `enrollment.removed`. | Moyen |
| 7 | **Sécurité** : le contenu des chapitres est renvoyé à tout visiteur. Le réserver aux étudiants inscrits (indice : le course-service doit demander à l'enrollment-service, ou recevoir l'information dans un événement). Quel est le coût de chaque solution ? | Difficile |
| 8 | Écrire un test automatique qui démarre l'application et vérifie le scénario d'inscription de bout en bout. | Difficile |

### 21.4 — Livrable

**Le dépôt GitHub du groupe** doit contenir, sur main :

- le tag **`v1-monolithe`** sur le dernier commit du TP4 ;
- la structure de la partie 8, **sans dossier `backend/`** ;
- un projet qui démarre avec `cp .env.example .env` puis `docker compose up --build`, **11 conteneurs** en marche ;
- aucun `.env`, aucun `node_modules` ;
- toutes les modifications arrivées par **pull request relue** (au moins une par membre, avec relecteur différent) ;
- un `README.md` racine à jour : description, commande de lancement, schéma de l'architecture, rôle de chaque membre.

**Chaque apprenant rend** un document `NOM_Prenom_TP5` avec :

- une capture de `docker compose ps` (11 conteneurs) ;
- une capture de `http://localhost:5000/api/health` ;
- une capture de l'interface RabbitMQ (onglet Queues), avec **au moins un message en attente** pendant l'expérience 1 ;
- les logs montrant la **chaîne d'événements** de suppression d'un cours (partie 18.3) ;
- le **tableau d'observation des pannes** rempli ;
- les réponses aux questions de compréhension ;
- votre **pull request approuvée**.

### 21.5 — Barème

| Critère | Points |
| --- | --- |
| Le projet démarre en une commande, 11 conteneurs, sans secret dans le dépôt | 3 |
| Les 11 user stories marchent à l'identique du TP4 (frontend inchangé) | 4 |
| Découpage correct : une base par service, aucun service ne lit la base d'un autre | 3 |
| Communication : appel synchrone, messages asynchrones, composition d'API | 3 |
| Expériences de panne : tableau rempli avec des observations justes | 3 |
| Travail Git : tag, branches, PR relues, messages de commit | 2 |
| Questions de compréhension (dont la comparaison monolithe / microservices) | 2 |
| **Total** | **20** |

## Partie 22 — Bilan : monolithe contre microservices

### 22.1 — Ce que vous venez de constater

| | Monolithe (TP4) | Microservices (TP5) | Verdict |
| --- | --- | --- | --- |
| Fonctionnalités pour l'utilisateur | 11 user stories | Les mêmes 11 | **Égalité** |
| Frontend | — | Inchangé | **Égalité** |
| Conteneurs à lancer | 4 | 11 | Monolithe plus léger |
| Programmes à écrire et à comprendre | 1 | 5 + RabbitMQ | Monolithe plus simple |
| Panne du module notifications | Tout s'arrête | Seules les notifications sont touchées | **Microservices** |
| Panne du module cours | Tout s'arrête | Les connexions et une partie du tableau de bord continuent | **Microservices** |
| Changer un seul service | Redéployer tout | Redéployer un service | **Microservices** |
| Appeler un autre domaine | Un appel de fonction | Un appel réseau (timeout, 503...) | Monolithe plus fiable |
| Cohérence des données | Une transaction | Messages, délais, données copiées | Monolithe plus simple |
| Comprendre une erreur | Un seul journal | Suivre la requête dans 3 journaux | Monolithe plus simple |
| Travailler à 4 sans conflits | Conflits fréquents | Chacun son dossier | **Microservices** |

**Conclusion honnête :** pour **11 user stories et 4 personnes**, le monolithe était plus simple, plus léger et plus rapide à écrire. Les microservices ont apporté **de la résilience, de l'indépendance et un travail d'équipe plus fluide**, au prix de **beaucoup plus de complexité**. L'intérêt croît avec la taille de l'équipe et du produit.

### 22.2 — Les pièges classiques

| Piège | Description | Comment l'éviter |
| --- | --- | --- |
| **Monolithe distribué** | Des services qui partagent une base ou qui s'appellent tous les uns les autres pour chaque requête. Tous les défauts des deux mondes. | Une base par service ; préférer les événements aux appels en chaîne. |
| **Services trop petits** | Un service par table ou par fonction. On passe plus de temps à gérer le réseau qu'à développer. | Découper par **domaine métier**, pas par fonction technique. |
| **Appels en cascade** | A appelle B qui appelle C qui appelle D : si D est lent, tout est lent. | Limiter la profondeur, utiliser des timeouts, des messages. |
| **Tout rendre synchrone** | Faire attendre l'utilisateur pour des choses qui n'en ont pas besoin (comme la notification). | Message asynchrone quand la réponse n'est pas indispensable tout de suite. |
| **Oublier la supervision** | Impossible de trouver une panne dans 10 services sans journaux centralisés. | Journaux centralisés, supervision, traçage (sujet du Sprint 4). |
| **Casser le contrat** | Un service change le format d'un message ou d'une route, un autre plante. | Contrats écrits (partie 6), versions, relecture des PR. |

### 22.3 — Ce qui vient ensuite

Ce TP a laissé volontairement des **points faibles**, que les prochains sprints traitent :

- le secret JWT est **partagé** par tous les services (sécurité) ;
- les routes internes ne sont **pas authentifiées** (sécurité) ;
- les services ne se **reconnectent pas** seuls à RabbitMQ (résilience) ;
- tout tourne sur **votre PC** avec Docker Compose : le déploiement réel (Kubernetes, CI/CD) est le sujet du Sprint 3 ;
- on ne **voit** pas ce qui se passe à l'intérieur (monitoring, tests automatisés) : Sprint 4.

## Partie 23 — Problèmes fréquents

| Problème | Cause probable | Solution |
| --- | --- | --- |
| La machine ralentit, des conteneurs s'arrêtent seuls | Pas assez de mémoire pour 11 conteneurs | Docker Desktop, Settings, Resources : au moins 4 Go ; fermer les autres applications |
| `port is already allocated` (5000, 5173 ou 15672) | Le monolithe du TP4 tourne encore | Dans le dossier du TP4 : `docker compose down` |
| `The "RABBITMQ_USER" variable is not set` | Le `.env` n'a pas la nouvelle variable | Recopier `.env.example` en `.env` et le compléter |
| Services bloqués sur « RabbitMQ pas encore prêt (n/20) » | RabbitMQ démarre lentement | Patienter 30 secondes ; si ça dépasse : `docker compose logs rabbitmq` |
| `RabbitMQ injoignable` puis arrêt du service | Mauvais mot de passe RabbitMQ (volume ancien) | `docker compose down -v` puis `docker compose up --build` |
| `password authentication failed` | Mot de passe de base changé après la première création | `docker compose down -v` puis relancer |
| La gateway répond `503 Service momentanément indisponible` | Le service ciblé n'est pas démarré ou a planté | `docker compose ps` puis `docker compose logs NOM_DU_SERVICE` |
| `/api/health` montre un service `injoignable` | Le service est arrêté ou plante au démarrage | `docker compose logs NOM_DU_SERVICE` |
| `getaddrinfo ENOTFOUND course-service` | Mauvais nom de service dans une adresse | Vérifier `COURSE_SERVICE_URL` dans `docker-compose.yml` : c'est le **nom du service** |
| `Cannot find module 'amqplib'` | `package.json` du service incomplet | Ajouter la dépendance, puis `docker compose up --build` |
| Inscription → `Cours introuvable` alors que le cours existe | Appel du enrollment-service vers le course-service impossible (ou route interne mal nommée) | `docker compose logs enrollment-service course-service` |
| Pas de notification après inscription | notification-service arrêté, ou événement perdu (RabbitMQ absent à ce moment) | Voir `docker compose logs` et l'onglet Queues de RabbitMQ |
| Les messages s'accumulent dans une file | Le consommateur plante à chaque message | Lire les erreurs dans les logs du service concerné |
| Tableau de bord : « Un service est momentanément indisponible » | Un des services interrogés est arrêté | `curl http://localhost:5000/api/health` pour savoir lequel |
| `.env` apparaît dans `git status` | `.gitignore` absent | Créer `.gitignore`, `git rm --cached .env`, et changer les secrets |
| Conflit sur `docker-compose.yml` | Plusieurs membres ont ajouté leur service | Résoudre comme au TP2 : garder tous les blocs, retirer les marqueurs |

## Partie 24 — Aide-mémoire

| Commande | Ce qu'elle fait |
| --- | --- |
| `docker compose up --build` | Construit et démarre les 11 conteneurs |
| `docker compose ps` | État de tous les conteneurs |
| `docker compose logs -f NOM_SERVICE` | Suit les logs d'un ou plusieurs services |
| `docker compose stop NOM_SERVICE` | Arrête un service (simule une panne) |
| `docker compose start NOM_SERVICE` | Le redémarre |
| `docker compose restart NOM_SERVICE` | Arrête puis redémarre |
| `docker compose up -d --build NOM_SERVICE` | Reconstruit un seul service |
| `docker compose exec NOM_SERVICE sh` | Ouvre un terminal dans un conteneur |
| `docker compose exec enrollment-service wget -qO- http://course-service:3002/health` | Appelle un service **depuis l'intérieur** du réseau Docker |
| `docker compose down` | Arrête tout (données gardées) |
| `docker compose down -v` | Arrête tout **et efface les données** |
| `git tag -a v1-monolithe -m 'message'` | Pose une étiquette sur le dernier commit |
| `git push origin v1-monolithe` | Envoie le tag sur GitHub |
| `git switch --detach v1-monolithe` | Se place sur la version taguée (lecture seule) |
| `curl http://localhost:5000/api/health` | État de la gateway et des 4 services |
