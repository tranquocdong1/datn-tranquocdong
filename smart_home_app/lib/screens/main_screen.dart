import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/device_provider.dart';
import '../services/socket_service.dart';
import '../config/api_config.dart';
import '../config/app_colors.dart';
import '../widgets/theme_toggle.dart';
import 'dashboard_screen.dart';
import 'door_screen.dart';
import 'room_screen.dart';
import 'clothes_screen.dart';
import 'schedule_screen.dart';
import 'logs_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});
  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    DoorScreen(),
    RoomScreen(),
    ClothesScreen(),
    ScheduleScreen(),
    LogsScreen(),
  ];

  final List<_NavItem> _navItems = const [
    _NavItem(icon: Icons.dashboard_outlined,       activeIcon: Icons.dashboard,        label: 'Dashboard'),
    _NavItem(icon: Icons.door_front_door_outlined,  activeIcon: Icons.door_front_door,  label: 'Cửa & Thẻ'),
    _NavItem(icon: Icons.living_outlined,           activeIcon: Icons.living,           label: 'Phòng'),
    _NavItem(icon: Icons.dry_cleaning_outlined,     activeIcon: Icons.dry_cleaning,     label: 'Giàn phơi'),
    _NavItem(icon: Icons.schedule_outlined,         activeIcon: Icons.schedule,         label: 'Hẹn giờ'),
    _NavItem(icon: Icons.history_outlined,          activeIcon: Icons.history,          label: 'Lịch sử'),
  ];

  void _logout() async {
    SocketService().disconnect();
    await context.read<AuthProvider>().logout();
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final device   = context.watch<DeviceProvider>();
    final bgCard   = context.bgCard;
    final border   = context.borderColor;
    final textHint = context.textHint;

    return Scaffold(
      backgroundColor: context.bgBase,
      appBar: AppBar(
        backgroundColor: bgCard,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Row(children: [
          Container(
            width: 34, height: 34,
            decoration: BoxDecoration(
              color: const Color(AppColors.amberPale),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.home_outlined, color: Color(AppColors.amber), size: 18),
          ),
          const SizedBox(width: 10),
          Text('Smart Home', style: TextStyle(
            fontSize: 15, fontWeight: FontWeight.w500,
            color: context.textHeading,
          )),
        ]),
        actions: [
          if (device.hasAlert)
            Container(
              margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: const Color(AppColors.dangerBg),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(children: [
                const Icon(Icons.warning_amber, size: 14, color: Color(AppColors.danger)),
                const SizedBox(width: 4),
                Text(
                  device.intruderAlert ? 'Xâm nhập!' : 'Khí gas!',
                  style: const TextStyle(
                    fontSize: 11, color: Color(AppColors.danger), fontWeight: FontWeight.w600,
                  ),
                ),
              ]),
            ),

          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 4),
            child: ThemeToggle(),
          ),

          IconButton(
            icon: Icon(Icons.logout_outlined, size: 20, color: context.textMuted),
            onPressed: () => showDialog(
              context: context,
              builder: (_) => AlertDialog(
                backgroundColor: bgCard,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                title: Text('Đăng xuất', style: TextStyle(
                  fontSize: 16, fontWeight: FontWeight.w500, color: context.textHeading,
                )),
                content: Text('Bạn có chắc muốn đăng xuất?', style: TextStyle(color: context.textBody)),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text('Hủy', style: TextStyle(color: context.textMuted)),
                  ),
                  ElevatedButton(
                    onPressed: () { Navigator.pop(context); _logout(); },
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(AppColors.amber)),
                    child: const Text('Đăng xuất', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 4),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: border),
        ),
      ),

      body: IndexedStack(index: _currentIndex, children: _screens),

      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: bgCard,
          border: Border(top: BorderSide(color: border)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, -2))],
        ),
        child: SafeArea(
          child: SizedBox(
            height: 60,
            child: Row(
              children: List.generate(_navItems.length, (i) {
                final item   = _navItems[i];
                final active = _currentIndex == i;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _currentIndex = i),
                    behavior: HitTestBehavior.opaque,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          active ? item.activeIcon : item.icon,
                          size: 22,
                          color: active ? const Color(AppColors.amber) : textHint,
                        ),
                        const SizedBox(height: 3),
                        Text(item.label, style: TextStyle(
                          fontSize: 10,
                          fontWeight: active ? FontWeight.w600 : FontWeight.normal,
                          color: active ? const Color(AppColors.amber) : textHint,
                        )),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavItem({required this.icon, required this.activeIcon, required this.label});
}