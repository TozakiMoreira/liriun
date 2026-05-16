import 'package:flutter/material.dart';

import '../core/theme/liriun_tokens.dart';

class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.body,
    this.ctaLabel,
    this.onCtaTap,
    this.compact = false,
  });

  final IconData icon;
  final String title;
  final String body;
  final String? ctaLabel;
  final VoidCallback? onCtaTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final size = compact ? 56.0 : 72.0;
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 22,
        vertical: compact ? 26 : 40,
      ),
      decoration: BoxDecoration(
        color: const Color(0x06FFFFFF),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Column(
        children: [
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  LiriunColors.violet400.withValues(alpha: 0.18),
                  LiriunColors.violet700.withValues(alpha: 0.06),
                ],
              ),
              borderRadius: BorderRadius.circular(size / 4),
              border: Border.all(
                color: LiriunColors.violet400.withValues(alpha: 0.32),
              ),
              boxShadow: [
                BoxShadow(
                  color: LiriunColors.violet500.withValues(alpha: 0.20),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Icon(
              icon,
              size: size * 0.5,
              color: LiriunColors.violet300,
            ),
          ),
          SizedBox(height: compact ? 14 : 20),
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: compact ? 15 : 17,
              fontWeight: FontWeight.w600,
              color: LiriunColors.text,
              letterSpacing: -0.2,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            body,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              color: LiriunColors.textMuted,
              height: 1.5,
            ),
          ),
          if (ctaLabel != null && onCtaTap != null) ...[
            const SizedBox(height: 18),
            GestureDetector(
              onTap: onCtaTap,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                decoration: BoxDecoration(
                  gradient: LiriunColors.gradBrand,
                  borderRadius: BorderRadius.circular(LiriunRadii.pill),
                  boxShadow: [
                    BoxShadow(
                      color: LiriunColors.violet700.withValues(alpha: 0.32),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Text(
                  ctaLabel!,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    letterSpacing: -0.1,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
