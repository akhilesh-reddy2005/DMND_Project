import pandas as pd
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

print("="*60)
print("Training Improved Fake Job Detection Model")
print("="*60)

os.makedirs('models', exist_ok=True)

# Load dataset
df = pd.read_csv("fake_job_postings.csv")

# Handle missing values
df['title'] = df['title'].fillna("")
df['description'] = df['description'].fillna("")

# Combine text with additional features
df['text'] = (
    df['title'] + " " + 
    df['description'] + " " +
    df['company_profile'].fillna("") + " " +
    df['requirements'].fillna("") + " " +
    df['benefits'].fillna("")
)

# Features & Labels
X = df['text']
y = df['fraudulent']

print(f"\nDataset stats:")
print(f"Total samples: {len(df)}")
print(f"Fraudulent: {y.sum()} ({y.sum()/len(df)*100:.2f}%)")
print(f"Legitimate: {(1-y).sum()} ({(1-y).sum()/len(df)*100:.2f}%)")

# 🔥 Enhanced TF-IDF with bigrams and more features
vectorizer = TfidfVectorizer(
    stop_words='english',
    ngram_range=(1,2),
    max_features=5000,
    min_df=2,
    max_df=0.95
)

X_vectorized = vectorizer.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_vectorized, y, test_size=0.2, random_state=42
)

# 🔥 Use Logistic Regression with class weight balancing
# This is better for imbalanced datasets
model = LogisticRegression(
    class_weight='balanced',  # Automatically adjust weights for imbalance
    max_iter=1000,
    random_state=42,
    solver='lbfgs'
)
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