import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/api_config.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  final _storage = const FlutterSecureStorage();

  // ── Callbacks (giống s.on() trong useSocket.js) ──────────────────────

  // Cửa
  Function(String)? onDoorStatus;
  Function(String)? onDoorAccess;
  Function(String)? onDoorUidScanned;
  Function(List<String>)? onDoorUidResponse;
  Function(String)? onDoorUidResult;

  // Giàn phơi + Mưa
  Function(String)? onClothesStatus;
  Function(String)? onClothesWarning;
  Function(String)? onRainStatus;

  // Phòng
  Function(double, double)? onRoomDHT;
  Function(int)? onRoomGas;
  Function(int)? onRoomPeople;
  Function(dynamic)? onRoomLight;
  Function(int)? onRoomBuzzer;
  Function(String)? onRoomFanStatus;

  // Đèn
  Function(String)? onLivingLed;
  Function(String)? onBedroomLed;

  // Cảnh báo xâm nhập
  Function()? onIntruderAlert;

  Future<void> connect() async {
    final token = await _storage.read(key: 'token');
    if (token == null) return;

    _socket = IO.io(ApiConfig.socketUrl, {
      'transports': ['websocket'],
      'auth': {'token': token},
      'reconnectionAttempts': 5,
    });

    _socket!.onConnect((_) => print('[Socket] Connected'));
    _socket!.onConnectError((err) => print('[Socket] Error: $err'));
    _socket!.onDisconnect((_) => print('[Socket] Disconnected'));

    // ── Cửa ──────────────────────────────────────────────────────────
    _socket!.on('door:status', (data) {
      print('=== DOOR STATUS: $data'); // ← thêm
      onDoorStatus?.call(data['status']?.toString() ?? '');
    });

    _socket!.on('door:access', (data) {
      onDoorAccess?.call(data['result']?.toString() ?? '');
    });

    _socket!.on('door:uid_scanned', (data) {
      onDoorUidScanned?.call(data['uid']?.toString() ?? '');
    });

    _socket!.on('door:uid_response', (data) {
      final raw = data['uids']?.toString() ?? '';
      final list = raw == 'empty' || raw.isEmpty ? <String>[] : raw.split(',');
      onDoorUidResponse?.call(list);
    });

    _socket!.on('door:uid_result', (data) {
      onDoorUidResult?.call(data['result']?.toString() ?? '');
    });

    // ── Giàn phơi + Mưa ──────────────────────────────────────────────
    _socket!.on('clothes:status', (data) {
      onClothesStatus?.call(data['status']?.toString() ?? '');
    });

    _socket!.on('clothes:warning', (data) {
      onClothesWarning?.call(data['reason']?.toString() ?? '');
    });

    _socket!.on('rain:status', (data) {
      onRainStatus?.call(data['status']?.toString() ?? '');
    });

    // ── Phòng ────────────────────────────────────────────────────────
    _socket!.on('room:dht', (data) {
      print('=== DHT RECEIVED: $data'); // ← thêm
      final temp = (data['temp'] as num?)?.toDouble() ?? 0.0;
      final hum  = (data['hum']  as num?)?.toDouble() ?? 0.0;
      onRoomDHT?.call(temp, hum);
    });

    _socket!.on('room:gas', (data) {
      onRoomGas?.call((data['gas'] as num?)?.toInt() ?? 0);
    });

    _socket!.on('room:people', (data) {
      print('=== PEOPLE DATA: $data'); // ← thêm
      onRoomPeople?.call((data['count'] as num?)?.toInt() ?? 0);
    });

    _socket!.on('room:light', (data) {
      onRoomLight?.call(data['light']);
    });

    _socket!.on('room:buzzer', (data) {
      onRoomBuzzer?.call((data['buzzer'] as num?)?.toInt() ?? 0);
    });

    _socket!.on('room:fan_status', (data) {
      onRoomFanStatus?.call(data['status']?.toString() ?? '');
    });

    // ── Đèn ──────────────────────────────────────────────────────────
    _socket!.on('living:led_status', (data) {
      onLivingLed?.call(data['status']?.toString() ?? '');
    });

    _socket!.on('bedroom:led_status', (data) {
      onBedroomLed?.call(data['status']?.toString() ?? '');
    });

    // ── Cảnh báo xâm nhập ────────────────────────────────────────────
    _socket!.on('alert:intruder', (_) {
      onIntruderAlert?.call();
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  bool get isConnected => _socket?.connected ?? false;
}