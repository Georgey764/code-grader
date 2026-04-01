import os
import joblib
from django.conf import settings

MODEL_PATH = os.path.join(
    settings.BASE_DIR, 
    "apps", "assessments", "ai_tools", "ai_detector_model.pkl"
)

# Load the model into memory when Django starts
try:
    rf_model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Warning: Could not load AI model at {MODEL_PATH}. Error: {e}")
    rf_model = None

def extract_features(code: str):
    """
    Must match the exact same logic we used in train_ai.py!
    """
    code = str(code)
    length = len(code)
    if length == 0:
        return [[0, 0, 0, 0]]
        
    num_lines = max(len(code.split('\n')), 1)
    avg_line_length = length / num_lines
    num_comments = code.count('#') + code.count('//')
    whitespace_ratio = sum(c.isspace() for c in code) / length
    
    # Return as a 2D array for scikit-learn
    return [[num_lines, avg_line_length, num_comments, whitespace_ratio]]

def predict_ai_generated(code: str) -> str:
    """
    Predicts if code is AI generated and provides the confidence score.
    """
    if not rf_model:
        return "Unknown (Model Offline)"
    
    if not code or len(code.strip()) == 0:
        return "Unknown (Empty File)"

    try:
        # Extract the 4 math features from the student's code
        features = extract_features(code)
        
        # Get the prediction (0 for Human, 1 for AI) and the confidence percentage
        prediction = rf_model.predict(features)[0] 
        probabilities = rf_model.predict_proba(features)[0]
        
        # probabilities[1] is the confidence it is AI.
        ai_confidence = round(probabilities[1] * 100, 1)

        if prediction == 1:
            return f"Codestral ({ai_confidence}% Confidence)" # Or just "AI" if you prefer!
        else:
            return "Human"

    except Exception as e:
        print(f"Prediction error: {e}")
        return "Unknown (Error processing file)"