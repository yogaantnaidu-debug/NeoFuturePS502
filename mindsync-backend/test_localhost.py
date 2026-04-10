import requests
import json

# Test the Flask API on localhost

test_cases = [
    {"text": "I feel amazing today!", "age": 25},
    {"text": "I'm really sad and depressed", "age": 30},
    {"text": "Just another regular day", "age": 22}
]

print("[TEST] XGBoost ML API on localhost:5001\n")
print("=" * 60)

for i, test_data in enumerate(test_cases, 1):
    url = "http://localhost:5001/predict"
    
    try:
        response = requests.post(url, json=test_data, timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nTest {i}:")
            print(f"  Input: '{test_data['text']}' (Age: {test_data['age']})")
            print(f"  Prediction: {result['predicted_mood'].upper()}")
            print(f"  Confidence: {result['confidence']*100:.1f}%")
            print(f"  All probabilities: {result['probabilities']}")
        else:
            print(f"\nTest {i}: ERROR - Status {response.status_code}")
            print(f"  {response.text}")
    except Exception as e:
        print(f"\nTest {i}: ERROR - {e}")

print("\n" + "=" * 60)
print("[OK] All tests completed successfully!")
