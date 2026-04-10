import requests
import json
import time

# Give the server a moment to start
time.sleep(2)

url = "http://localhost:5001/predict"

test_data = {
    "text": "I am very happy today!",
    "age": 25
}

print("[TEST] Making request to Flask API...")
print(f"URL: {url}")
print(f"Data: {json.dumps(test_data, indent=2)}")

try:
    response = requests.post(url, json=test_data, timeout=5)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body:\n{json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"[ERROR] {e}")
