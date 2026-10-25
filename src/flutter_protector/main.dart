import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:permission_handler/permission_handler.dart';

/// Top-level background message handler for Firebase Cloud Messaging
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint("Handling a background message: ${message.messageId}");
  
  final data = message.data;
  if (data['type'] == 'RING') {
    FlutterRingtonePlayer().playAlarm(
      volume: 1.0,
      looping: true,
      asAlarm: true,
    );
  } else if (data['type'] == 'PING') {
    await _transmitCurrentLocation();
  }
}

Future<void> _transmitCurrentLocation() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final imei = prefs.getString('registered_imei');
    if (imei == null || imei.isEmpty) return;

    final position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
      timeLimit: const Duration(seconds: 15),
    );

    final phoneRef = FirebaseFirestore.instance.collection('protected_phones').doc(imei);

    // 1. Update lastLocation
    await phoneRef.update({
      'lastLocation': {
        'lat': position.latitude,
        'lng': position.longitude,
        'accuracy': position.accuracy,
        'timestamp': FieldValue.serverTimestamp(),
        'address': 'Live GPS Ping via Flutter Companion Service',
        'city': 'Nigeria',
      },
      'lastUpdated': FieldValue.serverTimestamp(),
    });

    // 2. Append to location_history subcollection
    await phoneRef.collection('location_history').add({
      'lat': position.latitude,
      'lng': position.longitude,
      'accuracy': position.accuracy,
      'timestamp': FieldValue.serverTimestamp(),
      'event': 'flutter_gps_ping',
    });
  } catch (e) {
    debugPrint("Failed to transmit location: $e");
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(const NaijaMartProtectorApp());
}

class NaijaMartProtectorApp extends StatelessWidget {
  const NaijaMartProtectorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NaijaMart Phone Protector',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF008751),
          primary: const Color(0xFF008751),
        ),
        useMaterial3: true,
      ),
      home: const ProtectorHomeScreen(),
    );
  }
}

class ProtectorHomeScreen extends StatefulWidget {
  const ProtectorHomeScreen({super.key});

  @override
  State<ProtectorHomeScreen> createState() => _ProtectorHomeScreenState();
}

class _ProtectorHomeScreenState extends State<ProtectorHomeScreen> {
  final _imeiController = TextEditingController();
  final _certController = TextEditingController();
  bool _isProtected = false;
  String _statusMessage = 'Not Configured';
  StreamSubscription<DocumentSnapshot>? _commandSubscription;

  @override
  void initState() {
    super.initState();
    _loadStoredConfig();
    _requestAllPermissions();
  }

  Future<void> _loadStoredConfig() async {
    final prefs = await SharedPreferences.getInstance();
    final savedImei = prefs.getString('registered_imei');
    final savedCert = prefs.getString('protection_cert');

    if (savedImei != null && savedImei.isNotEmpty) {
      setState(() {
        _imeiController.text = savedImei;
        _certController.text = savedCert ?? '';
        _isProtected = true;
        _statusMessage = 'Active & Guarding Device';
      });
      _startFirestoreCommandListener(savedImei);
    }
  }

  Future<void> _requestAllPermissions() async {
    // 1. Notification permission
    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // 2. Foreground Location
    var locStatus = await Permission.location.request();

    // 3. Background Location ("Allow all the time")
    if (locStatus.isGranted) {
      await Permission.locationAlways.request();
    }

    // 4. Disable battery optimization
    await Permission.ignoreBatteryOptimizations.request();
  }

  void _startFirestoreCommandListener(String imei) {
    _commandSubscription?.cancel();

    _commandSubscription = FirebaseFirestore.instance
        .collection('protected_phones')
        .doc(imei)
        .snapshots()
        .listen((snapshot) async {
      if (!snapshot.exists) return;
      final data = snapshot.data();
      if (data == null) return;

      final command = data['command'] as Map<String, dynamic>?;
      if (command == null) return;

      final type = command['type'];
      if (type == 'RING') {
        FlutterRingtonePlayer().playAlarm(
          volume: 1.0,
          looping: true,
          asAlarm: true,
        );
      } else if (type == 'LOCK') {
        // Stop siren if playing
        FlutterRingtonePlayer().stop();
      } else if (type == 'PING') {
        await _transmitCurrentLocation();
      } else if (type == 'ERASE') {
        FlutterRingtonePlayer().stop();
        final prefs = await SharedPreferences.getInstance();
        await prefs.clear();
        setState(() {
          _isProtected = false;
          _statusMessage = 'Device Deregistered by Owner Command';
        });
      }
    });
  }

  Future<void> _activateProtection() async {
    final imei = _imeiController.text.trim();
    if (imei.length != 15) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 15-digit IMEI')),
      );
      return;
    }

    // Save token to Firestore
    final fcmToken = await FirebaseMessaging.instance.getToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('registered_imei', imei);
    await prefs.setString('protection_cert', _certController.text.trim());

    await FirebaseFirestore.instance.collection('protected_phones').doc(imei).update({
      'fcmToken': fcmToken,
      'isVerified': true,
      'lastUpdated': FieldValue.serverTimestamp(),
    });

    await _transmitCurrentLocation();
    _startFirestoreCommandListener(imei);

    setState(() {
      _isProtected = true;
      _statusMessage = 'Active & Guarding Device';
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Protection Active! Device is now reporting GPS coordinates.')),
      );
    }
  }

  void _stopAlarm() {
    FlutterRingtonePlayer().stop();
  }

  @override
  void dispose() {
    _commandSubscription?.cancel();
    _imeiController.dispose();
    _certController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NaijaMart Phone Protector', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF008751),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _isProtected ? Colors.green.shade50 : Colors.orange.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _isProtected ? Colors.green.shade400 : Colors.orange.shade300,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _isProtected ? Icons.shield : Icons.shield_outlined,
                    color: _isProtected ? const Color(0xFF008751) : Colors.orange.shade800,
                    size: 36,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isProtected ? 'SHIELD ACTIVE' : 'UNCONFIGURED',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            color: _isProtected ? const Color(0xFF008751) : Colors.orange.shade800,
                          ),
                        ),
                        Text(
                          _statusMessage,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _imeiController,
              keyboardType: TextInputType.number,
              maxLength: 15,
              decoration: const InputDecoration(
                labelText: '15-Digit IMEI (From dial *#06#)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _certController,
              decoration: const InputDecoration(
                labelText: 'Certificate ID (e.g. NM-SEC-924810)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _activateProtection,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF008751),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.check_circle),
              label: const Text('ACTIVATE BACKGROUND SHIELD', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _stopAlarm,
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.volume_off),
              label: const Text('Silence Siren Alarm'),
            ),
          ],
        ),
      ),
    );
  }
}
