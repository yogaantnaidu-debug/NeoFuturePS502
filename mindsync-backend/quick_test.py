import requests
import json

# Quick test of the Flask API
url = "http://localhost:5001/predict"

# Test data
test_data = {
    "text": "I am very happy today!",
    "age": 25
}

print("Testing XGBoost ML API...")
print(f"URL: {url}")
print(f"Data: {json.dumps(test_data, indent=2)}")
print()

try:
    response = requests.post(url, json=test_data, timeout=5)

    if response.status_code == 200:
        result = response.json()
        print("✅ SUCCESS!")
        print(f"Predicted mood: {result['predicted_mood']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Probabilities: {result['probabilities']}")
    else:
        print(f"❌ ERROR: Status {response.status_code}")
        print(response.text)

except requests.exceptions.ConnectionError:
    print("❌ ERROR: Cannot connect to localhost:5001")
    print("Make sure the Flask API is running:")
    print("  cd C:\\Users\\YOGAANT NAIDU\\mindsync-backend")
    print("  .\\.venv\\Scripts\\python.exe models/ml_api.py")

except Exception as e:
    print(f"❌ ERROR: {e}")
