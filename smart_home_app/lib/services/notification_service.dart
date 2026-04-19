import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'api_service.dart';

// Xử lý thông báo khi app bị tắt hoàn toàn (background handler PHẢI là top-level function)
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
  final _localNotifications = FlutterLocalNotificationsPlugin();

  // Channel riêng cho cảnh báo quan trọng (gas, xâm nhập)
  static const _alertChannel = AndroidNotificationChannel(
    'smart_home_alert',
    'Cảnh báo khẩn cấp',
    description: 'Thông báo gas, xâm nhập, khẩn cấp',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
  );

  // Channel cho thông báo thường (mưa, cửa...)
  static const _infoChannel = AndroidNotificationChannel(
    'smart_home_info',
    'Thông báo thông thường',
    description: 'Mưa, cửa mở/đóng, giàn phơi',
    importance: Importance.defaultImportance,
  );

  Future<void> init() async {
    // Đăng ký background handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Xin quyền thông báo
    await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      criticalAlert: true, // iOS quan trọng
    );

    // Tạo Android notification channels
    final androidPlugin = _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    await androidPlugin?.createNotificationChannel(_alertChannel);
    await androidPlugin?.createNotificationChannel(_infoChannel);

    // Khởi tạo local notifications
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    await _localNotifications.initialize(
      const InitializationSettings(android: androidSettings),
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // Lắng nghe khi app đang MỞ (foreground)
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Lắng nghe khi user TAP vào notification (app ở background)
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

    // Lấy FCM token để gửi lên backend
    final token = await _fcm.getToken();
    if (token != null) {
      print('[FCM Token] $token');
      await _saveFCMToken(token);
    }

    // Lắng nghe khi token refresh
    _fcm.onTokenRefresh.listen(_saveFCMToken);
  }

  // Khi app đang mở → hiện local notification
  void _handleForegroundMessage(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;

    final isAlert = message.data['type'] == 'alert';
    final channelId = isAlert ? 'smart_home_alert' : 'smart_home_info';
    final channelName = isAlert ? 'Cảnh báo khẩn cấp' : 'Thông báo thường';

    _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          channelId, channelName,
          importance: isAlert ? Importance.max : Importance.defaultImportance,
          priority: isAlert ? Priority.max : Priority.defaultPriority,
          icon: '@mipmap/ic_launcher',
        ),
      ),
      payload: message.data['screen'] ?? '/',
    );
  }

  void _handleNotificationTap(RemoteMessage message) {
    print('[FCM Tap] Navigate to: ${message.data['screen']}');
    // Điều hướng đến màn hình tương ứng nếu cần
  }

  void _onNotificationTap(NotificationResponse response) {
    print('[Local Notification Tap] payload: ${response.payload}');
  }

  Future<void> _saveFCMToken(String token) async {
    try {
      await ApiService().dio.post('/auth/fcm-token', data: {'token': token});
      print('[FCM] Token saved to backend');
    } catch (e) {
      print('[FCM] Error: $e');
    }
  }
}