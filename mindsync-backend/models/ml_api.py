from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

from flask_cors import CORS

app = Flask(__name__)
CORS(app)           # ← this line must be present
# Load saved model and vectorizer from parent directory
model_path = os.path.join(os.path.dirname(__file__), "..", "model.pkl")
vectorizer_path = os.path.join(os.path.dirname(__file__), "..", "vectorizer.pkl")

try:
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    print(f"[OK] Model loaded from {model_path}")
    print(f"[OK] Vectorizer loaded from {vectorizer_path}")
except ModuleNotFoundError as e:
    print(f"[ERROR] Missing module: {e}")
    print("[ERROR] Make sure to run this using the virtual environment:")
    print("  Run: .venv\\Scripts\\python.exe ml_api.py")
    print("  or: python -m pip install xgboost")
    raise

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

    prob_dict = {}
    for i, cls in enumerate(classes):
        prob_dict[label_map.get(cls, str(cls))] = round(float(probs[i]), 2)

    return {
        "predicted_mood": mood,
        "confidence": round(float(confidence), 2),
        "probabilities": prob_dict
    }

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    text = data.get("text")
    age = data.get("age", 25) # Default to 25 if not provided
    
    if not text:
        return jsonify({"error": "Missing 'text' parameter"}), 400

    result = predict_mood(text, age)
    return jsonify(result)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "XGBoost ML API is running"})

@app.route("/model-info", methods=["GET"])
def model_info():
    return jsonify({
        "model": "XGBoost",
        "accuracy": "85%",
        "n_features": len(vectorizer.get_feature_names_out()) if hasattr(vectorizer, 'get_feature_names_out') else 1000
    })

if __name__ == "__main__":
    app.run(debug=True, port=5001)