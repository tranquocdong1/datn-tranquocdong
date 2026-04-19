import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../config/api_config.dart';

class ThemeToggle extends StatelessWidget {
  const ThemeToggle({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDark;

    return GestureDetector(
      onTap: () => context.read<ThemeProvider>().toggle(),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Text(
          isDark ? 'Tối' : 'Sáng',
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: Color(AppColors.textMuted), // dùng AppColors gốc, không & operator
          ),
        ),
        const SizedBox(width: 6),
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          width: 52, height: 28,
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            color: isDark ? const Color(AppColors.amber) : const Color(0xFFE0DDD8),
            border: Border.all(
              color: isDark ? const Color(AppColors.amber) : const Color(AppColors.border),
            ),
          ),
          child: AnimatedAlign(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            alignment: isDark ? Alignment.centerRight : Alignment.centerLeft,
            child: Container(
              width: 22, height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.18),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Icon(
                isDark ? Icons.nightlight_round : Icons.wb_sunny_outlined,
                size: 12,
                color: isDark ? const Color(AppColors.amber) : const Color(AppColors.gray),
              ),
            ),
          ),
        ),
      ]),
    );
  }
}