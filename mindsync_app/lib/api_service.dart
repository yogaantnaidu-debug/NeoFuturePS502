import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000/api';
  static const String mlBaseUrl = 'http://10.0.2.2:5001'; // Flask base URL

  // User Endpoints
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['error'] ?? 'Login failed');
    }
  }

  static Future<Map<String, dynamic>> signup(String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['error'] ?? 'Signup failed');
    }
  }

  // Mood/Stats Endpoints
  static Future<Map<String, dynamic>> getMoodStats(String userId) async {
    final response = await http.get(Uri.parse('$baseUrl/mood/stats?user_id=$userId'));
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load stats');
  }

  static Future<List<dynamic>> getInsights(String userId) async {
    final response = await http.get(Uri.parse('$baseUrl/ai/insights?user_id=$userId'));
    if (response.statusCode == 200) return jsonDecode(response.body)['insights'] ?? [];
    throw Exception('Failed to load insights');
  }

  // AI Chat
  static Future<Map<String, dynamic>> chatAI(Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl/ai/chat'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Chat failed');
  }

  // Original Camera ML
  static Future<Map<String, dynamic>?> predictEmotion(File imageFile) async {
    try {
      var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/ml/predict-emotion'));
      request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (e) {
      print('Network error: $e');
    }
    return null;
  }
}
