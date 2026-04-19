import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../providers/device_provider.dart';
import '../services/all_services.dart';
import '../config/api_config.dart';
import '../config/app_colors.dart'; // AppThemeColors extension

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _statsService = StatsService();
  Map<String, dynamic>? _summary;
  List<Map<String, dynamic>> _accessData = [];
  List<Map<String, dynamic>> _tempHistory = [];
  // ignore: unused_field
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchAll();
    // Polling 10s giống web
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 10));
      if (!mounted) return false;
      _fetchAll(background: true);
      return true;
    });
  }

  Future<void> _fetchAll({bool background = false}) async {
    if (!background) setState(() => _loading = true);
    try {
      final summary = await _statsService.getSummary();
      final access = await _statsService.getAccessStats(7);
      final tempRaw = await _statsService.getTempHistory(24);
      if (!mounted) return;
      setState(() {
        _summary = summary;
        _accessData = access.cast<Map<String, dynamic>>();
        _tempHistory = tempRaw.map<Map<String, dynamic>>((d) => {
              'time': DateFormat('HH:mm')
                  .format(DateTime.parse(d['time'].toString())),
              'temp': (d['temp'] as num?)?.toDouble() ?? 0,
              'hum': (d['hum'] as num?)?.toDouble() ?? 0,
            }).toList();
        _loading = false;
      });
    } catch (e) {
      print('=== FETCH ERROR: $e');
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final device = context.watch<DeviceProvider>();
    final now = DateFormat('EEEE, d MMMM yyyy', 'vi').format(DateTime.now());

    return RefreshIndicator(
      color: const Color(AppColors.amber),
      onRefresh: () => _fetchAll(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

          // ── Page header ──────────────────────────────────────────
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Tổng quan hệ thống', style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.w300,
                color: context.textHeading, letterSpacing: -0.3,
              )),
              Text(now, style: TextStyle(fontSize: 11, color: context.textHint)),
            ]),
            _StatusPill(
              label: device.hasAlert
                  ? (device.intruderAlert ? 'Xâm nhập!' : 'Khí gas!')
                  : 'Bình thường',
              danger: device.hasAlert,
            ),
          ]),
          const SizedBox(height: 16),

          // ── Alert banner ──────────────────────────────────────────
          if (device.hasAlert) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(AppColors.dangerBg),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF09595)),
              ),
              child: Row(children: [
                const Icon(Icons.warning_amber,
                    color: Color(AppColors.danger), size: 18),
                const SizedBox(width: 10),
                Expanded(
                    child: Text(
                  device.intruderAlert
                      ? 'CẢNH BÁO: Phát hiện xâm nhập trái phép!'
                      : 'CẢNH BÁO: Phát hiện khí gas — đang bật quạt tự động!',
                  style: const TextStyle(
                      color: Color(AppColors.danger),
                      fontWeight: FontWeight.w500,
                      fontSize: 13),
                )),
              ]),
            ),
            const SizedBox(height: 16),
          ],

          // ── Sensor row ────────────────────────────────────────────
          _SectionHeader(title: 'Cảm biến môi trường', sub: 'Cập nhật thời gian thực'),
          _buildSensorGrid(device),
          const SizedBox(height: 20),

          // ── Device status ─────────────────────────────────────────
          _SectionHeader(title: 'Trạng thái thiết bị'),
          _buildDeviceGrid(device),
          const SizedBox(height: 20),

          // ── Summary stats ─────────────────────────────────────────
          if (_summary != null) ...[
            _SectionHeader(title: 'Thống kê hôm nay'),
            _buildSummaryGrid(_summary!),
            const SizedBox(height: 20),
          ],

          // ── Temp Chart ────────────────────────────────────────────
          _SectionHeader(title: 'Nhiệt độ & Độ ẩm', sub: '24 giờ qua'),
          _buildTempChart(),
          const SizedBox(height: 20),

          // ── Access Chart ──────────────────────────────────────────
          _SectionHeader(title: 'Lượt ra vào', sub: '7 ngày qua'),
          _buildAccessChart(),
          const SizedBox(height: 40),
        ]),
      ),
    );
  }

  Widget _buildSensorGrid(DeviceProvider d) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.8,
      children: [
        _SensorCard(
            title: 'Nhiệt độ',
            value: '${d.temperature.toStringAsFixed(1)}°C',
            sub: 'Độ ẩm ${d.humidity.toStringAsFixed(0)}%',
            icon: Icons.thermostat_outlined,
            danger: d.temperature >= 35),
        _SensorCard(
            title: 'Khí Gas',
            value: d.isGasAlert ? 'Cảnh báo!' : 'Bình thường',
            sub: 'Cảm biến MQ-2',
            icon: Icons.local_fire_department_outlined,
            danger: d.isGasAlert),
        _SensorCard(
            title: 'Số người',
            value: '${d.people}',
            sub: 'người trong nhà',
            icon: Icons.people_outline),
        _SensorCard(
            title: 'Thời tiết',
            value: d.isRaining ? 'Mưa' : 'Nắng',
            sub: d.isRaining ? 'Đã thu giàn' : 'Trời quang',
            icon: d.isRaining ? Icons.grain : Icons.wb_sunny_outlined,
            warn: d.isRaining),
      ],
    );
  }

  Widget _buildDeviceGrid(DeviceProvider d) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.8,
      children: [
        _SensorCard(
            title: 'Cửa chính',
            value: d.isDoorOpen ? 'Đang mở' : 'Đã đóng',
            sub: 'Khóa điện từ',
            icon: d.isDoorOpen
                ? Icons.door_front_door
                : Icons.door_front_door_outlined,
            warn: d.isDoorOpen),
        _SensorCard(
            title: 'Giàn phơi',
            value: d.isClothesIn ? 'Đã thu vào' : 'Đang phơi',
            sub: 'Servo motor',
            icon: Icons.dry_cleaning_outlined),
        _SensorCard(
            title: 'Quạt',
            value: d.fanStatus == '1' ? 'Đang bật' : 'Tắt',
            sub: 'Relay 1',
            icon: Icons.air),
        _SensorCard(
            title: 'Đèn PK',
            value: d.livingLed == '1' ? 'Đang bật' : 'Tắt',
            sub: 'LED strip',
            icon: Icons.lightbulb_outline),
      ],
    );
  }

  Widget _buildSummaryGrid(Map<String, dynamic> s) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 2.2,
      children: [
        _SensorCard(
            title: 'Lượt vào',
            value: '${s['granted'] ?? 0}',
            sub: 'Được cấp phép',
            icon: Icons.check_circle_outline),
        _SensorCard(
            title: 'Từ chối',
            value: '${s['denied'] ?? 0}',
            sub: 'Không xác thực',
            icon: Icons.cancel_outlined,
            danger: (s['denied'] ?? 0) > 0),
        _SensorCard(
            title: 'Cảnh báo gas',
            value: '${s['gasAlerts'] ?? 0}',
            sub: 'Lần kích hoạt',
            icon: Icons.local_fire_department_outlined,
            danger: (s['gasAlerts'] ?? 0) > 0),
        _SensorCard(
            title: 'Xâm nhập',
            value: '${s['intruders'] ?? 0}',
            sub: 'Bất thường',
            icon: Icons.shield_outlined,
            danger: (s['intruders'] ?? 0) > 0),
      ],
    );
  }

  Widget _buildTempChart() {
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);

    return Container(
      height: 200,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: _tempHistory.isEmpty
          ? Center(
              child: Text('Chưa có dữ liệu',
                  style: TextStyle(color: context.textHint)))
          : LineChart(LineChartData(
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                getDrawingHorizontalLine: (_) =>
                    FlLine(color: borderColor, strokeWidth: 0.5),
              ),
              titlesData: FlTitlesData(
                leftTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false)),
                rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false)),
                topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 22,
                  getTitlesWidget: (v, _) {
                    final i = v.toInt();
                    if (i < 0 ||
                        i >= _tempHistory.length ||
                        i % 6 != 0) return const SizedBox();
                    return Text(_tempHistory[i]['time'],
                        style: TextStyle(
                            fontSize: 9, color: context.textHint));
                  },
                )),
              ),
              borderData: FlBorderData(show: false),
              lineBarsData: [
                LineChartBarData(
                  spots: List.generate(
                      _tempHistory.length,
                      (i) => FlSpot(i.toDouble(),
                          _tempHistory[i]['temp'] as double)),
                  isCurved: true,
                  color: const Color(AppColors.amber),
                  barWidth: 2,
                  dotData: const FlDotData(show: false),
                  belowBarData: BarAreaData(
                      show: true,
                      color:
                          const Color(AppColors.amber).withOpacity(0.08)),
                ),
                LineChartBarData(
                  spots: List.generate(
                      _tempHistory.length,
                      (i) => FlSpot(
                          i.toDouble(), _tempHistory[i]['hum'] as double)),
                  isCurved: true,
                  color: const Color(0xFF85B7EB),
                  barWidth: 2,
                  dotData: const FlDotData(show: false),
                  belowBarData: BarAreaData(
                      show: true,
                      color: const Color(0xFF85B7EB).withOpacity(0.08)),
                ),
              ],
            )),
    );
  }

  Widget _buildAccessChart() {
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);

    return Container(
      height: 180,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: _accessData.isEmpty
          ? Center(
              child: Text('Chưa có dữ liệu',
                  style: TextStyle(color: context.textHint)))
          : BarChart(BarChartData(
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                getDrawingHorizontalLine: (_) =>
                    FlLine(color: borderColor, strokeWidth: 0.5),
              ),
              titlesData: FlTitlesData(
                leftTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false)),
                rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false)),
                topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 20,
                  getTitlesWidget: (v, _) {
                    final i = v.toInt();
                    if (i < 0 || i >= _accessData.length) {
                      return const SizedBox();
                    }
                    final date = _accessData[i]['date']?.toString() ?? '';
                    return Text(
                        date.length > 5 ? date.substring(5) : date,
                        style: TextStyle(
                            fontSize: 9, color: context.textHint));
                  },
                )),
              ),
              borderData: FlBorderData(show: false),
              barGroups: List.generate(
                  _accessData.length,
                  (i) => BarChartGroupData(x: i, barRods: [
                        BarChartRodData(
                            toY: (_accessData[i]['granted'] as num?)
                                    ?.toDouble() ??
                                0,
                            color:
                                const Color(0xFF3B6D11).withOpacity(0.75),
                            width: 10,
                            borderRadius: BorderRadius.circular(4)),
                        BarChartRodData(
                            toY: (_accessData[i]['denied'] as num?)
                                    ?.toDouble() ??
                                0,
                            color:
                                const Color(0xFFA32D2D).withOpacity(0.7),
                            width: 10,
                            borderRadius: BorderRadius.circular(4)),
                      ])),
            )),
    );
  }
}

// ── Reusable widgets ──────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  final String? sub;
  const _SectionHeader({required this.title, this.sub});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title,
            style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: context.textHeading)),
        if (sub != null)
          Text(sub!,
              style: TextStyle(fontSize: 11, color: context.textMuted)),
      ]),
    );
  }
}

class _SensorCard extends StatelessWidget {
  final String title, value;
  final String? sub;
  final IconData icon;
  final bool danger, warn;
  const _SensorCard(
      {required this.title,
      required this.value,
      this.sub,
      required this.icon,
      this.danger = false,
      this.warn = false});

  @override
  Widget build(BuildContext context) {
    final color = danger
        ? const Color(AppColors.danger)
        : warn
            ? const Color(AppColors.amber)
            : const Color(AppColors.success);
    final bgColor = danger
        ? const Color(AppColors.dangerBg)
        : warn
            ? const Color(AppColors.amberPale)
            : const Color(AppColors.successBg);

    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Row(children: [
        Container(
          width: 34,
          height: 34,
          decoration:
              BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(9)),
          child: Icon(icon, size: 17, color: color),
        ),
        const SizedBox(width: 10),
        Expanded(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
              Text(title,
                  style: TextStyle(fontSize: 10, color: context.textMuted),
                  overflow: TextOverflow.ellipsis),
              Text(value,
                  style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: context.textHeading),
                  overflow: TextOverflow.ellipsis),
              if (sub != null)
                Text(sub!,
                    style: TextStyle(fontSize: 10, color: context.textHint),
                    overflow: TextOverflow.ellipsis),
            ])),
      ]),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final String label;
  final bool danger;
  const _StatusPill({required this.label, this.danger = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: danger
            ? const Color(AppColors.dangerBg)
            : const Color(AppColors.successBg),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: danger
                  ? const Color(AppColors.danger)
                  : const Color(AppColors.success),
            )),
        const SizedBox(width: 5),
        Text(label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: danger
                  ? const Color(AppColors.danger)
                  : const Color(AppColors.success),
            )),
      ]),
    );
  }
}