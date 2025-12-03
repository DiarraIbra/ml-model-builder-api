# ML Model Builder API

Plateforme complète pour l'entraînement, l'évaluation et le déploiement de modèles de Machine Learning (classification et régression).

## Table des matières

- [Prérequis](#prérequis)
- [Architecture du projet](#architecture-du-projet)
- [Installation](#installation)
  - [1. Cloner le dépôt](#1-cloner-le-dépôt)
  - [2. Configuration du Backend](#2-configuration-du-backend)
  - [3. Configuration du Frontend](#3-configuration-du-frontend)
  - [4. Configuration de la base de données](#4-configuration-de-la-base-de-données)
- [Lancement de l'application](#lancement-de-lapplication)
- [Utilisation](#utilisation)
- [Technologies utilisées](#technologies-utilisées)
- [Fonctionnalités](#fonctionnalités)

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Python** 3.8 ou supérieur ([Télécharger Python](https://www.python.org/downloads/))
- **Node.js** 18.x ou supérieur ([Télécharger Node.js](https://nodejs.org/))
- **npm** ou **yarn** (inclus avec Node.js)
- **MySQL** 8.0 ou supérieur ([Télécharger MySQL](https://dev.mysql.com/downloads/))
- **Git** ([Télécharger Git](https://git-scm.com/downloads))

## Architecture du projet

```
Project_MLOPS/
├── backend/              # API Flask
│   ├── algorithms/       # Algorithmes ML personnalisés
│   ├── models/          # Modèles entraînés (.pkl) et rapports
│   ├── app.py           # Point d'entrée de l'API
│   └── requirements.txt # Dépendances Python
├── frontend/            # Application Next.js
│   ├── components/      # Composants React
│   ├── app/            # Pages et routes Next.js
│   ├── lib/            # Utilitaires et helpers
│   └── package.json    # Dépendances Node.js
└── README.md           # Ce fichier
```

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/DiarraIbra/ml-model-builder-api.git
cd Project_MLOPS
```

### 2. Configuration du Backend

#### a. Créer un environnement virtuel Python (recommandé)

**Sur Windows :**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Sur macOS/Linux :**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### b. Installer les dépendances Python

```bash
pip install -r requirements.txt
```

Les dépendances incluent :

- Flask 3.0.0
- flask-cors 4.0.0
- pandas ≥2.2.0
- numpy ≥1.26.4
- scikit-learn ≥1.4.0
- mysql-connector-python ≥8.3.0
- psutil ≥5.9.0

#### c. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` (optionnel, des valeurs par défaut sont définies) :

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=votre_mot_de_passe
MYSQL_DB=mlops
```

### 3. Configuration du Frontend

#### a. Installer les dépendances Node.js

```bash
cd ../frontend
npm install
```

Ou avec yarn :

```bash
yarn install
```

#### b. Configuration de l'API Backend

Le frontend est configuré pour communiquer avec le backend sur `http://localhost:5000`. Si vous utilisez un autre port, modifiez les appels API dans le code.

### 4. Configuration de la base de données

#### a. Créer la base de données MySQL

Connectez-vous à MySQL :

```bash
mysql -u root -p
```

Créez la base de données :

```sql
CREATE DATABASE mlops CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### b. Initialisation automatique des tables

Les tables seront créées automatiquement au premier lancement du backend grâce aux fonctions `ensure_models_table()` et `ensure_api_usage_table()`.

Tables créées :

- **models** : Stocke les métadonnées des modèles entraînés
- **api_usage_events** : Logs des événements d'utilisation de l'API

## Lancement de l'application

### 1. Démarrer le Backend

Dans le dossier `backend/` avec l'environnement virtuel activé :

```bash
python app.py
```

Le serveur Flask démarre sur `http://localhost:5000`

**Note :** Par défaut, Flask démarre en mode développement. Pour la production, utilisez un serveur WSGI comme Gunicorn.

### 2. Démarrer le Frontend

Dans un nouveau terminal, dans le dossier `frontend/` :

```bash
npm run dev
```

Ou avec yarn :

```bash
yarn dev
```

L'application Next.js démarre sur `http://localhost:3000`

### 3. Accéder à l'application

Ouvrez votre navigateur et accédez à :

```
http://localhost:3000
```

## Utilisation

### Entraîner un modèle

1. **Télécharger un fichier CSV** contenant vos données
2. **Sélectionner le type de modèle** : Classification ou Régression
3. **Choisir les features d'entrée** et la **variable cible**
4. **Lancer l'entraînement** : Le système teste automatiquement plusieurs algorithmes
5. **Consulter les résultats** : Métriques, justification du meilleur modèle, et rapport détaillé

### Algorithmes disponibles

**Classification :**

- Logistic Regression
- Decision Tree
- Random Forest
- Gradient Boosting
- Support Vector Machine (SVM)
- Naive Bayes
- K-Nearest Neighbors (KNN)

**Régression :**

- Linear Regression
- Ridge Regression
- Lasso Regression
- Decision Tree Regressor
- Random Forest Regressor
- Gradient Boosting Regressor
- Support Vector Regressor (SVR)
- K-Nearest Neighbors Regressor

### Gérer les modèles

- **Visualiser** tous les modèles entraînés
- **Télécharger** les modèles (.pkl) et rapports (.txt)
- **Supprimer** les modèles obsolètes
- **Consulter les statistiques** d'utilisation de l'API

## Technologies utilisées

### Backend

- **Flask** : Framework web Python
- **Scikit-learn** : Bibliothèque de Machine Learning
- **Pandas & NumPy** : Manipulation et analyse de données
- **MySQL** : Base de données relationnelle
- **Joblib** : Sérialisation des modèles

### Frontend

- **Next.js 16** : Framework React
- **React 19** : Bibliothèque UI
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **Radix UI** : Composants accessibles
- **Recharts** : Visualisation de données
- **React Hook Form + Zod** : Gestion et validation de formulaires

## Fonctionnalités

- ✅ **Entraînement automatique** de modèles ML avec comparaison d'algorithmes
- ✅ **Prétraitement automatique** : gestion des valeurs manquantes, encodage, normalisation
- ✅ **Évaluation complète** : métriques de performance détaillées
- ✅ **Justification intelligente** : explication du choix du meilleur algorithme (en français)
- ✅ **Gestion de modèles** : sauvegarde, téléchargement, suppression
- ✅ **API REST** : endpoints pour l'entraînement et les prédictions
- ✅ **Monitoring** : suivi des événements d'utilisation de l'API
- ✅ **Rapports détaillés** : génération automatique de rapports d'entraînement
- ✅ **Interface moderne** : UI responsive et intuitive

## Notes importantes

- Les modèles entraînés sont sauvegardés dans `backend/models/`
- Les rapports sont générés au format `.pdf` avec horodatage
- Le système gère automatiquement les séparateurs CSV (`,`, `;`, `\t`)
- Les métriques de classification utilisent un score composite pondéré
- La base de données stocke les métadonnées, pas les modèles complets

## Dépannage

### Le backend ne démarre pas

- Vérifiez que MySQL est en cours d'exécution
- Vérifiez les identifiants de connexion MySQL
- Assurez-vous que le port 5000 n'est pas déjà utilisé

### Le frontend ne se connecte pas au backend

- Vérifiez que le backend est démarré sur le port 5000
- Vérifiez les CORS dans `app.py`
- Consultez la console du navigateur pour les erreurs

### Erreurs d'installation des dépendances

- Mettez à jour pip : `pip install --upgrade pip`
- Utilisez Python 3.8+ et Node.js 18+
- Sur Windows, installez Visual C++ Build Tools si nécessaire

## Licence

Ce projet est développé dans un cadre académique.

## Auteurs

DIARRA Ibrahima
