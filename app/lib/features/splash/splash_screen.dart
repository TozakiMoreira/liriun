import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/session_provider.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../widgets/liriun_mark.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _ctl;
  late final AnimationController _orb;
  late final AnimationController _dots;
  late final Animation<double> _markFade;
  late final Animation<double> _markScale;
  late final Animation<double> _wordRise;
  late final Animation<double> _bottomFade;
  bool _animComplete = false;
  bool _navigated = false;

  @override
  void initState() {
    super.initState();
    _ctl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );
    _orb = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat(reverse: true);
    _dots = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
    _markFade = CurvedAnimation(
      parent: _ctl,
      curve: const Interval(0.0, 0.45, curve: Curves.easeOut),
    );
    _markScale = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(
        parent: _ctl,
        curve: const Interval(0.0, 0.55, curve: LiriunCurves.expo),
      ),
    );
    _wordRise = CurvedAnimation(
      parent: _ctl,
      curve: const Interval(0.25, 0.65, curve: LiriunCurves.decel),
    );
    _bottomFade = CurvedAnimation(
      parent: _ctl,
      curve: const Interval(0.55, 1.0, curve: Curves.easeOut),
    );
    _ctl.forward().whenComplete(() {
      _animComplete = true;
      _maybeNavigate();
    });
  }

  void _maybeNavigate() {
    if (_navigated) return;
    if (!_animComplete) return;
    final session = ref.read(sessionControllerProvider);
    if (session.isLoading) return;
    _navigated = true;
    final logado = session.valueOrNull != null;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.go(logado ? '/hoje' : '/login');
    });
  }

  @override
  void dispose() {
    _ctl.dispose();
    _orb.dispose();
    _dots.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AsyncValue<Session?>>(sessionControllerProvider, (_, __) => _maybeNavigate());
    return Scaffold(
      backgroundColor: LiriunColors.surface,
      body: Stack(
        children: [
          // Orb radial pulsante atrás do mark
          Positioned.fill(
            child: Center(
              child: AnimatedBuilder(
                animation: _orb,
                builder: (context, _) {
                  final t = Curves.easeInOut.transform(_orb.value);
                  return Container(
                    width: 280 + (t * 18),
                    height: 280 + (t * 18),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          LiriunColors.violet400
                              .withValues(alpha: 0.32 * (0.7 + t * 0.3)),
                          LiriunColors.violet700
                              .withValues(alpha: 0.08),
                          Colors.transparent,
                        ],
                        stops: const [0.0, 0.5, 0.75],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          // Mark + wordmark
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                FadeTransition(
                  opacity: _markFade,
                  child: ScaleTransition(
                    scale: _markScale,
                    child: const _DropShadowMark(),
                  ),
                ),
                const SizedBox(height: 18),
                FadeTransition(
                  opacity: _wordRise,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0, 0.4),
                      end: Offset.zero,
                    ).animate(_wordRise),
                    child: const Text(
                      'Liriun',
                      style: TextStyle(
                        fontFamily: 'Geist',
                        fontSize: 28,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -0.8,
                        color: LiriunColors.text,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Tagline + dots loader
          Positioned(
            bottom: 70,
            left: 0,
            right: 0,
            child: FadeTransition(
              opacity: _bottomFade,
              child: Column(
                children: [
                  const Text(
                    'CARREGANDO SEU DIA',
                    style: TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 10,
                      letterSpacing: 1.6,
                      fontWeight: FontWeight.w500,
                      color: LiriunColors.textFaint,
                    ),
                  ),
                  const SizedBox(height: 14),
                  AnimatedBuilder(
                    animation: _dots,
                    builder: (context, _) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(3, (i) {
                          final phase = (_dots.value + i * 0.16) % 1.0;
                          final scale = phase < 0.5
                              ? 0.6 + phase * 0.8
                              : 1.0 - (phase - 0.5) * 0.8;
                          final opacity = 0.4 + (phase < 0.5
                              ? phase * 1.2
                              : (1 - phase) * 1.2);
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 3),
                            child: Transform.scale(
                              scale: scale.clamp(0.5, 1.0),
                              child: Container(
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: LiriunColors.violet400
                                      .withValues(alpha: opacity.clamp(0.3, 1.0)),
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          );
                        }),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DropShadowMark extends StatelessWidget {
  const _DropShadowMark();
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: LiriunColors.violet700.withValues(alpha: 0.35),
            blurRadius: 36,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: const LiriunMark(size: 96),
    );
  }
}
