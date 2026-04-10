import 'package:flutter/material.dart';
import 'package:mindsync_app/api_service.dart';

class DashboardScreen extends StatefulWidget {
  final Map<String, dynamic> user;

  const DashboardScreen({Key? key, required this.user}) : super(key: key);

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? stats;
  List<dynamic>? insights;
  bool loading = true;
  String? errorMsg;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final userId = widget.user['_id'] ?? widget.user['id'];
      if (userId == null) {
        setState(() {
          errorMsg = "User ID missing";
          loading = false;
        });
        return;
      }

      final fetchedStats = await ApiService.getMoodStats(userId.toString());
      final fetchedInsights = await ApiService.getInsights(userId.toString());

      setState(() {
        stats = fetchedStats;
        insights = fetchedInsights;
        loading = false;
      });
    } catch (e) {
      // Ignore API errors for now if backend is not seeded, just show placeholder
      setState(() {
        stats = {'totalLogs': 0, 'happy': 0, 'sad': 0};
        insights = ['Continue logging your emotions to get personalized AI insights.'];
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFFa29bfe)));
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      color: const Color(0xFFa29bfe),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            Text(
              "Hello, ${widget.user['name'] ?? 'User'}",
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              "Here is your mental wellness overview.",
              style: TextStyle(fontSize: 16, color: Colors.white54),
            ),
            const SizedBox(height: 32),
            const Text(
              "Mood Statistics",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    title: "Total Logs",
                    value: "${stats?['totalLogs'] ?? 0}",
                    icon: Icons.bar_chart,
                    color: Colors.blueAccent,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _StatCard(
                    title: "Happy",
                    value: "${stats?['happy'] ?? 0}",
                    icon: Icons.sentiment_very_satisfied,
                    color: Colors.greenAccent,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _StatCard(
                    title: "Sad",
                    value: "${stats?['sad'] ?? 0}",
                    icon: Icons.sentiment_dissatisfied,
                    color: Colors.redAccent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              "AI Insights",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 16),
            if (insights != null && insights!.isNotEmpty)
              ...insights!.map((insight) => _InsightCard(insight: insight.toString()))
            else
              const Text("No AI insights yet. Keep logging your mood!", style: TextStyle(color: Colors.white54)),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({required this.title, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF13131A),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 4),
          )
        ]
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 4),
          Text(title, style: const TextStyle(fontSize: 14, color: Colors.white54)),
        ],
      ),
    );
  }
}

class _InsightCard extends StatelessWidget {
  final String insight;
  const _InsightCard({required this.insight});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF13131A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFa29bfe).withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.lightbulb, color: Colors.amber, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Text(insight, style: const TextStyle(color: Colors.white, fontSize: 15, height: 1.4)),
          ),
        ],
      ),
    );
  }
}
