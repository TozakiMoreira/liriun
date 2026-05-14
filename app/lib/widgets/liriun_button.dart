import 'package:flutter/material.dart';

import '../core/theme/liriun_tokens.dart';

enum LiriunButtonVariant { primary, secondary, ghost, destructive }

class LiriunButton extends StatefulWidget {
  const LiriunButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = LiriunButtonVariant.primary,
    this.icon,
    this.loading = false,
    this.fullWidth = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final LiriunButtonVariant variant;
  final Widget? icon;
  final bool loading;
  final bool fullWidth;

  @override
  State<LiriunButton> createState() => _LiriunButtonState();
}

class _LiriunButtonState extends State<LiriunButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final disabled = widget.onPressed == null || widget.loading;
    final scale = _pressed ? 0.97 : 1.0;

    final child = AnimatedScale(
      scale: scale,
      duration: LiriunDurations.fast,
      curve: LiriunCurves.standard,
      child: _content(disabled),
    );

    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: disabled ? null : widget.onPressed,
      child: widget.fullWidth
          ? SizedBox(width: double.infinity, child: child)
          : child,
    );
  }

  Widget _content(bool disabled) {
    final padding = const EdgeInsets.symmetric(horizontal: 20, vertical: 14);
    final border = Border.all(color: LiriunColors.borderHi, width: 1);

    switch (widget.variant) {
      case LiriunButtonVariant.primary:
        return Container(
          padding: padding,
          decoration: BoxDecoration(
            gradient: LiriunColors.gradBrand,
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            boxShadow: disabled
                ? null
                : [
                    BoxShadow(
                      color: LiriunColors.violet700.withValues(alpha: 0.35),
                      blurRadius: 22,
                      offset: const Offset(0, 8),
                    ),
                  ],
          ),
          child: Opacity(opacity: disabled ? 0.5 : 1, child: _row(Colors.white)),
        );
      case LiriunButtonVariant.secondary:
        return Container(
          padding: padding,
          decoration: BoxDecoration(
            color: const Color(0x14FFFFFF),
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            border: border,
          ),
          child: Opacity(
            opacity: disabled ? 0.5 : 1,
            child: _row(LiriunColors.text),
          ),
        );
      case LiriunButtonVariant.ghost:
        return Container(
          padding: padding,
          child: Opacity(
            opacity: disabled ? 0.5 : 1,
            child: _row(LiriunColors.textMuted),
          ),
        );
      case LiriunButtonVariant.destructive:
        return Container(
          padding: padding,
          decoration: BoxDecoration(
            color: LiriunColors.danger.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            border: Border.all(
              color: LiriunColors.danger.withValues(alpha: 0.32),
            ),
          ),
          child: Opacity(
            opacity: disabled ? 0.5 : 1,
            child: _row(LiriunColors.danger),
          ),
        );
    }
  }

  Widget _row(Color fg) {
    if (widget.loading) {
      return SizedBox(
        height: 18,
        width: 18,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation(fg),
        ),
      );
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.icon != null) ...[
          IconTheme(data: IconThemeData(color: fg, size: 18), child: widget.icon!),
          const SizedBox(width: 8),
        ],
        Text(
          widget.label,
          style: TextStyle(
            color: fg,
            fontSize: 14,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.1,
          ),
        ),
      ],
    );
  }
}
