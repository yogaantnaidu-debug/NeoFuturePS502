# start_all.ps1
Write-Host "Starting MindSync Backend Nodes..." -ForegroundColor Green

# Start the Flask ML API in a new window/background job (or just concurrently)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\YOGAANT NAIDU\mindsync-backend'; .venv\Scripts\activate; python models\ml_api.py" -WindowStyle Normal

# Start the Node Express backend
npm run dev
