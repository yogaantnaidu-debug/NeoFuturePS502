import sys
sys.path.insert(0, '.')
from models.ml_api import predict_mood

# Test predictions
test_cases = [
    ('I feel very stressed and anxious', 25),
    ('I am extremely happy today!', 30),
    ('Just another normal day', 22)
]

print('[TEST] Running predictions with XGBoost model:')
for text, age in test_cases:
    result = predict_mood(text, age)
    print(f'Text: "{text}" (Age: {age})')
    print(f'  -> Mood: {result["predicted_mood"]} (Confidence: {result["confidence"]})')
    print(f'  -> All probabilities: {result["probabilities"]}')
    print()
