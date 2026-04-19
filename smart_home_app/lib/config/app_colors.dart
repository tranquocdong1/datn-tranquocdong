import 'package:flutter/material.dart';
import 'api_config.dart'; // lấy AppColors từ đây

// ── Màu bổ sung cho dark mode (không có trong AppColors gốc) ─────────────────
class DarkColors {
  DarkColors._();
  static const Color bgBase       = Color(0xFF1A1917);
  static const Color bgCard       = Color(0xFF242220);
  static const Color bgMuted      = Color(0xFF1E1C1A);
  static const Color textHeading  = Color(0xFFF0EDE8);
  static const Color textBody     = Color(0xFFC8C5BF);
  static const Color textMuted    = Color(0xFF888780);
  static const Color textHint     = Color(0xFF555350);
  static const Color border       = Color(0xFF2E2C28);
  static const Color borderStrong = Color(0xFF3A3835);
}

// ── Light colors dạng Color() (tiện dùng trong widget) ───────────────────────
class LightColors {
  LightColors._();
  static const Color bgBase      = Color(0xFFF7F5F0);
  static const Color bgCard      = Color(0xFFFFFFFF);
  static const Color bgMuted     = Color(0xFFFAF8F4);
  static const Color textHeading = Color(0xFF1A1A1A);
  static const Color textBody    = Color(0xFF444340);
  static const Color textMuted   = Color(0xFF888780);
  static const Color textHint    = Color(0xFFB4B2A9);
  static const Color border      = Color(0xFFEEECE8);
  static const Color borderStrong= Color(0xFFE0DDD8);
}

// ── Helper: lấy màu theo theme hiện tại ──────────────────────────────────────
extension AppThemeColors on BuildContext {
  bool get isDark => Theme.of(this).brightness == Brightness.dark;

  Color get bgBase       => isDark ? DarkColors.bgBase       : LightColors.bgBase;
  Color get bgCard       => isDark ? DarkColors.bgCard       : LightColors.bgCard;
  Color get bgMuted      => isDark ? DarkColors.bgMuted      : LightColors.bgMuted;
  Color get textHeading  => isDark ? DarkColors.textHeading  : LightColors.textHeading;
  Color get textBody     => isDark ? DarkColors.textBody     : LightColors.textBody;
  Color get textMuted    => isDark ? DarkColors.textMuted    : LightColors.textMuted;
  Color get textHint     => isDark ? DarkColors.textHint     : LightColors.textHint;
  Color get borderColor  => isDark ? DarkColors.border       : LightColors.border;
}

// ── AppTheme: ThemeData cho light và dark ─────────────────────────────────────
class AppTheme {
  AppTheme._();

  static ThemeData get light => ThemeData(
    brightness: Brightness.light,
    useMaterial3: true,
    scaffoldBackgroundColor: LightColors.bgBase,
    cardColor: LightColors.bgCard,
    dividerColor: LightColors.border,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(AppColors.amber),
      brightness: Brightness.light,
      primary: const Color(AppColors.amber),
      surface: LightColors.bgCard,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: LightColors.bgCard,
      foregroundColor: LightColors.textHeading,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: TextStyle(
        fontSize: 17, fontWeight: FontWeight.w500,
        color: LightColors.textHeading,
      ),
      iconTheme: IconThemeData(color: LightColors.textMuted),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: LightColors.bgCard,
      selectedItemColor: Color(AppColors.amber),
      unselectedItemColor: LightColors.textHint,
      elevation: 0,
      type: BottomNavigationBarType.fixed,
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: LightColors.bgCard,
      indicatorColor: const Color(AppColors.amberPale),
      iconTheme: WidgetStateProperty.resolveWith((states) =>
        states.contains(WidgetState.selected)
          ? const IconThemeData(color: Color(AppColors.amber))
          : const IconThemeData(color: LightColors.textHint),
      ),
      labelTextStyle: WidgetStateProperty.resolveWith((states) =>
        states.contains(WidgetState.selected)
          ? const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(AppColors.amber))
          : const TextStyle(fontSize: 11, color: LightColors.textHint),
      ),
    ),
  );

  static ThemeData get dark => ThemeData(
    brightness: Brightness.dark,
    useMaterial3: true,
    scaffoldBackgroundColor: DarkColors.bgBase,
    cardColor: DarkColors.bgCard,
    dividerColor: DarkColors.border,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(AppColors.amber),
      brightness: Brightness.dark,
      primary: const Color(AppColors.amber),
      surface: DarkColors.bgCard,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: DarkColors.bgCard,
      foregroundColor: DarkColors.textHeading,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: TextStyle(
        fontSize: 17, fontWeight: FontWeight.w500,
        color: DarkColors.textHeading,
      ),
      iconTheme: IconThemeData(color: DarkColors.textMuted),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: DarkColors.bgCard,
      selectedItemColor: Color(AppColors.amber),
      unselectedItemColor: DarkColors.textHint,
      elevation: 0,
      type: BottomNavigationBarType.fixed,
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: DarkColors.bgCard,
      indicatorColor: const Color(0xFF2A2115),
      iconTheme: WidgetStateProperty.resolveWith((states) =>
        states.contains(WidgetState.selected)
          ? const IconThemeData(color: Color(AppColors.amber))
          : const IconThemeData(color: DarkColors.textHint),
      ),
      labelTextStyle: WidgetStateProperty.resolveWith((states) =>
        states.contains(WidgetState.selected)
          ? const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(AppColors.amber))
          : const TextStyle(fontSize: 11, color: DarkColors.textHint),
      ),
    ),
  );
}