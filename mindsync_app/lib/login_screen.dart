import 'package:flutter/material.dart';
import 'package:mindsync_app/api_service.dart';
import 'package:mindsync_app/main_layout.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool isLogin = true;
  String name = "";
  String email = "";
  String password = "";
  bool loading = false;
  String? errorMsg;

  Future<void> submit() async {
    setState(() {
      loading = true;
      errorMsg = null;
    });

    try {
      Map<String, dynamic> data;
      if (isLogin) {
        data = await ApiService.login(email, password);
      } else {
        data = await ApiService.signup(name, email, password);
      }
      
      var user = data['user'];
      if (user != null) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => MainLayout(user: user)),
        );
      } else {
        setState(() => errorMsg = "Failed to load user profile");
      }
    } catch (e) {
      setState(() => errorMsg = e.toString().replaceAll("Exception: ", ""));
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D12),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.psychology, size: 48, color: Color(0xFFa29bfe)),
              const SizedBox(height: 12),
              const Text("MindSync", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 32),
              if (errorMsg != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 20),
                  color: Colors.red.withOpacity(0.1),
                  child: Text(errorMsg!, style: const TextStyle(color: Colors.redAccent)),
                ),
              if (!isLogin)
                TextField(
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: "Full Name", labelStyle: TextStyle(color: Colors.white54), filled: true, fillColor: Color(0xFF13131A)),
                  onChanged: (v) => name = v,
                ),
              if (!isLogin) const SizedBox(height: 16),
              TextField(
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: "Email Address", labelStyle: TextStyle(color: Colors.white54), filled: true, fillColor: Color(0xFF13131A)),
                onChanged: (v) => email = v,
              ),
              const SizedBox(height: 16),
              TextField(
                style: const TextStyle(color: Colors.white),
                obscureText: true,
                decoration: const InputDecoration(labelText: "Password", labelStyle: TextStyle(color: Colors.white54), filled: true, fillColor: Color(0xFF13131A)),
                onChanged: (v) => password = v,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6C5CE7), padding: const EdgeInsets.symmetric(vertical: 14)),
                  onPressed: loading ? null : submit,
                  child: loading ? const CircularProgressIndicator(color: Colors.white) : Text(isLogin ? "Log In" : "Sign Up", style: const TextStyle(color: Colors.white)),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => setState(() => isLogin = !isLogin),
                child: Text(isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in", style: const TextStyle(color: Color(0xFFa29bfe))),
              )
            ],
          ),
        ),
      ),
    );
  }
}
