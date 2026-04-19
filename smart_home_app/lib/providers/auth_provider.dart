import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/all_services.dart';

class AuthProvider extends ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  final _authService = AuthService();

  String? token;
  Map<String, dynamic>? user;
  bool isLoading = false;
  String? error;

  // ── Bước 1: Login (giống handleSubmit trong LoginPage.jsx) ──
  // Trả về Map với 'twoFA', 'userId', 'message' hoặc null nếu lỗi
  Future<Map<String, dynamic>?> login(String username, String password) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final res = await _authService.login(username, password);

      if (res['twoFA'] != true) {
        // Không có 2FA → lưu token luôn
        token = res['token'];
        user = {'username': res['username'], 'role': res['role']};
        await _storage.write(key: 'token', value: token);
        isLoading = false;
        notifyListeners();
        return {'twoFA': false};
      }

      // Có 2FA → trả về userId và message để màn hình OTP hiển thị
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

  // ── Bước 2: Verify OTP (giống handleVerifyOTP) ──
  Future<bool> verifyOTP(String userId, String otp) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final res = await _authService.verifyOTP(userId, otp);
      token = res['token'];
      user = {'username': res['username'], 'role': res['role']};
      await _storage.write(key: 'token', value: token);
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

  // ── Gửi lại OTP (giống handleResend) ──
  Future<bool> resendOTP(String userId) async {
    try {
      await _authService.resendOTP(userId);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> logout() async {
    token = null;
    user = null;
    await _storage.delete(key: 'token');
    notifyListeners();
  }

  Future<bool> checkAuth() async {
    token = await _storage.read(key: 'token');
    return token != null;
  }

  String _parseError(dynamic e) {
    try {
      final data = (e as dynamic).response?.data;
      return data?['message']?.toString() ?? e.toString();
    } catch (_) {
      return e.toString();
    }
  }
}