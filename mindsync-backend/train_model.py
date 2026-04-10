# ==============================
# 1. IMPORT LIBRARIES
# ==============================
import pandas as pd
import numpy as np
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb


# ==============================
# 2. LOAD DATASET
# ==============================
try:
    df = pd.read_csv(r"C:\Users\YOGAANT NAIDU\Downloads\test.csv", encoding="latin1")
    df = df[["text", "sentiment", "Age of User"]]
    df.columns = ["text", "sentiment", "age"]
    print(f"[OK] Loaded {len(df)} records from CSV")
except:
    print("[ERROR] Error loading file, using fallback dataset...")
    df = pd.DataFrame({
        "text": [
            "I feel very stressed today",
            "I am happy and relaxed",
            "Feeling anxious about exams",
            "Life is going great",
            "I am tired and frustrated",
            "I feel calm and peaceful",
            "Feeling quite neutral today",
            "It's an okay day"
        ],
        "sentiment": ["negative", "positive", "negative", "positive", "negative", "positive", "neutral", "neutral"],
        "age": [21, 20, 22, 19, 23, 24, 22, 21]
    })


# ==============================
# 3. CLEAN DATA (SAFE)
# ==============================
df["text"] = df["text"].astype(str)
print(f"[INFO] Records before cleaning: {len(df)}")

df = df[df["text"].notna()]
df = df[df["text"].str.strip() != ""]
print(f"[INFO] Records after text cleaning: {len(df)}")

df["age"] = pd.to_numeric(df["age"], errors="coerce")
print(f"[INFO] Records after age conversion: {len(df)}")

# Fill missing ages with median or default value
median_age = df["age"].median()
if pd.isna(median_age):
    median_age = 25
df["age"] = df["age"].fillna(median_age)
print(f"[INFO] Records after handling missing ages: {len(df)}")

df = df.dropna()
print(f"[INFO] Records after removing NaN: {len(df)}")
print(f"[DEBUG] Columns in dataframe: {df.columns.tolist()}")
if 'sentiment' in df.columns:
    print(f"[DEBUG] Unique sentiments: {df['sentiment'].unique()}")
else:
    print("[ERROR] sentiment column missing!")
    df_columns = df.columns.tolist()
    if len(df_columns) >= 3:
        print(f"[DEBUG] Renaming last column to sentiment")
        df.rename(columns={df_columns[2]: 'sentiment'}, inplace=True)
print(f"Columns in dataframe: {df.columns.tolist()}")
if 'sentiment' in df.columns:
    print(f"Unique sentiments: {df['sentiment'].unique()}")
else:
    print("WARNING: 'sentiment' column not found in dataframe")


# ==============================
# 4. CHECK IF DATA IS EMPTY
# ==============================
if len(df) == 0:
    print("[WARN] Dataset empty after cleaning, using fallback data...")
    df = pd.DataFrame({
        "text": [
            "I feel very stressed today",
            "I am happy and relaxed",
            "Feeling anxious about exams",
            "Life is going great",
            "I am tired and frustrated",
            "I feel calm and peaceful",
            "Feeling quite neutral today",
            "It's an okay day",
            "I'm worried about the future",
            "Everything seems wonderful",
            "I feel mediocre",
            "Very depressed and sad",
            "Absolutely amazing day",
            "Just another normal day",
            "Terrible mood today"
        ],
        "sentiment": ["negative", "positive", "negative", "positive", "negative", "positive", "neutral", "neutral", "negative", "positive", "neutral", "negative", "positive", "neutral", "negative"],
        "age": [21, 20, 22, 19, 23, 24, 22, 21, 25, 26, 23, 28, 20, 30, 19]
    })


# ==============================
# 5. CONVERT SENTIMENT → NUMERIC
# ==============================
sentiment_map = {
    "negative": 0,
    "neutral": 1,
    "positive": 2
}

df["sentiment"] = df["sentiment"].map(sentiment_map)


# ==============================
# 6. TEXT → TF-IDF
# ==============================
vectorizer = TfidfVectorizer(
    stop_words=None,
    min_df=1
)

X_text = vectorizer.fit_transform(df["text"])


# ==============================
# 7. ADD AGE FEATURE
# ==============================
X = np.hstack((X_text.toarray(), df[["age"]].values))
y = df["sentiment"]


# ==============================
# 8. TRAIN MODEL
# ==============================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    eval_metric='mlogloss',
    verbosity=0
)
model.fit(X_train, y_train, verbose=False)

# Evaluate on test set
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\n[RESULT] Model Accuracy: {accuracy:.2%}")
print(f"\n[REPORT] Classification Report:\n{classification_report(y_test, y_pred, target_names=['negative', 'neutral', 'positive'], zero_division=0)}")


# ==============================
# 9. SAVE MODEL
# ==============================
joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("[OK] Model trained and saved!")


# ==============================
# 10. PREDICTION FUNCTION
# ==============================
def predict_mood(text, age):
    text_vec = vectorizer.transform([text])
    final_input = np.hstack((text_vec.toarray(), [[age]]))

    probs = model.predict_proba(final_input)[0]
    prediction = np.argmax(probs)
    confidence = np.max(probs)

    classes = model.classes_

    label_map = {
        0: "negative",
        1: "neutral",
        2: "positive"
    }

    mood = label_map.get(classes[prediction], "unknown")

    # dynamic probability dictionary
    prob_dict = {}
    for i, cls in enumerate(classes):
        prob_dict[label_map.get(cls, str(cls))] = round(float(probs[i]), 2)

    return {
        "input_text": text,                 # ✅ your text added
        "predicted_mood": mood,
        "confidence": round(float(confidence), 2),
        "probabilities": prob_dict
    }

# ==============================
# 11. TEST MODEL
# ==============================
print("\n[TEST OUTPUT]:")
print(predict_mood("I feel very stressed and tired", 21))
print(predict_mood("I am very happy today!", 20))