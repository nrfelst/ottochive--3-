from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import uvicorn
import numpy as np

app = FastAPI(title="Ottochive Reader API")

# Load model once at startup
MODEL_PATH = "model/ottochive_reader.joblib"
model = None

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"Model loaded from {MODEL_PATH}")
    else:
        print(f"Warning: Model file {MODEL_PATH} not found. Please run training first.")

class ClassifyRequest(BaseModel):
    text: str

class ClassifyResponse(BaseModel):
    label: str
    confidence: float

@app.post("/classify", response_model=ClassifyResponse)
async def classify_email(request: ClassifyRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Try training first.")
    
    # Predict label
    prediction = model.predict([request.text])[0]
    
    # Get confidence from decision function
    decision_scores = model.decision_function([request.text])
    # decision_function for LinearSVC returns distance from hyperplane
    # For multiclass, it returns one score per class. We take the max.
    confidence = float(np.max(decision_scores))
    
    return ClassifyResponse(label=prediction, confidence=confidence)

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "model": "ottochive_reader" if model else "unloaded"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
