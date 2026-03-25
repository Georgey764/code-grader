import joblib
import os
from django.conf import settings

def detect_ai_code(student_code_string):
    """
    Takes a string of Python/Java code and returns who wrote it 
    (e.g., 'GEMINI', 'LLAMA', or 'Human').
    """
    try:
        # 1. Find the brain file inside the assessments folder
        model_path = os.path.join(settings.BASE_DIR, 'apps', 'assessments', 'ai_detector_model.pkl')
        
        # 2. Wake up the brain
        pipeline = joblib.load(model_path)
        
        # 3. Ask it for a prediction
        prediction = pipeline.predict([student_code_string])
        
        return prediction[0]
        
    except Exception as e:
        print(f"AI Detection failed: {e}")
        return "Unknown"