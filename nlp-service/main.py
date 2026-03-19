from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import torch
import re

app = FastAPI()

# Load model once at startup
print("Loading BERT model (all-MiniLM-L6-v2)...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Model loaded successfully!")

# CORS configuration
# Using 5001 as we moved the backend port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluationRequest(BaseModel):
    student_answer: str
    model_answer: str
    keywords: list[str] = []
    max_marks: int = 10

class SimilarityRequest(BaseModel):
    text1: str
    text2: str

class GenerationRequest(BaseModel):
    context: str

@app.get("/health")
async def health():
    return {"status": "ok", "model": "all-MiniLM-L6-v2"}

@app.post("/generate-question")
async def generate_question(req: GenerationRequest):
    try:
        # Simple heuristic-based question generation
        # 1. Split into sentences
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', req.context) if len(s.strip()) > 20]
        
        if not sentences:
            raise HTTPException(status_code=400, detail="Text is too short to generate a question.")

        # 2. Use BERT to find the most "central" sentence (the one most similar to the whole text)
        context_embedding = model.encode(req.context)
        sentence_embeddings = model.encode(sentences)
        similarities = util.cos_sim(context_embedding, sentence_embeddings)[0]
        
        # Pick the most central sentence as the "Model Answer"
        best_idx = torch.argmax(similarities).item()
        model_answer = sentences[best_idx]
        
        # 3. Generate a question from that sentence
        # Simple transformation: "The capital of France is Paris." -> "Explain: The capital of France is Paris."
        # Or more advanced: replace key terms with "What"
        question_text = f"Explain the concept and significance of: {model_answer}"
        
        # 4. Extract keywords (top N words by frequency/length excluding stop words)
        stop_words = {'the', 'and', 'is', 'in', 'it', 'you', 'that', 'was', 'for', 'on', 'are', 'with', 'as', 'this', 'an', 'be', 'at', 'by'}
        words = re.findall(r'\b\w{5,}\b', model_answer.lower()) # Words longer than 4 chars
        keywords = list(set([w for w in words if w not in stop_words]))[:5]

        return {
            "question": question_text,
            "model_answer": model_answer,
            "keywords": keywords
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/similarity")
async def calculate_similarity(req: SimilarityRequest):
    try:
        embeddings = model.encode([req.text1, req.text2])
        cos_sim = util.cos_sim(embeddings[0], embeddings[1]).item()
        return {"similarity": float(cos_sim)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate")
async def evaluate(req: EvaluationRequest):
    try:
        # Step A — Semantic similarity
        embeddings = model.encode([req.student_answer, req.model_answer])
        cos_sim = util.cos_sim(embeddings[0], embeddings[1]).item()
        semantic_similarity = max(0.0, min(1.0, float(cos_sim)))

        # Step B — Keyword scoring with fuzzy matching
        matched_keywords = []
        missing_keywords = []
        
        if req.keywords:
            student_answer_lower = req.student_answer.lower()
            # Split student answer into tokens for individual word similarity
            student_tokens = re.findall(r'\b\w+\b', student_answer_lower)
            
            for kw in req.keywords:
                kw_lower = kw.lower()
                # 1. Exact match with regex
                if re.search(rf'\b{re.escape(kw_lower)}\b', student_answer_lower):
                    matched_keywords.append(kw)
                    continue
                
                # 2. Semantic match for the keyword itself against student tokens
                # This helps if the student uses a synonym for a keyword
                if student_tokens:
                    kw_embedding = model.encode(kw_lower)
                    token_embeddings = model.encode(student_tokens)
                    token_sims = util.cos_sim(kw_embedding, token_embeddings)[0]
                    if torch.max(token_sims).item() > 0.85: # High threshold for keyword synonym
                        matched_keywords.append(kw)
                        continue
                
                missing_keywords.append(kw)
            
            keyword_score = len(matched_keywords) / len(req.keywords)
        else:
            keyword_score = semantic_similarity

        # Step C — Combined score with dynamic weighting
        # If the student answer is very short compared to the model answer, penalize slightly
        len_ratio = len(req.student_answer.split()) / max(1, len(req.model_answer.split()))
        length_penalty = 1.0
        if len_ratio < 0.3:
            length_penalty = 0.8
        elif len_ratio < 0.1:
            length_penalty = 0.5

        # Adjust weights: if keywords exist, they are important (40%), otherwise 100% semantic
        if req.keywords:
            combined = (semantic_similarity * 0.6) + (keyword_score * 0.4)
        else:
            combined = semantic_similarity
            
        combined = combined * length_penalty
        
        score = round(combined * req.max_marks)
        score = max(0, min(score, req.max_marks)) 
        percentage = round(combined * 100, 1)
        percentage = max(0, min(percentage, 100))

        # Step D — Verdict & Dynamic Feedback
        if percentage >= 85:
            verdict = "Excellent"
            base_feedback = "Great job! Your answer is very accurate and covers the core concepts perfectly."
        elif percentage >= 70:
            verdict = "Good"
            base_feedback = "Good answer. You've captured the main points, though some minor details could be added."
        elif percentage >= 50:
            verdict = "Satisfactory"
            base_feedback = f"Fair attempt. You mentioned {len(matched_keywords)} key terms, but missed {len(missing_keywords)} others."
        elif percentage >= 30:
            verdict = "Needs Improvement"
            base_feedback = "You have the basic idea, but your answer lacks depth or specific required terminology."
        else:
            verdict = "Insufficient"
            base_feedback = "The answer does not sufficiently address the question. Please try to include more relevant details."

        # Step E — LLM-Style Detailed Analysis (Heuristic based)
        analysis = []
        if semantic_similarity > 0.8:
            analysis.append("Semantic alignment is very high, indicating you understand the core concept well.")
        elif semantic_similarity > 0.5:
            analysis.append("The overall meaning is partially aligned with the expected answer.")
        else:
            analysis.append("The core meaning of your answer deviates significantly from the expected response.")

        if missing_keywords:
            analysis.append(f"To improve, consider including these specific terms: {', '.join(missing_keywords)}.")
        
        if length_penalty < 1.0:
            analysis.append("Your answer was a bit brief. Adding more descriptive detail could help clarify your points.")

        feedback = f"{base_feedback} {' '.join(analysis)}"

        return {
            "score": score,
            "max_marks": req.max_marks,
            "percentage": percentage,
            "semantic_similarity": round(semantic_similarity, 4),
            "keyword_score": round(keyword_score, 4),
            "matched_keywords": matched_keywords,
            "missing_keywords": missing_keywords,
            "verdict": verdict,
            "feedback": feedback,
            "detailed_analysis": analysis
        }

    except Exception as e:
        print(f"Error during evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
