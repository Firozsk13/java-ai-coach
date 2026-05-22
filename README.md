# JavaAI Coach 🚀

### AI-Powered Java Learning Assistant with Voice Interaction

JavaAI Coach is an AI-driven educational platform designed to help beginners and intermediate learners understand Java programming through interactive conversations, structured explanations, code examples, MCQ-based tests, interview preparation, and voice-based learning.

The project combines **Large Language Models (LLMs)**, **vector search**, and **speech interaction** to create a personalized Java learning experience similar to an AI tutor.

---

# ✨ Features

* 🎙️ Voice-based interaction (Speech-to-Text + Text-to-Speech)
* 💬 AI-powered Java chatbot
* 📚 Structured Java explanations with code examples
* 🧠 Java MCQ generation for practice
* 🎯 Mock interview preparation
* 🛣️ Personalized Java learning paths
* 📄 Document upload & context-aware retrieval
* ⚡ Real-time streamed AI responses
* 🔐 Secure user authentication
* 📱 Responsive modern UI

---

# 🏗️ System Architecture

```text
Frontend (React + Vite)
        ↓
FastAPI Backend
        ↓
LLM + Prompt Engineering
        ↓
Pinecone Vector Database
        ↓
MongoDB Storage
```

---

# 🛠️ Tech Stack

## Frontend

* React.js (Vite)
* SCSS
* React Markdown
* Bootstrap
* Web Speech API

## Backend

* Python
* FastAPI
* LangChain
* Mistral AI / OpenAI APIs

## Database & AI

* MongoDB
* Pinecone Vector Database
* LLMs (Mistral/OpenAI/HuggingFace)

---

# 📌 Key Functionalities

## 1. AI Chat System

* Users can ask Java-related questions
* AI responds with:

  * Definitions
  * Step-by-step explanations
  * Java code examples
  * Key points
  * Practice tasks

---

## 2. Voice-Based Learning

* Speech-to-text converts user voice into queries
* Text-to-speech reads AI responses aloud
* Supports conversational learning experience

---

## 3. Context-Aware Retrieval

* Uploaded documents are converted into embeddings
* Pinecone performs semantic similarity search
* Relevant context is injected into prompts before AI generation

---

## 4. Learning & Assessment

* Beginner-friendly MCQ generation
* Java mock interview preparation
* Guided Java learning paths

---

# 🔐 Authentication

The project uses token-based authentication to secure:

* Chatbot access
* Document uploads
* User-specific chatbot sessions
* Protected APIs

---

# 📂 Project Structure

```text
java-ai-coach/
│
├── frontend/          # React + Vite frontend
├── backend/           # FastAPI backend
│
├── services/          # AI & Pinecone services
├── routes/            # API routes
├── models/            # Database schemas
├── utils/             # Utility functions
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Firozsk13/java-ai-coach
cd java-ai-coach
```

---

# 🚀 Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🚀 Backend Setup

## Create Virtual Environment

```bash
cd backend

python -m venv venv
```

## Activate Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Start Backend

```bash
uvicorn main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory:

```env
MISTRAL_API_KEY=your_api_key
MISTRAL_MODEL=your_model
MISTRAL_EMBED_MODEL=your_embedding_model

PINECONE_API_KEY=your_pinecone_key
PINECONE_ENV=your_environment
PINECONE_INDEX=your_index_name

MONGO_URI=your_mongodb_uri
```

---

# 📸 Core Modules

| Module         | Description               |
| -------------- | ------------------------- |
| Authentication | User login & registration |
| AI Chat        | Java tutoring chatbot     |
| Voice Engine   | Speech interaction        |
| Vector Search  | Context-aware retrieval   |
| Learning Mode  | Java learning roadmap     |
| Interview Prep | Mock interview generation |

---

# 🧠 AI Workflow

```text
User Query
    ↓
Speech/Text Input
    ↓
FastAPI Backend
    ↓
Vector Search (Pinecone)
    ↓
Prompt Construction
    ↓
LLM Response Generation
    ↓
Streaming Response to Frontend
    ↓
Speech + UI Rendering
```

---

# 🎯 Future Enhancements

* Dedicated Learning Mode
* User progress tracking
* Difficulty-based assessments
* Multi-language programming support
* Personalized AI coaching
* Analytics dashboard

---

# 👨‍💻 Author

### Firoz Ismail Shaikh

Final Year BE Project – Computer Science & Engineering
firoz.s.ismail@gmail.com

GitHub:
`https://github.com/Firozsk13/java-ai-coach`

---

# 📄 License

This project is developed for educational and academic purposes.
