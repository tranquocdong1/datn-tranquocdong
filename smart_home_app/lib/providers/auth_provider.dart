import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/all_services.dart';
import '../services/notification_service.dart';

class AuthProvider extends ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  final _authService = AuthService();

  String? token;
  Map<String, dynamic>? user;
  bool isLoading = false;
  String? error;

  /// Hàm dùng chung để xử lý khi xác thực thành công (Login hoặc OTP)
  Future<void> _handleAuthSuccess(Map<String, dynamic> res) async {
    token = res['token'];
    user = {
      'username': res['username'],
      'role': res['role']
    };

    // 1. Lưu token vào bộ nhớ máy để duy trì phiên đăng nhập
    await _storage.write(key: 'token', value: token);

    // 2. Kích hoạt NotificationService để lấy và gửi FCM Token lên Server
    // Chúng ta chạy init() ở đây vì trong init() đã có logic _registerToken()
    try {
      await NotificationService().init();
      debugPrint('[Auth] FCM Token integrated successfully');
    } catch (e) {
      // Không chặn luồng đăng nhập nếu lỗi thông báo (để user vẫn vào được app)
      debugPrint('[Auth] FCM Integration error: $e');
    }
  }

  // ── Bước 1: Login ──
  Future<Map<String, dynamic>?> login(String username, String password) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final res = await _authService.login(username, password);

      if (res['twoFA'] != true) {
        // Không có 2FA → Xử lý lưu token và FCM luôn
        await _handleAuthSuccess(res);

        isLoading = false;
        notifyListeners();
        return {'twoFA': false};
      }

      // Có 2FA → Trả về thông tin để UI chuyển sang màn hình OTP
      isLoading = false;
      notifyListeners();
      return {
        'twoFA': true,
        'userId': res['userId'],
        'message': res['message'] ?? 'Đã gửi mã OTP',
      };
    } catch (e) {
      error = _parseError(e);
      isLoading = false;
      notifyListeners();
      return null;
    }
  }

  // ── Bước 2: Verify OTP ──
  Future<bool> verifyOTP(String userId, String otp) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final res = await _authService.verifyOTP(userId, otp);

      // OTP chính xác → Xử lý lưu token và FCM
      await _handleAuthSuccess(res);

      isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = _parseError(e);
      isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // ── Gửi lại OTP ──
  Future<bool> resendOTP(String userId) async {
    try {
      await _authService.resendOTP(userId);
      return true;
    } catch (_) {
      return false;
    }
  }

  // ── Đăng xuất ──
  Future<void> logout() async {
    token = null;
    user = null;
    await _storage.delete(key: 'token');
    notifyListeners();
  }

  // ── Kiểm tra trạng thái đăng nhập khi mở App ──
  Future<bool> checkAuth() async {
    token = await _storage.read(key: 'token');
    if (token != null) {
      // Nếu đã có token, khởi động lại service thông báo để cập nhật token mới (nếu có)
      await NotificationService().init();
    }
    return token != null;
  }

  // ── Parser lỗi từ Dio ──
  String _parseError(dynamic e) {
    try {
      if (e.response != null && e.response.data != null) {
        return e.response.data['message']?.toString() ?? 'Lỗi hệ thống';
      }
      return e.toString();
    } catch (_) {
      return 'Không thể kết nối đến máy chủ';
    }
  }
}