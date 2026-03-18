```markdown
# 🪄 VibePrompt

Un outil de Prompt Engineering "SaaS" premium conçu spécifiquement pour les développeurs. Transforme des idées brutes en prompts IA ultra-structurés de niveau ingénieur senior (Role, Context, Task, Constraints) pour garantir des résultats parfaits dès le premier essai.

## 🚀 Live Demo
[Tester VibePrompt en direct](https://vibe-prompt-two.vercel.app/)

## ✨ Fonctionnalités clés (Pourquoi ce n'est pas juste une démo)
- **Génération IA Ultra-Rapide :** Propulsé par le tout dernier modèle Gemini 3.1 Flash Lite.
- **Système de Comptes (Auth) :** Inscription et connexion sécurisées pour chaque utilisateur.
- **Persistance des Données :** Sauvegarde des prompts dans une base de données relationnelle.
- **Sécurité RLS :** Row Level Security activée ; vos prompts restent privés et inaccessibles aux autres utilisateurs.
- **UX Premium :** Support du Markdown pour le rendu des prompts, mode sombre (Dark Mode) et copie rapide dans le presse-papier.

## 🛠️ Stack Technique & Infrastructure
- **Framework :** Next.js 16 (App Router / Turbopack)
- **Langage :** TypeScript
- **Intelligence :** Google Gemini API (Gemini 3.1 Flash Lite)
- **Backend & Auth :** Supabase (PostgreSQL)
- **Styling & UI :** Tailwind CSS, Framer Motion, Lucide React
- **Déploiement :** Vercel

## 💻 Installation locale

1. Cloner le dépôt :
```bash
git clone [https://github.com/DegenWimz/vibe-prompt.git](https://github.com/DegenWimz/vibe-prompt.git)
cd vibe-prompt
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
Créer un fichier `.env.local` à la racine du projet et ajouter vos clés d'API (Google et Supabase) :
```env
# Google AI
GEMINI_API_KEY=votre_cle_api_gemini_ici

# Supabase (Auth & Database)
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase_ici
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase_ici
```

4. Lancer le serveur de développement :
```bash
npm run dev
```