import pandas as pd
from datasets import load_dataset
from sklearn.ensemble import RandomForestClassifier
import joblib
import numpy as np
import os

print(" 1. Downloading dataset from Hugging Face...")
# Pulls the exact dataset you found
dataset = load_dataset("basakdemirok/AIGCodeSet", split="train")
df = dataset.to_pandas()

print(f" Loaded {len(df)} code samples!")

# ---------------------------------------------------------
# EXPLAINABLE FEATURES (The "Why")
# ---------------------------------------------------------
def extract_features(code):
    code = str(code)
    length = len(code)
    if length == 0:
        return [0, 0, 0, 0]
        
    num_lines = max(len(code.split('\n')), 1)
    avg_line_length = length / num_lines
    num_comments = code.count('#') + code.count('//')
    whitespace_ratio = sum(c.isspace() for c in code) / length
    
    return [num_lines, avg_line_length, num_comments, whitespace_ratio]

print(" 2. Extracting features from code (This might take 10-20 seconds)...")
X = np.array(df['code'].apply(extract_features).tolist())

print(" 3. Preparing labels...")
# If LLM is 'HUMAN' or blank, label is 0. Otherwise, label is 1 (AI).
df['is_ai'] = df['LLM'].apply(lambda x: 0 if pd.isna(x) or str(x).strip().upper() == 'HUMAN' else 1)
y = df['is_ai'].values

print(" 4. Training the Random Forest...")
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X, y)

print(" 5. Saving the model...")
# Saves it directly into your services folder
save_path = os.path.join("apps", "assessments", "services", "ai_detector_model.pkl")
os.makedirs(os.path.dirname(save_path), exist_ok=True)
joblib.dump(rf, save_path)

print(f" SUCCESS! Model saved to: {save_path}")