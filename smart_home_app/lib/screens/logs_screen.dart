import 'package:flutter/material.dart';
import '../services/all_services.dart';
import '../config/api_config.dart';
import '../config/app_colors.dart';

// ── Constants ────────────────────────────────────────────────────────────────

const _devices = [
  {'key': 'all',      'label': 'Tất cả'},
  {'key': 'door',     'label': 'Cửa'},
  {'key': 'room',     'label': 'Phòng'},
  {'key': 'rain',     'label': 'Mưa'},
  {'key': 'security', 'label': 'Bảo mật'},
];

const _badgeConfig = {
  'access_granted':   {'label': 'Cho phép',       'type': 'success', 'icon': Icons.verified_user_outlined},
  'access_denied':    {'label': 'Từ chối',         'type': 'danger',  'icon': Icons.gpp_bad_outlined},
  'uid_scanned':      {'label': 'Quét thẻ',        'type': 'blue',    'icon': Icons.credit_card_outlined},
  'gas_detected':     {'label': 'Phát hiện gas',   'type': 'amber',   'icon': Icons.local_fire_department_outlined},
  'intruder_alert':   {'label': 'Xâm nhập',        'type': 'purple',  'icon': Icons.shield_outlined},
  'high_temperature': {'label': 'Nhiệt cao',       'type': 'danger',  'icon': Icons.thermostat_outlined},
  'rain_detected':    {'label': 'Phát hiện mưa',   'type': 'blue',    'icon': Icons.grain},
  'dht_record':       {'label': 'DHT record',      'type': 'muted',   'icon': Icons.bar_chart_outlined},
};

const _deviceBadge = {
  'door':     {'type': 'amber'},
  'room':     {'type': 'success'},
  'rain':     {'type': 'blue'},
  'security': {'type': 'purple'},
};

const _limit = 20;
const _refreshSecs = 10;

// ── Screen ───────────────────────────────────────────────────────────────────

class LogsScreen extends StatefulWidget {
  const LogsScreen({super.key});
  @override
  State<LogsScreen> createState() => _LogsScreenState();
}

class _LogsScreenState extends State<LogsScreen> {
  final _logsService = StatsService();

  List<Map<String, dynamic>> _logs = [];
  int _total = 0;
  int _page = 1;
  String _device = 'all';
  bool _loading = true;
  bool _refreshing = false;
  int _countdown = _refreshSecs;

  @override
  void initState() {
    super.initState();
    _fetchLogs();
    _startAutoRefresh();
    _startCountdown();
  }

  void _startAutoRefresh() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: _refreshSecs));
      if (!mounted) return false;
      _fetchLogs(background: true);
      return true;
    });
  }

  void _startCountdown() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() {
        _countdown = _countdown <= 1 ? _refreshSecs : _countdown - 1;
      });
      return true;
    });
  }

  Future<void> _fetchLogs({bool background = false}) async {
    if (background) {
      setState(() => _refreshing = true);
    } else {
      setState(() => _loading = true);
    }
    try {
      final res = await _logsService.getLogs({
        'page': _page,
        'limit': _limit,
        if (_device != 'all') 'device': _device,
      });
      if (!mounted) return;
      setState(() {
        _logs = (res['data'] as List).cast<Map<String, dynamic>>();
        _total = res['total'] as int? ?? 0;
        _countdown = _refreshSecs;
      });
    } catch (e) {
      debugPrint('=== LOGS FETCH ERROR: $e');
    } finally {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _refreshing = false;
      });
    }
  }

  void _setDevice(String key) {
    setState(() {
      _device = key;
      _page = 1;
    });
    _fetchLogs();
  }

  void _setPage(int p) {
    setState(() => _page = p);
    _fetchLogs();
  }

  int get _totalPages => (_total / _limit).ceil();

  @override
  Widget build(BuildContext context) {
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);
    final mutedBg = context.isDark
        ? const Color(0xFF1E1C1A)
        : const Color(AppColors.bgMuted);

    return RefreshIndicator(
      color: const Color(AppColors.amber),
      onRefresh: () => _fetchLogs(background: true),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

          // ── Header ──────────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Lịch sử hoạt động',
                    style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w300,
                        color: context.textHeading,
                        letterSpacing: -0.3)),
                Text('Nhật ký sự kiện từ tất cả các thiết bị',
                    style: TextStyle(fontSize: 12, color: context.textHint)),
              ]),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                // Total badge
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: mutedBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: borderColor),
                  ),
                  child: Text('$_total bản ghi',
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: context.textMuted)),
                ),
                const SizedBox(height: 6),
                // Countdown + refresh button
                Row(children: [
                  Text(
                    _refreshing
                        ? 'Đang cập nhật...'
                        : 'Cập nhật sau ${_countdown}s',
                    style:
                        TextStyle(fontSize: 10, color: context.textHint),
                  ),
                  const SizedBox(width: 6),
                  GestureDetector(
                    onTap: (_refreshing || _loading)
                        ? null
                        : () => _fetchLogs(background: true),
                    child: Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardColor,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: borderColor),
                      ),
                      child: _refreshing
                          ? const Padding(
                              padding: EdgeInsets.all(6),
                              child: CircularProgressIndicator(
                                  strokeWidth: 1.5,
                                  color: Color(AppColors.amber)),
                            )
                          : Icon(Icons.refresh,
                              size: 14, color: context.textMuted),
                    ),
                  ),
                ]),
              ]),
            ],
          ),
          const SizedBox(height: 16),

          // ── Filter tabs ─────────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderColor),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _devices.map((d) {
                  final isActive = _device == d['key'];
                  return GestureDetector(
                    onTap: () => _setDevice(d['key']!),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.only(right: 4),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 7),
                      decoration: BoxDecoration(
                        color: isActive
                            ? const Color(AppColors.amberPale)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                        border: isActive
                            ? Border.all(
                                color:
                                    const Color(AppColors.amberBorder))
                            : null,
                      ),
                      child: Text(d['label']!,
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: isActive
                                  ? FontWeight.w500
                                  : FontWeight.w400,
                              color: isActive
                                  ? const Color(AppColors.amber)
                                  : context.textMuted)),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // ── Log list ────────────────────────────────────────────
          AnimatedOpacity(
            opacity: _refreshing ? 0.6 : 1.0,
            duration: const Duration(milliseconds: 300),
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: borderColor),
              ),
              child: _loading
                  ? const Padding(
                      padding: EdgeInsets.all(48),
                      child: Center(
                          child: CircularProgressIndicator(
                              color: Color(AppColors.amber))),
                    )
                  : _logs.isEmpty
                      ? Padding(
                          padding: const EdgeInsets.all(48),
                          child: Center(
                            child: Column(children: [
                              Icon(Icons.inbox_outlined,
                                  size: 36, color: context.textHint),
                              const SizedBox(height: 10),
                              Text('Không có dữ liệu',
                                  style: TextStyle(
                                      fontSize: 13,
                                      color: context.textMuted)),
                            ]),
                          ),
                        )
                      : Column(
                          children: _logs.asMap().entries.map((entry) {
                            final isLast =
                                entry.key == _logs.length - 1;
                            return _LogItem(
                              log: entry.value,
                              isLast: isLast,
                            );
                          }).toList(),
                        ),
            ),
          ),

          // ── Pagination ─────────────────────────────────────────
          if (_totalPages > 1) ...[
            const SizedBox(height: 12),
            _Pagination(
              page: _page,
              totalPages: _totalPages,
              total: _total,
              onPage: _setPage,
            ),
          ],

          const SizedBox(height: 40),
        ]),
      ),
    );
  }
}

// ── Log item ─────────────────────────────────────────────────────────────────

class _LogItem extends StatelessWidget {
  final Map<String, dynamic> log;
  final bool isLast;
  const _LogItem({required this.log, required this.isLast});

  @override
  Widget build(BuildContext context) {
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);

    final badge = _badgeConfig[log['event']] ??
        {
          'label': log['event'] ?? '—',
          'type': 'muted',
          'icon': Icons.info_outline,
        };
    final devBadge = _deviceBadge[log['device']] ?? {'type': 'muted'};

    final time = log['createdAt'] != null
        ? DateTime.tryParse(log['createdAt'].toString())?.toLocal()
        : null;
    final timeStr = time != null
        ? '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}:${time.second.toString().padLeft(2, '0')}'
        : '—';
    final dateStr = time != null
        ? '${time.day.toString().padLeft(2, '0')}/${time.month.toString().padLeft(2, '0')}/${time.year}'
        : '';

    final payload = log['payload'];
    final payloadStr = payload != null ? payload.toString() : null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : Border(bottom: BorderSide(color: borderColor, width: 0.8)),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // ── Time ──
        SizedBox(
          width: 68,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(timeStr,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    color: context.textHeading)),
            Text(dateStr,
                style: TextStyle(fontSize: 10, color: context.textHint)),
          ]),
        ),
        const SizedBox(width: 10),

        // ── Device + Event badges ──
        Expanded(
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            Row(children: [
              _Badge(type: devBadge['type']!, label: log['device'] ?? '—'),
              const SizedBox(width: 6),
              _BadgeWithIcon(
                type: badge['type'] as String,
                label: badge['label'] as String,
                icon: badge['icon'] as IconData,
              ),
            ]),
            if (payloadStr != null) ...[
              const SizedBox(height: 6),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: context.isDark
                      ? const Color(0xFF1E1C1A)
                      : const Color(AppColors.bgMuted),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: borderColor),
                ),
                child: Text(
                  payloadStr,
                  style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 10,
                      color: context.textMuted),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            ],
          ]),
        ),
      ]),
    );
  }
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

Color _bgForType(String type) {
  switch (type) {
    case 'success': return const Color(AppColors.successBg);
    case 'danger':  return const Color(AppColors.dangerBg);
    case 'amber':   return const Color(AppColors.amberPale);
    case 'blue':    return Color(0xFFE6F1FB);
    case 'purple':  return Color(0xFFEEEDFE);
    default:        return const Color(0xFFF0EDE8);
  }
}

Color _colorForType(String type) {
  switch (type) {
    case 'success': return const Color(AppColors.success);
    case 'danger':  return const Color(AppColors.danger);
    case 'amber':   return const Color(AppColors.amber);
    case 'blue':    return const Color(0xFF185FA5);
    case 'purple':  return const Color(0xFF534AB7);
    default:        return const Color(AppColors.textMuted);
  }
}

class _Badge extends StatelessWidget {
  final String type, label;
  const _Badge({required this.type, required this.label});
  @override
  Widget build(BuildContext context) => Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: _bgForType(type),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label,
            style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: _colorForType(type))),
      );
}

class _BadgeWithIcon extends StatelessWidget {
  final String type, label;
  final IconData icon;
  const _BadgeWithIcon(
      {required this.type, required this.label, required this.icon});
  @override
  Widget build(BuildContext context) => Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: _bgForType(type),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 11, color: _colorForType(type)),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: _colorForType(type))),
        ]),
      );
}

// ── Pagination ────────────────────────────────────────────────────────────────

class _Pagination extends StatelessWidget {
  final int page, totalPages, total;
  final void Function(int) onPage;
  const _Pagination(
      {required this.page,
      required this.totalPages,
      required this.total,
      required this.onPage});

  List<int> get _pages {
    if (totalPages <= 5) return List.generate(totalPages, (i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) {
      return List.generate(5, (i) => totalPages - 4 + i);
    }
    return [page - 2, page - 1, page, page + 1, page + 2];
  }

  @override
  Widget build(BuildContext context) {
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: context.isDark
            ? const Color(0xFF1E1C1A)
            : const Color(AppColors.bgMuted),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Column(                          // ← đổi Row → Column
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Trang $page / $totalPages · $total bản ghi',
              style: TextStyle(fontSize: 11, color: context.textMuted)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _PageBtn(
                child: const Icon(Icons.chevron_left, size: 16),
                disabled: page == 1,
                active: false,
                onTap: () => onPage(page - 1),
              ),
              const SizedBox(width: 4),
              ..._pages.map((p) => Padding(
                    padding: const EdgeInsets.only(right: 4),
                    child: _PageBtn(
                      child: Text('$p',
                          style: TextStyle(
                              fontSize: 12,
                              fontWeight: p == page
                                  ? FontWeight.w500
                                  : FontWeight.w400)),
                      active: p == page,
                      disabled: false,
                      onTap: () => onPage(p),
                    ),
                  )),
              _PageBtn(
                child: const Icon(Icons.chevron_right, size: 16),
                disabled: page == totalPages,
                active: false,
                onTap: () => onPage(page + 1),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PageBtn extends StatelessWidget {
  final Widget child;
  final bool active, disabled;
  final VoidCallback onTap;
  const _PageBtn(
      {required this.child,
      required this.active,
      required this.disabled,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    final borderColor = context.isDark
        ? const Color(0xFF2E2C28)
        : const Color(AppColors.border);

    return GestureDetector(
      onTap: disabled ? null : onTap,
      child: AnimatedOpacity(
        opacity: disabled ? 0.4 : 1.0,
        duration: const Duration(milliseconds: 150),
        child: Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            color: active
                ? const Color(AppColors.amberPale)
                : Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(7),
            border: Border.all(
                color: active
                    ? const Color(AppColors.amberBorder)
                    : borderColor),
          ),
          child: Center(
            child: DefaultTextStyle(
              style: TextStyle(
                  color: active
                      ? const Color(AppColors.amber)
                      : context.textMuted,
                  fontSize: 12),
              child: IconTheme(
                data: IconThemeData(
                    color: active
                        ? const Color(AppColors.amber)
                        : context.textMuted,
                    size: 16),
                child: child,
              ),
            ),
          ),
        ),
      ),
    );
  }
}