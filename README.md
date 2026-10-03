# 📄 PDF RAG Chatbot

Chatbot qui répond à des questions **à partir du contenu de vos documents PDF**, grâce à une architecture **RAG** (*Retrieval-Augmented Generation*). Vous importez un PDF, il est indexé, puis vous lui posez des questions en langage naturel : les réponses sont générées uniquement à partir du document et accompagnées de leurs **sources (fichier + numéro de page)**.

## ✨ Fonctionnalités

- Import d'un PDF par glisser-déposer ou sélection de fichier
- Extraction du texte page par page (en conservant le numéro de page)
- Découpage en chunks, vectorisation (embeddings) et stockage dans une base vectorielle persistante
- Questions/réponses basées uniquement sur le contexte retrouvé (le modèle répond « je ne sais pas » si l'information est absente)
- Affichage des sources (document et page) pour chaque réponse
- Interface de type terminal avec fond animé « Matrix rain »

## 🧱 Architecture

```
Frontend (React + Vite)
        │  HTTP (JSON / multipart)
        ▼
Backend (FastAPI)
  ├── POST /api/upload ──► PyMuPDF (extraction) ──► découpage en chunks
  │                         ──► Azure OpenAI Embeddings ──► ChromaDB
  └── POST /api/ask ─────► recherche des 3 chunks les plus proches (ChromaDB)
                            ──► prompt + contexte ──► Azure OpenAI (LLM)
                            ──► réponse + sources
```

## 🛠️ Stack technique

| Couche | Technologies |
|---|---|
| Frontend | React 19, Vite |
| Backend | Python, FastAPI, Uvicorn |
| RAG | LangChain (`langchain-openai`, `langchain-chroma`, `langchain-text-splitters`) |
| LLM & embeddings | Azure OpenAI |
| Base vectorielle | ChromaDB (persistée dans `backend/chroma_db`) |
| Lecture des PDF | PyMuPDF |

## 📁 Structure du projet

```
PdfRagChatbot/
├── backend/
│   ├── app/
│   │   ├── main.py               # Application FastAPI + CORS
│   │   ├── api/routes.py         # Routes /api/ask et /api/upload
│   │   ├── models/chat_model.py  # Schémas Pydantic (question, réponse, sources)
│   │   └── services/
│   │       ├── pdf_service.py        # Extraction du texte par page
│   │       ├── chunk_service.py      # Découpage en chunks (1000 car., chevauchement 200)
│   │       ├── vector_service.py     # Embeddings + ChromaDB
│   │       ├── llm_service.py        # Client Azure OpenAI
│   │       └── rag_service.py        # Recherche, prompt, génération, sources
│   ├── test_*.py                 # Scripts de test manuels (PDF, chunks, embeddings, vecteurs)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Interface de chat et d'upload
│   │   └── components/MatrixRain.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## ✅ Prérequis

- Python 3.10+
- Node.js 18+ et npm
- Un compte **Azure OpenAI** avec deux déploiements : un modèle de chat et un modèle d'embeddings

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/VOTRE_UTILISATEUR/PdfRagChatbot.git
cd PdfRagChatbot
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```

Créez un fichier `backend/.env` :

```env
AZURE_OPENAI_ENDPOINT=https://<votre-ressource>.openai.azure.com/
AZURE_OPENAI_API_KEY=<votre-clé>
AZURE_OPENAI_API_VERSION=<version-api>
AZURE_OPENAI_DEPLOYMENT=<nom-du-déploiement-chat>
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=<nom-du-déploiement-embeddings>
```

Lancez l'API (depuis le dossier `backend`) :

```bash
uvicorn app.main:app --reload
```

L'API est disponible sur `http://127.0.0.1:8000` (documentation interactive : `/docs`).

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env         # cp .env.example .env sous macOS / Linux
npm run dev
```

Par défaut, le frontend appelle l'API sur `http://127.0.0.1:8000` (modifiable via `VITE_API_URL` dans `frontend/.env`). L'application s'ouvre sur `http://localhost:5173`.

## 💡 Utilisation

1. Ouvrez l'application dans le navigateur.
2. Importez un PDF dans le panneau « document source ».
3. Attendez la confirmation d'indexation (nombre de pages et de chunks).
4. Posez vos questions dans la zone de saisie : la réponse s'affiche avec les pages sources.

## 🔌 API

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/` | Vérifie que l'API fonctionne |
| `POST` | `/api/upload` | Reçoit un PDF (`multipart/form-data`, champ `file`), l'indexe et renvoie `filename`, `pages`, `chunks` |
| `POST` | `/api/ask` | Corps : `{ "question": "..." }`. Renvoie `{ "answer": "...", "sources": [{ "page": 1, "source": "fichier.pdf" }] }` |

## ⚠️ Limites connues et pistes d'amélioration

- Seuls les PDF contenant du texte sont supportés (pas d'OCR pour les scans).
- La recherche utilise les 3 passages les plus proches (`k=3`) ; les questions qui nécessitent beaucoup de contexte peuvent être moins bien traitées.
- Pas d'historique de conversation envoyé au modèle : chaque question est traitée indépendamment.
- Le CORS est ouvert à toutes les origines (`*`) : à restreindre en production.
- Pistes : OCR, gestion de plusieurs documents, suppression de documents, streaming des réponses, authentification.

## 🔒 Sécurité

Ne versionnez jamais vos fichiers `.env` ni vos clés API. Ils sont exclus par le `.gitignore`.

## 📜 Licence

À définir.
