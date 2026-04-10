import 'dart:io';
import 'package:flutter/material.dart';

class ResultScreen extends StatelessWidget {
  final String mood;
  final double confidence;
  final String imagePath;

  const ResultScreen({
    super.key,
    required this.mood,
    required this.confidence,
    required this.imagePath,
  });

  @override
  Widget build(BuildContext context) {
    // Generate colors and text dynamically based on the mood
    final isHappy = mood.toLowerCase() == 'happy';
    final primaryColor = isHappy ? Colors.lightBlueAccent : Colors.indigoAccent;
    final iconData = isHappy ? Icons.sentiment_very_satisfied : Icons.sentiment_very_dissatisfied;
    final message = isHappy ? "You're feeling Happy!" : "You're feeling Sad.";

    return Scaffold(
      backgroundColor: const Color(0xFF121212), // Dark premium background
      appBar: AppBar(
        title: const Text('Analysis Result'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Image Preview
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withOpacity(0.3),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: Image.file(
                  File(imagePath),
                  height: 300,
                  width: 300,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 40),
              
              // Result Card
              Container(
                padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 30),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: Column(
                  children: [
                    Icon(iconData, size: 80, color: primaryColor),
                    const SizedBox(height: 20),
                    Text(
                      message,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Confidence: ${(confidence * 100).toStringAsFixed(1)}%',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 40),
              
              // Try Again Button
              ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.refresh),
                label: const Text('Analyze Another'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
