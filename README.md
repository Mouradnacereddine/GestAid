# Lending Aid

Lending Aid est une plateforme de gestion d’agences et de bénévoles, développée pour simplifier la gestion des demandes d’inscription et l’organisation des rôles (superadmin, admin, bénévole).

## Fonctionnalités principales
- Gestion des agences par le superadmin
- Attribution d’admins aux agences
- Validation des demandes d’inscription (admin pour bénévoles, superadmin pour admins)
- Interface moderne basée sur React, TypeScript et Tailwind CSS

## Prérequis
- [Node.js](https://nodejs.org/) >= 18.x
- [npm](https://www.npmjs.com/) >= 9.x
- Accès à une instance [Supabase](https://supabase.com/) (voir configuration ci-dessous)

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Mouradnacereddine/GestAid.git
cd GestAid

# 2. Installer les dépendances
npm install
```

## Configuration

1. Copier le fichier `.env.example` en `.env` et remplir les variables nécessaires (clés Supabase, etc).
2. Configurer la base de données Supabase avec les tables et policies adaptées (voir dossier `supabase/`).

## Lancement du projet

```bash
npm run dev
```

Le projet sera disponible sur http://localhost:5173 (ou le port affiché dans le terminal).

## Stack technique
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Contribution
Les contributions sont les bienvenues ! Merci de créer une issue ou une pull request pour toute amélioration ou bug.

## Licence
Ce projet est sous licence MIT.

npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
