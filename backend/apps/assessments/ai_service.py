import joblib
import os
from django.conf import settings

# 1. Define the path and load the brain ONCE when the server starts
MODEL_PATH = os.path.join(settings.BASE_DIR, 'apps', 'assessments', 'ai_detector_model.pkl')
AI_PIPELINE = None

try:
    AI_PIPELINE = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Failed to load AI model: {e}")

def detect_ai_code(student_code_string):
    """
    Takes a string of Python/Java code and returns who wrote it 
    (e.g., 'GEMINI', 'LLAMA', or 'Human').
    """
    # 2. Use the pre-loaded brain for instant predictions!
    if not AI_PIPELINE:
        return "Unknown - Model Offline"
        
    try:
        prediction = AI_PIPELINE.predict([student_code_string])
        return prediction[0]
    except Exception as e:
        print(f"AI Detection failed: {e}")
        return "Unknown"