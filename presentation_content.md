# EduGrade AI - Presentation Content

## Slide 1: Title of Project, Team details
- **Project Title**: EduGrade AI – NLP-Powered Classroom Evaluation Platform
- **Tagline**: Redefining Grading through BERT-based Semantic Analysis
- **Team Details**:
    - **Lead Developer**: Shubashis, Vansh, Vishnu
    - **Project Scope**: Full-Stack MERN + Python FastAPI Integration
- **Date**: March 19, 2026

## Slide 2: Problem Statement
- **Manual Grading Inefficiency**: Teachers spend excessive time grading descriptive answers, leading to delayed feedback for students.
- **Subjectivity**: Human grading can be inconsistent and biased across different batches.
- **Limitations of Keyword Matching**: Traditional automated systems rely on exact keyword matching, failing to recognize synonyms or contextually correct answers.
- **Lack of Scalability**: Difficulty in managing large-scale evaluations in digital academies.

## Slide 3: Work breakdown structure with timeline
- **Phase 1: Foundation (Week 1)**
    - Project Scaffolding (MERN + Python)
    - Database Schema Design (MongoDB Atlas)
- **Phase 2: Core Logic (Week 2)**
    - JWT Authentication & RBAC (Student/Teacher/Admin)
    - NLP Service Development (BERT all-MiniLM-L6-v2)
- **Phase 3: Integration & UI (Week 3)**
    - Frontend Dashboard Development (React/Tailwind)
    - API Integration & Evaluation Logic Refinement
- **Phase 4: Optimization (Final Days)**
    - UI/UX Polish & Mobile Responsiveness
    - System Verification & Load Testing

## Slide 4: System Architecture
- **Frontend**: React.js (Vite), Tailwind CSS (v4), Lucide Icons
- **Backend (API)**: Node.js, Express.js (Port 5001)
- **NLP Service**: Python, FastAPI, HuggingFace Transformers (Port 8001)
- **Database**: MongoDB Atlas (NoSQL)
- **Communication**: RESTful APIs & JSON Web Tokens (JWT)

## Slide 5: Use Case Diagram
- **Actors**: Student, Teacher, Admin
- **Use Cases**:
    - **Student**: Register/Login, View Assignments, Submit Answers, View Instant Results/Feedback.
    - **Teacher**: Create/Delete Questions, Set Model Answers & Keywords, View Student Submissions & Analytics.
    - **Admin**: Manage All Users, Change User Roles, Oversee Global Platform Statistics.

## Slide 6: ER Diagram
- **User Entity**: _id, name, email, password, role (Student/Teacher/Admin), avatar.
- **Question Entity**: _id, text, modelAnswer, keywords (Array), maxMarks, createdBy (Ref: User).
- **Submission Entity**: _id, student (Ref: User), question (Ref: Question), answer, score, percentage, verdict, feedback, matchedKeywords.

## Slide 7: DFD Diagram
1. **Input**: Student submits an answer via the React Frontend.
2. **Processing**: Backend receives the request, fetches the Model Answer/Keywords from MongoDB.
3. **NLP Analysis**: Backend sends data to Python FastAPI; BERT model calculates semantic similarity; Fuzzy logic checks keywords.
4. **Storage**: Evaluated score and feedback are saved back to the Submissions collection.
5. **Output**: Result is pushed to the Student Dashboard in real-time.

## Slide 8: Class Diagram
- **AuthController**: register(), login(), getMe()
- **QuestionController**: createQuestion(), getAllQuestions(), deleteQuestion()
- **SubmissionController**: submitAnswer(), getStudentResults(), getQuestionSubmissions()
- **NLPService (Python)**: loadModel(), calculateSimilarity(), checkKeywords(), evaluate()

## Slide 9: Interaction Diagrams
- **Evaluation Flow Sequence**:
    1. Student -> POST /api/submissions -> Backend
    2. Backend -> Query Question -> Database
    3. Database -> ModelAnswer -> Backend
    4. Backend -> POST /evaluate -> NLP Service
    5. NLP Service -> Result JSON -> Backend
    6. Backend -> Update Submission -> Database
    7. Backend -> Success Response -> Student

## Slide 10: State chart and Activity Diagrams
- **Submission State Chart**: Draft -> Submitted -> Evaluating (NLP) -> Graded -> Feedback Viewed.
- **Activity Diagram (Registration)**: User enters details -> Validate Email -> Hash Password -> Assign Role -> Generate JWT -> Redirect to Dashboard.

## Slide 11: Deployment Diagram
- **Client Tier**: Web Browser (Chrome/Safari/Edge)
- **Web Tier**: Vercel/Netlify (React Frontend)
- **App Tier**: Render/Heroku (Node.js Backend & Python NLP Service)
- **Data Tier**: MongoDB Atlas Cluster
- **Environment**: macOS (Development), Linux (Production)
