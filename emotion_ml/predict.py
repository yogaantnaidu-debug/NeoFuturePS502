import os
import sys
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import cv2
import numpy as np

class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.fc1 = nn.Linear(64 * 12 * 12, 64)
        self.fc2 = nn.Linear(64, 1)
        self.dropout = nn.Dropout(0.5)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(-1, 64 * 12 * 12)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = torch.sigmoid(self.fc2(x))
        return x

def predict_emotion(image_path):
    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image not found at {image_path}"}))
        return

    model_path = os.path.join(os.path.dirname(__file__), 'emotion_model.pth')
    if not os.path.exists(model_path):
        print(json.dumps({"error": "Model emotion_model.pth not found."}))
        return

    try:
        # Load image via cv2 to perform face detection
        cv_img = cv2.imread(image_path)
        if cv_img is None:
             print(json.dumps({"error": "Could not read image"}))
             return
             
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        
        # Load OpenCV default Haar cascade for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        if len(faces) > 0:
            # Get the first/largest detected face
            (x, y, w, h) = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
            # Crop the face
            cv_img = cv_img[y:y+h, x:x+w]
        
        # Convert cv2 image back to string bytes/PIL image for tensor pipeline
        cv_img_rgb = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(cv_img_rgb).convert('L')
        
        # Apply transforms: resize to 48x48, convert to tensor, normalize
        transform = transforms.Compose([
            transforms.Resize((48, 48)),
            transforms.ToTensor(),
            transforms.Normalize((0.5,), (0.5,))
        ])
        
        input_tensor = transform(img)
        input_tensor = input_tensor.unsqueeze(0) # Add batch dimension -> (1, 1, 48, 48)

        # Load model architecture and weights
        model = SimpleCNN()
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu'), weights_only=True))
        model.eval() # Set to evaluation mode

        with torch.no_grad():
            output = model(input_tensor)
            prediction = output.item()
        
        # In custom dataset, happy=0, sad=1
        mood = 'sad' if prediction > 0.5 else 'happy'
        confidence = prediction if mood == 'sad' else 1.0 - prediction

        print(json.dumps({
            "mood": mood,
            "confidence": round(confidence, 4)
        }))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python predict.py <image_path>"}))
    else:
        predict_emotion(sys.argv[1])

