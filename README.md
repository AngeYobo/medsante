# MédSanté Pro v2

**Logiciel de gestion - Médecine du Travail**

Application web complète destinée aux services de santé au travail (secrétaires, infirmier(e)s, médecins) pour le suivi médical réglementaire des salariés.

---

## Fonctionnalités

### Gestion courante
- **Tableau de bord** - KPIs en temps réel : effectif, visites à venir/en retard, restrictions, AT/MP
- **Gestion des salariés** - Fiches complètes (identité, poste, service, risques, vaccinations, aptitude)
- **Visites médicales** - Planification, suivi, historique, conclusions médicales protégées par rôle
- **Calendrier visuel** - Vue mensuelle des visites avec navigation et code couleur par type

### Prévention & Risques
- **Registre AT / MP** - Accidents du travail et maladies professionnelles (gravité, arrêt, causes, mesures correctives)
- **Campagnes de prévention** - Vaccination, dépistage, formation avec suivi de participation
- **Risques professionnels** - Association des risques par salarié et statistiques d'exposition

### Outils & Rapports
- **Rapports annuels PDF** - Génération complète avec aperçu et export (effectif, visites, aptitudes, AT/MP, risques, campagnes)
- **Import / Export CSV** - Import de fichiers salariés, export des données (compatible Excel)
- **Recherche globale** - Recherche instantanée dans les salariés, visites, AT/MP et campagnes
- **Notifications** - Alertes pour visites à programmer, échéances, campagnes
- **Statistiques** - Graphiques par service, risques, types de visite, aptitudes

### Sécurité & Rôles
| Rôle | Code démo | Droits |
|------|-----------|--------|
| Secrétaire | `SEC01` | Gestion administrative, planification des visites |
| Infirmier(e) | `INF01` | Consultation des dossiers, visites (lecture seule salariés) |
| Médecin | `MED01` | Accès complet, conclusions médicales, aptitudes |

---

## Installation

### Prérequis
- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/) (ou npm / yarn)

### Mise en place

```bash
# Cloner le projet
git clone <url-du-repo>
cd santepro

# Créer le projet Vite + React
pnpm create vite . --template react

# Installer les dépendances
pnpm install

# Remplacer le composant principal
cp medsante-v2.jsx src/App.jsx

# Lancer le serveur de développement
pnpm dev
```

L'application sera accessible sur **http://localhost:5173**

### Build de production

```bash
pnpm build
pnpm preview
```

Les fichiers compilés seront dans le dossier `dist/`.

---

## Structure du projet

```
santepro/
├── src/
│   ├── App.jsx          ← Application principale (MédSanté Pro)
│   └── main.jsx         ← Point d'entrée React (généré par Vite)
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Utilisation

### Connexion
Au lancement, entrez l'un des codes d'accès (voir tableau ci-dessus). Les droits varient selon le rôle.

### Import CSV de salariés
Le fichier CSV doit utiliser le séparateur `;` avec les colonnes suivantes :

```
nom;prenom;matricule;dateNaissance;poste;service;dateEmbauche;risques;vaccinations;aptitude;notes
```

- **risques** et **vaccinations** : valeurs séparées par des virgules
- **aptitude** : `apte`, `apte_restrictions`, `inapte_temporaire`, `inapte`, `en_attente`
- Encodage : UTF-8

### Export PDF
1. Aller dans **Rapports PDF**
2. Sélectionner l'année
3. Cliquer sur **Générer le rapport**
4. Cliquer sur **Exporter en PDF** → le rapport s'ouvre dans un nouvel onglet
5. Utiliser `Ctrl+P` (ou `Cmd+P`) → choisir **Enregistrer au format PDF**

---

## Persistance des données

Les données sont sauvegardées automatiquement via l'API `window.storage` (persistance entre sessions). Les clés utilisées :

| Clé | Contenu |
|-----|---------|
| `ms2-employees` | Liste des salariés |
| `ms2-visits` | Visites médicales |
| `ms2-notifications` | Notifications |
| `ms2-accidents` | Registre AT / MP |
| `ms2-campaigns` | Campagnes de prévention |

> **Note** : En environnement local (hors Claude.ai), les données sont stockées en mémoire et réinitialisées à chaque rechargement. Pour une persistance locale, remplacez `window.storage` par `localStorage` dans le code.

---

## Personnalisation

### Ajouter un utilisateur
Dans le fichier `App.jsx`, ajoutez une entrée au tableau `USERS` :

```javascript
{ id: 4, code: "INF02", name: "Julie Blanc", role: "infirmiere" },
```

### Ajouter un service
Ajoutez une entrée au tableau `SERVICES` :

```javascript
const SERVICES = [
  "Production", "Maintenance", ..., "Mon nouveau service"
];
```

### Ajouter un risque professionnel
Ajoutez une entrée au tableau `RISQUES` :

```javascript
const RISQUES = [
  "Bruit", "Vibrations", ..., "Nouveau risque"
];
```

---

## Conformité réglementaire

Cette application est conçue dans le respect de :
- **RGPD** - Séparation des accès par rôle, données médicales protégées
- **Code du Travail** - Types de visites réglementaires (embauche, périodique, reprise, pré-reprise)
- **Secret médical** - Conclusions médicales accessibles uniquement au médecin

> ⚠️ **Important** : Pour un déploiement en production avec des données de santé réelles, un hébergement certifié **HDS** (Hébergeur de Données de Santé) est obligatoire.

---

## Évolutions prévues

- [ ] Authentification sécurisée (JWT / OAuth)
- [ ] Base de données backend (PostgreSQL)
- [ ] Hébergement HDS
- [ ] Gestion multi-sites
- [ ] API REST pour intégration RH
- [ ] Application mobile (PWA)
- [ ] Signature électronique des fiches d'aptitude
- [ ] Intégration avec les logiciels de paie

---

## Technologies

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 6
- CSS custom (sans framework)
- Fonts : DM Sans + Source Serif 4

---

## Licence

Usage interne - © 2026 MédSanté Pro. Toute reproduction ou distribution sans autorisation est interdite.