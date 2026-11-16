# Guide pas à pas — TP N°5 bis : Consolider le socle (MVC, SOLID, erreurs, JWT, tests)

> **Projet :** LearnHub (fil rouge) — service étudié : `services/enrollment-service`
> **Durée prévue :** 6 h (2 séances de 3 h) — individuel ou binôme
> **À quoi sert ce guide :** te dire *quoi faire, dans quel ordre, pourquoi, et comment vérifier* que chaque étape est réussie. Il complète le sujet du TP, il ne le remplace pas.

---

## Table des matières

0. [Avant de commencer : la vue d'ensemble](#0-avant-de-commencer--la-vue-densemble)
1. [Étape 0 — Préparation (20 min)](#1-étape-0--préparation-20-min)
2. [Étape 1 — Diagnostic de l'existant (20 min)](#2-étape-1--diagnostic-de-lexistant-20-min)
3. [Étape 2 — Refactoring en couches (100 min)](#3-étape-2--refactoring-en-couches-100-min)
4. [Étape 3 — SOLID dans ton code (30 min)](#4-étape-3--solid-dans-ton-code-30-min)
5. [Étape 4 — Erreurs et pannes en situation réelle (40 min)](#5-étape-4--erreurs-et-pannes-en-situation-réelle-40-min)
6. [Étape 5 — JWT et rôles : comprendre en cassant (50 min)](#6-étape-5--jwt-et-rôles--comprendre-en-cassant-50-min)
7. [Étape 6 — Les tests automatiques (80 min)](#7-étape-6--les-tests-automatiques-80-min)
8. [Étape 7 — Clôture : Pull Request et livrable](#8-étape-7--clôture--pull-request-et-livrable)
9. [Annexe A — Aide pour les questions de compréhension et le QCM](#annexe-a--aide-pour-les-questions-de-compréhension-et-le-qcm)
10. [Annexe B — Dépannage](#annexe-b--dépannage)
11. [Annexe C — Check-list finale](#annexe-c--check-list-finale)

---

## 0. Avant de commencer : la vue d'ensemble

### 0.1 Ce que tu vas réellement faire

Le service d'inscription (`enrollment-service`) marche déjà, mais **toute sa logique est dans un seul fichier** (`routes/enrollments.js`). Ce TP consiste à :

1. **Découper** ce fichier en couches (route → contrôleur → service → repository) **sans changer le comportement**.
2. **Gérer proprement les erreurs** (404, 409, 503…) avec une classe d'erreur et un seul « gestionnaire ».
3. **Comprendre la sécurité JWT** en essayant de la contourner.
4. **Prouver** que tout marche avec des **tests automatiques** (Jest + Supertest) et avec la collection Postman du TP5.

### 0.2 Le schéma à garder en tête

```
Requête HTTP
   |
   v
[ Route ]        enrollmentRoutes.js      "la carte" : adresse + protections (authenticate, requireRole)
   |
   v
[ Contrôleur ]   enrollmentController.js  lit req, appelle le service, écrit res
   |
   v
[ Service ]      enrollmentService.js     règles métier (aucun req/res, aucun SQL)
   |        \
   |         +--> courseClient.js  --> course-service (HTTP)
   |         +--> eventPublisher   --> RabbitMQ (message)
   v
[ Repository ]   enrollmentRepository.js  seul endroit où il y a du SQL
   |
   v
PostgreSQL (enrollments_db)
```

**Règle d'or :** une couche ne parle qu'à celle juste en dessous. Si tu vois du SQL dans un contrôleur ou `res.status(...)` dans un service, c'est que quelque chose est mal placé.

### 0.3 Planning conseillé

| Séance | Étapes | Durée |
|---|---|---|
| **Séance 1** | Préparation, diagnostic, refactoring en couches, début de SOLID | ≈ 3 h |
| **Séance 2** | Fin SOLID + règle des 5 inscriptions, pannes, JWT, tests, PR | ≈ 3 h |

### 0.4 Ce qu'il faut rendre (garde-le en tête dès le début)

Au fil des étapes, **prends tes captures et note tes réponses tout de suite** : c'est beaucoup plus facile que de tout refaire à la fin. Chaque étape de ce guide a une rubrique **📎 Pour le livrable** qui te dit quoi garder.

### 0.5 Un conseil sur la méthode

- **Un commit par idée** (`refactor:`, `feat:`, `test:`, `docs:`, `fix:`). Ça compte dans le barème (2 points).
- **Ne supprime jamais l'ancien fichier avant la fin** : tu migres route par route.
- **Après chaque étape : lance, teste, commit.** Ne cumule pas 3 étapes avant de tester.

---

## 1. Étape 0 — Préparation (20 min)

### 1.1 Forker et cloner

1. Sur GitHub, ouvre `https://github.com/ImenAouissi/LearnHub-MicroService` et clique sur **Fork**.
2. Dans **Git Bash** :

```bash
cd ~/projets
git clone https://github.com/VOTRE_COMPTE/LearnHub-MicroService.git
cd LearnHub-MicroService
git switch -c feature/tp5bis-refactoring
```

**Pourquoi un fork et une branche ?** Le fork te donne ta propre copie (tu ne casses pas le dépôt du prof). La branche isole ton travail : la Pull Request finale ira de cette branche vers `main` *de ton fork*.

### 1.2 Établir le point de référence (très important)

Avant de toucher au code, vérifie que **tout marche**. Sinon, tu ne sauras pas si une panne vient de toi ou de l'existant.

```bash
cp .env.example .env
```

Ouvre `.env` et remplace les valeurs `changez_...` par tes propres valeurs (pas d'espaces, pas de guillemets, pas de `@ : / # ? %` dans les mots de passe).

```bash
docker compose up --build -d
docker compose ps
```

**Vérifications :**

- `docker compose ps` : **11 conteneurs** en état *running* (les bases et RabbitMQ en *healthy*).
- Navigateur : `http://localhost:5000/api/health` doit afficher quelque chose comme :

```json
{ "gateway": "ok", "services": { "user": "ok", "course": "ok", "enrollment": "ok", "notification": "ok" } }
```

- **Postman** : lance la collection du TP5 avec le *Collection Runner*. **Tout doit être vert.**

> Si ce n'est pas vert, **arrête-toi ici** et corrige (souvent : mémoire Docker < 4 Go, ports 5000/5173 déjà occupés par l'ancien monolithe → `docker compose down` dans l'ancien dossier).

### 1.3 Préparer le service de travail

```bash
cd services/enrollment-service
node --version      # doit afficher v20.x (minimum v18)
npm install
```

**Pourquoi Node 20 ?** Le code utilise `fetch` et `AbortController`, intégrés à Node depuis la version 18. Les **tests** s'exécuteront sur ta machine (pas dans Docker), donc c'est *ton* Node qui compte.

### 1.4 Garder une copie de l'ancien fichier

```bash
git show HEAD:services/enrollment-service/src/routes/enrollments.js > /tmp/enrollments.ORIGINAL.js
```

Tu pourras le relire à tout moment, même après l'avoir modifié.

📎 **Pour le livrable :** rien à capturer à cette étape.

---

## 2. Étape 1 — Diagnostic de l'existant (20 min)

**Objectif :** constater par toi-même que le fichier actuel fait *trop de choses*. **Tu ne modifies rien.**

Ouvre `services/enrollment-service/src/routes/enrollments.js` et lis la route `POST /`. Dans la version du dépôt, elle ressemble à ceci :

```js
router.post('/', authenticate, requireRole('etudiant'), asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const course = courseId ? await getCourse(courseId) : null;
  if (!course) return res.status(404).json({ error: 'Cours introuvable' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING id, course_id, progress',
      [req.user.id, courseId]);
    publish('enrollment.created', { userId: req.user.id, courseId, courseTitle: course.title });
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Vous êtes déjà inscrit à ce cours' });
    throw err;
  }
}));
```

### Tâche 4.1 — Qui fait quoi ?

Repère, **dans ton fichier**, chaque responsabilité et note le numéro de ligne. Aide :

| Responsabilité | Où la chercher |
|---|---|
| Vérifier le token et le rôle | `authenticate, requireRole('etudiant')` dans la signature de la route |
| Lire le corps de la requête | `req.body` |
| Valider les données | le test sur `courseId` |
| Appeler le course-service | `getCourse(courseId)` |
| Règle métier « déjà inscrit ? » | ici elle est **cachée** dans le `catch` (code `23505`) : c'est la base qui refuse le doublon |
| Écrire du SQL | `pool.query('INSERT ...')` |
| Publier un message RabbitMQ | `publish('enrollment.created', ...)` |
| Fabriquer la réponse HTTP | `res.status(...).json(...)` |

**Conclusion attendue :** les 8 responsabilités sont dans **une seule route**.

### Tâche 4.2 — Les raisons de changer

Pour chaque demande, demande-toi : *« est-ce que je dois ouvrir **ce** fichier ? »*

| Demande | Piste |
|---|---|
| PostgreSQL → MySQL | Le SQL (`INSERT`) et le code d'erreur `23505` sont ici → oui |
| Règle « max 5 cours en cours » | C'est une règle métier, elle viendrait s'ajouter ici → oui |
| Changer le format des erreurs | Les `res.status().json({error})` sont ici → oui |
| Le course-service change d'adresse | Regarde **où** l'adresse est définie (`config.js` / variable d'environnement). Si ce n'est pas dans ce fichier, ce n'est pas une raison de le modifier |
| RabbitMQ → Kafka | L'appel `publish(...)` est ici → oui (même si le détail est dans `messaging.js`) |

**À retenir :** un fichier qui a 4–5 raisons de changer viole le **S** de SOLID (*Single Responsibility*).

### Tâche 4.3 — Peut-on le tester ?

Question à te poser : pour tester cette route **sans** PostgreSQL, sans RabbitMQ et sans course-service, que faudrait-il ? Réponse : il faudrait *remplacer* `pool`, `getCourse` et `publish`, qui sont **importés en dur** dans le fichier. Comme on ne peut pas les remplacer facilement, on ne peut pas tester la route isolément. C'est exactement ce que l'étape suivante va corriger.

📎 **Pour le livrable :** le tableau 4.1 rempli (avec les lignes), les réponses 4.2 et 4.3.

---

## 3. Étape 2 — Refactoring en couches (100 min)

### 3.1 Créer l'arborescence

Depuis `services/enrollment-service` :

```bash
mkdir -p src/errors src/controllers src/services src/repositories tests
ls src/middleware     # asyncHandler.js existe déjà : NE PAS le recréer
```

Fichiers à créer :

```
src/
|-- container.js                       (NOUVEAU)
|-- courseClient.js                    (RÉÉCRIT)
|-- errors/AppError.js                 (NOUVEAU)
|-- middleware/errorHandler.js         (NOUVEAU)
|-- routes/enrollmentRoutes.js         (NOUVEAU)
|-- routes/enrollments.js              (ANCIEN, on le vide peu à peu)
|-- controllers/enrollmentController.js (NOUVEAU)
|-- services/enrollmentService.js       (NOUVEAU)
`-- repositories/enrollmentRepository.js (NOUVEAU)
```

### 3.2 Les erreurs applicatives

**Idée :** au lieu d'écrire `res.status(404).json(...)` partout, on **lance** (`throw`) des erreurs qui *portent* leur code HTTP. Un **seul** middleware (`errorHandler`) les transforme en réponse.

**`src/errors/AppError.js`**

```js
// Erreur de base : porte un code HTTP (status) et un code lisible (code)
class AppError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR') { super(message, 400, code); }
}
class UnauthorizedError extends AppError {
  constructor(message, code = 'UNAUTHORIZED') { super(message, 401, code); }
}
class ForbiddenError extends AppError {
  constructor(message, code = 'FORBIDDEN') { super(message, 403, code); }
}
class NotFoundError extends AppError {
  constructor(message, code = 'NOT_FOUND') { super(message, 404, code); }
}
class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') { super(message, 409, code); }
}
class ServiceUnavailableError extends AppError {
  constructor(message, code = 'SERVICE_UNAVAILABLE') { super(message, 503, code); }
}

module.exports = {
  AppError, ValidationError, UnauthorizedError, ForbiddenError,
  NotFoundError, ConflictError, ServiceUnavailableError,
};
```

**Explications :**

- `extends Error` : une `AppError` *est* une erreur JavaScript, donc `throw` fonctionne.
- `this.name = this.constructor.name` : le nom de la classe (`NotFoundError`…) apparaît dans les logs.
- Chaque sous-classe fixe **son** statut HTTP : ainsi le service écrit `throw new ConflictError(...)` sans jamais écrire « 409 ».

**`src/middleware/errorHandler.js`**

```js
const { AppError } = require('../errors/AppError');

// Un middleware d'erreur a TOUJOURS 4 paramètres (err, req, res, next)
module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Erreur prévue : on renvoie son code HTTP et son message
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }

  // Bug imprévu : détails dans les logs, message neutre pour le client
  console.error('[ERREUR NON PREVUE]', err);
  return res.status(500).json({ error: 'Erreur interne du serveur', code: 'INTERNAL_ERROR' });
};
```

**Points d'attention :**

- Express reconnaît un middleware d'erreur **uniquement s'il a 4 paramètres**, même si `next` n'est pas utilisé. Ne le « nettoie » pas.
- On **ajoute** le champ `code` mais on **garde** `error` : le frontend et Postman lisent `error`.

**Question 5.2 — piste :** pense à ce qu'un attaquant pourrait apprendre d'un message du type *"connect ECONNREFUSED 172.18.0.3:5432"* ou *"password authentication failed"*. Où ces détails doivent-ils aller à la place ?

### 3.3 Le client du course-service

**Idée :** isoler l'appel réseau dans un fichier qui **traduit** les pannes techniques en erreurs claires, avec timeout et nouvel essai.

> ⚠️ **Adaptation par rapport au sujet.** L'ancien `courseClient.js` exportait **deux** fonctions : `getCourse` et `getCourses` (appel *batch*). La route `GET /mine` en a besoin (étape 3.8). Dans la version ci-dessous, j'ai donc gardé les deux et factorisé le code commun dans `fetchJson`.

**`src/courseClient.js`** (remplace tout le contenu)

```js
const { NotFoundError, ValidationError, ServiceUnavailableError } = require('./errors/AppError');

// Factory : fabrique un client configuré (les réglages sont des paramètres)
function createCourseClient({
  baseUrl = process.env.COURSE_SERVICE_URL || 'http://course-service:3002',
  timeoutMs = 3000,   // on n'attend jamais plus de 3 s
  retries = 1,        // 1 nouvel essai si le réseau échoue
  fetchImpl = fetch,  // remplaçable dans les tests
} = {}) {

  async function callOnce(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetchImpl(`${baseUrl}${path}`, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchJson(path) {
    let response;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        response = await callOnce(path);
        break;                                   // une réponse HTTP est arrivée
      } catch (err) {
        // Réseau coupé ou timeout : on réessaie, puis on abandonne
        if (attempt === retries) {
          throw new ServiceUnavailableError(
            'Le service des cours est momentanément indisponible', 'COURSE_SERVICE_DOWN');
        }
      }
    }

    // On ne réessaie PAS ces cas : la réponse serait la même
    if (response.status === 404) throw new NotFoundError('Cours introuvable', 'COURSE_NOT_FOUND');
    if (response.status === 400) throw new ValidationError('Identifiant de cours invalide', 'COURSE_ID_INVALID');
    if (!response.ok) {
      throw new ServiceUnavailableError('Le service des cours a rencontré une erreur', 'COURSE_SERVICE_ERROR');
    }
    return response.json();
  }

  return {
    getCourse: (courseId) => fetchJson(`/internal/courses/${encodeURIComponent(courseId)}`),
    getCourses: (ids) => fetchJson(`/internal/courses/batch?ids=${ids.map(encodeURIComponent).join(',')}`),
  };
}

const defaultClient = createCourseClient();

// On garde ces exports : l'ancienne route "complete" les utilise encore
module.exports = {
  createCourseClient,
  getCourse: defaultClient.getCourse,
  getCourses: defaultClient.getCourses,
};
```

**Comprendre le code :**

| Élément | Rôle |
|---|---|
| `createCourseClient({...} = {})` | **Factory** : fabrique un client avec des réglages. Les valeurs par défaut s'appliquent si on ne passe rien |
| `AbortController` + `setTimeout` | Si le serveur ne répond pas en 3 s, on **annule** la requête (timeout) |
| `finally { clearTimeout }` | On nettoie le minuteur dans tous les cas |
| La boucle `for` | `retries = 1` → 2 tentatives en tout |
| `catch` : réessaie | Il n'est atteint que si `fetch` a **échoué** (réseau, timeout), pas si le serveur a répondu 404 |
| 404 / 400 / autre | Une réponse HTTP est arrivée : on la **traduit** en erreur métier, sans réessayer |
| `fetchImpl` | Dans un test, on passe un faux `fetch` : on simule une panne **sans arrêter de conteneur** |

**Question 5.3 — pistes :**

1. *Pourquoi ne pas réessayer un 404 ?* → relancer la même requête donnera la même réponse.
2. *Attente maximale avant un 503 ?* → compte : nombre de tentatives × timeout (voir aussi 5.4 plus bas, c'est la valeur « ≈ 6 s » du tableau des expériences).

```bash
git add .
git commit -m "refactor: ajoute les erreurs applicatives et le client course-service"
```

### 3.4 Le repository

**Idée :** *seul* ce fichier connaît le SQL. Il traduit aussi les erreurs de base de données en erreurs métier.

> ⚠️ **Adaptation importante.** Dans le sujet, le repository utilise `db.query(...)`, mais le fichier `db/postgres.js` du dépôt exporte **`{ pool, initPostgres }`**. Écrire `const db = require('../db/postgres')` puis `db.query` **plante** (`db.query is not a function`). Utilise donc `const { pool } = require('../db/postgres')` et `pool.query(...)`. (C'est exactement ce que le sujet te demande de vérifier : « comparez avec votre ancien fichier ».)

**`src/repositories/enrollmentRepository.js`**

```js
const { pool } = require('../db/postgres');
const { ConflictError } = require('../errors/AppError');

class EnrollmentRepository {
  async findByUserAndCourse(userId, courseId) {
    const { rows } = await pool.query(
      'SELECT id, course_id, progress FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]);
    return rows[0] || null;
  }

  async create(userId, courseId) {
    try {
      const { rows } = await pool.query(
        'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING id, course_id, progress',
        [userId, courseId]);
      return rows[0];
    } catch (err) {
      // 23505 = violation de contrainte d'unicité PostgreSQL (double clic, requêtes simultanées)
      if (err.code === '23505') {
        throw new ConflictError('Vous êtes déjà inscrit à ce cours', 'ALREADY_ENROLLED');
      }
      throw err;
    }
  }

  // Même ordre que l'ancienne route (les plus récentes d'abord)
  async findByUser(userId) {
    const { rows } = await pool.query(
      'SELECT id, course_id, progress FROM enrollments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]);
    return rows;
  }

  // Chapitres terminés pour une liste d'inscriptions (utilisé par GET /mine)
  async findCompletedChapters(enrollmentIds) {
    if (enrollmentIds.length === 0) return [];
    const { rows } = await pool.query(
      'SELECT enrollment_id, chapter_id FROM completed_chapters WHERE enrollment_id = ANY($1::int[])',
      [enrollmentIds]);
    return rows;
  }
}

module.exports = EnrollmentRepository;
```

**Pourquoi `RETURNING id, course_id, progress` et pas `RETURNING *` ?** Pour renvoyer **exactement** les mêmes champs qu'avant (non-régression). Un refactoring ne doit pas changer ce que voit le client.

**Pourquoi traiter `23505` alors que le service vérifie déjà « déjà inscrit ? »** Deux clics quasi simultanés peuvent passer tous les deux la vérification. La base, elle, n'accepte qu'une insertion (contrainte `UNIQUE (user_id, course_id)`). Le repository convertit cette erreur technique en **409**.

### 3.5 Le service (le cœur du TP)

**Idée :** le service contient les **décisions** (règles métier). Il **reçoit** ses dépendances par le constructeur au lieu de les fabriquer : c'est l'**injection de dépendances** (le **D** de SOLID), et c'est ce qui rend les tests possibles.

**`src/services/enrollmentService.js`**

```js
const { ValidationError, ConflictError } = require('../errors/AppError');

class EnrollmentService {
  // Les dépendances arrivent de l'extérieur : le service ne fabrique rien lui-même
  constructor({ enrollmentRepository, courseClient, eventPublisher, logger = console }) {
    this.enrollmentRepository = enrollmentRepository;
    this.courseClient = courseClient;
    this.eventPublisher = eventPublisher;
    this.logger = logger;
  }

  async enroll({ userId, courseId }) {
    // 1. Validation
    if (!courseId || typeof courseId !== 'string') {
      throw new ValidationError('courseId est obligatoire', 'COURSE_ID_REQUIRED');
    }

    // 2. Dépendance synchrone : le cours existe-t-il ? (lève 404 ou 503 sinon)
    const course = await this.courseClient.getCourse(courseId);

    // 3. Règle métier : une seule inscription par cours
    const existing = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (existing) {
      throw new ConflictError('Vous êtes déjà inscrit à ce cours', 'ALREADY_ENROLLED');
    }

    // 4. Écriture en base
    const enrollment = await this.enrollmentRepository.create(userId, courseId);

    // 5. Dépendance asynchrone : si RabbitMQ est en panne, l'inscription reste valide
    try {
      await this.eventPublisher.publish('enrollment.created', {
        userId, courseId, courseTitle: course.title,
      });
    } catch (err) {
      this.logger.error('[evenement perdu] enrollment.created', err.message);
    }

    return enrollment;
  }

  async listForUser(userId) {
    // (version simple — à enrichir à l'étape 3.8)
    return this.enrollmentRepository.findByUser(userId);
  }
}

module.exports = EnrollmentService;
```

**Vérifie en relisant :** aucun `req`, aucun `res`, aucun `SELECT`, aucun `fetch` dans ce fichier. Il ne contient que des décisions.

**À savoir sur l'étape 5 :** dans ce dépôt, `messaging.publish` est **synchrone** et ne lève **pas** d'exception quand RabbitMQ est absent : il écrit un avertissement (`Événement enrollment.created perdu : RabbitMQ non connecté`) et renvoie `false`. Le `try/catch` du service est donc une **ceinture de sécurité** (si un autre publisher lève une exception) et c'est ce que testent les tests unitaires. Quand tu feras l'expérience « RabbitMQ arrêté », la ligne à chercher dans les logs sera celle écrite par `messaging.js`.

**Question 5.5 — piste :** applique la **règle de décision** : *« l'opération principale peut-elle continuer sans cette dépendance ? »*
- Sans le course-service, peut-on savoir si le cours existe ?
- Sans RabbitMQ, l'inscription est-elle encore correcte ? Qu'est-ce qu'on perd, et comment s'appelle ce compromis (voir la partie 2.3 du sujet : *cohérence éventuelle*) ?

### 3.6 Le contrôleur et les routes

**`src/controllers/enrollmentController.js`** — volontairement très court :

```js
class EnrollmentController {
  constructor({ enrollmentService }) {
    this.enrollmentService = enrollmentService;
  }

  // req.user est rempli par le middleware authenticate (champs : voir étape 5)
  create = async (req, res) => {
    const enrollment = await this.enrollmentService.enroll({
      userId: req.user.id,
      courseId: req.body.courseId,
    });
    res.status(201).json(enrollment);
  };

  listMine = async (req, res) => {
    const enrollments = await this.enrollmentService.listForUser(req.user.id);
    res.json(enrollments);
  };
}

module.exports = EnrollmentController;
```

> `create = async (req, res) => {...}` est une **fonction fléchée en propriété de classe** : `this` reste bien le contrôleur quand Express appelle la fonction (sans ça, `this` serait perdu).

**`src/routes/enrollmentRoutes.js`** — « la carte » :

```js
const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');

// Fonction qui REÇOIT le contrôleur : on pourra lui donner un faux dans les tests
module.exports = function buildEnrollmentRouter({ enrollmentController }) {
  const router = express.Router();

  router.post('/', authenticate, requireRole('etudiant'), asyncHandler(enrollmentController.create));
  router.get('/mine', authenticate, requireRole('etudiant'), asyncHandler(enrollmentController.listMine));

  return router;
};
```

**Ordre d'exécution d'une requête `POST /api/enrollments` :** `authenticate` (401 si pas de bon token) → `requireRole('etudiant')` (403 si mauvais rôle) → `asyncHandler(create)` (le contrôleur). Si le contrôleur lève une erreur, `asyncHandler` la transmet à `errorHandler`.

### 3.7 Assembler : `container.js` et `index.js`

**`src/container.js`** — l'**unique** endroit où l'on fabrique et branche les objets (pattern *Singleton* : Node ne charge un fichier qu'une fois) :

```js
const EnrollmentRepository = require('./repositories/enrollmentRepository');
const EnrollmentService = require('./services/enrollmentService');
const EnrollmentController = require('./controllers/enrollmentController');
const { createCourseClient } = require('./courseClient');
const messaging = require('./messaging');

const enrollmentRepository = new EnrollmentRepository();
const courseClient = createCourseClient();
const enrollmentService = new EnrollmentService({
  enrollmentRepository,
  courseClient,
  eventPublisher: { publish: messaging.publish },   // on n'expose que publish
});
const enrollmentController = new EnrollmentController({ enrollmentService });

module.exports = { enrollmentController };
```

**`src/index.js`** — modifie **seulement** ce qui suit. Dans la version du dépôt, le fichier contient (dans cet ordre) les routes, un handler 404 puis un gestionnaire d'erreur écrit « en ligne ». Il faut :

1. ajouter les 3 `require` en haut ;
2. monter le **nouveau routeur avant** l'ancien ;
3. **remplacer** l'ancien gestionnaire d'erreur en ligne par `app.use(errorHandler)` (sinon l'ancien répond avant le nouveau et tu n'auras pas le champ `code`).

```js
// --- en haut, avec les autres require ---
const buildEnrollmentRouter = require('./routes/enrollmentRoutes');
const { enrollmentController } = require('./container');
const errorHandler = require('./middleware/errorHandler');

// --- les routes ---
app.get('/health', (req, res) => res.json({ service: 'enrollment-service', status: 'ok' }));

// NOUVELLES routes d'abord, puis l'ancien fichier pour ce qui n'est pas encore migré
app.use('/api/enrollments', buildEnrollmentRouter({ enrollmentController }));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/internal', require('./routes/internal'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

// SUPPRIME l'ancien app.use((err, req, res, next) => { ... }) et mets à la place :
app.use(errorHandler);     // TOUJOURS en dernier, après toutes les routes
```

**Dans l'ancien `routes/enrollments.js`**, supprime les routes `POST /` et `GET /mine` (elles sont maintenant dans le nouveau routeur). Il ne doit rester que :

```
POST /:courseId/chapters/:chapterId/complete
```

(Tu peux aussi retirer les `require` devenus inutiles.)

**Pourquoi « nouveau routeur avant l'ancien » ?** Express essaie les routes dans l'ordre de déclaration : la première qui répond gagne.

### 3.8 Exercice obligatoire : conserver la réponse de `GET /mine`

Le contrôleur du sujet renvoie les **lignes brutes** de la base. Or, dans le dépôt, `GET /api/enrollments/mine` renvoie une réponse **enrichie** que le **frontend utilise** :

```json
[{
  "enrollmentId": 12,
  "courseId": "64b7...",
  "title": "Git",
  "category": "Dev",
  "ownerName": "Mme Martin",
  "progress": 50,
  "chapters": [{ "id": "…", "title": "Introduction", "done": true }]
}]
```

Si tu laisses la version brute, le frontend casse **et** Postman devient rouge. Il faut recopier la logique d'enrichissement dans le **service**. Remplace `listForUser` par :

```js
  async listForUser(userId) {
    const enrollments = await this.enrollmentRepository.findByUser(userId);
    if (enrollments.length === 0) return [];

    // Les titres des cours ne sont pas dans NOTRE base : on les demande au course-service
    const courses = await this.courseClient.getCourses(enrollments.map((e) => e.course_id));
    const done = await this.enrollmentRepository.findCompletedChapters(enrollments.map((e) => e.id));

    return enrollments.map((enr) => {
      const course = courses.find((c) => c._id === enr.course_id);
      const doneIds = done.filter((d) => d.enrollment_id === enr.id).map((d) => d.chapter_id);
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
    });
  }
```

> Ce code est la traduction fidèle de l'ancienne route : même liste, même format, même cas « cours supprimé ».

### 3.9 Lancer et vérifier

Le dossier du service est monté dans le conteneur et `nodemon` surveille les fichiers : le rechargement est automatique. Pour être sûr :

```bash
# depuis la racine du projet
docker compose up --build -d enrollment-service
docker compose logs -f enrollment-service
```

Tu dois voir `PostgreSQL (enrollments_db) connecté…`, `RabbitMQ connecté`, `enrollment-service sur le port 3003`.

**Si le service ne démarre pas :** lis la **première** ligne d'erreur dans les logs. Cas fréquents : faute dans un `require` (chemin), `db.query is not a function` (voir 3.4), `asyncHandler is not a function`.

### 3.10 Preuve de non-régression

1. Relance **toute** la collection Postman (*Collection Runner*).
2. Résultat attendu : **tout vert**, comme au point de référence.
3. **Fais une capture** : elle fait partie du livrable.

**Si un test est rouge :** regarde le code HTTP et le champ manquant, puis compare avec `/tmp/enrollments.ORIGINAL.js`. Causes classiques :

- `courseId` absent → le TP attend maintenant **400 `COURSE_ID_REQUIRED`** (avant : 404). Si ta collection testait 404 pour ce cas, c'est un changement de comportement *voulu* par le sujet (expérience 7.1) : note-le dans ton rapport.
- Champ de réponse différent (voir 3.4 : `RETURNING` explicite).
- `GET /mine` brut au lieu d'enrichi (voir 3.8).

```bash
git add .
git commit -m "refactor: decoupe la route d'inscription en couches"
```

### 3.11 Bonus (+1) : migrer aussi la route `complete`

Facultatif, mais ça termine le travail : l'ancien fichier `routes/enrollments.js` peut alors être **supprimé**.

**Repository** — ajoute :

```js
  async countCompleted(enrollmentId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS done FROM completed_chapters WHERE enrollment_id = $1', [enrollmentId]);
    return rows[0].done;
  }

  async addCompletedChapter(enrollmentId, chapterId) {
    await pool.query(
      'INSERT INTO completed_chapters (enrollment_id, chapter_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [enrollmentId, chapterId]);
  }

  async updateProgress(enrollmentId, progress) {
    await pool.query('UPDATE enrollments SET progress = $1 WHERE id = $2', [progress, enrollmentId]);
  }
```

**Service** — ajoute (pense à importer `NotFoundError`) :

```js
  async completeChapter({ userId, courseId, chapterId }) {
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (!enrollment) throw new NotFoundError("Vous n'êtes pas inscrit à ce cours", 'NOT_ENROLLED');

    const course = await this.courseClient.getCourse(courseId);
    if (!course.chapters.some((ch) => ch._id === chapterId)) {
      throw new NotFoundError('Chapitre introuvable', 'CHAPTER_NOT_FOUND');
    }

    await this.enrollmentRepository.addCompletedChapter(enrollment.id, chapterId);
    const done = await this.enrollmentRepository.countCompleted(enrollment.id);
    const total = course.chapters.length;
    const progress = total ? Math.round((done * 100) / total) : 0;
    await this.enrollmentRepository.updateProgress(enrollment.id, progress);
    return { progress };
  }
```

**Contrôleur** :

```js
  complete = async (req, res) => {
    const { courseId, chapterId } = req.params;
    res.json(await this.enrollmentService.completeChapter({ userId: req.user.id, courseId, chapterId }));
  };
```

**Route** (dans `enrollmentRoutes.js`) :

```js
  router.post('/:courseId/chapters/:chapterId/complete',
    authenticate, requireRole('etudiant'), asyncHandler(enrollmentController.complete));
```

Ensuite : supprime l'ancien `routes/enrollments.js` **et** sa ligne `app.use(... require('./routes/enrollments'))` dans `index.js`, relance Postman.

📎 **Pour le livrable :** capture de l'arborescence `src/` (`ls -R src` ou l'explorateur VS Code), capture Postman verte, réponses 5.2, 5.3, 5.5.

---

## 4. Étape 3 — SOLID dans ton code (30 min)

### 4.1 La fiche SOLID (tâche 6.1)

Chaque ligne doit citer **un fichier et une fonction/classe** comme preuve, et expliquer **ce qui arriverait si le principe était violé**. Propositions (à reformuler avec tes mots) :

| Principe | Où le voit-on ? | Si violé… |
|---|---|---|
| **S** — une seule raison de changer | `enrollmentRepository.js` ne change que si la base change ; `enrollmentController.js` ne change que si le format HTTP change ; comparer avec l'ancien fichier à 5 raisons de changer | Un changement de SQL risque de casser la validation ou l'envoi d'événements |
| **O** — ouvert à l'extension, fermé à la modification | `AppError.js` + `errorHandler.js` : on ajoute une classe d'erreur (ex. `BusinessRuleError`) sans toucher au handler, grâce à `instanceof AppError` | Chaque nouvelle erreur obligerait à rouvrir le handler (risque de régression) |
| **L** — Liskov | Un faux repository en mémoire (ou le `jest.fn()` des tests) peut remplacer `EnrollmentRepository` : le service fonctionne de la même façon | Un « faux » qui ne respecte pas le contrat (méthode manquante, mauvais type de retour) casserait le service |
| **I** — petites interfaces | `container.js` : `eventPublisher: { publish: messaging.publish }` — le service ne voit que `publish`, pas tout le module RabbitMQ ; `courseClient` n'expose que `getCourse`/`getCourses` | Le service dépendrait de fonctions dont il n'a pas besoin → plus de couplage |
| **D** — dépendre d'abstractions | Constructeur de `EnrollmentService` : reçoit repository, client, publisher ; c'est `container.js` qui choisit les vraies implémentations | Le service ferait `require('pg')` lui-même : impossible à tester sans base |

### 4.2 Évolution : la règle des 5 inscriptions actives (tâche 6.2)

**Énoncé :** un étudiant ne peut pas avoir plus de 5 inscriptions en cours (`progress < 100`). Au-delà → **422** avec le code `MAX_ACTIVE_ENROLLMENTS`.

**a) `AppError.js`** — ajoute la classe et exporte-la :

```js
class BusinessRuleError extends AppError {
  constructor(message, code = 'BUSINESS_RULE') { super(message, 422, code); }
}

module.exports = {
  AppError, ValidationError, UnauthorizedError, ForbiddenError,
  NotFoundError, ConflictError, ServiceUnavailableError, BusinessRuleError,
};
```

**b) Repository** — ajoute :

```js
  async countActiveByUser(userId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS n FROM enrollments WHERE user_id = $1 AND progress < 100', [userId]);
    return Number(rows[0].n);     // COUNT(*) revient en TEXTE avec pg : on convertit
  }
```

**c) Service** — importe `BusinessRuleError`, déclare la constante, et ajoute la vérification **entre l'étape 3 et l'étape 4** (avant l'écriture) :

```js
const MAX_ACTIVE_ENROLLMENTS = 5;

// ... dans enroll(), juste après la vérification "déjà inscrit" :
    const active = await this.enrollmentRepository.countActiveByUser(userId);
    if (active >= MAX_ACTIVE_ENROLLMENTS) {
      throw new BusinessRuleError(
        `Vous ne pouvez pas avoir plus de ${MAX_ACTIVE_ENROLLMENTS} inscriptions en cours`,
        'MAX_ACTIVE_ENROLLMENTS');
    }
```

**d) Test avec Postman — à faire avec un compte vierge :**

1. Inscris un **nouvel étudiant** (`POST /api/users/register`) et connecte-le.
2. Avec un compte formateur, crée **6 cours** différents (`POST /api/courses`) ou réutilise les cours existants.
3. Inscris l'étudiant aux 5 premiers → `201` à chaque fois.
4. Le 6ᵉ → **422** `{ "error": "...", "code": "MAX_ACTIVE_ENROLLMENTS" }`.

**Question 6.2 — comment raisonner :** compte les fichiers que tu as modifiés (normalement : `AppError.js`, repository, service). As-tu touché `errorHandler.js`, le contrôleur, les routes ? Compare avec l'ancien monde (tâche 4.2) où tout se passait dans un seul fichier. Que prouve cette différence sur le principe **O** ?

```bash
git add .
git commit -m "feat: regle des 5 inscriptions actives (422 MAX_ACTIVE_ENROLLMENTS)"
```

📎 **Pour le livrable :** fiche SOLID complétée, réponse 6.2, capture Postman du 422.

---

## 5. Étape 4 — Erreurs et pannes en situation réelle (40 min)

**Objectif :** provoquer des pannes et vérifier que chacune produit la **bonne** réponse. Utilise un **compte étudiant**, avec une inscription possible (cours non déjà suivi, moins de 5 actives).

### 5.1 Les expériences (tâche 7.1)

| N° | Scénario | Comment le provoquer | Attendu |
|---|---|---|---|
| 1 | Corps sans `courseId` | `POST /api/enrollments` avec `{}` | **400** `COURSE_ID_REQUIRED` |
| 2 | Cours inexistant | `courseId` valide mais inconnu (ex. `64b7f0f0f0f0f0f0f0f0f0f0`) | **404** `COURSE_NOT_FOUND` |
| 3 | Double inscription | Même requête 2 fois | 1ʳᵉ **201**, 2ᵉ **409** `ALREADY_ENROLLED` |
| 4 | course-service arrêté | `docker compose stop course-service` puis inscription | **503** `COURSE_SERVICE_DOWN` après ≈ 6 s |
| 5 | RabbitMQ arrêté | `docker compose stop rabbitmq` puis inscription (autre cours) | **201** + avertissement dans les logs + pas de notification |
| 6 | Retour à la normale | `docker compose start course-service rabbitmq` | tout refonctionne |

**Conseils pratiques :**

- Pour chaque ligne, note **le statut ET le corps** de la réponse (capture Postman).
- **Scénario 4 :** le temps est affiché en haut à droite de la réponse Postman. Il vaut ≈ **3 s × 2 tentatives = 6 s**.
- **Scénario 5 :** `docker compose logs enrollment-service` → cherche une ligne du type `Événement enrollment.created perdu : RabbitMQ non connecté` (écrite par `messaging.js`). Le texte `[evenement perdu]` du sujet correspond au `catch` du service, qui ne se déclenche que si le publisher lève une exception.
- **Remets le système en état avant chaque expérience** (surtout après la 4 et la 5).
- Attends quelques secondes après `start rabbitmq` : il met 15–30 s à être prêt, et le service se reconnecte tout seul (`connectRabbit` réessaie).

### 5.2 Les décisions d'architecture (tâche 7.2)

Complète le tableau en te posant, pour chaque dépendance : *« l'opération principale (s'inscrire) peut-elle continuer sans elle ? »*

| Dépendance | Appel | Si elle tombe, l'inscription… | Pistes pour « Pourquoi » et « Autre choix » |
|---|---|---|---|
| course-service | Synchrone (HTTP) | **échoue** (503) | On ne peut pas vérifier que le cours existe. *Autre choix :* accepter l'inscription « en attente » et vérifier plus tard → plus de complexité, risque de références vers des cours inexistants |
| RabbitMQ | Asynchrone (message) | **réussit** (201) | L'inscription est complète sans la notification (cohérence éventuelle). *Autre choix :* faire échouer l'inscription → perd la résilience ; ou « outbox » (stocker l'événement en base et le renvoyer plus tard) → plus de code |
| PostgreSQL | Base du service | **échoue** | C'est la donnée principale : sans elle, rien à enregistrer. Observe quel code tu obtiens (probablement **500** neutre, car l'erreur n'est pas une `AppError`) : est-ce le bon choix ? Un **503** serait plus juste (piste d'amélioration) |

### 5.3 Timeout et retry (tâche 7.3)

1. Dans `container.js`, remplace `createCourseClient()` par `createCourseClient({ timeoutMs: 1000, retries: 0 })`.
2. `docker compose up --build -d enrollment-service`.
3. Refais l'expérience 4 (arrêt du course-service) et note le nouveau délai (≈ **1 s**).
4. Réponds aux questions :
   - *Avantage d'un timeout court ?* L'utilisateur est fixé plus vite, les ressources sont libérées. *Risque ?* Un course-service simplement **lent** (pas en panne) sera considéré comme mort → fausses erreurs 503.
   - *Pas de retry sur un 404 :* la réponse sera identique. *Retry sans limite sur un service surchargé :* chaque client réessaie en boucle → on **aggrave** la surcharge (effet « avalanche »). C'est pourquoi on limite les essais (et que le *circuit breaker* existe).
5. **Remets les réglages par défaut** (`createCourseClient()`), reconstruis le service.

```bash
git add .
git commit -m "docs: experiences de panne et decisions d'architecture"
```

📎 **Pour le livrable :** tableau 7.1 (statuts observés + captures), tableau 7.2, réponses 7.3.

---

## 6. Étape 5 — JWT et rôles : comprendre en cassant (50 min)

### 6.1 Lire le middleware de sécurité (8.1)

Ouvre `services/enrollment-service/src/middleware/auth.js` **sans le modifier**. Dans la version du dépôt :

```js
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
```

Réponds en t'appuyant sur le code **de ton dépôt** :

| Question | Pour trouver la réponse |
|---|---|
| Où est lu le token ? | En-tête `Authorization`, format `Bearer <token>` |
| Quelle fonction / quel secret ? | `jwt.verify(token, jwtSecret)` ; `jwtSecret` vient de `config.js` → variable d'environnement `JWT_SECRET` |
| Quels champs dans `req.user` ? | Le contenu décodé : **`id`**, **`name`**, **`role`** (+ `iat`, `exp` ajoutés par la lib). **Note-les** : tu en as besoin dans les tests |
| Rôle de `requireRole('etudiant')` | Vérifie `req.user.role`. S'exécute **après** `authenticate` (il a besoin de `req.user`) |
| Codes renvoyés | `authenticate` → **401** (pas de token / token invalide ou expiré) ; `requireRole` → **403** (rôle insuffisant) |

### 6.2 Décoder un token (8.2)

1. Dans Postman, exécute la requête de **connexion étudiant**. Le token est dans `{{tokenStudent}}`.
2. Copie-le et décode **localement** (Git Bash) :

```bash
node -e "console.log(JSON.parse(Buffer.from(process.argv[1].split('.')[1], 'base64url')))" "COLLE_LE_TOKEN_ICI"
```

3. Note les champs observés. Tu dois voir quelque chose comme :

```js
{ id: 5, name: 'Alice', role: 'etudiant', iat: 1735000000, exp: 1735014400 }
```

- Le champ qui donne le rôle : **`role`**.
- `exp` est en secondes depuis 1970 ; l'écart `exp - iat` vaut **14400 s = 4 h** (durée choisie dans `user-service` : `expiresIn: '4h'`).
- Pour lire `exp` en date : `node -e "console.log(new Date(1735014400*1000))"`.

> **Retiens :** le contenu d'un JWT est **encodé, pas chiffré**. N'y mets jamais de mot de passe. Et ne colle jamais un vrai token dans un site de décodage en ligne.

### 6.3 Falsifier, expirer, tromper (8.3)

Pour chaque expérience : `GET http://localhost:5000/api/enrollments/mine` dans Postman, onglet **Authorization → Bearer Token**, et note le code.

| N° | Expérience | Fabrication | Attendu |
|---|---|---|---|
| 1 | Token intact | `{{tokenStudent}}` | **200** |
| 2 | Aucun token | *No Auth* | **401** |
| 3 | Signature modifiée | change le **dernier caractère** du token | **401** |
| 4 | Contenu modifié (étudiant → admin) | Script A | **401** |
| 5 | Token expiré | Script B, attendre 2 s | **401** |
| 6 | Mauvais secret | Script C | **401** |
| 7 | Bon secret, mauvais rôle | Script D, appel `POST /api/enrollments` | **403** |

**Script A** (modifier le rôle en gardant l'ancienne signature) :

```bash
node -e "const [h,p,s]=process.argv[1].split('.');const d=JSON.parse(Buffer.from(p,'base64url'));d.role='admin';console.log([h,Buffer.from(JSON.stringify(d)).toString('base64url'),s].join('.'))" "COLLE_LE_TOKEN_ICI"
```

**Scripts B, C, D** — place-toi dans `services/enrollment-service`. Pour éviter de coller ton secret à la main, ces versions le lisent dans `.env` :

```bash
# B : expire après 1 seconde
node -e "const j=require('jsonwebtoken');console.log(j.sign({id:1,role:'etudiant'},process.argv[1],{expiresIn:'1s'}))" "$(grep ^JWT_SECRET= ../../.env | cut -d= -f2-)"

# C : signé avec un autre secret
node -e "const j=require('jsonwebtoken');console.log(j.sign({id:1,role:'etudiant'},'mauvais-secret',{expiresIn:'1h'}))"

# D : bon secret, rôle formateur
node -e "const j=require('jsonwebtoken');console.log(j.sign({id:1,role:'formateur'},process.argv[1],{expiresIn:'1h'}))" "$(grep ^JWT_SECRET= ../../.env | cut -d= -f2-)"
```

> Utilise les **mêmes noms de champs** que ceux observés en 6.2 (`id`, `role`). Le token fabriqué marche même si l'utilisateur `id: 1` n'existe pas : on y reviendra dans les questions.

**Questions de synthèse — comment raisonner :**

1. *Pourquoi l'expérience 4 échoue-t-elle alors que le contenu est modifiable ?* → pense à ce que la **signature** calcule (contenu + secret) et à ce qui se passe quand le contenu change mais pas la signature.
2. *Qu'a-t-il fallu pour fabriquer un token valide (exp. 7) ?* → le **secret**. Conclusion sur son stockage : où est `JWT_SECRET` ? Le fichier `.env` est-il dans Git (regarde `.gitignore`) ?
3. *Pourquoi 403 et pas 401 ?* → le token est valide : le système **sait qui tu es** ; c'est le **droit** qui manque.
4. *Compte supprimé, token valable 4 h ?* → les services ne consultent **pas** la base d'utilisateurs : ils vérifient seulement la signature et `exp`. Le token marche donc jusqu'à son expiration. Pistes de solution : durée de vie courte + *refresh token*, liste de révocation, vérification auprès du user-service pour les actions sensibles.
5. *Secret partagé par 4 services ?* → **avantage :** aucun appel réseau pour vérifier un token (rapide, pas de dépendance). **Risque :** il suffit de compromettre un service pour pouvoir fabriquer des tokens pour tous.
6. *Authenticate oublié sur une route d'un service ?* → la gateway ne vérifie rien, donc la route serait **publique**. La gateway pourrait centraliser la vérification (sujet d'un TP ultérieur).

### 6.4 La matrice des permissions (8.4)

Complète la matrice, **déduis chaque case du code** (middlewares de chaque route), puis **vérifie au moins 6 cases dans Postman**. Voici le raisonnement, déduit des routes du dépôt (à confirmer par tes essais) :

| Route | Anonyme | Étudiant | Formateur | Admin | Raison |
|---|---|---|---|---|---|
| `POST /api/users/register` | 201 | 201 | 201 | 201 | route publique |
| `GET /api/courses` | 200 | 200 | 200 | 200 | catalogue public |
| `POST /api/courses` | 401 | 403 | 201 | 403 | `requireRole('formateur')` uniquement |
| `DELETE /api/courses/:id` (cours d'un **autre** formateur) | 401 | 403 | 403 | 403 | rôle d'abord (formateur), puis **propriété** (`loadOwnedCourse`) |
| `POST /api/enrollments` | 401 | 201* | 403 | 403 | `requireRole('etudiant')` (*ou 409/404/422 selon le cas) |
| `GET /api/enrollments/mine` | 401 | 200 | 403 | 403 | `requireRole('etudiant')` |
| `GET /api/notifications/mine` | 401 | 200 | 200 | 200 | `authenticate` seul |
| `GET /api/users` | 401 | 403 | 403 | 200 | `requireRole('admin')` |
| `GET /api/stats/me` | 401 | 200 | 200 | 200 | la gateway vérifie le token, contenu adapté au rôle |

**À retenir (trois mécanismes distincts) :**

- **Authentification** — *qui es-tu ?* → 401
- **Autorisation par rôle** — *ton rôle suffit-il ?* → 403
- **Autorisation par propriété** — *es-tu le propriétaire de CE cours ?* → 403 (vérifié dans la route/le service, pas dans `requireRole`)

**Bonus (+1) :** `requireRole('formateur', 'admin')` fonctionne déjà, car `requireRole` est écrit avec `(...roles)` et `roles.includes(...)`. Question : faut-il modifier les routes existantes pour autant ? Non → c'est encore le principe **O**.

```bash
git add .
git commit -m "docs: matrice des permissions et experiences JWT"
```

📎 **Pour le livrable :** réponses 8.1, tableau 8.3 (avec captures), les 6 réponses de synthèse, matrice 8.4 complétée.

---

## 7. Étape 6 — Les tests automatiques (80 min)

### 7.1 Installer Jest et Supertest

Dans `services/enrollment-service` :

```bash
npm install --save-dev jest supertest
```

Dans `package.json`, la section `scripts` doit contenir (**garde ta ligne `start`/`dev` d'origine**, ajoute seulement `test`) :

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon -L src/index.js",
  "test": "jest"
}
```

> Les tests tournent **sur ta machine**, sans Docker, sans base, sans réseau. Jest exécute automatiquement tout fichier qui se termine par `.test.js`.

### 7.2 Comprendre ce qu'est un « faux »

Un **faux** (*mock*) est un objet qui remplace une vraie dépendance. Exemple : `findByUserAndCourse: jest.fn().mockResolvedValue(null)` = *« une fonction qui répond toujours "rien en base" »*. `jest.fn()` enregistre aussi comment elle a été appelée (`toHaveBeenCalledWith`, `not.toHaveBeenCalled`).

Un bon test suit le schéma **AAA** : **A**rrange (préparer), **A**ct (agir), **A**ssert (vérifier).

### 7.3 Test unitaire du service (tests tests/enrollmentService.test.js)

```js
const EnrollmentService = require('../src/services/enrollmentService');
const {
  ValidationError, NotFoundError, ConflictError, ServiceUnavailableError, BusinessRuleError,
} = require('../src/errors/AppError');

// Fabrique des faux collaborateurs : aucune base, aucun réseau
function buildFakes() {
  return {
    enrollmentRepository: {
      findByUserAndCourse: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1, user_id: 7, course_id: 'c1', progress: 0 }),
      findByUser: jest.fn().mockResolvedValue([]),
      findCompletedChapters: jest.fn().mockResolvedValue([]),
      countActiveByUser: jest.fn().mockResolvedValue(0),
    },
    courseClient: {
      getCourse: jest.fn().mockResolvedValue({ _id: 'c1', title: 'Git' }),
      getCourses: jest.fn().mockResolvedValue([]),
    },
    eventPublisher: { publish: jest.fn().mockResolvedValue() },
    logger: { error: jest.fn() },
  };
}

describe('EnrollmentService.enroll', () => {
  test("inscrit l'étudiant et publie enrollment.created", async () => {
    const fakes = buildFakes();                                   // Arrange
    const service = new EnrollmentService(fakes);
    const result = await service.enroll({ userId: 7, courseId: 'c1' });   // Act
    expect(result.progress).toBe(0);                              // Assert
    expect(fakes.enrollmentRepository.create).toHaveBeenCalledWith(7, 'c1');
    expect(fakes.eventPublisher.publish).toHaveBeenCalledWith(
      'enrollment.created', { userId: 7, courseId: 'c1', courseTitle: 'Git' });
  });

  test('refuse un courseId manquant (400)', async () => {
    const service = new EnrollmentService(buildFakes());
    await expect(service.enroll({ userId: 7 })).rejects.toThrow(ValidationError);
  });

  test("refuse un cours inexistant (404) et n'écrit rien", async () => {
    const fakes = buildFakes();
    fakes.courseClient.getCourse.mockRejectedValue(new NotFoundError('Cours introuvable'));
    const service = new EnrollmentService(fakes);
    await expect(service.enroll({ userId: 7, courseId: 'x' })).rejects.toThrow(NotFoundError);
    expect(fakes.enrollmentRepository.create).not.toHaveBeenCalled();
  });

  test('refuse une double inscription (409)', async () => {
    const fakes = buildFakes();
    fakes.enrollmentRepository.findByUserAndCourse.mockResolvedValue({ id: 1 });
    const service = new EnrollmentService(fakes);
    await expect(service.enroll({ userId: 7, courseId: 'c1' })).rejects.toThrow(ConflictError);
    expect(fakes.eventPublisher.publish).not.toHaveBeenCalled();
  });

  test('course-service en panne : erreur 503 et aucune inscription', async () => {
    const fakes = buildFakes();
    fakes.courseClient.getCourse.mockRejectedValue(new ServiceUnavailableError('panne'));
    const service = new EnrollmentService(fakes);
    await expect(service.enroll({ userId: 7, courseId: 'c1' })).rejects.toThrow(ServiceUnavailableError);
    expect(fakes.enrollmentRepository.create).not.toHaveBeenCalled();
  });

  test("RabbitMQ en panne : l'inscription reste valide et l'erreur est journalisée", async () => {
    const fakes = buildFakes();
    fakes.eventPublisher.publish.mockRejectedValue(new Error('RabbitMQ absent'));
    const service = new EnrollmentService(fakes);
    const result = await service.enroll({ userId: 7, courseId: 'c1' });
    expect(result.id).toBe(1);
    expect(fakes.logger.error).toHaveBeenCalled();
  });

  // --- Tes 2 tests (tâche 9.2) : voici une solution possible ---
  test('refuse une 6e inscription active (422) et n\'écrit rien', async () => {
    const fakes = buildFakes();
    fakes.enrollmentRepository.countActiveByUser.mockResolvedValue(5);
    const service = new EnrollmentService(fakes);
    await expect(service.enroll({ userId: 7, courseId: 'c1' })).rejects.toThrow(BusinessRuleError);
    expect(fakes.enrollmentRepository.create).not.toHaveBeenCalled();
  });
});

describe('EnrollmentService.listForUser', () => {
  test('renvoie les deux inscriptions enrichies avec le titre du cours', async () => {
    const fakes = buildFakes();
    fakes.enrollmentRepository.findByUser.mockResolvedValue([
      { id: 1, course_id: 'c1', progress: 50 },
      { id: 2, course_id: 'c2', progress: 0 },
    ]);
    fakes.courseClient.getCourses.mockResolvedValue([
      { _id: 'c1', title: 'Git', category: 'Dev', ownerName: 'M', chapters: [{ _id: 'ch1', title: 'Intro' }] },
      { _id: 'c2', title: 'Docker', category: 'Dev', ownerName: 'M', chapters: [] },
    ]);
    const service = new EnrollmentService(fakes);
    const result = await service.listForUser(7);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Git');
  });
});
```

**Lancer :**

```bash
npm test
```

> Remarque : si tu as gardé la version « simple » de `listForUser` (renvoie les lignes brutes), adapte le dernier test (`expect(result).toEqual([...])`). Avec la version enrichie de l'étape 3.8, utilise celui ci-dessus.

#### Vérifier qu'un test sert vraiment à quelque chose (demandé dans le barème)

1. Dans `enrollmentService.js`, **supprime** le bloc `if (existing) { throw ... }`.
2. `npm test` → le test « refuse une double inscription (409) » doit devenir **rouge**. **Capture-le.**
3. Annule ta modification (`git checkout src/services/enrollmentService.js` si tu avais commité avant), relance : tout est vert. **Capture-le aussi.**

### 7.4 Test du client course-service (tests/courseClient.test.js)

On injecte un faux `fetch` : on simule une panne réseau **sans arrêter aucun conteneur**.

```js
const { createCourseClient } = require('../src/courseClient');
const { NotFoundError, ServiceUnavailableError } = require('../src/errors/AppError');

const reponse = (status, body = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

test('renvoie le cours quand le service répond 200', async () => {
  const client = createCourseClient({ fetchImpl: jest.fn().mockResolvedValue(reponse(200, { title: 'Git' })) });
  await expect(client.getCourse('c1')).resolves.toEqual({ title: 'Git' });
});

test('traduit un 404 en NotFoundError, sans nouvel essai', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(reponse(404));
  const client = createCourseClient({ fetchImpl, retries: 2 });
  await expect(client.getCourse('x')).rejects.toThrow(NotFoundError);
  expect(fetchImpl).toHaveBeenCalledTimes(1);          // pas de retry sur un 404
});

test('réessaie après une coupure réseau puis réussit', async () => {
  const fetchImpl = jest.fn()
    .mockRejectedValueOnce(new Error('ECONNREFUSED'))
    .mockResolvedValueOnce(reponse(200, { title: 'Git' }));
  const client = createCourseClient({ fetchImpl, retries: 1 });
  await expect(client.getCourse('c1')).resolves.toEqual({ title: 'Git' });
  expect(fetchImpl).toHaveBeenCalledTimes(2);
});

test('abandonne en 503 quand le réseau reste coupé', async () => {
  const fetchImpl = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
  const client = createCourseClient({ fetchImpl, retries: 1 });
  await expect(client.getCourse('c1')).rejects.toThrow(ServiceUnavailableError);
  expect(fetchImpl).toHaveBeenCalledTimes(2);
});
```

**À comprendre :** le 3ᵉ test vérifie que le *retry* fonctionne (1 échec puis 1 succès = 2 appels) ; le 2ᵉ vérifie qu'on **ne** réessaie **pas** sur un 404 (1 seul appel).

### 7.5 Test d'intégration HTTP (tests/enrollmentRoutes.test.js)

On teste la chaîne **JWT + rôle + contrôleur + gestion d'erreurs** avec un **faux service** : on vérifie les codes HTTP sans base de données.

```js
// Le secret doit être défini AVANT de charger le middleware auth
process.env.JWT_SECRET = 'secret-de-test';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const buildEnrollmentRouter = require('../src/routes/enrollmentRoutes');
const EnrollmentController = require('../src/controllers/enrollmentController');
const errorHandler = require('../src/middleware/errorHandler');
const { NotFoundError } = require('../src/errors/AppError');

// Les noms de champs (id, role) sont ceux observés à l'étape 6.2
const token = (payload, options = { expiresIn: '1h' }) =>
  jwt.sign(payload, process.env.JWT_SECRET, options);
const etudiant = () => token({ id: 7, name: 'Alice', role: 'etudiant' });
const formateur = () => token({ id: 8, name: 'Bob', role: 'formateur' });

function buildApp(enrollmentService) {
  const app = express();
  app.use(express.json());
  const enrollmentController = new EnrollmentController({ enrollmentService });
  app.use('/api/enrollments', buildEnrollmentRouter({ enrollmentController }));
  app.use(errorHandler);
  return app;
}

describe('POST /api/enrollments', () => {
  test('401 sans token', async () => {
    const res = await request(buildApp({})).post('/api/enrollments').send({ courseId: 'c1' });
    expect(res.status).toBe(401);
  });

  test('401 avec un token expiré', async () => {
    const expire = token({ id: 7, role: 'etudiant' }, { expiresIn: -10 });
    const res = await request(buildApp({}))
      .post('/api/enrollments').set('Authorization', `Bearer ${expire}`).send({ courseId: 'c1' });
    expect(res.status).toBe(401);
  });

  test('401 avec un token signé par un autre secret', async () => {
    const faux = jwt.sign({ id: 7, role: 'etudiant' }, 'mauvais-secret');
    const res = await request(buildApp({}))
      .post('/api/enrollments').set('Authorization', `Bearer ${faux}`).send({ courseId: 'c1' });
    expect(res.status).toBe(401);
  });

  test('403 pour un formateur', async () => {
    const res = await request(buildApp({}))
      .post('/api/enrollments').set('Authorization', `Bearer ${formateur()}`).send({ courseId: 'c1' });
    expect(res.status).toBe(403);
  });

  test('201 pour un étudiant, et le service reçoit son identifiant', async () => {
    const enrollmentService = { enroll: jest.fn().mockResolvedValue({ id: 1, progress: 0 }) };
    const res = await request(buildApp(enrollmentService))
      .post('/api/enrollments').set('Authorization', `Bearer ${etudiant()}`).send({ courseId: 'c1' });
    expect(res.status).toBe(201);
    expect(res.body.progress).toBe(0);
    expect(enrollmentService.enroll).toHaveBeenCalledWith({ userId: 7, courseId: 'c1' });
  });

  test('404 et code lisible quand le service lève NotFoundError', async () => {
    const enrollmentService = {
      enroll: jest.fn().mockRejectedValue(new NotFoundError('Cours introuvable', 'COURSE_NOT_FOUND')),
    };
    const res = await request(buildApp(enrollmentService))
      .post('/api/enrollments').set('Authorization', `Bearer ${etudiant()}`).send({ courseId: 'x' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Cours introuvable', code: 'COURSE_NOT_FOUND' });
  });

  test('500 neutre quand une erreur inattendue survient (rien ne fuit)', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const enrollmentService = { enroll: jest.fn().mockRejectedValue(new Error('password=secret db host')) };
    const res = await request(buildApp(enrollmentService))
      .post('/api/enrollments').set('Authorization', `Bearer ${etudiant()}`).send({ courseId: 'c1' });
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('password');
  });
});
```

**Pourquoi ce test ne charge pas `container.js` ?** Parce que `container.js` branche le vrai RabbitMQ et la vraie base. En construisant l'application avec un faux service, le test est rapide et indépendant.

**Point d'attention (le plus fréquent) :** `process.env.JWT_SECRET = ...` doit être **la toute première ligne**, avant tout `require` : `config.js` lit la variable au moment où il est chargé.

### 7.6 Compter les tests

```bash
npm test
```

| Fichier | Nombre de tests |
|---|---|
| `enrollmentService.test.js` | 8 (6 du sujet + règle des 5 + `listForUser`) |
| `courseClient.test.js` | 4 |
| `enrollmentRoutes.test.js` | 7 |
| **Total** | **19** (minimum demandé : 15) |

### 7.7 Couverture (9.5)

```bash
npx jest --coverage
# pour voir aussi les fichiers jamais chargés par un test :
npx jest --coverage --collectCoverageFrom='src/**/*.js'
```

**Comment lire le tableau :** pour chaque fichier, le pourcentage de lignes exécutées par les tests. Repère le plus couvert, le moins couvert, puis réponds :

- *100 % = pas de bug ?* Non : la couverture dit que la ligne a été **exécutée**, pas que le test a vérifié le **bon résultat**. Un test sans `expect` pertinent peut couvrir 100 % sans rien prouver.
- *Fichier non couvert ?* Typiquement le **repository** (il parle à une vraie base) et `messaging.js`. Il faudrait un test d'**intégration avec une vraie base** ou un test **de bout en bout** (Postman).

### 7.8 La pyramide de tests (9.6)

| Niveau | Ce que tu as utilisé | Nombre (à compter) | Temps | Ce qu'il ne détecte pas |
|---|---|---|---|---|
| Unitaire | Jest + faux collaborateurs (service, client) | 12 | quelques ms (lis la ligne `Time:` de Jest) | Les erreurs d'assemblage entre couches, le vrai SQL, le vrai réseau |
| Intégration (HTTP, faux service) | Jest + Supertest | 7 | < 1 s | Le vrai accès base, les vrais autres services |
| Bout en bout | Collection Postman | nombre de requêtes de la collection | plusieurs secondes à minutes | Les cas rares et précis (lent, difficile à diagnostiquer) |

```bash
git add .
git commit -m "test: ajoute les tests unitaires, client HTTP et routes"
```

📎 **Pour le livrable :** capture `npm test` (tous verts), capture `npx jest --coverage`, capture du test cassé puis réparé, réponses 9.5, tableau 9.6.

---

## 8. Étape 7 — Clôture : Pull Request et livrable

### 8.1 Dernier contrôle technique

```bash
# à la racine du projet
docker compose up --build -d
docker compose ps                      # 11 conteneurs
git status                             # pas de .env, pas de secrets
git log --oneline -10                  # commits clairs et nombreux
```

Relance **la collection Postman complète** : tout doit rester vert.

### 8.2 Envoyer et ouvrir la PR

```bash
git push -u origin feature/tp5bis-refactoring
```

Sur GitHub, ouvre une **Pull Request** de ta branche vers `main` **de ton fork**. Description en 5 lignes :

```
## Ce qui a changé
Découpage de enrollment-service en couches (routes / contrôleur / service / repository),
erreurs AppError + errorHandler, client course-service avec timeout et retry,
règle des 5 inscriptions actives, 19 tests Jest/Supertest.

## Ce qui n'a pas changé
Le comportement de l'API (mêmes routes, mêmes réponses), le frontend, les autres services.

## Comment vérifier
cd services/enrollment-service && npm test  |  collection Postman du TP5 (tout vert).
```

Demande à un camarade de relire et de laisser **au moins un commentaire utile** (ça compte dans la note Git).

### 8.3 Le document à rendre : `NOM_Prenom_TP5bis` (Word ou PDF)

Plan conseillé, dans l'ordre du sujet :

1. Lien de la **Pull Request** + capture de `git log --oneline -10`
2. Capture de l'arborescence `src/`
3. Tableau de diagnostic (4.1, 4.2, 4.3)
4. Fiche SOLID (6.1) + réponse 6.2
5. Tableau des expériences de panne (7.1), tableau des décisions (7.2), réponses 7.3
6. Réponses 8.1, tableau JWT (8.3), six questions de synthèse, matrice des permissions (8.4)
7. Captures `npm test` et `npx jest --coverage` (+ test cassé puis réparé)
8. Capture Postman entièrement verte
9. Tableau de la pyramide de tests (9.6)
10. Réponses aux questions 5.2, 5.3, 5.5 et au QCM

> Rédige les réponses **avec tes propres mots** : le barème valorise la justification, pas la copie.

### 8.4 Barème (20 pts) — où gagner les points

| Critère | Pts | Ce qui compte |
|---|---|---|
| Couches | 4 | aucun SQL hors repository, aucun `req/res` hors contrôleur/route |
| SOLID + évolution 6.2 | 3 | preuves précises (fichier + fonction), règle des 5 fonctionnelle |
| Erreurs et dépendances | 4 | 503, 404, 409, timeout, panne RabbitMQ, **justifiés** |
| JWT | 3 | expériences, synthèse, matrice |
| Tests | 4 | ≥ 15 verts, un test cassé volontairement puis réparé, couverture commentée |
| Git | 2 | branche, petits commits, PR relue |

**Bonus (+1 chacun) :** migration de `complete` (3.11) ; `requireRole` multi-rôles (6.4) ; refactoring d'un deuxième service.

---

## Annexe A — Aide pour les questions de compréhension et le QCM

Je ne donne pas les lettres : voici **comment raisonner** pour les trouver (et pouvoir justifier à l'oral).

| N° | Sujet | Comment raisonner |
|---|---|---|
| 1 | Où est le SQL ? | Relis le tableau des couches (partie 2.1 du sujet) : qui est « le garde-manger » ? |
| 2 | Que ne doit pas contenir un service ? | Un service ignore HTTP. Quels objets appartiennent au monde HTTP ? |
| 3 | Un contrôleur qui lit la requête, interroge la base **et** envoie un mail | Combien de « raisons de changer » ? Quel principe parle de cela ? |
| 4 | Le service reçoit son repository par le constructeur | Quelle lettre de SOLID parle de « dépendre d'abstractions » ? |
| 5 | Course-service muet après le timeout | Dépendance indisponible = quelle famille de codes (5xx) et lequel exactement ? |
| 6 | Pas de retry sur un 404 | Que donnerait une deuxième requête identique ? |
| 7 | RabbitMQ arrêté, inscription OK | Les données finissent par être cohérentes, avec un délai ou une perte : quel terme (partie 3 du README TP5) ? |
| 8 | Contenu du token modifié sans changer la signature | Revois ton expérience n° 4 |
| 9 | Connecté mais rôle insuffisant | 401 ou 403 ? (« je sais qui vous êtes… ») |
| 10 | Test unitaire du service sans PostgreSQL | Par quoi les dépendances sont-elles remplacées ? |
| 11 | Postman sur toute l'application | Le test traverse tout le système : quel niveau de la pyramide ? |
| 12 | `BusinessRuleError` sans toucher `errorHandler.js` | Tu l'as vécu en 6.2 : quelle lettre de SOLID ? |

---

## Annexe B — Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Cannot find module '../src/...'` | Mauvais dossier, faute de nom/majuscule | Lance `npm test` depuis `services/enrollment-service` ; vérifie les chemins |
| `db.query is not a function` | Import erroné du pool | Utilise `const { pool } = require('../db/postgres')` et `pool.query` |
| `jest` non reconnu | Installation oubliée | `npm install --save-dev jest supertest` dans le bon dossier |
| Les tests de routes plantent à l'import de `auth.js` | Variable d'environnement lue au chargement | `process.env.JWT_SECRET = ...` tout en haut du test, avant les `require` ; au besoin `jest.mock('../src/db/postgres')` |
| Test 401 attendu, on obtient 403 ou 200 | Champs du token différents de ceux de `authenticate` | Reprends les noms observés en 6.2 (`id`, `name`, `role`) |
| `fetch is not defined` | Node trop ancien | Utilise Node 18+ (20 recommandé) |
| La route répond avec l'ancien comportement | Ancien routeur avant le nouveau, ou image non reconstruite | Nouveau routeur **avant** l'ancien ; `docker compose up --build -d enrollment-service` |
| Toutes les erreurs renvoient 500 / pas de champ `code` | `errorHandler` absent, mal placé, ou ancien handler encore présent | `app.use(errorHandler)` = dernière instruction ; supprime l'ancien handler en ligne |
| `asyncHandler is not a function` | Mauvais import/export | Le fichier exporte directement la fonction : `module.exports = (fn) => ...` |
| L'ancienne route `complete` plante après la réécriture du client | Elle attendait `null` quand le cours n'existe pas | Elle reçoit maintenant une `NotFoundError` (404 via `errorHandler`) : comportement équivalent côté client |
| `GET /mine` ne renvoie plus `title`, `chapters`… | `listForUser` renvoie les lignes brutes | Applique l'enrichissement de l'étape 3.8 |
| Le scénario de panne dure ≈ 6 s | Timeout cumulé de 2 essais | Normal : 3 s × 2 tentatives |
| Postman : 404 sur `/api/enrollments` | Préfixe oublié | Les routes sont relatives (`'/'`, `'/mine'`) ; le préfixe est dans `index.js` |
| Les tests passent, mais Docker plante au démarrage | Les tests n'exécutent pas `index.js`/`container.js` | Regarde `docker compose logs enrollment-service` : la 1ʳᵉ erreur est la bonne |
| Pas de nouvelles notifications après l'arrêt de RabbitMQ | Normal : messages perdus pendant la panne (choix de conception du sujet) | Voir tableau 7.2 |

---

## Annexe C — Check-list finale

- [ ] Fork cloné, branche `feature/tp5bis-refactoring`
- [ ] Point de référence : 11 conteneurs, health OK, Postman vert (avant refactoring)
- [ ] Diagnostic 4.1 / 4.2 / 4.3 rempli
- [ ] Fichiers créés : `AppError.js`, `errorHandler.js`, `courseClient.js` (réécrit), repository, service, contrôleur, routes, `container.js`
- [ ] `index.js` : nouveau routeur avant l'ancien, `app.use(errorHandler)` en dernier
- [ ] Ancien `POST /` et `GET /mine` supprimés de `routes/enrollments.js`
- [ ] `GET /mine` renvoie toujours la réponse enrichie
- [ ] Postman **entièrement vert** après refactoring (capture)
- [ ] Fiche SOLID + règle des 5 inscriptions (422) + réponse 6.2
- [ ] 6 expériences de panne notées, tableau des décisions, réglages 7.3 **remis par défaut**
- [ ] Expériences JWT (7), 6 questions de synthèse, matrice avec ≥ 6 cases vérifiées
- [ ] `npm test` : **≥ 15 tests verts** ; test cassé volontairement puis réparé ; couverture commentée
- [ ] Pyramide de tests (9.6) remplie
- [ ] Aucun secret dans Git (`.env` ignoré)
- [ ] Commits nombreux, PR ouverte, **au moins 1 commentaire utile** d'un camarade
- [ ] Document `NOM_Prenom_TP5bis` assemblé (Word/PDF)

---

*Bon courage ! En cas de blocage : lis la **première** erreur (logs Docker ou sortie Jest), compare avec la version d'origine (`git show HEAD:...`), puis avance par petites étapes avec un commit à chaque fois.*
