# SmartCampus — Architecture frontend et plan des 6 modules

## 1. Principes
1. **Un module = un dossier autonome** dans `src/features/<module>/`. Un module n'importe jamais un autre module : il ne dépend que de `src/api`, `src/auth`, `src/components`, `src/i18n`, `src/lib`.
2. **Le shell ne connaît pas le contenu des modules** : il lit seulement `features/registry.ts` (route, icône, rôles autorisés). Ajouter un module = remplir son dossier, rien d'autre à toucher.
3. **Tout appel réseau passe par `src/api/client.ts`** (API Gateway + JWT). Chaque fonction d'API d'un module fournit son `mock`, donc l'app tourne sans backend (`VITE_USE_MOCKS=true`).
4. **Les textes** vivent dans `<module>/i18n.ts` (`registerMessages`). Aucune chaîne en dur dans les composants.
5. **Rôles : 3 seulement** — `student` (Étudiant), `teacher` (Enseignant), `admin` (Administrateur). Les droits fins se règlent par permission (matrice du module 1), pas par de nouveaux rôles.
6. **Chaque module a ses dossiers dédiés et son `README.md`** (rôle, pages, routes d'API, événements, règles métier, checklist back-end). Le back-end est en microservices ; le front est **une seule application React**.

## 2. Structure globale
```
src/
├─ api/            client.ts (gateway + JWT) · errors.ts · useQuery.ts · useMutation.ts
├─ auth/           roles.ts (3 rôles) · jwt.ts · RequireSession.tsx · AuthContext (ré-export)
├─ components/
│  ├─ ui/          primitives shadcn (button, card, dialog, select, switch…)
│  └─ shared/      StatCard, StatusPill, DataTable, ConfirmDialog, EmptyState, Stepper,
│                  Timeline, CapacityGauge, ConflictAlert, ErrorViews, ModuleBoundary…
├─ i18n/           fr.ts (socle) · index.tsx (registerMessages)
├─ layout/         AppShell, TopBar, Sidebar, MobileNav, DemoPanel
├─ lib/            utils, format, tones
└─ features/
   ├─ registry.ts  liste des 6 modules (ordre de la sidebar)
   ├─ types.ts     contrat ModuleDef
   ├─ _shared/     serviceHealth (panne simulée par module)
   ├─ dashboard/   tableau de bord après connexion (hors modules)
   ├─ home/        page d'accueil publique (« / » sans session)
   └─ users | academic | resources | housing | student-life | library
```

## 3. Gabarit d'un module (identique pour les 6)
```
features/<module>/
├─ README.md       fiche du module : rôles, pages, routes d'API, événements, règles, checklist back-end
├─ index.ts        ModuleDef : id, path, icône, rôles, Page (lazy)
├─ api/            fonctions d'API + mock (une fonction = une route du microservice)
├─ mocks/          données fictives typées + « base » en mémoire
├─ hooks/          useXxx() = useQuery/useMutation autour de api/
├─ types/          entités, DTO, filtres, constantes de domaine
├─ schemas/        validation (zod) des formulaires
├─ utils/          fonctions pures du module (dates, validation…)
├─ i18n/           messages français du module
├─ components/     composants propres au module
└─ pages/
   ├─ <Module>Module.tsx   sous-routes + onglets du module
   └─ XxxPage.tsx          une page = un écran
```
Chaque dossier se termine par un `index.ts` : on importe donc `../api`, `../hooks`, `../types`… sans connaître les fichiers à l'intérieur.
Règles : une page ne contient que de la composition (données via hooks, UI via composants) ; chaque page gère les états **chargement (skeleton) / vide (EmptyState) / erreur (503 → ServiceUnavailableView, 403, 409)** ; les événements de domaine s'affichent en toast. Un dossier vide ou inutile n'est pas créé (ex. `schemas/` absent si le module n'a pas de formulaire).

## 4. Ordre de construction et contenu des modules

| # | Module | Rôles | Statut |
|---|---|---|---|
| 1 | **Utilisateurs** `/utilisateurs` | admin (+ profil pour tous) | Fait |
| 2 | **Académique** `/academique` | student, teacher, admin | Fait |
| 3 | **Ressources** `/ressources` | teacher, admin | Fait |
| 4 | **Résidences** `/residences` | student, admin | Fait |
| 5 | **Vie étudiante & clubs** `/vie-etudiante` | student, teacher, admin | Fait |
| 6 | **Bibliothèque** `/bibliotheque` | student, teacher, admin | Fait |

### Module 1 — Utilisateurs (user-service) — fait
```
users/
├─ index.ts · README.md · routes.ts · api/ · mocks/ · hooks/ · types/ · utils/ · i18n/
├─ auth/            (pages publiques)
│  ├─ AuthContext.tsx · schemas.ts · api.mock.ts
│  ├─ components/   AuthShell, EmailField, PasswordInput, PasswordStrength, AttemptAlert,
│  │                CountdownButton, OtpInput, Field
│  └─ pages/        LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage
├─ components/      AccountForm, AccountStatusBadge, LoginHistoryTable, Fields
└─ pages/           UsersModule (onglets), UsersListPage, RolesMatrixPage, LoginHistoryPage, ProfilePage
```
Endpoints : `POST /auth/login`, `POST /users`, `GET /users/{id}`, `PUT /users/{id}/role`. Événements : `UtilisateurCréé`, `RôleModifié`.

### Module 2 — Académique (academic-service)
```
academic/
├─ index.ts · README.md · api/ · mocks/ · hooks/ · types/ · schemas/ · i18n/
├─ components/  CourseCard, TimetableGrid, GradeTable, EnrollmentStepper, ProgressRing
└─ pages/
   ├─ AcademicModule.tsx
   ├─ CoursesPage.tsx        catalogue + recherche (tous)
   ├─ CourseDetailPage.tsx   syllabus, enseignant, inscrits
   ├─ TimetablePage.tsx      emploi du temps (étudiant/enseignant)
   ├─ GradesPage.tsx         étudiant : mes notes · enseignant : saisie
   └─ EnrollmentsPage.tsx    inscriptions pédagogiques (admin valide : En attente → Validé/Refusé)
```
Types : `Course`, `Session`, `Enrollment`, `Grade`, `Semester`. Endpoints : `GET /courses`, `POST /enrollments`, `PUT /grades`. Événements : `InscriptionValidée`, `NotePubliée`. Règle : conflit d'horaire → 409 (`ConflictAlert`).

### Module 3 — Ressources (resource-service)
```
resources/
├─ index.ts · README.md · api/ · mocks/ · hooks/ · types/ · schemas/ · utils/ · i18n/
├─ components/  RoomCard, AvailabilityCalendar, ReservationForm, EquipmentList
└─ pages/
   ├─ ResourcesModule.tsx
   ├─ RoomsPage.tsx              salles et équipements, filtres capacité/bâtiment
   ├─ ReservationsPage.tsx       mes réservations (Timeline de statut)
   ├─ ReservationRequestPage.tsx formulaire + détection de conflit 409
   └─ ApprovalsPage.tsx          admin : valider / refuser
```
Types : `Room`, `Equipment`, `Reservation`. Endpoints : `GET /rooms`, `POST /reservations`, `PUT /reservations/{id}/status`. Événements : `RéservationCréée`, `RéservationConfirmée`. Composants partagés : `CapacityGauge`, `ConflictAlert`, `StatusPill`.

### Module 4 — Résidences (housing-service)
```
housing/
├─ index.ts · README.md · api/ · mocks/ · hooks/ · types/ · schemas/ · utils/ · i18n/
├─ components/  ResidenceCard, RoomPicker, HousingRequestStepper, OccupancyChart
└─ pages/
   ├─ HousingModule.tsx
   ├─ ResidencesPage.tsx   résidences + CapacityGauge
   ├─ MyRequestPage.tsx    étudiant : demande en 4 étapes (Stepper) + suivi (Timeline)
   ├─ RequestsPage.tsx     admin : file des demandes, affectation
   └─ MaintenancePage.tsx  signalement de pannes (remplace le rôle Technicien : l'admin les traite)
```
Types : `Residence`, `HousingRoom`, `HousingRequest`, `Ticket`. Endpoints : `GET /residences`, `POST /housing-requests`, `PUT /housing-requests/{id}/assign`. Événements : `DemandeDéposée`, `ChambreAffectée`. Règle : résidence pleine → 409.

### Module 5 — Vie étudiante & clubs (club-service)
```
student-life/
├─ index.ts · README.md · api/ · mocks/ · hooks/ · types/ · schemas/ · utils/ · i18n/
├─ components/  ClubCard, EventCard, MembershipButton, EventForm
└─ pages/
   ├─ StudentLifeModule.tsx
   ├─ ClubsPage.tsx          annuaire + adhésion
   ├─ ClubDetailPage.tsx     membres, événements
   ├─ EventsPage.tsx         agenda campus
   └─ ClubAdminPage.tsx      admin : créer/valider clubs, adhésions
```
Types : `Club`, `Membership`, `CampusEvent`. Endpoints : `GET /clubs`, `POST /clubs/{id}/members`, `POST /events`. Événements : `ClubCréé`, `AdhésionConfirmée`. (La gestion d'un club est faite par l'admin ; pas de rôle « responsable de club ».)

### Module 6 — Bibliothèque (library-service)
```
library/
├─ index.ts · README.md · api/ · mocks/ · hooks/ · types/ · schemas/ · utils/ · i18n/
├─ components/  BookCard, AvailabilityBadge, LoanRow, BookForm
└─ pages/
   ├─ LibraryModule.tsx
   ├─ CatalogPage.tsx      recherche, filtres, disponibilité
   ├─ BookDetailPage.tsx   emprunter / réserver
   ├─ MyLoansPage.tsx      prêts en cours, retards, prolongation
   └─ LoansAdminPage.tsx   admin : prêts, retours, ajout d'ouvrages
```
Types : `Book`, `Loan`, `Reservation`. Endpoints : `GET /books`, `POST /loans`, `PUT /loans/{id}/return`. Événements : `LivreEmprunté`, `LivreRetourné`.

## 5. Matrice des accès (3 rôles)
| Module | Étudiant | Enseignant | Administrateur |
|---|---|---|---|
| Utilisateurs | profil seul | profil seul | tout |
| Académique | ses cours, notes | ses cours, saisie | tout + validation |
| Ressources | — | réserver | tout + validation |
| Résidences | sa demande | — | tout + affectation |
| Vie étudiante | adhérer | adhérer | tout |
| Bibliothèque | emprunter | emprunter | tout + gestion |

## 6. Définition de « module terminé »
- Pages avec états chargement / vide / erreur (503, 403, 409).
- Mocks cohérents (base en mémoire) et endpoints typés dans `api.ts`.
- Textes dans `i18n.ts`, validation dans `schemas.ts`.
- Accessibilité : labels visibles, navigation clavier, contraste AA, focus visible.
- `npx tsc -b --noEmit` et `npx vite build` sans erreur ; aucune modification des autres modules.
