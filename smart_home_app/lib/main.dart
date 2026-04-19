import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:smart_home_app/services/notification_service.dart';
import 'providers/auth_provider.dart';
import 'providers/device_provider.dart';
import 'providers/theme_provider.dart';
import 'services/api_service.dart';
import 'services/socket_service.dart';
import 'screens/login_screen.dart';
import 'screens/main_screen.dart';
import 'config/api_config.dart';   // AppColors + ApiConfig đều ở đây
import 'config/app_colors.dart';   // AppTheme (light/dark ThemeData)

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await NotificationService().init();
  await initializeDateFormatting('vi', null);
  ApiService().init();

  final themeProvider = ThemeProvider();
  await themeProvider.load();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: themeProvider),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DeviceProvider()),
      ],
      child: const SmartHomeApp(),
    ),
  );
}

class SmartHomeApp extends StatelessWidget {
  const SmartHomeApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    return MaterialApp(
      title: 'Smart Home',
      debugShowCheckedModeBanner: false,
      theme:     AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeProvider.themeMode,
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});
  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _checking = true;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final auth = context.read<AuthProvider>();
    final loggedIn = await auth.checkAuth();
    if (loggedIn) {
      await _initDeviceState();
      _connectSocket();
    }
    setState(() => _checking = false);
  }

  Future<void> _initDeviceState() async {
    try {
      final device = context.read<DeviceProvider>();
      final res = await ApiService().dio.get('/stats/overview');
      device.initFromAPI(res.data);
      print('=== DEVICE STATE INITIALIZED: ${res.data}');
    } catch (e) {
      print('=== INIT STATE ERROR: $e');
    }
  }

  void _connectSocket() {
    final socket = SocketService();
    final device = context.read<DeviceProvider>();

    socket.onDoorStatus      = device.setDoorStatus;
    socket.onDoorAccess      = device.setLastAccess;
    socket.onDoorUidScanned  = device.setLastUID;
    socket.onDoorUidResponse = device.setUidList;

    socket.onClothesStatus   = device.setClothesStatus;
    socket.onRainStatus      = device.setRainStatus;

    socket.onRoomDHT         = device.setDHT;
    socket.onRoomGas         = device.setGas;
    socket.onRoomPeople      = device.setPeople;
    socket.onRoomLight       = device.setLight;
    socket.onRoomBuzzer      = device.setBuzzer;
    socket.onRoomFanStatus   = device.setFanStatus;

    socket.onLivingLed       = device.setLivingLed;
    socket.onBedroomLed      = device.setBedroomLed;
    socket.onIntruderAlert   = () => device.setIntruderAlert(true);

    socket.connect();
    print('=== SOCKET CONNECT CALLED');
  }

  @override
  Widget build(BuildContext context) {
    if (_checking) {
      return const Scaffold(
        body: Center(
          // AppColors.amber từ api_config.dart — không còn ambiguous
          child: CircularProgressIndicator(color: Color(AppColors.amber)),
        ),
      );
    }
    final token = context.watch<AuthProvider>().token;
    return token != null ? const MainScreen() : const LoginScreen();
  }
}