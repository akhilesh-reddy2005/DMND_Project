import pandas as pd
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report

print("="*60)
print("Training Improved Fake Job Detection Model")
print("="*60)

os.makedirs('models', exist_ok=True)

# Load dataset
df = pd.read_csv("fake_job_postings.csv")

# Handle missing values
df['title'] = df['title'].fillna("")
df['description'] = df['description'].fillna("")

# Combine text
df['text'] = df['title'] + " " + df['description']

# Features & Labels
X = df['text']
y = df['fraudulent']

# 🔥 Improved TF-IDF with bigrams
vectorizer = TfidfVectorizer(
    stop_words='english',
    ngram_range=(1,2),
    max_features=5000
)

X_vectorized = vectorizer.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_vectorized, y, test_size=0.2, random_state=42
)

# Train model
model = MultinomialNB()
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy: {accuracy:.2%}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save model
pickle.dump(model, open("models/naive_bayes_model.pkl", "wb"))
pickle.dump(vectorizer, open("models/tfidf_vectorizer.pkl", "wb"))

print("\nModel retrained and saved successfully!")