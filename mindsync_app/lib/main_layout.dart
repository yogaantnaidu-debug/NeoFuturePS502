import 'package:flutter/material.dart';
import 'package:mindsync_app/dashboard_screen.dart';
import 'package:mindsync_app/chat_screen.dart';
import 'package:mindsync_app/camera_screen.dart';
import 'package:mindsync_app/main.dart';

class MainLayout extends StatefulWidget {
  final Map<String, dynamic> user;

  const MainLayout({Key? key, required this.user}) : super(key: key);

  @override
  _MainLayoutState createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;
  late List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      DashboardScreen(user: widget.user),
      ChatScreen(user: widget.user),
      CameraScreen(cameras: cameras),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D12),
      body: SafeArea(
        child: _pages[_currentIndex],
      ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF13131A),
        selectedItemColor: const Color(0xFFa29bfe),
        unselectedItemColor: Colors.white54,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.chat_bubble), label: 'AI Chat'),
          BottomNavigationBarItem(icon: Icon(Icons.camera_alt), label: 'Camera ML'),
        ],
      ),
    );
  }
}
