import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import torch.nn.functional as F

# Paths
base_dir = r"C:\Users\YOGAANT NAIDU\Downloads\archive (2)"
train_dir = os.path.join(base_dir, 'train')

# Setup hyperparameters
batch_size = 32
epochs = 5
learning_rate = 0.001

print("Initializing PyTorch Data Loaders...")

# Transforms for data augmentation and normalization
# Convert to grayscale 1 channel
transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

# Load custom folders only: happy and sad
# We use ImageFolder which assigns classes based on subdirectories
# By explicitly setting classes we can filter if needed, but ImageFolder loads all subdirs.
# Let's filter out only the classes we want by creating a custom dataset or deleting others. 
# A simpler way without deleting is to use a subset, but it's easier to just manually filter it:
class CustomEmotionDataset(datasets.ImageFolder):
    def find_classes(self, directory):
        classes = ['happy', 'sad']
        class_to_idx = {'happy': 0, 'sad': 1}
        return classes, class_to_idx

# Load dataset
full_dataset = CustomEmotionDataset(root=train_dir, transform=transform)

# Split into train and validation
train_size = int(0.8 * len(full_dataset))
val_size = len(full_dataset) - train_size
train_dataset, val_dataset = torch.utils.data.random_split(full_dataset, [train_size, val_size])

train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

print(f"Classes: {full_dataset.classes}")
print(f"Training samples: {len(train_dataset)}, Validation samples: {len(val_dataset)}")

# Define the CNN Model
class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.fc1 = nn.Linear(64 * 12 * 12, 64) # 48/2/2 = 12
        self.fc2 = nn.Linear(64, 1)            # Binary classification (1 output node)
        self.dropout = nn.Dropout(0.5)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(-1, 64 * 12 * 12)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = torch.sigmoid(self.fc2(x))
        return x

model = SimpleCNN()
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=learning_rate)

print("Starting Training...")
for epoch in range(epochs):
    model.train()
    running_loss = 0.0
    for i, data in enumerate(train_loader, 0):
        inputs, labels = data
        labels = labels.float().view(-1, 1) # reshape for BCE
        
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        
    # Validation
    model.eval()
    val_loss = 0.0
    correct = 0
    total = 0
    with torch.no_grad():
        for data in val_loader:
            inputs, labels = data
            labels = labels.float().view(-1, 1)
            outputs = model(inputs)
            val_loss += criterion(outputs, labels).item()
            predicted = (outputs > 0.5).float()
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    print(f"Epoch [{epoch+1}/{epochs}], Loss: {running_loss/len(train_loader):.4f}, "
          f"Val Loss: {val_loss/len(val_loader):.4f}, Val Acc: {100 * correct / total:.2f}%")

# Save model weights
model_path = 'emotion_model.pth'
torch.save(model.state_dict(), model_path)
print(f"Model weights saved to {os.path.abspath(model_path)}")
