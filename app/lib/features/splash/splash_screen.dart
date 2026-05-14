import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/liriun_tokens.dart';
import '../../widgets/liriun_mark.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctl;
  late final Animation<double> _scale;
  late final Animation<double> _glow;

  @override
  void initState() {
    super.initState();
    _ctl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..forward();
    _scale = Tween(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _ctl, curve: LiriunCurves.expo),
    );
    _glow = Tween(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _ctl,
        curve: const Interval(0.2, 1.0, curve: LiriunCurves.decel),
      ),
    );
  }

  @override
  void dispose() {
    _ctl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LiriunColors.bg,
      body: Center(
        child: AnimatedBuilder(
          animation: _ctl,
          builder: (context, _) {
            return Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color:
                        LiriunColors.violet500.withValues(alpha: 0.45 * _glow.value),
                    blurRadius: 60 * _glow.value,
                    spreadRadius: 8 * _glow.value,
                  ),
                ],
              ),
              child: Transform.scale(
                scale: _scale.value,
                child: const LiriunMark(size: 96),
              ),
            );
          },
        ),
      ),
    );
  }
}
