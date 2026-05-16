import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/liriun_tokens.dart';
import '../../widgets/liriun_mark.dart';
import '../../widgets/pulse_ring.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pageController = PageController();
  int _page = 0;

  static const _pages = [
    _OnbContent.diga,
    _OnbContent.entende,
    _OnbContent.qualquerLugar,
  ];

  void _next() {
    HapticFeedback.lightImpact();
    if (_page < _pages.length - 1) {
      _pageController.nextPage(
        duration: LiriunDurations.base,
        curve: LiriunCurves.decel,
      );
    } else {
      context.go('/hoje');
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLast = _page == _pages.length - 1;
    return Scaffold(
      backgroundColor: LiriunColors.surface,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(width: 60),
                  _PageDots(current: _page, total: _pages.length),
                  TextButton(
                    onPressed: () => context.go('/hoje'),
                    child: const Text(
                      'Pular',
                      style: TextStyle(
                        fontFamily: 'Geist Mono',
                        fontSize: 11,
                        letterSpacing: 1.2,
                        color: LiriunColors.textFaint,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (i) => setState(() => _page = i),
                itemCount: _pages.length,
                itemBuilder: (context, i) {
                  switch (_pages[i]) {
                    case _OnbContent.diga:
                      return const _PageDiga();
                    case _OnbContent.entende:
                      return const _PageEntende();
                    case _OnbContent.qualquerLugar:
                      return const _PageQualquerLugar();
                  }
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 0, 22, 24),
              child: GestureDetector(
                onTap: _next,
                child: Container(
                  height: 52,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    gradient: LiriunColors.gradBrand,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: LiriunColors.violet700.withValues(alpha: 0.35),
                        blurRadius: 22,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        isLast ? 'Começar' : 'Continuar',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                          letterSpacing: -0.1,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward_rounded,
                          size: 18, color: Colors.white),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

enum _OnbContent { diga, entende, qualquerLugar }

class _PageDots extends StatelessWidget {
  const _PageDots({required this.current, required this.total});
  final int current;
  final int total;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(total, (i) {
        final active = i == current;
        return AnimatedContainer(
          duration: LiriunDurations.base,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: active ? 22 : 5,
          height: 5,
          decoration: BoxDecoration(
            gradient: active ? LiriunColors.gradBrand : null,
            color: active ? null : const Color(0x2EFFFFFF),
            borderRadius: BorderRadius.circular(3),
          ),
        );
      }),
    );
  }
}

// ─── 1. Diga. Está feito. ─────────────────────────────────
class _PageDiga extends StatelessWidget {
  const _PageDiga();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 22),
      child: Column(
        children: [
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                const PulseRing(size: 220),
                Container(
                  width: 124,
                  height: 124,
                  decoration: BoxDecoration(
                    gradient: LiriunColors.gradBrand,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: LiriunColors.violet700.withValues(alpha: 0.45),
                        blurRadius: 60,
                        offset: const Offset(0, 24),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.mic_rounded,
                      color: Colors.white, size: 48),
                ),
              ],
            ),
          ),
          const Padding(
            padding: EdgeInsets.only(bottom: 32),
            child: Column(
              children: [
                Text(
                  'Diga.\nEstá feito.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.8,
                    color: LiriunColors.text,
                    height: 1.1,
                  ),
                ),
                SizedBox(height: 14),
                Text(
                  'Aperte uma vez no microfone e fale como pensa. Liriun cria a tarefa no formato certo.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: LiriunColors.textMuted,
                    height: 1.5,
                    letterSpacing: -0.1,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── 2. Liriun te entende. ────────────────────────────────
class _PageEntende extends StatefulWidget {
  const _PageEntende();

  @override
  State<_PageEntende> createState() => _PageEntendeState();
}

class _PageEntendeState extends State<_PageEntende>
    with SingleTickerProviderStateMixin {
  late final AnimationController _shimmer;

  @override
  void initState() {
    super.initState();
    _shimmer = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
  }

  @override
  void dispose() {
    _shimmer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 22),
      child: Column(
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // User bubble (alinhada direita)
                Align(
                  alignment: Alignment.centerRight,
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 280),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 11),
                      decoration: BoxDecoration(
                        gradient: LiriunColors.gradBrand,
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(18),
                          topRight: Radius.circular(18),
                          bottomLeft: Radius.circular(18),
                          bottomRight: Radius.circular(6),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: LiriunColors.violet700
                                .withValues(alpha: 0.28),
                            blurRadius: 22,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Text(
                        '"Reunião com a Marina amanhã às 9, prioridade alta"',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                          letterSpacing: -0.1,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                // Card extraído com shimmer
                AnimatedBuilder(
                  animation: _shimmer,
                  builder: (context, _) {
                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0x0AFFFFFF),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: LiriunColors.borderHi),
                      ),
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: FractionalTranslation(
                                translation: Offset(_shimmer.value * 2 - 1, 0),
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.transparent,
                                        LiriunColors.violet400
                                            .withValues(alpha: 0.10),
                                        Colors.transparent,
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 14,
                                    height: 14,
                                    decoration: const BoxDecoration(
                                      gradient: LiriunColors.gradBrand,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.auto_awesome,
                                      size: 9,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text(
                                    'EXTRAÍDO',
                                    style: TextStyle(
                                      fontFamily: 'Geist Mono',
                                      fontSize: 9,
                                      letterSpacing: 1.2,
                                      fontWeight: FontWeight.w500,
                                      color: LiriunColors.textFaint,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              const Text(
                                'Reunião com a Marina',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: LiriunColors.text,
                                  letterSpacing: -0.2,
                                  height: 1.3,
                                ),
                              ),
                              const SizedBox(height: 12),
                              for (final p in const [
                                ('QUANDO', 'Amanhã, 09:00'),
                                ('PESSOA', 'Marina'),
                                ('PRIORIDADE', 'Alta'),
                              ]) ...[
                                Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 4),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        p.$1,
                                        style: const TextStyle(
                                          fontFamily: 'Geist Mono',
                                          fontSize: 10,
                                          letterSpacing: 0.4,
                                          color: LiriunColors.textFaint,
                                        ),
                                      ),
                                      Text(
                                        p.$2,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                          color: LiriunColors.text,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const Padding(
            padding: EdgeInsets.only(bottom: 28),
            child: Column(
              children: [
                Text(
                  'Liriun te entende.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.6,
                    color: LiriunColors.text,
                    height: 1.15,
                  ),
                ),
                SizedBox(height: 12),
                Text(
                  'Datas, pessoas, prioridade — tudo extraído no formato certo.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: LiriunColors.textMuted,
                    height: 1.5,
                    letterSpacing: -0.1,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── 3. Em qualquer lugar. ────────────────────────────────
class _PageQualquerLugar extends StatefulWidget {
  const _PageQualquerLugar();

  @override
  State<_PageQualquerLugar> createState() => _PageQualquerLugarState();
}

class _PageQualquerLugarState extends State<_PageQualquerLugar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _orbit;

  @override
  void initState() {
    super.initState();
    _orbit = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 24),
    )..repeat();
  }

  @override
  void dispose() {
    _orbit.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 22),
      child: Column(
        children: [
          Expanded(
            child: Center(
              child: SizedBox(
                width: 240,
                height: 240,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    AnimatedBuilder(
                      animation: _orbit,
                      builder: (context, _) => Transform.rotate(
                        angle: _orbit.value * 6.283,
                        child: CustomPaint(
                          size: const Size(220, 220),
                          painter: _OrbitPainter(),
                        ),
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        boxShadow: [
                          BoxShadow(
                            color: LiriunColors.violet700
                                .withValues(alpha: 0.4),
                            blurRadius: 28,
                            offset: const Offset(0, 12),
                          ),
                        ],
                      ),
                      child: const LiriunMark(size: 64),
                    ),
                    const Align(
                      alignment: Alignment.topCenter,
                      child: _DeviceChip(label: 'iOS'),
                    ),
                    const Align(
                      alignment: Alignment.centerRight,
                      child: _DeviceChip(label: 'Android'),
                    ),
                    const Align(
                      alignment: Alignment.bottomCenter,
                      child: _DeviceChip(label: 'Web'),
                    ),
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: _DeviceChip(label: 'Watch'),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const Padding(
            padding: EdgeInsets.only(bottom: 28),
            child: Column(
              children: [
                Text(
                  'Em qualquer lugar.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.7,
                    color: LiriunColors.text,
                    height: 1.1,
                  ),
                ),
                SizedBox(height: 12),
                Text(
                  'Sincronia em tempo real entre iOS, Android, watch e web.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: LiriunColors.textMuted,
                    height: 1.5,
                    letterSpacing: -0.1,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OrbitPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1
      ..color = LiriunColors.violet400.withValues(alpha: 0.22);
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 4;
    const dashLen = 6.0;
    const gap = 6.0;
    final circ = 2 * 3.14159265 * radius;
    final dashes = (circ / (dashLen + gap)).floor();
    for (var i = 0; i < dashes; i++) {
      final start = (i * (dashLen + gap)) / radius;
      final end = ((i * (dashLen + gap)) + dashLen) / radius;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        start,
        end - start,
        false,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

class _DeviceChip extends StatelessWidget {
  const _DeviceChip({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: LiriunColors.surfaceHi,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: LiriunColors.borderHi),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: LiriunColors.violet400,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 9,
              fontWeight: FontWeight.w500,
              letterSpacing: 0.4,
              color: LiriunColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
