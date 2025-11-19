from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI()

MODEL_PATH = os.path.join("models", "recommender.pkl")
model = joblib.load(MODEL_PATH)

class PredictRequest(BaseModel):
    winRate: float
    averageBet: float
    totalRounds: int

class PredictResponse(BaseModel):
    recommendedSide: str
    riskFactor: float

@app.post("/predict", response_model=PredictResponse)
def predict_behavior(data: PredictRequest):
    try:
      
        features = np.array([[data.winRate, data.averageBet, data.totalRounds]])
        pred = model.predict(features)[0]         
        risk = model.predict_proba(features)[0][1]
        return PredictResponse(
            recommendedSide=pred,
            riskFactor=round(risk, 3)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

