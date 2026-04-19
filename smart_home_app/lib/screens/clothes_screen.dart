import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/device_provider.dart';
import '../services/all_services.dart';
import '../config/api_config.dart';
import '../config/app_colors.dart'; // AppThemeColors extension

class ClothesScreen extends StatefulWidget {
  const ClothesScreen({super.key});
  @override
  State<ClothesScreen> createState() => _ClothesScreenState();
}

class _ClothesScreenState extends State<ClothesScreen> {
  final _clothesService = ClothesService();
  String _loading = '';

  Future<void> _handleCmd(String cmd) async {
    setState(() => _loading = cmd);
    try {
      await _clothesService.clothesCmd(cmd);
    } catch (_) {
      _toast('Gửi lệnh thất bại!', isError: true);
    }
    setState(() => _loading = '');
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
    final isRaining = device.isRaining;
    final isClothesIn = device.isClothesIn;
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
            Text('Giàn phơi thông minh',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w300,
                  color: context.textHeading,
                  letterSpacing: -0.3,
                )),
            Text('Servo motor · Cảm biến mưa tự động',
                style: TextStyle(fontSize: 12, color: context.textHint)),
          ]),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: isRaining
                  ? const Color(AppColors.blueBg)
                  : const Color(AppColors.successBg),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(
                  isRaining
                      ? Icons.grain
                      : Icons.wb_sunny_outlined,
                  size: 12,
                  color: isRaining
                      ? const Color(AppColors.blue)
                      : const Color(AppColors.success)),
              const SizedBox(width: 5),
              Text(
                isRaining ? 'Đang mưa' : 'Trời quang',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: isRaining
                      ? const Color(AppColors.blue)
                      : const Color(AppColors.success),
                ),
              ),
            ]),
          ),
        ]),
        const SizedBox(height: 16),

        // ── Rain warning banner ───────────────────────────────────
        if (isRaining) ...[
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(AppColors.blueBg),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFB5D4F4)),
            ),
            child: const Row(children: [
              Icon(Icons.warning_amber,
                  color: Color(AppColors.blue), size: 18),
              SizedBox(width: 10),
              Expanded(
                  child: Text(
                'Đang mưa — hệ thống đã tự động thu giàn phơi. Không thể đẩy ra lúc này.',
                style: TextStyle(
                    color: Color(AppColors.blue),
                    fontWeight: FontWeight.w500,
                    fontSize: 13),
              )),
            ]),
          ),
          const SizedBox(height: 16),
        ],

        // ── Status card ───────────────────────────────────────────
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderColor),
          ),
          child: Column(children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                color: isRaining
                    ? const Color(AppColors.blueBg)
                    : isClothesIn
                        ? const Color(AppColors.amberPale)
                        : const Color(AppColors.successBg),
              ),
              child: Icon(
                isRaining
                    ? Icons.grain
                    : isClothesIn
                        ? Icons.home_outlined
                        : Icons.wb_sunny_outlined,
                size: 30,
                color: isRaining
                    ? const Color(AppColors.blue)
                    : isClothesIn
                        ? const Color(AppColors.amber)
                        : const Color(AppColors.success),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              isRaining
                  ? 'Đang có mưa'
                  : isClothesIn
                      ? 'Giàn đã thu vào'
                      : 'Đang phơi ngoài',
              style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w500,
                  color: context.textHeading),
            ),
            const SizedBox(height: 6),
            Text(
              isRaining
                  ? 'Hệ thống tự động thu giàn phơi để bảo vệ quần áo'
                  : isClothesIn
                      ? 'Quần áo đang ở trong nhà, an toàn'
                      : 'Quần áo đang được phơi ngoài trời nắng',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: context.textMuted),
            ),
          ]),
        ),
        const SizedBox(height: 16),

        // ── Control card ──────────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderColor),
          ),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Điều khiển thủ công',
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: context.textHeading)),
            Text('Gửi lệnh trực tiếp đến servo motor',
                style: TextStyle(fontSize: 11, color: context.textMuted)),
            const SizedBox(height: 16),

            _CtrlBtn(
              icon: Icons.open_in_new_outlined,
              label: 'Đẩy ra ngoài',
              sub: isRaining
                  ? 'Không khả dụng khi trời mưa'
                  : 'Mở giàn phơi ra ngoài trời',
              disabled: isRaining,
              loading: _loading == 'OUT',
              onPressed: () => _handleCmd('OUT'),
              accentColor: const Color(AppColors.amber),
            ),
            const SizedBox(height: 10),
            _CtrlBtn(
              icon: Icons.home_outlined,
              label: 'Thu vào trong',
              sub: 'Kéo giàn phơi vào trong nhà',
              loading: _loading == 'IN',
              onPressed: () => _handleCmd('IN'),
              accentColor: const Color(AppColors.blue),
            ),
            const SizedBox(height: 10),
            _CtrlBtn(
              icon: Icons.smart_toy_outlined,
              label: 'Chế độ tự động',
              sub: 'Hệ thống tự điều chỉnh theo cảm biến mưa',
              loading: _loading == 'AUTO',
              onPressed: () => _handleCmd('AUTO'),
              accentColor: const Color(AppColors.purple),
            ),
            const SizedBox(height: 16),

            // Note box
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
                    Text('LƯU Ý',
                        style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: context.textMuted,
                            letterSpacing: 0.6)),
                    const SizedBox(height: 6),
                    RichText(
                        text: TextSpan(
                      style: TextStyle(
                          fontSize: 12,
                          color: context.textMuted,
                          height: 1.6),
                      children: [
                        const TextSpan(text: 'Chế độ '),
                        TextSpan(
                            text: 'AUTO',
                            style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: context.textHeading)),
                        const TextSpan(
                            text:
                                ' sẽ tự động thu giàn khi phát hiện mưa và đẩy ra khi trời quang. Lệnh thủ công sẽ ghi đè tạm thời.'),
                      ],
                    )),
                  ]),
            ),
          ]),
        ),
        const SizedBox(height: 16),

        // ── Info cards ────────────────────────────────────────────
        Text('Thông tin môi trường',
            style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: context.textHeading)),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(
              child: _InfoCard(
                  icon: Icons.grain,
                  label: 'Cảm biến mưa',
                  value: isRaining ? 'Đang mưa' : 'Trời tạnh',
                  color: isRaining
                      ? const Color(AppColors.blue)
                      : const Color(AppColors.success))),
          const SizedBox(width: 10),
          Expanded(
              child: _InfoCard(
                  icon: Icons.dry_cleaning_outlined,
                  label: 'Giàn phơi',
                  value: isClothesIn ? 'Đã thu vào' : 'Đang phơi',
                  color: isClothesIn
                      ? const Color(AppColors.amber)
                      : const Color(AppColors.success))),
        ]),
        const SizedBox(height: 40),
      ]),
    );
  }
}

class _CtrlBtn extends StatelessWidget {
  final IconData icon;
  final String label, sub;
  final bool disabled, loading;
  final VoidCallback onPressed;
  final Color accentColor;
  const _CtrlBtn(
      {required this.icon,
      required this.label,
      required this.sub,
      required this.onPressed,
      required this.accentColor,
      this.disabled = false,
      this.loading = false});

  @override
  Widget build(BuildContext context) {
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);
    final mutedBg = context.isDark
        ? const Color(0xFF1E1C1A)
        : const Color(AppColors.bgMuted);

    return GestureDetector(
      onTap: (disabled || loading) ? null : onPressed,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: disabled ? mutedBg : accentColor.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
              color: disabled
                  ? borderColor
                  : accentColor.withOpacity(0.3)),
        ),
        child: Row(children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: disabled
                  ? borderColor
                  : accentColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: loading
                ? Padding(
                    padding: const EdgeInsets.all(8),
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: accentColor))
                : Icon(icon,
                    size: 18,
                    color: disabled ? context.textHint : accentColor),
          ),
          const SizedBox(width: 12),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(label,
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: disabled
                            ? context.textHint
                            : context.textHeading)),
                Text(sub,
                    style:
                        TextStyle(fontSize: 11, color: context.textMuted)),
              ])),
        ]),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color color;
  const _InfoCard(
      {required this.icon,
      required this.label,
      required this.value,
      required this.color});

  @override
  Widget build(BuildContext context) {
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor)),
      child: Row(children: [
        Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(9)),
            child: Icon(icon, size: 17, color: color)),
        const SizedBox(width: 10),
        Expanded(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              Text(label,
                  style:
                      TextStyle(fontSize: 10, color: context.textMuted)),
              Text(value,
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: context.textHeading)),
            ])),
      ]),
    );
  }
}