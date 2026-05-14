import 'dart:math';

import 'package:flutter/material.dart';

import '../core/theme/liriun_tokens.dart';

/// 32 barras animadas — feedback visual de captação de áudio.
/// Espelha `lm-bar-listen` do mockup.
class WaveformBars extends StatefulWidget {
  const WaveformBars({
    super.key,
    this.barCount = 32,
    this.height = 56,
    this.color,
    this.active = true,
  });

  final int barCount;
  final double height;
  final Color? color;
  final bool active;

  @override
  State<WaveformBars> createState() => _WaveformBarsState();
}

class _WaveformBarsState extends State<WaveformBars>
    with TickerProviderStateMixin {
  late final List<AnimationController> _controllers;
  late final List<double> _phases;

  @override
  void initState() {
    super.initState();
    final rng = Random(42);
    _controllers = List.generate(widget.barCount, (i) {
      final c = AnimationController(
        vsync: this,
        duration: Duration(milliseconds: 700 + (i % 4) * 120),
      );
      if (widget.active) c.repeat(reverse: true);
      return c;
    });
    _phases = List.generate(widget.barCount, (_) => rng.nextDouble());
    // Stagger inicial pra parecer onda
    for (var i = 0; i < _controllers.length; i++) {
      Future.delayed(Duration(milliseconds: (i * 40) % 600), () {
        if (mounted && widget.active && !_controllers[i].isAnimating) {
          _controllers[i].repeat(reverse: true);
        }
      });
    }
  }

  @override
  void didUpdateWidget(covariant WaveformBars oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.active != oldWidget.active) {
      for (final c in _controllers) {
        if (widget.active) {
          c.repeat(reverse: true);
        } else {
          c.stop();
          c.value = 0.5;
        }
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
    final color = widget.color ?? LiriunColors.violet300;
    return SizedBox(
      height: widget.height,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(widget.barCount, (i) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 1.5),
            child: AnimatedBuilder(
              animation: _controllers[i],
              builder: (context, _) {
                final base = 0.25 + (_controllers[i].value * 0.75);
                final h = widget.height * base;
                return Container(
                  width: 3,
                  height: h,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.85),
                    borderRadius: BorderRadius.circular(2),
                  ),
                );
              },
            ),
          );
        }),
      ),
    );
  }
}
