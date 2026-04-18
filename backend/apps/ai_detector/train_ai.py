import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib

def main():
    print("Loading data...")
    df = pd.read_csv('data/dataset.csv')
    
    # Clean up labels: 0 for human, 1 for AI
    def fix_labels(val):
        v = str(val).lower().strip()
        if v in ['human', 'none', 'nan', 'null']:
            return 0
        return 1
        
    df['is_ai'] = df['LLM'].apply(fix_labels)
    df = df.dropna(subset=['code']) # drop empty rows just in case

    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        df['code'], df['is_ai'], test_size=0.2, random_state=42
    )

    print("Vectorizing text...")
    # Limiting to 1500 features to save memory/time
    vec = TfidfVectorizer(max_features=1500)
    X_train_vec = vec.fit_transform(X_train)
    X_test_vec = vec.transform(X_test)

    print("Training Random Forest...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train_vec, y_train)

    acc = clf.score(X_test_vec, y_test)
    print(f"Accuracy: {acc * 100:.2f}%")

    print("Saving models...")
    joblib.dump(clf, 'ai_detector_model.pkl')
    joblib.dump(vec, 'ai_vectorizer.pkl')
    print("Done!")

if __name__ == "__main__":
    main()