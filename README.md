# EduGrade AI - World-Class NLP-Powered Classroom Evaluation Platform

EduGrade AI is a comprehensive full-stack platform designed to automate and enhance the grading process for descriptive answers using advanced Natural Language Processing (NLP) and Computer Vision (OCR).

## 🚀 Advanced Features

- **BERT-Powered Evaluation**: Uses the `all-MiniLM-L6-v2` model for semantic similarity analysis between student and model answers.
- **Computer Vision (OCR)**: Integrated **EasyOCR** for handwritten text extraction from photos and **PyMuPDF** for document extraction.
- **Real-Time Data Analytics**: Interactive charts using **Recharts** for student mastery trends and teacher performance distributions.
- **Gamification & Achievements**: Dynamic badge and streak system to motivate students (e.g., "Fast Finisher", "Academic Streak").
- **Class Knowledge Gaps**: Backend aggregation to identify frequently missed keywords, visualized for instructors.
- **Modern UI/UX**: Sleek, responsive glassmorphism dashboard built with **React** and **Tailwind CSS v4**.
- **Secure Authentication**: Custom JWT-based authentication system with role-based access control (RBAC).

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Lucide Icons, Recharts
- **Backend (API)**: Node.js, Express.js, MongoDB Atlas (Mongoose)
- **NLP/OCR Service**: Python, FastAPI, HuggingFace Transformers, EasyOCR, PyMuPDF
- **Authentication**: JSON Web Tokens (JWT), Bcrypt.js

## 📁 Project Structure

```text
/Evaluation
├── backend/            # Express.js server and REST API
├── frontend/           # React.js application (Vite + Tailwind)
└── nlp-service/        # Python FastAPI service for BERT evaluation & OCR
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
uvicorn main:app --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Configure VITE_API_URL in .env
npm run dev
```

## 🌐 Deployment Guide

### 1. Backend (Render)
- **Service Type**: Web Service
- **Environment**: Node.js
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && node server.js`
- **Environment Variables**:
  - `PORT`: 5001
  - `MONGO_URI`: Your MongoDB Atlas URI
  - `JWT_SECRET`: A secure random string
  - `CLIENT_URL`: Your Vercel frontend URL
  - `NLP_SERVICE_URL`: Your Render NLP service URL

### 2. NLP Service (Render)
- **Service Type**: Web Service
- **Environment**: Python
- **Build Command**: `cd nlp-service && pip install -r requirements.txt`
- **Start Command**: `cd nlp-service && uvicorn main:app --host 0.0.0.0 --port 8000`
- **Environment Variables**:
  - `PORT`: 8000

### 3. Frontend (Vercel)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-backend.onrender.com/api`)

## 📊 Evaluation & Metrics
The platform calculates:
- **Semantic Similarity**: Using BERT embeddings.
- **Keyword Mastery**: Matching extracted keywords from student responses.
- **Academic Streaks**: Rewarding consistent high performance.

## 👥 Team
- **Developers**: Shubashis, Vansh, Vishnu

---
© 2026 EduGrade AI. All rights reserved.
