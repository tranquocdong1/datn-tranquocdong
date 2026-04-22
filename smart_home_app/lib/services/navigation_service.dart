import 'package:flutter/material.dart';

class NavigationService {
  static final NavigationService _instance = NavigationService._internal();
  factory NavigationService() => _instance;
  NavigationService._internal();

  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  static const Map<String, int> _screenIndex = {
    '/dashboard': 0,
    '/door':      1,
    '/room':      2,
    '/clothes':   3,
    '/schedule':  4,
  };

  int? _pendingTabIndex;
  Function(int)? _tabChangeCallback;

  void navigateToScreen(String? screen) {
    if (screen == null || screen.isEmpty) return;
    final tabIndex = _screenIndex[screen];
    if (tabIndex == null) return;

    // Nếu callback chưa đăng ký (MainScreen chưa mount) → lưu pending
    if (_tabChangeCallback != null) {
      navigatorKey.currentState?.popUntil((route) => route.isFirst);
      _tabChangeCallback!(tabIndex);
    } else {
      _pendingTabIndex = tabIndex;
    }
  }

  void setTabChangeCallback(Function(int) callback) {
    _tabChangeCallback = callback;
    // Xử lý pending nếu có (app mở từ terminated state)
    if (_pendingTabIndex != null) {
      callback(_pendingTabIndex!);
      _pendingTabIndex = null;
    }
  }

  void clearTabChangeCallback() => _tabChangeCallback = null;
}