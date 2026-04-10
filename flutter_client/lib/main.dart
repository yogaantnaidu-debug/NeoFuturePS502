import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MindSyncApp());
}

class MindSyncApp extends StatelessWidget {
  const MindSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MindSync Emotion',
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.deepPurple,
        fontFamily: 'Inter',
        scaffoldBackgroundColor: const Color(0xFF121212),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E1E1E),
          elevation: 0,
        ),
      ),
      home: const EmotionScreen(),
    );
  }
}

class EmotionScreen extends StatefulWidget {
  const EmotionScreen({super.key});

  @override
  State<EmotionScreen> createState() => _EmotionScreenState();
}

class _EmotionScreenState extends State<EmotionScreen> with SingleTickerProviderStateMixin {
  File? _image;
  final ImagePicker _picker = ImagePicker();
  String _mood = "";
  double _confidence = 0.0;
  bool _isLoading = false;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _image = File(pickedFile.path);
        _mood = ""; // Reset mood
      });
      _analyzeMood();
    }
  }

  Future<void> _analyzeMood() async {
    if (_image == null) return;
    setState(() {
      _isLoading = true;
    });

    try {
      // NOTE: Replace with your actual Node.js backend IP! 
      // Use 10.0.2.2 for Android emulator targeting localhost.
      var uri = Uri.parse('http://10.0.2.2:3000/api/predict-emotion');
      var request = http.MultipartRequest('POST', uri);
      request.files.add(await http.MultipartFile.fromPath('image', _image!.path));

      var response = await request.send();
      if (response.statusCode == 200) {
        var responseData = await response.stream.bytesToString();
        var data = json.decode(responseData);
        setState(() {
          _mood = data['mood'] ?? "Unknown";
          _confidence = data['confidence'] != null ? data['confidence'].toDouble() : 0.0;
        });
      } else {
        setState(() {
          _mood = "Error";
        });
        print('Backend error: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        _mood = "Error connection";
      });
      print(e);
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mood Detection', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Glassmorphism Card for Image
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  gradient: LinearGradient(
                    colors: [Colors.white.withOpacity(0.1), Colors.white.withOpacity(0.05)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(color: Colors.white.withOpacity(0.2)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 20,
                      spreadRadius: 5,
                    )
                  ]
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: _image == null
                        ? Container(
                            height: 300,
                            width: double.infinity,
                            color: Colors.white.withOpacity(0.05),
                            child: const Center(child: Icon(Icons.face_retouching_natural, size: 80, color: Colors.grey)),
                          )
                        : Image.file(_image!, height: 300, width: double.infinity, fit: BoxFit.cover),
                  ),
                ),
              ),
              const SizedBox(height: 30),

              // Upload Button
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _pickImage,
                icon: const Icon(Icons.camera_alt),
                label: const Text('Analyze Photo', style: TextStyle(fontSize: 16)),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                  backgroundColor: Colors.deepPurpleAccent,
                  foregroundColor: Colors.white,
                  elevation: 8,
                ),
              ),

              const SizedBox(height: 40),

              // Result Section
              if (_isLoading)
                FadeTransition(
                  opacity: _animationController,
                  child: const Text("Analyzing brainwaves...", style: TextStyle(color: Colors.deepPurpleAccent, fontSize: 18, fontStyle: FontStyle.italic)),
                )
              else if (_mood.isNotEmpty)
                Column(
                  children: [
                    Text(
                      _mood.toUpperCase(),
                      style: TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.w900,
                        color: _mood == 'happy' ? Colors.greenAccent : (_mood == 'sad' ? Colors.blueAccent : Colors.redAccent),
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Confidence: ${(_confidence * 100).toStringAsFixed(1)}%",
                      style: TextStyle(fontSize: 16, color: Colors.white.withOpacity(0.7)),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
