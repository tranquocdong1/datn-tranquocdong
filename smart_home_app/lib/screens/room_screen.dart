import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/device_provider.dart';
import '../services/all_services.dart';
import '../config/api_config.dart';
import '../config/app_colors.dart'; // AppThemeColors extension

class RoomScreen extends StatefulWidget {
  const RoomScreen({super.key});
  @override
  State<RoomScreen> createState() => _RoomScreenState();
}

class _RoomScreenState extends State<RoomScreen> {
  final _roomService = RoomService();
  bool _alertLoading = false;
  String _deviceLoading = '';

  Future<void> _handleAlert(String cmd) async {
    setState(() => _alertLoading = true);
    try {
      await _roomService.alertCmd(cmd);
    } catch (_) {
      _toast('Lỗi khi gửi lệnh!', isError: true);
    }
    setState(() => _alertLoading = false);
  }

  Future<void> _deviceCmd(String key, Future<void> Function(String) fn,
      String label, String cmd) async {
    setState(() => _deviceLoading = '$key$cmd');
    try {
      await fn(cmd);
    } catch (_) {
      _toast('Lỗi!', isError: true);
    }
    setState(() => _deviceLoading = '');
  }

  void _toast(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError
          ? const Color(AppColors.danger)
          : const Color(AppColors.success),
      behavior: SnackBarBehavior.floating,
      shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      margin: const EdgeInsets.all(16),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final device = context.watch<DeviceProvider>();
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);
    final mutedBg = context.isDark
        ? const Color(0xFF1E1C1A)
        : const Color(AppColors.bgMuted);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

        // ── Header ───────────────────────────────────────────────
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Quản lý phòng',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w300,
                  color: context.textHeading,
                  letterSpacing: -0.3,
                )),
            const SizedBox(height: 3),
          ]),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: device.isGasAlert
                  ? const Color(AppColors.dangerBg)
                  : const Color(AppColors.successBg),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              device.isGasAlert ? 'Khí gas!' : 'Bình thường',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: device.isGasAlert
                    ? const Color(AppColors.danger)
                    : const Color(AppColors.success),
              ),
            ),
          ),
        ]),
        const SizedBox(height: 16),

        // ── Gas alert banner ──────────────────────────────────────
        if (device.isGasAlert) ...[
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(AppColors.dangerBg),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFF09595)),
            ),
            child: const Row(children: [
              Icon(Icons.warning_amber,
                  color: Color(AppColors.danger), size: 18),
              SizedBox(width: 10),
              Expanded(
                  child: Text(
                'CẢNH BÁO: Phát hiện khí gas — đang bật quạt tự động!',
                style: TextStyle(
                    color: Color(AppColors.danger),
                    fontWeight: FontWeight.w500,
                    fontSize: 13),
              )),
            ]),
          ),
          const SizedBox(height: 16),
        ],

        // ── Sensor cards ──────────────────────────────────────────
        _SectionHeader(
            title: 'Cảm biến môi trường',
            sub: 'Cập nhật theo thời gian thực'),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 1.7,
          children: [
            _SensorCard(
                title: 'Nhiệt độ',
                value: '${device.temperature.toStringAsFixed(1)}°C',
                sub: 'Độ ẩm ${device.humidity.toStringAsFixed(0)}%',
                icon: Icons.thermostat_outlined,
                danger: device.temperature >= 35),
            _SensorCard(
                title: 'Số người',
                value: '${device.people}',
                sub: 'người trong nhà',
                icon: Icons.people_outline,
                accentColor: const Color(AppColors.blue),
                accentBg: const Color(AppColors.blueBg)),
            _SensorCard(
                title: 'Ánh sáng',
                value: device.isDark ? 'Tối' : 'Sáng',
                sub: device.isDark ? 'Ánh sáng yếu' : 'Đủ ánh sáng',
                icon: device.isDark
                    ? Icons.nightlight_outlined
                    : Icons.wb_sunny_outlined,
                accentColor: device.isDark
                    ? const Color(AppColors.purple)
                    : const Color(AppColors.amber),
                accentBg: device.isDark
                    ? const Color(AppColors.purpleBg)
                    : const Color(AppColors.amberPale)),
            _SensorCard(
                title: 'Khí Gas',
                value: device.isGasAlert ? 'Cảnh báo!' : 'Bình thường',
                sub: 'Cảm biến MQ-2',
                icon: Icons.local_fire_department_outlined,
                danger: device.isGasAlert),
          ],
        ),
        const SizedBox(height: 20),

        // ── Device controls ───────────────────────────────────────
        _SectionHeader(
            title: 'Điều khiển thiết bị', sub: 'Bật / Tắt / Tự động'),
        _DeviceCard(
          title: 'Đèn phòng khách',
          sub: 'LED strip · Relay 2',
          icon: Icons.lightbulb_outline,
          status: device.livingLed,
          loading: _deviceLoading.startsWith('living'),
          onCmd: (cmd) => _deviceCmd('living', _roomService.livingLedCmd,
              'Đèn phòng khách', cmd),
        ),
        const SizedBox(height: 10),
        _DeviceCard(
          title: 'Đèn phòng ngủ',
          sub: 'LED strip · Relay 3',
          icon: Icons.bed_outlined,
          status: device.bedroomLed,
          loading: _deviceLoading.startsWith('bedroom'),
          hideAuto: true,
          onCmd: (cmd) => _deviceCmd('bedroom', _roomService.bedroomLedCmd,
              'Đèn phòng ngủ', cmd),
        ),
        const SizedBox(height: 10),
        _DeviceCard(
          title: 'Quạt thông gió',
          sub: 'DC motor · Relay 1',
          icon: Icons.air,
          status: device.fanStatus,
          loading: _deviceLoading.startsWith('fan'),
          onCmd: (cmd) =>
              _deviceCmd('fan', _roomService.fanCmd, 'Quạt', cmd),
        ),
        const SizedBox(height: 20),

        // ── Buzzer card ───────────────────────────────────────────
        _SectionHeader(title: 'Còi cảnh báo', sub: 'Kích hoạt thủ công'),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
                color: device.isBuzzerOn
                    ? const Color(0xFFF09595)
                    : borderColor),
          ),
          child: Column(children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: device.isBuzzerOn
                    ? const Color(AppColors.dangerBg)
                    : mutedBg,
                border: Border.all(
                    color: device.isBuzzerOn
                        ? const Color(0xFFF09595)
                        : borderColor,
                    width: 2),
              ),
              child: Icon(
                device.isBuzzerOn
                    ? Icons.notifications_active_outlined
                    : Icons.notifications_off_outlined,
                size: 28,
                color: device.isBuzzerOn
                    ? const Color(AppColors.danger)
                    : context.textHint,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              device.isBuzzerOn ? 'Đang kêu!' : 'Đang tắt',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w300,
                color: context.textHeading,
              ),
            ),
            const SizedBox(height: 4),
            Text('Buzzer · Module cảnh báo',
                style:
                    TextStyle(fontSize: 12, color: context.textMuted)),
            const SizedBox(height: 16),
            SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _alertLoading
                      ? null
                      : () => _handleAlert('INTRUDER'),
                  icon: const Icon(Icons.flash_on, size: 16),
                  label: Text(_alertLoading
                      ? 'Đang xử lý...'
                      : 'Kích hoạt cảnh báo'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(AppColors.dangerBg),
                    foregroundColor: const Color(AppColors.danger),
                    side: const BorderSide(color: Color(0xFFF09595)),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    elevation: 0,
                  ),
                )),
            const SizedBox(height: 8),
            SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed:
                      _alertLoading ? null : () => _handleAlert('OFF'),
                  icon: const Icon(Icons.notifications_off_outlined,
                      size: 16),
                  label: const Text('Tắt còi'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: context.textMuted,
                    side: BorderSide(color: borderColor),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                )),
          ]),
        ),
        const SizedBox(height: 40),
      ]),
    );
  }
}

// ── Reusable widgets ──────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  final String? sub;
  const _SectionHeader({required this.title, this.sub});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child:
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
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

class _SensorCard extends StatelessWidget {
  final String title, value;
  final String? sub;
  final IconData icon;
  final bool danger;
  final Color? accentColor, accentBg;
  const _SensorCard(
      {required this.title,
      required this.value,
      this.sub,
      required this.icon,
      this.danger = false,
      this.accentColor,
      this.accentBg});

  @override
  Widget build(BuildContext context) {
    final color = danger
        ? const Color(AppColors.danger)
        : accentColor ?? const Color(AppColors.success);
    final bg = danger
        ? const Color(AppColors.dangerBg)
        : accentBg ?? const Color(AppColors.successBg);
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: borderColor)),
      child: Row(children: [
        Container(
            width: 32,
            height: 32,
            decoration:
                BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, size: 16, color: color)),
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

class _DeviceCard extends StatelessWidget {
  final String title, sub;
  final IconData icon;
  final String status;
  final bool loading, hideAuto;
  final Function(String) onCmd;
  const _DeviceCard(
      {required this.title,
      required this.sub,
      required this.icon,
      required this.status,
      required this.onCmd,
      this.loading = false,
      this.hideAuto = false});

  @override
  Widget build(BuildContext context) {
    final isOn = status == '1';
    final cmds = hideAuto ? ['ON', 'OFF'] : ['ON', 'OFF', 'AUTO'];
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);
    final mutedBg = context.isDark
        ? const Color(0xFF1E1C1A)
        : const Color(AppColors.bgMuted);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor)),
      child: Column(children: [
        Row(children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: isOn ? const Color(AppColors.amberPale) : mutedBg,
              borderRadius: BorderRadius.circular(9),
              border: Border.all(
                  color: isOn
                      ? const Color(AppColors.amberBorder)
                      : borderColor),
            ),
            child: Icon(icon,
                size: 17,
                color: isOn
                    ? const Color(AppColors.amber)
                    : context.textHint),
          ),
          const SizedBox(width: 10),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(title,
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: context.textHeading)),
                Text(sub,
                    style:
                        TextStyle(fontSize: 11, color: context.textMuted)),
              ])),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: isOn ? const Color(AppColors.amberPale) : mutedBg,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              isOn ? 'Đang bật' : 'Tắt',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: isOn
                    ? const Color(AppColors.amber)
                    : context.textHint,
              ),
            ),
          ),
        ]),
        const SizedBox(height: 12),
        Row(
            children: cmds
                .map((cmd) => Expanded(
                      child: Padding(
                        padding: EdgeInsets.only(
                            left: cmd == cmds.first ? 0 : 6),
                        child: GestureDetector(
                          onTap: loading ? null : () => onCmd(cmd),
                          child: Container(
                            padding:
                                const EdgeInsets.symmetric(vertical: 7),
                            decoration: BoxDecoration(
                              color: mutedBg,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: borderColor),
                            ),
                            child: Center(
                                child: Text(
                              cmd == 'ON'
                                  ? 'Bật'
                                  : cmd == 'OFF'
                                      ? 'Tắt'
                                      : 'Tự động',
                              style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: context.textMuted),
                            )),
                          ),
                        ),
                      ),
                    ))
                .toList()),
      ]),
    );
  }
}