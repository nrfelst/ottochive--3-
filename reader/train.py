import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import os

def train_model():
    # Load data
    data_path = "data/email_labels.csv"
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    df = pd.read_csv(data_path)
    
    # Split 80/20 train/test with stratify
    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], 
        df['label'], 
        test_size=0.2, 
        random_state=42, 
        stratify=df['label']
    )
    
    # Build scikit-learn Pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2), 
            max_features=10000, 
            stop_words="english", 
            sublinear_tf=True
        )),
        ('clf', LinearSVC(C=1.0, max_iter=2000))
    ])
    
    # Train
    print("Training model...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_test)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model
    model_dir = "model"
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        
    model_path = os.path.join(model_dir, "ottochive_reader.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
