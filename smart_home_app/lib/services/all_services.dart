import 'api_service.dart';
import '../config/api_config.dart';

// ══════════════════════════════════════════════════════════
// AUTH SERVICE  (mirrors authApi.js)
// ══════════════════════════════════════════════════════════
class AuthService {
  final _api = ApiService().dio;

  Future<Map<String, dynamic>> login(String username, String password) async {
    final res = await _api.post(ApiConfig.login, data: {
      'username': username,
      'password': password,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> getMe() async {
    final res = await _api.get(ApiConfig.getMe);
    return res.data;
  }

  Future<Map<String, dynamic>> verifyOTP(String userId, String otp) async {
    final res = await _api.post(ApiConfig.verifyOTP, data: {
      'userId': userId,
      'otp': otp,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> resendOTP(String userId) async {
    final res = await _api.post(ApiConfig.resendOTP, data: {'userId': userId});
    return res.data;
  }
}

// ══════════════════════════════════════════════════════════
// DOOR SERVICE  (mirrors doorApi.js)
// ══════════════════════════════════════════════════════════
class DoorService {
  final _api = ApiService().dio;

  Future<Map<String, dynamic>> getDoorStatus() async {
    final res = await _api.get(ApiConfig.door);
    return res.data;
  }

  Future<void> sendDoorCmd(String cmd) async {
    await _api.post(ApiConfig.doorCmd, data: {'cmd': cmd});
  }

  Future<List<dynamic>> getDoorLogs(int limit) async {
    final res = await _api.get('${ApiConfig.doorLogs}?limit=$limit');
    return res.data;
  }

  Future<void> addUID(String uid) async {
    await _api.post(ApiConfig.doorUidAdd, data: {'uid': uid});
  }

  Future<void> learnMode() async {
    await _api.post(ApiConfig.doorUidAdd, data: {'mode': 'learn'});
  }

  Future<void> removeUID(String uid) async {
    await _api.delete(ApiConfig.doorUid, data: {'uid': uid});
  }

  Future<List<dynamic>> listUID() async {
    final res = await _api.get(ApiConfig.doorUidList);
    return res.data is List ? res.data : [];
  }
}

// ══════════════════════════════════════════════════════════
// ROOM SERVICE  (mirrors roomApi.js)
// ══════════════════════════════════════════════════════════
class RoomService {
  final _api = ApiService().dio;

  Future<Map<String, dynamic>> getRoomStatus() async {
    final res = await _api.get(ApiConfig.room);
    return res.data;
  }

  Future<void> fanCmd(String cmd) async {
    await _api.post(ApiConfig.roomFan, data: {'cmd': cmd});
  }

  Future<void> livingLedCmd(String cmd) async {
    await _api.post(ApiConfig.roomLivingLed, data: {'cmd': cmd});
  }

  Future<void> bedroomLedCmd(String cmd) async {
    await _api.post(ApiConfig.roomBedroomLed, data: {'cmd': cmd});
  }

  Future<void> alertCmd(String cmd) async {
    await _api.post(ApiConfig.roomAlert, data: {'cmd': cmd});
  }

  Future<List<dynamic>> getRoomLogs(int limit) async {
    final res = await _api.get('${ApiConfig.roomLogs}?limit=$limit');
    return res.data;
  }
}

// ══════════════════════════════════════════════════════════
// CLOTHES SERVICE  (mirrors clothesApi.js)
// ══════════════════════════════════════════════════════════
class ClothesService {
  final _api = ApiService().dio;

  Future<Map<String, dynamic>> getClothesStatus() async {
    final res = await _api.get(ApiConfig.clothes);
    return res.data;
  }

  Future<void> clothesCmd(String cmd) async {
    await _api.post(ApiConfig.clothesCmd, data: {'cmd': cmd});
  }
}

// ══════════════════════════════════════════════════════════
// SCHEDULE SERVICE  (mirrors scheduleApi.js)
// ══════════════════════════════════════════════════════════
class ScheduleService {
  final _api = ApiService().dio;

  Future<List<dynamic>> getSchedules() async {
    final res = await _api.get(ApiConfig.schedules);
    return res.data is List ? res.data : [];
  }

  Future<Map<String, dynamic>> createSchedule(Map<String, dynamic> data) async {
    final res = await _api.post(ApiConfig.schedules, data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateSchedule(String id, Map<String, dynamic> data) async {
    final res = await _api.put('${ApiConfig.schedules}/$id', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> toggleSchedule(String id) async {
    final res = await _api.patch('${ApiConfig.schedules}/$id/toggle');
    return res.data;
  }

  Future<void> deleteSchedule(String id) async {
    await _api.delete('${ApiConfig.schedules}/$id');
  }

  Future<List<dynamic>> getScheduleLogs() async {
    final res = await _api.get(ApiConfig.scheduleLogs);
    return res.data is List ? res.data : [];
  }
}

// ══════════════════════════════════════════════════════════
// STATS SERVICE
// ══════════════════════════════════════════════════════════
class StatsService {
  final _api = ApiService().dio;

  Future<Map<String, dynamic>> getSummary() async {
    final res = await _api.get(ApiConfig.stats);
    return res.data;
  }

  Future<List<dynamic>> getAccessStats(int days) async {
    final res = await _api.get('${ApiConfig.accessStats}?days=$days');
    return res.data is List ? res.data : [];
  }

  Future<List<dynamic>> getTempHistory(int hours) async {
    final url = '${ApiConfig.tempHistory}?hours=$hours';
    print('=== FULL URL: ${_api.options.baseUrl}$url');
    final res = await _api.get(url);
    return res.data is List ? res.data : [];
  }

  Future<Map<String, dynamic>> getLogs(Map<String, dynamic> params) async {
    final res = await _api.get(ApiConfig.logs, queryParameters: params);
    return res.data;
  }
}