import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'api_service.dart';
import 'navigation_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('[FCM Background] ${message.notification?.title}');
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final _fcm = FirebaseMessaging.instance;
  final _local = FlutterLocalNotificationsPlugin();
  final _nav = NavigationService();

  // ── 2 channels khớp với fcmService.js ──────────────────────────────────
  // 'smart_home_alert'  → gas, xâm nhập, nhiệt độ cao  (type: 'alert')
  // 'smart_home_info'   → (hiện chưa dùng, giữ lại cho tương lai)
  static const _alertChannel = AndroidNotificationChannel(
    'smart_home_alert',
    'Cảnh báo khẩn cấp',
    description: 'Khí gas, xâm nhập, nhiệt độ cao',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
  );

  static const _infoChannel = AndroidNotificationChannel(
    'smart_home_info',
    'Thông báo thông thường',
    description: 'Thông báo chung',
    importance: Importance.defaultImportance,
  );

  Future<void> init() async {
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    await _fcm.requestPermission(
      alert: true, badge: true, sound: true, criticalAlert: true,
    );

    // Tạo channels
    final androidPlugin = _local
        .resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    await androidPlugin?.createNotificationChannel(_alertChannel);
    await androidPlugin?.createNotificationChannel(_infoChannel);

    // Khởi tạo local notifications
    await _local.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      ),
      onDidReceiveNotificationResponse: _onLocalTap,
    );

    // App ĐANG MỞ → hiện local notification
    FirebaseMessaging.onMessage.listen(_onForeground);

    // App ở BACKGROUND → user tap notification
    FirebaseMessaging.onMessageOpenedApp.listen((msg) {
      print('[FCM] Tap from background: ${msg.data}');
      _navigate(msg.data);
    });

    // App BỊ TẮT HOÀN TOÀN → user tap để mở
    final initial = await _fcm.getInitialMessage();
    if (initial != null) {
      print('[FCM] Tap from terminated: ${initial.data}');
      Future.delayed(const Duration(milliseconds: 500), () {
        _navigate(initial.data);
      });
    }

    // Lưu FCM token lên backend
    final token = await _fcm.getToken();
    if (token != null) {
      print('[FCM Token] $token');
      await _saveToken(token);
    }
    _fcm.onTokenRefresh.listen(_saveToken);
  }

  // ── Foreground: hiện local notification ──────────────────────────────────
  void _onForeground(RemoteMessage message) {
    final notif = message.notification;
    if (notif == null) return;

    // Khớp channelId với fcmService.js: type='alert' → smart_home_alert
    final isAlert = message.data['type'] == 'alert';
    final channelId   = isAlert ? 'smart_home_alert' : 'smart_home_info';
    final channelName = isAlert ? 'Cảnh báo khẩn cấp' : 'Thông báo thông thường';

    _local.show(
      notif.hashCode,
      notif.title,
      notif.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          channelId,
          channelName,
          importance: isAlert ? Importance.max : Importance.defaultImportance,
          priority:   isAlert ? Priority.max   : Priority.defaultPriority,
          icon: '@mipmap/ic_launcher',
          styleInformation: BigTextStyleInformation(
            notif.body ?? '',
            contentTitle: notif.title,
          ),
        ),
      ),
      // Payload = screen để navigate khi tap
      payload: message.data['screen'] ?? '/dashboard',
    );
  }

  // ── Tap local notification ────────────────────────────────────────────────
  void _onLocalTap(NotificationResponse response) {
    print('[FCM] Local tap: ${response.payload}');
    _nav.navigateToScreen(response.payload);
  }

  // ── Navigate theo data từ FCM ─────────────────────────────────────────────
  // fcmService.js gửi 3 loại:
  //   notifyGas      → screen: '/room'
  //   notifyIntruder → screen: '/room'
  //   notifyHighTemp → screen: '/room', + extra: temp, hum
  void _navigate(Map<String, dynamic> data) {
    _nav.navigateToScreen(data['screen']?.toString());
  }

  Future<void> _saveToken(String token) async {
    try {
      await ApiService().dio.post('/auth/fcm-token', data: {'token': token});
      print('[FCM] Token saved');
    } catch (e) {
      print('[FCM] Save token error: $e');
    }
  }
}