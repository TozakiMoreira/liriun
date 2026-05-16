import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/liriun_tokens.dart';
import '../../widgets/liriun_mark.dart';

/// Preview de como notificação Liriun aparece na lock screen.
/// Acessível em Configurações > Notificações.
class NotificationPreviewScreen extends ConsumerWidget {
  const NotificationPreviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(-0.5, -0.6),
                  radius: 1.2,
                  colors: [
                    LiriunColors.violet400.withValues(alpha: 0.30),
                    Colors.transparent,
                  ],
                  stops: const [0.0, 0.6],
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(0.7, 0.7),
                  radius: 1.4,
                  colors: [
                    LiriunColors.violet700.withValues(alpha: 0.22),
                    Colors.transparent,
                  ],
                  stops: const [0.0, 0.6],
                ),
              ),
            ),
          ),
          Container(color: const Color(0xFF0A0C12).withValues(alpha: 0.55)),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(4, 8, 4, 0),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => context.pop(),
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: const Color(0x1AFFFFFF),
                              borderRadius: BorderRadius.circular(99),
                            ),
                            child: const Icon(Icons.chevron_left_rounded,
                                size: 22, color: Colors.white),
                          ),
                        ),
                        const Spacer(),
                        const Text(
                          'PREVIEW · NOTIFICAÇÃO',
                          style: TextStyle(
                            fontFamily: 'Geist Mono',
                            fontSize: 10,
                            letterSpacing: 1.6,
                            color: Color(0xCCFFFFFF),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const Spacer(),
                        const SizedBox(width: 32),
                      ],
                    ),
                  ),
                  const SizedBox(height: 60),
                  const _LockTime(),
                  const SizedBox(height: 36),
                  const _NotificationPrimary(),
                  const SizedBox(height: 8),
                  const _NotificationSecondary(),
                  const Spacer(),
                  const _LiriunWidget(),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LockTime extends StatelessWidget {
  const _LockTime();
  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    const dias = [
      'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO'
    ];
    const meses = [
      'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
    ];
    return Column(
      children: [
        Text(
          '${dias[now.weekday - 1]}, ${now.day} ${meses[now.month - 1]}',
          style: const TextStyle(
            fontFamily: 'Geist Mono',
            fontSize: 12,
            letterSpacing: 1.4,
            color: Color(0xA6FFFFFF),
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}',
          style: const TextStyle(
            fontSize: 76,
            fontWeight: FontWeight.w300,
            color: Colors.white,
            letterSpacing: -2,
            height: 1,
          ),
        ),
      ],
    );
  }
}

class _NotificationPrimary extends StatelessWidget {
  const _NotificationPrimary();

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 28, sigmaY: 28),
        child: Container(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
          decoration: BoxDecoration(
            color: const Color(0xC714161C),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0x1FFFFFFF)),
            boxShadow: const [
              BoxShadow(
                color: Color(0x8C000000),
                blurRadius: 32,
                offset: Offset(0, 12),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      gradient: LiriunColors.gradBrand,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Padding(
                      padding: EdgeInsets.all(2),
                      child: LiriunMark(size: 18),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'LIRIUN',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                      letterSpacing: -0.1,
                    ),
                  ),
                  const Spacer(),
                  const Text(
                    'agora',
                    style: TextStyle(
                      fontSize: 11,
                      color: Color(0x8CFFFFFF),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              const Text(
                'Marina te espera em 15 minutos.',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                  letterSpacing: -0.2,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Quer que eu avise que você está a caminho?',
                style: TextStyle(
                  fontSize: 12,
                  color: Color(0xB8FFFFFF),
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    flex: 5,
                    child: _ActionBtn(
                      label: 'Avisar',
                      primary: true,
                      onTap: () {},
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    flex: 5,
                    child: _ActionBtn(
                      label: 'Adiar 10min',
                      onTap: () {},
                    ),
                  ),
                  const SizedBox(width: 6),
                  _ActionBtn(
                    label: '···',
                    iconOnly: true,
                    onTap: () {},
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  const _ActionBtn({
    required this.label,
    required this.onTap,
    this.primary = false,
    this.iconOnly = false,
  });
  final String label;
  final VoidCallback onTap;
  final bool primary;
  final bool iconOnly;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 32,
        width: iconOnly ? 36 : null,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: primary
              ? LiriunColors.violet400.withValues(alpha: 0.20)
              : iconOnly
                  ? const Color(0x10FFFFFF)
                  : const Color(0x1AFFFFFF),
          borderRadius: BorderRadius.circular(9),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: iconOnly ? 14 : 11,
            fontWeight: primary ? FontWeight.w600 : FontWeight.w500,
            color: primary
                ? const Color(0xFFC8B6FF)
                : iconOnly
                    ? const Color(0x8CFFFFFF)
                    : Colors.white,
            letterSpacing: -0.1,
          ),
        ),
      ),
    );
  }
}

class _NotificationSecondary extends StatelessWidget {
  const _NotificationSecondary();

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: 0.86,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
            decoration: BoxDecoration(
              color: const Color(0x8514161C),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0x0FFFFFFF)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        gradient: LiriunColors.gradBrand,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Padding(
                        padding: EdgeInsets.all(1.5),
                        child: LiriunMark(size: 13),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'LIRIUN',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                        letterSpacing: -0.1,
                      ),
                    ),
                    const Spacer(),
                    const Text(
                      '2h atrás',
                      style: TextStyle(
                        fontSize: 10,
                        color: Color(0x73FFFFFF),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  '3 tarefas concluídas hoje. Você está adiantado.',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xD9FFFFFF),
                    letterSpacing: -0.1,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _LiriunWidget extends StatelessWidget {
  const _LiriunWidget();

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 32, sigmaY: 32),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xB80E1014),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0x1AFFFFFF)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      gradient: LiriunColors.gradBrand,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Padding(
                      padding: EdgeInsets.all(2),
                      child: LiriunMark(size: 18),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'SEU DIA · WIDGET',
                    style: TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 11,
                      letterSpacing: 1.2,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              RichText(
                text: const TextSpan(
                  style: TextStyle(
                    fontFamily: 'Geist',
                    fontSize: 12,
                    color: Color(0xD9FFFFFF),
                    height: 1.5,
                    letterSpacing: -0.1,
                  ),
                  children: [
                    TextSpan(
                      text: 'Marina · 13:00',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    TextSpan(text: '  ·  '),
                    TextSpan(
                      text: 'Acme · 15:30',
                      style: TextStyle(color: Color(0x8CFFFFFF)),
                    ),
                    TextSpan(text: '  ·  '),
                    TextSpan(
                      text: 'Lucas Jr · 17:30',
                      style: TextStyle(color: Color(0x8CFFFFFF)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: List.generate(6, (i) {
                  final done = i < 3;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 1.5),
                      child: Container(
                        height: 3,
                        decoration: BoxDecoration(
                          gradient: done ? LiriunColors.gradBrand : null,
                          color: done ? null : const Color(0x1AFFFFFF),
                          borderRadius: BorderRadius.circular(99),
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
