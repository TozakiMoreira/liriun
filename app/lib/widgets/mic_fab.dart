import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/theme/liriun_tokens.dart';

enum MicFabState { idle, listening, processing }

class MicFab extends StatefulWidget {
  const MicFab({
    super.key,
    required this.onTap,
    this.onLongPress,
    this.state = MicFabState.idle,
    this.size = 64,
  });

  final VoidCallback onTap;
  final VoidCallback? onLongPress;
  final MicFabState state;
  final double size;

  @override
  State<MicFab> createState() => _MicFabState();
}

class _MicFabState extends State<MicFab> with TickerProviderStateMixin {
  late final AnimationController _glowController;
  late final AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );
    _syncWithState();
  }

  @override
  void didUpdateWidget(covariant MicFab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.state != oldWidget.state) _syncWithState();
  }

  void _syncWithState() {
    if (widget.state == MicFabState.listening) {
      _pulseController.repeat(reverse: true);
    } else {
      _pulseController.stop();
      _pulseController.value = 0;
    }
  }

  @override
  void dispose() {
    _glowController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'Falar com Liriun',
      child: GestureDetector(
        onTap: () {
          HapticFeedback.lightImpact();
          widget.onTap();
        },
        onLongPress: widget.onLongPress == null
            ? null
            : () {
                HapticFeedback.mediumImpact();
                widget.onLongPress!.call();
              },
        child: AnimatedBuilder(
          animation: Listenable.merge([_glowController, _pulseController]),
          builder: (context, _) {
            final pulseT = _pulseController.value;
            final pulseScale = 1.0 + (pulseT * 0.06);
            final glowT = _glowController.value;
            final glowSpread = 4 + (glowT * 12);
            return Transform.scale(
              scale: pulseScale,
              child: Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  gradient: LiriunColors.gradBrand,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: LiriunColors.violet700.withValues(alpha: 0.45),
                      blurRadius: 24,
                      spreadRadius: glowSpread,
                    ),
                    const BoxShadow(
                      color: Color(0x33FFFFFF),
                      blurRadius: 0,
                      offset: Offset(0, -1),
                    ),
                  ],
                ),
                child: Center(
                  child: _icon(),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _icon() {
    switch (widget.state) {
      case MicFabState.processing:
        return const SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(
            strokeWidth: 2.4,
            valueColor: AlwaysStoppedAnimation(Colors.white),
          ),
        );
      case MicFabState.idle:
      case MicFabState.listening:
        return const Icon(Icons.mic_rounded, color: Colors.white, size: 28);
    }
  }
}
