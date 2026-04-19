import 'package:flutter/material.dart';
import '../services/all_services.dart';
import '../config/api_config.dart';
import '../config/app_colors.dart'; // AppThemeColors extension

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});
  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  final _scheduleService = ScheduleService();
  List<Map<String, dynamic>> _schedules = [];
  bool _loading = true;
  bool _showForm = false;
  String? _editId;

  // Form state
  final _nameCtrl = TextEditingController();
  String _device = 'fan';
  String _action = 'ON';
  int _hour = 6, _minute = 0;
  List<int> _days = [1, 2, 3, 4, 5];

  static const _dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  static const _devices = [
    {'value': 'fan', 'label': '🌀 Quạt'},
    {'value': 'living_led', 'label': '💡 Đèn phòng khách'},
    {'value': 'bedroom_led', 'label': '💡 Đèn phòng ngủ'},
    {'value': 'clothes', 'label': '👕 Giàn phơi'},
    {'value': 'door', 'label': '🚪 Cửa chính'},
  ];
  static const _actions = {
    'fan': ['ON', 'OFF', 'AUTO'],
    'living_led': ['ON', 'OFF', 'AUTO'],
    'bedroom_led': ['ON', 'OFF', 'AUTO'],
    'clothes': ['IN', 'OUT', 'AUTO'],
    'door': ['OPEN', 'CLOSE'],
  };
  static const _actionLabel = {
    'ON': 'Bật', 'OFF': 'Tắt', 'AUTO': 'Tự động',
    'IN': 'Thu vào', 'OUT': 'Đẩy ra',
    'OPEN': 'Mở', 'CLOSE': 'Đóng',
  };

  @override
  void initState() {
    super.initState();
    _fetchSchedules();
  }

  Future<void> _fetchSchedules() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final list = await _scheduleService.getSchedules();
      if (!mounted) return;
      setState(() {
        _schedules = list.cast<Map<String, dynamic>>();
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _handleSubmit() async {
    if (_nameCtrl.text.trim().isEmpty) {
      _toast('Nhập tên lịch!', isError: true);
      return;
    }
    if (_days.isEmpty) {
      _toast('Chọn ít nhất 1 ngày!', isError: true);
      return;
    }

    final data = {
      'name': _nameCtrl.text.trim(),
      'device': _device,
      'action': _action,
      'hour': _hour,
      'minute': _minute,
      'days': _days,
      'enabled': true,
    };

    try {
      if (_editId != null) {
        await _scheduleService.updateSchedule(_editId!, data);
        _toast('Đã cập nhật lịch!');
      } else {
        await _scheduleService.createSchedule(data);
        _toast('Đã tạo lịch mới!');
      }
      _resetForm();
      _fetchSchedules();
    } catch (e) {
      _toast('Lỗi!', isError: true);
    }
  }

  Future<void> _handleToggle(String id) async {
    try {
      final res = await _scheduleService.toggleSchedule(id);
      setState(() {
        _schedules = _schedules
            .map((s) =>
                s['_id'] == id ? {...s, 'enabled': res['enabled']} : s)
            .toList();
      });
    } catch (_) {
      _toast('Lỗi!', isError: true);
    }
  }

  Future<void> _handleDelete(String id, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Xóa lịch',
            style:
                TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
        content: Text('Xóa lịch "$name"?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Hủy')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppColors.danger)),
            child: const Text('Xóa',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await _scheduleService.deleteSchedule(id);
      _toast('Đã xóa!');
      _fetchSchedules();
    } catch (_) {
      _toast('Lỗi!', isError: true);
    }
  }

  void _handleEdit(Map<String, dynamic> s) {
    _nameCtrl.text = s['name'] ?? '';
    setState(() {
      _editId = s['_id'];
      _device = s['device'] ?? 'fan';
      _action = s['action'] ?? 'ON';
      _hour = s['hour'] ?? 6;
      _minute = s['minute'] ?? 0;
      _days = List<int>.from(s['days'] ?? [1, 2, 3, 4, 5]);
      _showForm = true;
    });
  }

  void _resetForm() {
    _nameCtrl.clear();
    setState(() {
      _showForm = false;
      _editId = null;
      _device = 'fan';
      _action = 'ON';
      _hour = 6;
      _minute = 0;
      _days = [1, 2, 3, 4, 5];
    });
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

  String _pad(int n) => n.toString().padLeft(2, '0');

  // ── Theme-aware helpers ──────────────────────────────────────
  Color _borderColor(BuildContext context) => context.isDark
      ? const Color(0xFF2E2C28)
      : const Color(AppColors.border);

  Color _mutedBg(BuildContext context) => context.isDark
      ? const Color(0xFF1E1C1A)
      : const Color(AppColors.bgMuted);

  InputDecoration _inputDec(BuildContext context, String hint) =>
      InputDecoration(
        hintText: hint,
        hintStyle:
            TextStyle(color: context.textHint, fontSize: 13),
        isDense: true,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        filled: true,
        fillColor: _mutedBg(context),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: _borderColor(context))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: _borderColor(context))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(AppColors.amber))),
      );

  @override
  Widget build(BuildContext context) {
    final borderColor = _borderColor(context);
    final mutedBg = _mutedBg(context);

    return RefreshIndicator(
      color: const Color(AppColors.amber),
      onRefresh: _fetchSchedules,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child:
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

          // ── Header ─────────────────────────────────────────────
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Hẹn giờ tự động',
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w300,
                      color: context.textHeading,
                      letterSpacing: -0.3)),
              Text('Lịch chạy theo giờ · Gửi lệnh tự động',
                  style: TextStyle(fontSize: 11, color: context.textHint)),
            ]),
            ElevatedButton.icon(
              onPressed: () => setState(() {
                _showForm = !_showForm;
                if (!_showForm) _resetForm();
              }),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('Tạo mới'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppColors.amber),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20)),
                elevation: 0,
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 10),
              ),
            ),
          ]),
          const SizedBox(height: 16),

          // ── Form ───────────────────────────────────────────────
          if (_showForm) ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: borderColor)),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _editId != null ? '✏️ Chỉnh sửa lịch' : '➕ Tạo lịch mới',
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: context.textHeading),
                    ),
                    const SizedBox(height: 16),

                    // Name
                    Text('TÊN LỊCH',
                        style: TextStyle(
                            fontSize: 10,
                            color: context.textMuted,
                            letterSpacing: 0.6)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _nameCtrl,
                      style: TextStyle(color: context.textHeading),
                      decoration:
                          _inputDec(context, 'VD: Bật đèn buổi tối'),
                    ),
                    const SizedBox(height: 14),

                    // Device + Action row
                    Row(children: [
                      Expanded(
                          child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                            Text('THIẾT BỊ',
                                style: TextStyle(
                                    fontSize: 10,
                                    color: context.textMuted,
                                    letterSpacing: 0.6)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              value: _device,
                              dropdownColor: Theme.of(context).cardColor,
                              isExpanded: true,
                              style: TextStyle(
                                  fontSize: 13,
                                  color: context.textHeading),
                              decoration: _inputDec(context, ''),
                              items: _devices
                                  .map((d) => DropdownMenuItem(
                                      value: d['value'],
                                      child: Text(d['label']!,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                              fontSize: 13,
                                              color: context
                                                  .textHeading))))
                                  .toList(),
                              onChanged: (v) => setState(() {
                                _device = v!;
                                _action =
                                    (_actions[_device]!).first;
                              }),
                            ),
                          ])),
                      const SizedBox(width: 10),
                      Expanded(
                          child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                            Text('LỆNH',
                                style: TextStyle(
                                    fontSize: 10,
                                    color: context.textMuted,
                                    letterSpacing: 0.6)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              value: _action,
                              dropdownColor: Theme.of(context).cardColor,
                              isExpanded: true,
                              style: TextStyle(
                                  fontSize: 13,
                                  color: context.textHeading),
                              decoration: _inputDec(context, ''),
                              items: (_actions[_device] ?? ['ON'])
                                  .map((a) => DropdownMenuItem(
                                      value: a,
                                      child: Text(
                                          _actionLabel[a] ?? a,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                              fontSize: 13,
                                              color: context
                                                  .textHeading))))
                                  .toList(),
                              onChanged: (v) =>
                                  setState(() => _action = v!),
                            ),
                          ])),
                    ]),
                    const SizedBox(height: 14),

                    // Hour + Minute
                    Row(children: [
                      Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text('GIỜ',
                                style: TextStyle(
                                    fontSize: 10,
                                    color: context.textMuted,
                                    letterSpacing: 0.6)),
                            const SizedBox(height: 6),
                            SizedBox(
                                width: 80,
                                child: TextField(
                                  keyboardType:
                                      TextInputType.number,
                                  style: TextStyle(
                                      color: context.textHeading),
                                  decoration:
                                      _inputDec(context, '0-23'),
                                  onChanged: (v) => setState(() =>
                                      _hour =
                                          int.tryParse(v) ?? _hour),
                                  controller:
                                      TextEditingController(
                                          text: '$_hour'),
                                )),
                          ]),
                      const SizedBox(width: 10),
                      Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text('PHÚT',
                                style: TextStyle(
                                    fontSize: 10,
                                    color: context.textMuted,
                                    letterSpacing: 0.6)),
                            const SizedBox(height: 6),
                            SizedBox(
                                width: 80,
                                child: TextField(
                                  keyboardType:
                                      TextInputType.number,
                                  style: TextStyle(
                                      color: context.textHeading),
                                  decoration:
                                      _inputDec(context, '0-59'),
                                  onChanged: (v) => setState(() =>
                                      _minute = int.tryParse(v) ??
                                          _minute),
                                  controller:
                                      TextEditingController(
                                          text: '$_minute'),
                                )),
                          ]),
                      const SizedBox(width: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                            color: const Color(AppColors.amberPale),
                            borderRadius:
                                BorderRadius.circular(10),
                            border: Border.all(
                                color: const Color(
                                    AppColors.amberBorder))),
                        child: Text(
                          '${_pad(_hour)}:${_pad(_minute)}',
                          style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w300,
                              color: Color(AppColors.amber),
                              letterSpacing: 2),
                        ),
                      ),
                    ]),
                    const SizedBox(height: 14),

                    // Days
                    Text('NGÀY ÁP DỤNG',
                        style: TextStyle(
                            fontSize: 10,
                            color: context.textMuted,
                            letterSpacing: 0.6)),
                    const SizedBox(height: 8),
                    Wrap(
                        spacing: 7,
                        runSpacing: 7,
                        children: [
                          ..._dayLabels.asMap().entries.map((e) =>
                              GestureDetector(
                                onTap: () => setState(() {
                                  if (_days.contains(e.key)) {
                                    _days.remove(e.key);
                                  } else {
                                    _days.add(e.key);
                                    _days.sort();
                                  }
                                }),
                                child: Container(
                                  width: 38,
                                  height: 38,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: _days.contains(e.key)
                                        ? const Color(AppColors.amber)
                                        : mutedBg,
                                  ),
                                  child: Center(
                                      child: Text(e.value,
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight:
                                                FontWeight.w500,
                                            color: _days.contains(
                                                    e.key)
                                                ? Colors.white
                                                : context.textMuted,
                                          ))),
                                ),
                              )),
                          _quickBtn('T2–T6', [1, 2, 3, 4, 5]),
                          _quickBtn('Cuối tuần', [0, 6]),
                          _quickBtn('Hàng ngày',
                              [0, 1, 2, 3, 4, 5, 6]),
                        ]),
                    const SizedBox(height: 20),

                    Row(children: [
                      ElevatedButton(
                        onPressed: _handleSubmit,
                        style: ElevatedButton.styleFrom(
                            backgroundColor:
                                const Color(AppColors.amber),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius.circular(20))),
                        child: Text(_editId != null
                            ? '💾 Cập nhật'
                            : '✅ Tạo lịch'),
                      ),
                      const SizedBox(width: 10),
                      OutlinedButton(
                        onPressed: _resetForm,
                        style: OutlinedButton.styleFrom(
                            foregroundColor: context.textMuted,
                            side: BorderSide(color: borderColor),
                            shape: RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius.circular(20))),
                        child: const Text('Hủy'),
                      ),
                    ]),
                  ]),
            ),
            const SizedBox(height: 16),
          ],

          // ── Schedule list ──────────────────────────────────────
          if (_loading)
            const Center(
                child: CircularProgressIndicator(
                    color: Color(AppColors.amber)))
          else if (_schedules.isEmpty)
            Container(
              padding: const EdgeInsets.all(48),
              decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: borderColor)),
              child: Column(children: [
                Icon(Icons.schedule, size: 40, color: context.textHint),
                const SizedBox(height: 12),
                Text(
                  'Chưa có lịch nào. Nhấn "Tạo mới" để bắt đầu!',
                  textAlign: TextAlign.center,
                  style:
                      TextStyle(fontSize: 13, color: context.textMuted),
                ),
              ]),
            )
          else
            Column(
                children: _schedules
                    .map((s) => _buildScheduleCard(s))
                    .toList()),

          const SizedBox(height: 40),
        ]),
      ),
    );
  }

  Widget _buildScheduleCard(Map<String, dynamic> s) {
    final enabled = s['enabled'] == true;
    final borderColor = _borderColor(context);
    final mutedBg = _mutedBg(context);

    return Opacity(
      opacity: enabled ? 1.0 : 0.45,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: borderColor)),
        child: Row(children: [
          // Time badge
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: enabled
                  ? const Color(AppColors.amberPale)
                  : mutedBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                  color: enabled
                      ? const Color(AppColors.amberBorder)
                      : borderColor),
            ),
            child: Text(
              '${_pad(s['hour'] ?? 0)}:${_pad(s['minute'] ?? 0)}',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w300,
                letterSpacing: 1,
                color: enabled
                    ? const Color(AppColors.amber)
                    : context.textHint,
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(s['name'] ?? '',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: context.textHeading)),
                const SizedBox(height: 4),
                Row(children: [
                  Text(
                    _devices
                            .firstWhere(
                                (d) => d['value'] == s['device'],
                                orElse: () =>
                                    {'label': s['device']})['label'] ??
                        '',
                    style: TextStyle(
                        fontSize: 11, color: context.textMuted),
                  ),
                  Text(' · ',
                      style: TextStyle(color: borderColor)),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                        color: const Color(AppColors.amberPale),
                        borderRadius: BorderRadius.circular(10)),
                    child: Text(
                      _actionLabel[s['action']] ??
                          s['action'] ??
                          '',
                      style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          color: Color(AppColors.amber)),
                    ),
                  ),
                ]),
                const SizedBox(height: 6),
                // Day dots
                Row(
                    children: _dayLabels.asMap().entries.map((e) {
                  final active =
                      (s['days'] as List?)?.contains(e.key) == true;
                  return Container(
                    margin: const EdgeInsets.only(right: 3),
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: active
                          ? const Color(AppColors.amber)
                          : mutedBg,
                    ),
                    child: Center(
                        child: Text(e.value,
                            style: TextStyle(
                              fontSize: 8,
                              fontWeight: FontWeight.w500,
                              color: active
                                  ? Colors.white
                                  : context.textHint,
                            ))),
                  );
                }).toList()),
              ])),

          // Action buttons
          Column(children: [
            _iconBtn(
                Icons.power_settings_new,
                enabled
                    ? const Color(AppColors.success)
                    : context.textHint,
                enabled
                    ? const Color(AppColors.successBg)
                    : mutedBg,
                () => _handleToggle(s['_id'])),
            const SizedBox(height: 4),
            _iconBtn(Icons.edit_outlined, const Color(AppColors.amber),
                const Color(AppColors.amberPale), () => _handleEdit(s)),
            const SizedBox(height: 4),
            _iconBtn(Icons.delete_outline, const Color(AppColors.danger),
                const Color(AppColors.dangerBg),
                () => _handleDelete(s['_id'], s['name'] ?? '')),
          ]),
        ]),
      ),
    );
  }

  Widget _iconBtn(
      IconData icon, Color color, Color bg, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 30,
        height: 30,
        decoration: BoxDecoration(shape: BoxShape.circle, color: bg),
        child: Icon(icon, size: 14, color: color),
      ),
    );
  }

  Widget _quickBtn(String label, List<int> days) {
    return GestureDetector(
      onTap: () => setState(() => _days = List.from(days)),
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
            color: const Color(AppColors.amberPale),
            borderRadius: BorderRadius.circular(20),
            border:
                Border.all(color: const Color(AppColors.amberBorder))),
        child: Text(label,
            style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: Color(AppColors.amber))),
      ),
    );
  }
}