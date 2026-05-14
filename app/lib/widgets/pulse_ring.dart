import 'package:flutter/material.dart';

import '../core/theme/liriun_tokens.dart';

/// 3 anéis concêntricos defasados 0/0.5/1s — feedback de captura de voz.
/// Espelha `lm-pulse-ring` keyframe do mockup.
class PulseRing extends StatefulWidget {
  const PulseRing({
    super.key,
    this.size = 180,
    this.color,
    this.active = true,
  });

  final double size;
  final Color? color;
  final bool active;

  @override
  State<PulseRing> createState() => _PulseRingState();
}

class _PulseRingState extends State<PulseRing> with TickerProviderStateMixin {
  late final List<AnimationController> _controllers;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(3, (i) {
      final c = AnimationController(
        vsync: this,
        duration: const Duration(seconds: 2),
      );
      Future.delayed(Duration(milliseconds: i * 500), () {
        if (mounted && widget.active) c.repeat();
      });
      return c;
    });
  }

  @override
  void didUpdateWidget(covariant PulseRing oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.active && !oldWidget.active) {
      for (var i = 0; i < _controllers.length; i++) {
        Future.delayed(Duration(milliseconds: i * 500), () {
          if (mounted) _controllers[i].repeat();
        });
      }
    } else if (!widget.active && oldWidget.active) {
      for (final c in _controllers) {
        c.stop();
        c.reset();
      }
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ?? LiriunColors.violet400.withValues(alpha: 0.4);
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: Stack(
        alignment: Alignment.center,
        children: _controllers.map((c) {
          return AnimatedBuilder(
            animation: c,
            builder: (context, _) {
              final t = LiriunCurves.standard.transform(c.value);
              final scale = 0.85 + (1.85 - 0.85) * t;
              final opacity = 0.85 * (1 - t);
              return Transform.scale(
                scale: scale,
                child: Opacity(
                  opacity: opacity,
                  child: Container(
                    width: widget.size,
                    height: widget.size,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: color, width: 1.5),
                    ),
                  ),
                ),
              );
            },
          );
        }).toList(),
      ),
    );
  }
}
