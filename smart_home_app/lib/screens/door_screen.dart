import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/device_provider.dart';
import '../services/all_services.dart';
import '../config/api_config.dart';
import '../config/app_colors.dart'; // AppThemeColors extension

class DoorScreen extends StatefulWidget {
  const DoorScreen({super.key});
  @override
  State<DoorScreen> createState() => _DoorScreenState();
}

class _DoorScreenState extends State<DoorScreen> {
  final _doorService = DoorService();
  final _manualUIDCtrl = TextEditingController();
  String _loading = '';
  List<String> _uidList = [];

  @override
  void initState() {
    super.initState();
    _loadUIDs();
  }

  Future<void> _loadUIDs() async {
    try {
      final list = await _doorService.listUID();
      setState(() => _uidList = list.map((e) => e.toString()).toList());
    } catch (_) {}
  }

  Future<void> _handleDoor(String cmd) async {
    setState(() => _loading = cmd);
    try {
      await _doorService.sendDoorCmd(cmd);
    } catch (_) {
      _toast('Gửi lệnh thất bại!', isError: true);
    }
    setState(() => _loading = '');
  }

  Future<void> _handleLearn() async {
    setState(() => _loading = 'learn');
    try {
      await _doorService.learnMode();
      _toast('Đang chờ quẹt thẻ mới... (10 giây)');
    } catch (_) {
      _toast('Lỗi kích hoạt chế độ học!', isError: true);
    }
    setState(() => _loading = '');
  }

  Future<void> _handleAddManual() async {
    final uid = _manualUIDCtrl.text.trim();
    if (uid.isEmpty) {
      _toast('Vui lòng nhập UID!', isError: true);
      return;
    }
    setState(() => _loading = 'addManual');
    try {
      await _doorService.addUID(uid);
      _toast('Đã thêm thẻ $uid');
      _manualUIDCtrl.clear();
      _loadUIDs();
    } catch (_) {
      _toast('Thêm thẻ thất bại!', isError: true);
    }
    setState(() => _loading = '');
  }

  Future<void> _handleRemove(String uid) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Xóa thẻ',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
        content: Text('Xóa thẻ $uid?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Hủy')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppColors.danger)),
            child:
                const Text('Xóa', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await _doorService.removeUID(uid);
      _toast('Đã xóa thẻ');
      _loadUIDs();
    } catch (_) {
      _toast('Xóa thẻ thất bại!', isError: true);
    }
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
    final isOpen = device.isDoorOpen;
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);
    final mutedBg = context.isDark
        ? const Color(0xFF1E1C1A)
        : const Color(AppColors.bgMuted);

    return RefreshIndicator(
      color: const Color(AppColors.amber),
      onRefresh: _loadUIDs,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

          // ── Header ───────────────────────────────────────────────
          Text('Quản lý cửa & thẻ RFID',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w300,
                color: context.textHeading,
                letterSpacing: -0.3,
              )),
          const SizedBox(height: 4),
          Text('Điều khiển khóa điện từ và danh sách thẻ xác thực',
              style: TextStyle(fontSize: 12, color: context.textHint)),
          const SizedBox(height: 20),

          // ── Status hero card ──────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: borderColor),
            ),
            child: Column(children: [
              // Door icon
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isOpen
                      ? const Color(AppColors.amberPale)
                      : const Color(AppColors.successBg),
                  border: Border.all(
                      color: isOpen
                          ? const Color(AppColors.amberBorder)
                          : const Color(0xFF9FE1CB),
                      width: 2),
                ),
                child: Icon(
                  isOpen ? Icons.door_front_door : Icons.lock_outline,
                  size: 30,
                  color: isOpen
                      ? const Color(AppColors.amber)
                      : const Color(AppColors.success),
                ),
              ),
              const SizedBox(height: 12),
              Text(isOpen ? 'Đang mở' : 'Đã đóng',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w300,
                    color: context.textHeading,
                  )),
              const SizedBox(height: 4),
              Text('Khóa điện từ · Cửa chính',
                  style: TextStyle(fontSize: 12, color: context.textMuted)),
              const SizedBox(height: 12),

              // Status pill
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                decoration: BoxDecoration(
                  color: isOpen
                      ? const Color(AppColors.amberPale)
                      : const Color(AppColors.successBg),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  isOpen ? 'Không khóa' : 'Đã khóa an toàn',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: isOpen
                        ? const Color(AppColors.amber)
                        : const Color(AppColors.success),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Control buttons
              Row(children: [
                Expanded(
                    child: _ActionBtn(
                  label: 'Mở cửa',
                  icon: Icons.lock_open_outlined,
                  variant: 'primary',
                  loading: _loading == 'OPEN',
                  disabled: _loading != '' || isOpen,
                  onPressed: () => _handleDoor('OPEN'),
                )),
                const SizedBox(width: 10),
                Expanded(
                    child: _ActionBtn(
                  label: 'Đóng cửa',
                  icon: Icons.lock_outline,
                  variant: 'success',
                  loading: _loading == 'CLOSE',
                  disabled: _loading != '' || !isOpen,
                  onPressed: () => _handleDoor('CLOSE'),
                )),
              ]),
            ]),
          ),
          const SizedBox(height: 16),

          // ── Last access card ──────────────────────────────────────
          if (device.lastUID != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: borderColor),
              ),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Icon(Icons.access_time,
                          size: 14, color: context.textMuted),
                      const SizedBox(width: 6),
                      Text('LƯỢT QUẸT THẺ GẦN NHẤT',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 0.6,
                            color: context.textMuted,
                          )),
                    ]),
                    const SizedBox(height: 12),
                    Row(children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: device.lastAccess == 'granted'
                              ? const Color(AppColors.successBg)
                              : const Color(AppColors.dangerBg),
                        ),
                        child: Icon(
                          device.lastAccess == 'granted'
                              ? Icons.verified_user_outlined
                              : Icons.gpp_bad_outlined,
                          size: 18,
                          color: device.lastAccess == 'granted'
                              ? const Color(AppColors.success)
                              : const Color(AppColors.danger),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(device.lastUID!,
                                style: TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                    color: context.textHeading)),
                            Container(
                              margin: const EdgeInsets.only(top: 4),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: device.lastAccess == 'granted'
                                    ? const Color(AppColors.successBg)
                                    : const Color(AppColors.dangerBg),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                device.lastAccess == 'granted'
                                    ? '✓ Cho phép'
                                    : '✕ Từ chối',
                                style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w500,
                                    color: device.lastAccess == 'granted'
                                        ? const Color(AppColors.success)
                                        : const Color(AppColors.danger)),
                              ),
                            ),
                          ]),
                    ]),
                  ]),
            ),
          const SizedBox(height: 16),

          // ── Card management ───────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: borderColor),
            ),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Danh sách thẻ RFID',
                                  style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: context.textHeading)),
                              Text(
                                  '${_uidList.length}/10 thẻ đã đăng ký',
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: context.textMuted)),
                            ]),
                        _ActionBtn(
                          label: 'Học thẻ',
                          icon: Icons.nfc,
                          variant: 'primary',
                          loading: _loading == 'learn',
                          disabled: _loading == 'learn',
                          onPressed: _handleLearn,
                        ),
                      ]),
                  const SizedBox(height: 12),

                  // Progress bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: _uidList.length / 10,
                      backgroundColor: borderColor,
                      color: _uidList.length >= 8
                          ? const Color(AppColors.danger)
                          : const Color(AppColors.amber),
                      minHeight: 4,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Manual add
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: mutedBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: borderColor),
                    ),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('THÊM THẺ THỦ CÔNG',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w500,
                                  color: context.textMuted,
                                  letterSpacing: 0.6)),
                          const SizedBox(height: 10),
                          Row(children: [
                            Expanded(
                              child: TextField(
                                controller: _manualUIDCtrl,
                                style: TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 13,
                                    color: context.textHeading),
                                onSubmitted: (_) => _handleAddManual(),
                                decoration: InputDecoration(
                                  hintText: 'VD: 83:15:ce:06',
                                  hintStyle: TextStyle(
                                      color: context.textHint, fontSize: 13),
                                  isDense: true,
                                  contentPadding:
                                      const EdgeInsets.symmetric(
                                          horizontal: 12, vertical: 10),
                                  filled: true,
                                  fillColor: Theme.of(context).cardColor,
                                  border: OutlineInputBorder(
                                      borderRadius:
                                          BorderRadius.circular(8),
                                      borderSide:
                                          BorderSide(color: borderColor)),
                                  enabledBorder: OutlineInputBorder(
                                      borderRadius:
                                          BorderRadius.circular(8),
                                      borderSide:
                                          BorderSide(color: borderColor)),
                                  focusedBorder: OutlineInputBorder(
                                      borderRadius:
                                          BorderRadius.circular(8),
                                      borderSide: const BorderSide(
                                          color: Color(AppColors.amber))),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            _ActionBtn(
                              label: 'Thêm',
                              icon: Icons.add,
                              onPressed: _handleAddManual,
                              loading: _loading == 'addManual',
                              disabled: _loading == 'addManual',
                            ),
                          ]),
                        ]),
                  ),
                  const SizedBox(height: 16),
                  Divider(color: borderColor),
                  const SizedBox(height: 8),

                  // UID list
                  if (_uidList.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(children: [
                          Icon(Icons.credit_card,
                              size: 36, color: context.textHint),
                          const SizedBox(height: 8),
                          Text('Chưa có thẻ nào được đăng ký',
                              style: TextStyle(
                                  fontSize: 13, color: context.textHint)),
                        ]),
                      ),
                    )
                  else
                    Column(
                        children: _uidList.asMap().entries.map((entry) =>
                            Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: mutedBg,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: borderColor),
                              ),
                              child: Row(children: [
                                Container(
                                  width: 30,
                                  height: 30,
                                  decoration: BoxDecoration(
                                      color: const Color(AppColors.amberPale),
                                      borderRadius:
                                          BorderRadius.circular(8)),
                                  child: const Icon(Icons.credit_card,
                                      size: 14,
                                      color: Color(AppColors.amber)),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                    child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                      Text(entry.value,
                                          style: TextStyle(
                                              fontFamily: 'monospace',
                                              fontSize: 13,
                                              fontWeight: FontWeight.w500,
                                              color: context.textHeading)),
                                      Text('Thẻ #${entry.key + 1}',
                                          style: TextStyle(
                                              fontSize: 10,
                                              color: context.textHint)),
                                    ])),
                                IconButton(
                                  onPressed: () =>
                                      _handleRemove(entry.value),
                                  icon: Icon(Icons.delete_outline,
                                      size: 18, color: context.textHint),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(
                                      minWidth: 32, minHeight: 32),
                                ),
                              ]),
                            )).toList()),
                ]),
          ),
          const SizedBox(height: 40),
        ]),
      ),
    );
  }
}

// Reusable action button
class _ActionBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final String variant;
  final bool loading, disabled;
  final VoidCallback onPressed;

  const _ActionBtn({
    required this.label,
    required this.icon,
    required this.onPressed,
    this.variant = 'default',
    this.loading = false,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg, textColor, border;
    switch (variant) {
      case 'primary':
        bg = const Color(AppColors.amber);
        textColor = Colors.white;
        border = const Color(AppColors.amber);
        break;
      case 'success':
        bg = const Color(AppColors.successBg);
        textColor = const Color(AppColors.success);
        border = const Color(0xFF9FE1CB);
        break;
      case 'danger':
        bg = const Color(AppColors.dangerBg);
        textColor = const Color(AppColors.danger);
        border = const Color(0xFFF09595);
        break;
      default:
        bg = context.isDark ? const Color(0xFF1E1C1A) : const Color(AppColors.bgMuted);
        textColor = context.textMuted;
        border = context.isDark ? const Color(0xFF2E2C28) : const Color(AppColors.border);
    }

    return GestureDetector(
      onTap: (disabled || loading) ? null : onPressed,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        decoration: BoxDecoration(
          color: (disabled || loading) ? bg.withOpacity(0.5) : bg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: border),
        ),
        child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (loading)
                SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(
                        strokeWidth: 1.5, color: textColor))
              else
                Icon(icon, size: 14, color: textColor),
              const SizedBox(width: 6),
              Text(loading ? '...' : label,
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: textColor)),
            ]),
      ),
    );
  }
}