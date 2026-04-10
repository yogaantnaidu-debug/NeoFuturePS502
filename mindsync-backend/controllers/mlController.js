const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const predictEmotion = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = path.resolve(req.file.path);
    
    // We are running this script inside the python executable of our venv!
    // The venv is in Web-appNeo/archive (2)/emotion_ml/venv
    const pythonExecutable = path.join(__dirname, '../../archive (2)/emotion_ml/venv/Scripts/python.exe');
    const scriptPath = path.join(__dirname, '../../archive (2)/emotion_ml/predict.py');

    // We'll check if venv python exists, else fallback to standard python
    const finalPythonExe = fs.existsSync(pythonExecutable) ? pythonExecutable : 'python';

    console.log(`🧠 ML Request Received. Image at: ${imagePath}`);
    console.log(`🐍 Using Python at: ${finalPythonExe}`);
    
    const pythonProcess = spawn(finalPythonExe, [scriptPath, imagePath]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        // Cleaning up the temp uploaded image
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
        }

        try {
            // Find the JSON part in the python output
            // The python script might print other debug info, so we look for valid json
            let result;
            const lines = dataString.split('\n');
            for (let line of lines) {
                if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
                    result = JSON.parse(line.trim());
                    break;
                }
            }

            if (!result) {
                return res.status(500).json({ error: 'Failed to process python script output', payload: dataString });
            }

            res.json(result);
        } catch (error) {
            console.error('JSON parsing error on:', dataString);
            res.status(500).json({ error: 'Failed to parse python output', details: error.message });
        }
    });
};

module.exports = {
    predictEmotion
};
