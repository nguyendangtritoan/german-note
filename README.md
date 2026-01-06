# 🇩🇪 German Learning Companion

A modern, AI-powered web application designed to help you master the German language effectively. This app combines the power of **Groq/Gemini LLMs** with spaced repetition principles to create a personalized learning experience.

## ✨ Key Features

*   **🤖 AI-Powered Analysis**: Instant feedback, translations, and grammatical explanations using advanced LLMs (Groq/Gemini).
*   **📚 Context bundles**: Organize your vocabulary into context-specific bundles.
*   **🃏 Smart Flashcards**: Review your saved words with an interactive flashcard mode.
*   **📝 Grammar Insights**: Deep dive into German grammar rules with AI assistance.
*   **🔒 Secure Auth**: Integrated Firebase Authentication for user management.
*   **⚡ Serverless Backend**: Secure proxy functions via Cloudflare Workers to protect API keys.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS
*   **Backend / Edge**: Cloudflare Pages Functions
*   **Database / Auth**: Firebase (Firestore & Auth)
*   **AI Models**: Groq (Llama/Mixtral) & Google Gemini

## 🚀 Local Development

To run this project locally, you need two terminal sessions running simultaneously (one for the frontend, one for the backend functions).

### Prerequisites
*   Node.js v22+
*   npm

### 1. Setup Environment Variables
Create a `.env` file in the root directory:

```bash
# Public Client Config (Firebase)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
... (other firebase config)

# Backend Secrets (Do NOT prefix with VITE_)
GROQ_API_KEY=your_secret_key
GEMINI_API_KEY=your_secret_key
```

### 2. Run the Development Server

**Terminal 1 (Backend - Wrangler):**
```bash
npm run pages:dev
```
*   This starts the Cloudflare Functions proxy on `http://127.0.0.1:8788`.

**Terminal 2 (Frontend - Vite):**
```bash
npm run dev
```
*   This starts the Vite dev server. Access the app at the URL shown here (usually `http://localhost:5173`).

## ☁️ Deployment (Cloudflare Pages)

This project is optimized for **Cloudflare Pages**.

1.  Connect your GitHub repository to Cloudflare Pages.
2.  **Build Settings**:
    *   **Framework**: React (Vite)
    *   **Command**: `npm run build`
    *   **Output directory**: `dist`
3.  **Environment Variables**:
    *   Add your Firebase config (e.g., `VITE_FIREBASE_API_KEY`) to `wrangler.toml` (recommended) or Dashboard > Production variables.
    *   Add your AI Keys (`GROQ_API_KEY`, etc.) as **Secrets** in the Cloudflare Dashboard.

## 📂 Project Structure

*   **`/functions`**: Serverless backend functions (API proxies).
*   **`/src/api`**: Frontend API adapters routing requests to `/functions`.
*   **`/src/components`**: Reusable UI components.
*   **`/src/context`**: Global state management (Auth, Settings).
*   **`/src/hooks`**: Core business logic and custom hooks.
*   **`/src/utils`**: Helper functions and AI prompt engineering.