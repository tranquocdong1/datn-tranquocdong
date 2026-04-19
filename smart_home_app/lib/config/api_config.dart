class ApiConfig {
  // Dùng 10.0.2.2 để Android emulator kết nối với localhost máy thật
  static const String baseUrl = 'http://10.0.2.2:5000/api';
  static const String socketUrl = 'http://10.0.2.2:5000';

  // ── Auth ──
  static const String login = '/auth/login';
  static const String getMe = '/auth/me';
  static const String verifyOTP = '/auth/verify-otp';
  static const String resendOTP = '/auth/resend-otp';

  // ── Door ──
  static const String door = '/door';
  static const String doorCmd = '/door/cmd';
  static const String doorLogs = '/door/logs';
  static const String doorUidAdd = '/door/uid/add';
  static const String doorUid = '/door/uid';
  static const String doorUidList = '/door/uid/list';

  // ── Room ──
  static const String room = '/room';
  static const String roomFan = '/room/fan';
  static const String roomLivingLed = '/room/living/led';
  static const String roomBedroomLed = '/room/bedroom/led';
  static const String roomAlert = '/room/alert';
  static const String roomLogs = '/room/logs';

  // ── Clothes ──
  static const String clothes = '/clothes';
  static const String clothesCmd = '/clothes/cmd';

  // ── Schedules ──
  static const String schedules = '/schedules';
  static const String scheduleLogs = '/schedules/logs';

  // ── Stats ──
  static const String stats = '/stats/summary';
  static const String accessStats = '/stats/access';
  static const String tempHistory = '/stats/temperature';
  static const String logs = '/stats/logs';
}

// Color palette (giống web)
class AppColors {
  static const amber = 0xFFEF9F27;
  static const amberLight = 0xFFFAC775;
  static const amberPale = 0xFFFFF3DC;
  static const amberBorder = 0xFFFAE8B8;

  static const success = 0xFF3B6D11;
  static const successBg = 0xFFEAFCE8;

  static const danger = 0xFFA32D2D;
  static const dangerBg = 0xFFFCEBEB;

  static const blue = 0xFF185FA5;
  static const blueBg = 0xFFE6F1FB;

  static const purple = 0xFF534AB7;
  static const purpleBg = 0xFFEEEDFE;

  static const gray = 0xFF888780;
  static const grayBg = 0xFFF1EFE8;

  static const textHeading = 0xFF1A1A1A;
  static const textMuted = 0xFF888780;
  static const textHint = 0xFFB4B2A9;

  static const bgCard = 0xFFFFFFFF;
  static const bgMuted = 0xFFFAF8F4;
  static const border = 0xFFEEECE8;
}