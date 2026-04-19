import 'package:flutter/material.dart';

// Mirrors useDeviceStore (Zustand) từ web
class DeviceProvider extends ChangeNotifier {

  // ── Cửa ──────────────────────────────────────────────────
  String doorStatus = 'closed';
  String? lastAccess;
  String? lastUID;
  List<String> uidList = [];

  // ── Giàn phơi + Mưa ──────────────────────────────────────
  String clothesStatus = 'out';
  String rainStatus = 'clear';

  // ── Phòng ─────────────────────────────────────────────────
  double temperature = 0;
  double humidity = 0;
  int gas = 0;
  int people = 0;
  dynamic light = 'bright';
  int buzzer = 0;
  String fanStatus = '0';

  // ── Đèn ──────────────────────────────────────────────────
  String livingLed = '0';
  String bedroomLed = '0';

  // ── Cảnh báo ─────────────────────────────────────────────
  bool intruderAlert = false;

  // ── Computed ──────────────────────────────────────────────
  bool get isDoorOpen => doorStatus == 'open';
  bool get isRaining  => rainStatus == 'raining';
  bool get isClothesIn => clothesStatus == 'in';
  bool get isGasAlert => gas == 1;
  bool get isDark => light == 'dark';
  bool get isBuzzerOn => buzzer == 1;
  bool get hasAlert => intruderAlert || isGasAlert;

  // ── Setters (mirrors Zustand setters) ─────────────────────
  void setDoorStatus(String v)    { doorStatus = v;    notifyListeners(); }
  void setLastAccess(String v)    { lastAccess = v;    notifyListeners(); }
  void setLastUID(String v)       { lastUID = v;       notifyListeners(); }
  void setUidList(List<String> v) { uidList = v;       notifyListeners(); }

  void setClothesStatus(String v) { clothesStatus = v; notifyListeners(); }
  void setRainStatus(String v)    { rainStatus = v;    notifyListeners(); }

  void setDHT(double t, double h) { temperature = t; humidity = h; notifyListeners(); }
  void setGas(int v)              { gas = v;           notifyListeners(); }
  void setPeople(int v)           { people = v;        notifyListeners(); }
  void setLight(dynamic v)        { light = v;         notifyListeners(); }
  void setBuzzer(int v)           { buzzer = v;        notifyListeners(); }
  void setFanStatus(String v)     { fanStatus = v;     notifyListeners(); }
  void setLivingLed(String v)     { livingLed = v;     notifyListeners(); }
  void setBedroomLed(String v)    { bedroomLed = v;    notifyListeners(); }

  void setIntruderAlert(bool v) {
    intruderAlert = v;
    notifyListeners();
    if (v) {
      Future.delayed(const Duration(seconds: 10), () {
        intruderAlert = false;
        notifyListeners();
      });
    }
  }

  // ── initFromAPI (mirrors initFromAPI trong Zustand) ────────
  void initFromAPI(Map<String, dynamic> data) {
    final door    = data['door']    as Map<String, dynamic>? ?? {};
    final clothes = data['clothes'] as Map<String, dynamic>? ?? {};
    final rain    = data['rain']    as Map<String, dynamic>? ?? {};
    final room    = data['room']    as Map<String, dynamic>? ?? {};
    final living  = data['living']  as Map<String, dynamic>? ?? {};
    final bedroom = data['bedroom'] as Map<String, dynamic>? ?? {};

    doorStatus    = door['status']?.toString()    ?? 'closed';
    clothesStatus = clothes['status']?.toString() ?? 'out';
    rainStatus    = rain['status']?.toString()    ?? 'clear';
    temperature   = (room['temperature'] as num?)?.toDouble() ?? 0;
    humidity      = (room['humidity']    as num?)?.toDouble() ?? 0;
    gas           = (room['gas']         as num?)?.toInt()    ?? 0;
    people        = (room['people']      as num?)?.toInt()    ?? 0;
    light         = room['light'] ?? 'bright';
    buzzer        = (room['buzzer']      as num?)?.toInt()    ?? 0;
    fanStatus     = room['fanStatus']?.toString()    ?? '0';
    livingLed     = living['ledStatus']?.toString()  ?? '0';
    bedroomLed    = bedroom['ledStatus']?.toString() ?? '0';

    notifyListeners();
  }
}