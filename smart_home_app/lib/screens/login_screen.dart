import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../config/api_config.dart';
import 'main_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  // Bước: 'login' | 'otp'
  String _step = 'login';
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  String? _userId;
  String  _hint = '';
  bool _obscure = true;
  bool _loading = false;
  int  _countdown = 0;

  // Countdown timer
  void _startCountdown(int secs) {
    setState(() => _countdown = secs);
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() => _countdown = _countdown > 0 ? _countdown - 1 : 0);
      return _countdown > 0;
    });
  }

  String _formatTime(int s) =>
      '${(s ~/ 60).toString().padLeft(2, '0')}:${(s % 60).toString().padLeft(2, '0')}';

  // ── Bước 1: Login ──────────────────────────────────────────
  Future<void> _handleLogin() async {
    if (_usernameCtrl.text.isEmpty || _passwordCtrl.text.isEmpty) {
      _showToast('Vui lòng nhập đầy đủ thông tin!', isError: true);
      return;
    }

    setState(() => _loading = true);
    final auth = context.read<AuthProvider>();
    final res  = await auth.login(_usernameCtrl.text.trim(), _passwordCtrl.text);
    setState(() => _loading = false);

    if (!mounted) return;

    if (res == null) {
      _showToast(auth.error ?? 'Sai tên đăng nhập hoặc mật khẩu!', isError: true);
      return;
    }

    if (res['twoFA'] == false) {
      // Không có 2FA → vào Home
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const MainScreen()));
    } else {
      // Có 2FA → sang bước OTP
      setState(() {
        _step   = 'otp';
        _userId = res['userId'];
        _hint   = res['message'] ?? '';
      });
      _startCountdown(300);
      _showToast('Đã gửi mã OTP!');
    }
  }

  // ── Bước 2: Verify OTP ─────────────────────────────────────
  Future<void> _handleVerifyOTP() async {
    if (_otpCtrl.text.length != 6) {
      _showToast('OTP phải đủ 6 số!', isError: true);
      return;
    }

    setState(() => _loading = true);
    final auth    = context.read<AuthProvider>();
    final success = await auth.verifyOTP(_userId!, _otpCtrl.text);
    setState(() => _loading = false);

    if (!mounted) return;

    if (success) {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const MainScreen()));
    } else {
      _showToast(auth.error ?? 'OTP không hợp lệ!', isError: true);
      _otpCtrl.clear();
    }
  }

  // ── Gửi lại OTP ────────────────────────────────────────────
  Future<void> _handleResend() async {
    if (_countdown > 0) return;
    final auth    = context.read<AuthProvider>();
    final success = await auth.resendOTP(_userId!);
    if (success) {
      _showToast('Đã gửi lại OTP!');
      _startCountdown(300);
    } else {
      _showToast('Gửi lại thất bại!', isError: true);
    }
  }

  void _showToast(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? const Color(AppColors.danger) : const Color(AppColors.success),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      margin: const EdgeInsets.all(16),
    ));
  }

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }

  // ── UI ─────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F5F0),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                // Logo row
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(
                        color: const Color(AppColors.amberPale),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(AppColors.amberBorder)),
                      ),
                      child: const Icon(Icons.home_outlined, color: Color(AppColors.amber), size: 26),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Smart Home', style: TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w500,
                          color: const Color(AppColors.textHeading),
                        )),
                        Text('Hệ thống nhà thông minh', style: TextStyle(
                          fontSize: 11, color: const Color(AppColors.textMuted),
                        )),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // Form card
                Container(
                  width: double.infinity,
                  constraints: const BoxConstraints(maxWidth: 400),
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(AppColors.border)),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 2))],
                  ),
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: _step == 'login' ? _buildLoginForm() : _buildOTPForm(),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Form Đăng nhập ─────────────────────────────────────────
  Widget _buildLoginForm() {
    return Column(
      key: const ValueKey('login'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Step indicator
        _buildStepIndicator(),
        const SizedBox(height: 24),

        Text('Chào mừng trở lại', style: TextStyle(
          fontSize: 24, fontWeight: FontWeight.w300,
          color: const Color(AppColors.textHeading), letterSpacing: -0.3,
        )),
        const SizedBox(height: 4),
        Text('Đăng nhập để quản lý ngôi nhà của bạn', style: TextStyle(
          fontSize: 13, color: const Color(AppColors.textMuted),
        )),
        const SizedBox(height: 28),

        // Username field
        _buildLabel('TÊN ĐĂNG NHẬP'),
        const SizedBox(height: 8),
        _buildTextField(
          controller: _usernameCtrl,
          hint: 'Nhập tên đăng nhập',
          icon: Icons.person_outline,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: 16),

        // Password field
        _buildLabel('MẬT KHẨU'),
        const SizedBox(height: 8),
        _buildTextField(
          controller: _passwordCtrl,
          hint: 'Nhập mật khẩu',
          icon: Icons.lock_outline,
          obscure: _obscure,
          suffixIcon: IconButton(
            icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              size: 18, color: const Color(AppColors.textMuted)),
            onPressed: () => setState(() => _obscure = !_obscure),
          ),
          onSubmitted: (_) => _handleLogin(),
        ),
        const SizedBox(height: 28),

        // Login button
        _buildPrimaryButton(
          loading: _loading,
          label: 'Tiếp tục',
          icon: Icons.arrow_forward,
          onPressed: _handleLogin,
        ),
      ],
    );
  }

  // ── Form OTP ───────────────────────────────────────────────
  Widget _buildOTPForm() {
    return Column(
      key: const ValueKey('otp'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildStepIndicator(),
        const SizedBox(height: 24),

        Text('Xác thực 2 lớp', style: TextStyle(
          fontSize: 24, fontWeight: FontWeight.w300,
          color: const Color(AppColors.textHeading), letterSpacing: -0.3,
        )),
        const SizedBox(height: 4),
        Text('Nhập mã OTP được gửi đến email của bạn', style: TextStyle(
          fontSize: 13, color: const Color(AppColors.textMuted),
        )),
        const SizedBox(height: 20),

        // Email hint
        if (_hint.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(AppColors.amberPale),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(AppColors.amberBorder)),
            ),
            child: Row(children: [
              const Icon(Icons.mail_outline, color: Color(AppColors.amber), size: 18),
              const SizedBox(width: 10),
              Expanded(child: Text(_hint, style: const TextStyle(fontSize: 13, color: Color(0xFFBA7517)))),
            ]),
          ),
        const SizedBox(height: 16),

        // OTP input
        _buildLabel('NHẬP MÃ OTP (6 SỐ)'),
        const SizedBox(height: 8),
        TextField(
          controller: _otpCtrl,
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          maxLength: 6,
          autofocus: true,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          onSubmitted: (_) => _handleVerifyOTP(),
          style: const TextStyle(
            fontSize: 28, fontWeight: FontWeight.w700,
            letterSpacing: 12, color: Color(AppColors.amber),
          ),
          decoration: InputDecoration(
            counterText: '',
            hintText: '——————',
            hintStyle: TextStyle(
              fontSize: 20, letterSpacing: 10,
              color: const Color(AppColors.textHint),
            ),
            filled: true,
            fillColor: const Color(AppColors.bgMuted),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: const Color(AppColors.border)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: const Color(AppColors.border)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(AppColors.amber), width: 1.5),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Countdown & Resend
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _countdown > 0
                ? '⏱ Hết hạn sau: ${_formatTime(_countdown)}'
                : '⚠️ OTP đã hết hạn',
              style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w500,
                color: _countdown > 0 ? const Color(AppColors.amber) : const Color(AppColors.danger),
              ),
            ),
            GestureDetector(
              onTap: _handleResend,
              child: Text('Gửi lại OTP', style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w600,
                decoration: TextDecoration.underline,
                color: _countdown > 0 ? const Color(AppColors.textHint) : const Color(AppColors.amber),
              )),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Verify button
        _buildPrimaryButton(
          loading: _loading,
          label: 'Xác thực',
          icon: Icons.shield_outlined,
          onPressed: _handleVerifyOTP,
        ),
        const SizedBox(height: 10),

        // Quay lại
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () => setState(() { _step = 'login'; _otpCtrl.clear(); }),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 13),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              side: BorderSide(color: const Color(AppColors.border)),
            ),
            child: Text('← Quay lại đăng nhập', style: TextStyle(
              color: const Color(AppColors.textMuted), fontSize: 13,
            )),
          ),
        ),
      ],
    );
  }

  Widget _buildStepIndicator() {
    return Row(children: [
      _stepDot(1, active: _step == 'login', done: _step == 'otp'),
      Expanded(child: Container(height: 2, color: _step == 'otp' ? const Color(AppColors.success) : const Color(AppColors.border))),
      _stepDot(2, active: _step == 'otp'),
    ]);
  }

  Widget _stepDot(int n, {bool active = false, bool done = false}) {
    return Column(children: [
      Container(
        width: 28, height: 28,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: done ? const Color(AppColors.success) : active ? const Color(AppColors.amber) : const Color(AppColors.border),
        ),
        child: Center(child: Text(
          done ? '✓' : '$n',
          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
        )),
      ),
      const SizedBox(height: 4),
      Text(n == 1 ? 'Đăng nhập' : 'OTP', style: TextStyle(
        fontSize: 10, fontWeight: active ? FontWeight.w600 : FontWeight.normal,
        color: active ? const Color(AppColors.amber) : done ? const Color(AppColors.success) : const Color(AppColors.textHint),
      )),
    ]);
  }

  Widget _buildLabel(String text) {
    return Text(text, style: TextStyle(
      fontSize: 11, fontWeight: FontWeight.w500,
      color: const Color(AppColors.textMuted), letterSpacing: 0.6,
    ));
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool obscure = false,
    Widget? suffixIcon,
    TextInputAction? textInputAction,
    Function(String)? onSubmitted,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      textInputAction: textInputAction,
      onSubmitted: onSubmitted,
      style: const TextStyle(fontSize: 14, color: Color(AppColors.textHeading)),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: const Color(AppColors.textHint), fontSize: 14),
        prefixIcon: Icon(icon, size: 18, color: const Color(AppColors.textMuted)),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: const Color(AppColors.bgMuted),
        contentPadding: const EdgeInsets.symmetric(vertical: 13, horizontal: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: const Color(AppColors.border)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: const Color(AppColors.border)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(AppColors.amber), width: 1.5),
        ),
      ),
    );
  }

  Widget _buildPrimaryButton({
    required bool loading,
    required String label,
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: loading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(AppColors.amber),
          disabledBackgroundColor: const Color(AppColors.amber).withOpacity(0.7),
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: 0,
        ),
        child: loading
          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
          : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text(label, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
              const SizedBox(width: 8),
              Icon(icon, size: 16, color: Colors.white),
            ]),
      ),
    );
  }
}