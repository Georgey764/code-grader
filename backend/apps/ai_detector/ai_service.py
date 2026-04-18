import joblib
import os

# Get current dir so paths work on other machines
current_dir = os.path.dirname(os.path.abspath(__file__))
model_file = os.path.join(current_dir, 'ai_detector_model.pkl')
vec_file = os.path.join(current_dir, 'ai_vectorizer.pkl')

# Load the saved models globally
try:
    clf = joblib.load(model_file)
    vectorizer = joblib.load(vec_file)
except Exception as e:
    print(f"Error loading models: {e}")
    # print("TODO: Make sure train_ai.py was run first")
    clf = None
    vectorizer = None

def predict_ai_generated(code_text):
    detail = predict_ai_generated_detail(code_text)
    return detail["summary"]


def predict_ai_generated_detail(code_text):
    """
    Structured result for API responses. `prediction` is "ai", "human", "empty", or "unavailable".
    """
    if not code_text or not str(code_text).strip():
        return {
            "prediction": "empty",
            "confidence_percent": None,
            "summary": "No code to analyze",
        }

    if not clf or not vectorizer:
        return {
            "prediction": "unavailable",
            "confidence_percent": None,
            "summary": "Model not loaded",
        }

    features = vectorizer.transform([code_text])
    pred = int(clf.predict(features)[0])
    probs = clf.predict_proba(features)[0]
    confidence = float(probs[pred] * 100)

    if pred == 1:
        return {
            "prediction": "ai",
            "confidence_percent": round(confidence, 2),
            "summary": f"AI Generated ({confidence:.1f}% confidence)",
        }

    return {
        "prediction": "human",
        "confidence_percent": round(confidence, 2),
        "summary": f"Human Written ({confidence:.1f}% confidence)",
    }

if __name__ == "__main__":
    print("--- Running System Diagnostics ---")
    
    # Test 1: Authentic Human Code (Minimalist, shorthand, no comments)
    test_human_code = """
def calc_fib(n):
    if n <= 1: return n
    return calc_fib(n-1) + calc_fib(n-2)
"""

    # Test 2: Stereotypical AI Code (Verbose, heavily commented, type hints)
    test_ai_code = """
from typing import List

def generate_fibonacci_sequence(n: int) -> List[int]:
    \"\"\"
    Generates a Fibonacci sequence up to the nth number.
    
    Args:
        n (int): The number of Fibonacci numbers to generate.
        
    Returns:
        List[int]: A list containing the Fibonacci sequence.
    \"\"\"
    if n <= 0:
        return []
    elif n == 1:
        return [0]
        
    sequence = [0, 1]
    while len(sequence) < n:
        next_value = sequence[-1] + sequence[-2]
        sequence.append(next_value)
        
    return sequence
"""

    print("\n[Test 1] Analyzing Human Code snippet...")
    print("Result:", predict_ai_generated(test_human_code))
    
    print("\n[Test 2] Analyzing AI Code snippet...")
    print("Result:", predict_ai_generated(test_ai_code))
    print("\nDiagnostics Complete.")