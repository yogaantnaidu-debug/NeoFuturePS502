// In your Node.js Backend, you can integrate the Python model like this:

// 1. Install required packages in your node project: npm install multer
// 2. Add an endpoint that will be called by your Flutter app:

const express = require('express');
const { spawn } = require('child_process');
const multer  = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

const app = express();

app.post('/api/predict-emotion', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = path.resolve(req.file.path);
    // Path to the python executable in the virtual environment!
    const pythonExecutable = path.resolve('C:/Users/YOGAANT NAIDU/Downloads/archive (2)/emotion_ml/venv/Scripts/python.exe');
    // Path to the predict.py script we created
    const scriptPath = path.resolve('C:/Users/YOGAANT NAIDU/Downloads/archive (2)/emotion_ml/predict.py');

    const pythonProcess = spawn(pythonExecutable, [scriptPath, imagePath]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.on('close', (code) => {
        try {
            // The python script prints purely JSON string to standard output.
            const result = JSON.parse(dataString);
            res.json(result);
        } catch (error) {
            console.error(dataString)
            res.status(500).json({ error: 'Failed to process image prediction' });
        }
    });
});

// app.listen(3000, () => console.log('Server listening on port 3000'));
