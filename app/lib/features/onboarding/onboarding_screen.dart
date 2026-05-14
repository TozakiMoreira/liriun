import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/liriun_tokens.dart';
import '../../widgets/liriun_mark.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pageController = PageController();
  int _page = 0;

  final _pages = const [
    _OnbPage(
      kicker: 'BEM-VINDO',
      title: 'Fale como',
      titleAccent: 'pensa.',
      body: 'Toque no mic e diga sua tarefa. Liriun extrai data, hora, pessoa e prioridade automaticamente.',
      icon: Icons.mic_rounded,
    ),
    _OnbPage(
      kicker: 'ELE APRENDE',
      title: 'Conhece você',
      titleAccent: 'cada dia.',
      body: 'Liriun observa seu ritmo. Sugere quando agir, mostra padrões, celebra cada streak.',
      icon: Icons.auto_awesome,
    ),
    _OnbPage(
      kicker: 'VAMOS COMEÇAR',
      title: 'Tudo pronto,',
      titleAccent: 'aperte abaixo.',
      body: 'Suas tarefas, sua agenda, seus insights — tudo em um lugar. Sem fricção.',
      icon: Icons.check_circle_outline_rounded,
    ),
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
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LiriunColors.bg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const LiriunMark(size: 28),
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
                itemBuilder: (context, i) => _pages[i],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 28),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_pages.length, (i) {
                      final active = i == _page;
                      return AnimatedContainer(
                        duration: LiriunDurations.base,
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: active ? 22 : 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: active
                              ? LiriunColors.violet400
                              : const Color(0x33FFFFFF),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 22),
                  GestureDetector(
                    onTap: _next,
                    child: Container(
                      height: 56,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        gradient: LiriunColors.gradBrand,
                        borderRadius: BorderRadius.circular(LiriunRadii.md),
                        boxShadow: [
                          BoxShadow(
                            color: LiriunColors.violet700
                                .withValues(alpha: 0.35),
                            blurRadius: 22,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Text(
                        _page == _pages.length - 1 ? 'Começar' : 'Continuar',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnbPage extends StatelessWidget {
  const _OnbPage({
    required this.kicker,
    required this.title,
    required this.titleAccent,
    required this.body,
    required this.icon,
  });

  final String kicker;
  final String title;
  final String titleAccent;
  final String body;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 28),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  LiriunColors.violet400.withValues(alpha: 0.15),
                  LiriunColors.violet700.withValues(alpha: 0.05),
                ],
              ),
              borderRadius: BorderRadius.circular(LiriunRadii.xl),
              border: Border.all(
                  color: LiriunColors.violet400.withValues(alpha: 0.28)),
            ),
            child: Icon(icon, size: 32, color: LiriunColors.violet300),
          ),
          const SizedBox(height: 28),
          Text(
            kicker,
            style: const TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 10,
              letterSpacing: 1.6,
              fontWeight: FontWeight.w600,
              color: LiriunColors.violet300,
            ),
          ),
          const SizedBox(height: 10),
          RichText(
            text: TextSpan(
              style: const TextStyle(
                fontFamily: 'Geist',
                fontSize: 36,
                fontWeight: FontWeight.w600,
                letterSpacing: -1.2,
                color: LiriunColors.text,
                height: 1.05,
              ),
              children: [
                TextSpan(text: '$title\n'),
                WidgetSpan(
                  child: ShaderMask(
                    shaderCallback: (b) =>
                        LiriunColors.gradBrand.createShader(b),
                    child: Text(
                      titleAccent,
                      style: const TextStyle(
                        fontFamily: 'Geist',
                        fontSize: 36,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -1.2,
                        color: Colors.white,
                        height: 1.05,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            body,
            style: const TextStyle(
              fontSize: 15,
              color: LiriunColors.textMuted,
              height: 1.55,
              letterSpacing: -0.1,
            ),
          ),
        ],
      ),
    );
  }
}
