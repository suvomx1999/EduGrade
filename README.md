# EduGrade AI - NLP-Powered Classroom Evaluation Platform

EduGrade AI is a comprehensive full-stack platform designed to automate and enhance the grading process for descriptive answers using advanced Natural Language Processing (NLP).

## 🚀 Features

- **BERT-Powered Evaluation**: Uses the `all-MiniLM-L6-v2` model for semantic similarity analysis between student and model answers.
- **Fuzzy Keyword Matching**: Intelligent keyword detection that recognizes synonyms and contextually relevant terms.
- **Role-Based Dashboards**:
  - **Student**: Submit assignments and receive instant, detailed feedback.
  - **Teacher**: Create questions, manage assignments, and track class performance.
  - **Admin**: Full system oversight, user management, and global analytics.
- **Modern UI/UX**: Sleek, responsive dashboard built with React and Tailwind CSS v4, featuring glassmorphism and smooth animations.
- **Secure Authentication**: Custom JWT-based authentication system with role-based access control (RBAC).

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Lucide Icons
- **Backend (API)**: Node.js, Express.js, MongoDB Atlas (Mongoose)
- **NLP Service**: Python, FastAPI, HuggingFace Transformers (Sentence-Transformers)
- **Authentication**: JSON Web Tokens (JWT), Bcrypt.js

## 📁 Project Structure

```text
/Evaluation
├── backend/            # Express.js server and REST API
├── frontend/           # React.js application (Vite + Tailwind)
└── nlp-service/        # Python FastAPI service for BERT evaluation
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB Atlas account

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your .env file with MONGO_URI, JWT_SECRET, etc.
npm start
```

### 2. NLP Service Setup
```bash
cd nlp-service
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn main:app --port 8001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📊 Presentation Content
Detailed slide-by-slide content for presentations can be found in `presentation_content.md`.

## 👥 Team
- **Developers**: Shubashis, Vansh, Vishnu

---
© 2026 EduGrade AI. All rights reserved.
