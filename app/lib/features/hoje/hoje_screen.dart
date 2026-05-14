import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/session_provider.dart';
import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../models/task.dart';
import '../../models/task_mapper.dart';

enum TodayVariant { morning, midday, evening }

class HojeScreen extends ConsumerWidget {
  const HojeScreen({super.key});

  TodayVariant _variant(int h) {
    if (h >= 5 && h < 12) return TodayVariant.morning;
    if (h >= 12 && h < 19) return TodayVariant.midday;
    return TodayVariant.evening;
  }

  String _saudacao(TodayVariant v) => switch (v) {
        TodayVariant.morning => 'Bom dia,',
        TodayVariant.midday => 'Boa tarde,',
        TodayVariant.evening => 'Boa noite,',
      };

  String _kicker(DateTime now) {
    const dias = [
      'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO'
    ];
    final dia = dias[now.weekday - 1];
    final hh = now.hour.toString().padLeft(2, '0');
    final mm = now.minute.toString().padLeft(2, '0');
    return '$dia · $hh:$mm';
  }

  bool _isToday(DateTime d) {
    final n = DateTime.now();
    return d.year == n.year && d.month == n.month && d.day == n.day;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final now = DateTime.now();
    final variant = _variant(now.hour);
    final session = ref.watch(sessionControllerProvider).valueOrNull;
    final nome = session?.usuario.nome.split(' ').first ?? 'você';
    final pendentesAsync = ref.watch(pendentesProvider);

    return Scaffold(
      backgroundColor: LiriunColors.surface,
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          color: LiriunColors.violet300,
          backgroundColor: LiriunColors.surfaceHi,
          onRefresh: () async => ref.invalidate(pendentesProvider),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(18, 22, 18, 140),
            child: pendentesAsync.when(
              loading: () => _greetingOnly(variant, nome, now),
              error: (e, _) => _greetingOnly(variant, nome, now),
              data: (dtos) {
                final hojeList = dtos
                    .where((t) => _isToday(t.dataPrazo) || t.status == 3)
                    .map((d) => d.toTask())
                    .toList()
                  ..sort((a, b) => (a.scheduledFor ?? a.createdAt)
                      .compareTo(b.scheduledFor ?? b.createdAt));
                final next = hojeList.firstWhere(
                  (t) => t.completedAt == null,
                  orElse: () => hojeList.isEmpty
                      ? Task(
                          id: '',
                          title: '',
                          createdAt: now,
                          category: Category.personal,
                        )
                      : hojeList.first,
                );
                final hasNext = next.id.isNotEmpty;
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _greetingRow(context, variant, nome, now),
                    const SizedBox(height: 22),
                    _DayShapeCard(tasks: hojeList, now: now),
                    const SizedBox(height: 14),
                    _LiriunSugereCard(variant: variant, nome: nome),
                    const SizedBox(height: 18),
                    if (hasNext) ...[
                      _NextHeader(timeUntil: _timeUntil(next.scheduledFor, now)),
                      const SizedBox(height: 8),
                      _NextTaskCard(
                        task: next,
                        onTap: () => context.push('/task/${next.id}'),
                      ),
                    ] else
                      _EmptyState(),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _greetingOnly(TodayVariant v, String nome, DateTime now) {
    return Builder(
      builder: (context) => _greetingRow(context, v, nome, now),
    );
  }

  Widget _greetingRow(
      BuildContext context, TodayVariant v, String nome, DateTime now) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _kicker(now),
                style: const TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 1.4,
                  color: LiriunColors.textFaint,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              RichText(
                text: TextSpan(
                  style: const TextStyle(
                    fontFamily: 'Geist',
                    fontSize: 26,
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.6,
                    color: LiriunColors.text,
                    height: 1.1,
                  ),
                  children: [
                    TextSpan(text: '${_saudacao(v)}\n'),
                    TextSpan(
                      text: '$nome.',
                      style: const TextStyle(color: LiriunColors.violet300),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => context.push('/configuracoes'),
            borderRadius: BorderRadius.circular(LiriunRadii.sm),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0x0AFFFFFF),
                borderRadius: BorderRadius.circular(LiriunRadii.sm),
                border: Border.all(color: LiriunColors.borderHi),
              ),
              child: const Icon(Icons.settings_outlined,
                  size: 18, color: LiriunColors.textMuted),
            ),
          ),
        ),
      ],
    );
  }

  String _timeUntil(DateTime? when, DateTime now) {
    if (when == null) return '';
    final diff = when.difference(now);
    if (diff.isNegative) return 'atrasada';
    final h = diff.inHours;
    final m = diff.inMinutes % 60;
    if (h > 0) return 'em ${h}h ${m}m';
    return 'em ${m}m';
  }
}

class _DayShapeCard extends StatelessWidget {
  const _DayShapeCard({required this.tasks, required this.now});
  final List<Task> tasks;
  final DateTime now;

  double _pct(DateTime t) {
    final h = t.hour + t.minute / 60;
    final c = h.clamp(6.0, 22.0);
    return (c - 6) / 16;
  }

  @override
  Widget build(BuildContext context) {
    final scheduled = tasks.where((t) => t.scheduledFor != null).toList();
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 14, 12, 12),
      decoration: BoxDecoration(
        color: const Color(0x06FFFFFF),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'O DIA',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 0.6,
                  color: LiriunColors.textFaint,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '${scheduled.length} MOMENTO${scheduled.length == 1 ? '' : 'S'}',
                style: const TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 0.4,
                  color: LiriunColors.violet300,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 32,
            child: LayoutBuilder(
              builder: (context, c) {
                final w = c.maxWidth;
                final nowX = w * _pct(now);
                return Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Positioned(
                      top: 14,
                      left: 0,
                      right: 0,
                      child: Container(
                        height: 2,
                        decoration: BoxDecoration(
                          color: const Color(0x0FFFFFFF),
                          borderRadius: BorderRadius.circular(1),
                        ),
                      ),
                    ),
                    for (final t in scheduled) ...[
                      Positioned(
                        left: w * _pct(t.scheduledFor!) - 2,
                        top: 7,
                        child: Container(
                          width: 4,
                          height: 16,
                          decoration: BoxDecoration(
                            color: t.category.color,
                            borderRadius: BorderRadius.circular(2),
                            boxShadow: [
                              BoxShadow(
                                color: t.category.color.withValues(alpha: 0.4),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                    Positioned(
                      left: nowX - 6,
                      top: 9,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.white.withValues(alpha: 0.10),
                              blurRadius: 0,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                      ),
                    ),
                    for (final hh in [0.0, 0.375, 0.5625, 0.75, 1.0])
                      Positioned(
                        left: w * hh - 8,
                        top: 24,
                        child: Text(
                          {
                            0.0: '06',
                            0.375: '12',
                            0.5625: '15',
                            0.75: '18',
                            1.0: '22',
                          }[hh]!,
                          style: const TextStyle(
                            fontFamily: 'Geist Mono',
                            fontSize: 8,
                            letterSpacing: 0.4,
                            color: LiriunColors.textFaint,
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _LiriunSugereCard extends StatelessWidget {
  const _LiriunSugereCard({required this.variant, required this.nome});
  final TodayVariant variant;
  final String nome;

  @override
  Widget build(BuildContext context) {
    final body = switch (variant) {
      TodayVariant.morning =>
        'Comece pelo bloco que pesa menos. O resto flui.',
      TodayVariant.midday => 'Pausa rápida, $nome. Depois retoma com clareza.',
      TodayVariant.evening =>
        'Encerre o dia com leveza. Amanhã começa cedo.',
    };
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            LiriunColors.violet400.withValues(alpha: 0.12),
            LiriunColors.violet700.withValues(alpha: 0.04),
          ],
        ),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        border:
            Border.all(color: LiriunColors.violet400.withValues(alpha: 0.28)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: const BoxDecoration(
                  gradient: LiriunColors.gradBrand,
                  shape: BoxShape.circle,
                ),
                child:
                    const Icon(Icons.auto_awesome, size: 10, color: Colors.white),
              ),
              const SizedBox(width: 6),
              const Text(
                'LIRIUN SUGERE',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 1.4,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.violet300,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: LiriunColors.text,
              height: 1.45,
              letterSpacing: -0.1,
            ),
          ),
        ],
      ),
    );
  }
}

class _NextHeader extends StatelessWidget {
  const _NextHeader({required this.timeUntil});
  final String timeUntil;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          timeUntil.isEmpty ? 'A SEGUIR' : 'A SEGUIR · $timeUntil',
          style: const TextStyle(
            fontFamily: 'Geist Mono',
            fontSize: 9,
            letterSpacing: 1.2,
            color: LiriunColors.textFaint,
            fontWeight: FontWeight.w600,
          ),
        ),
        GestureDetector(
          onTap: () => GoRouter.of(context).go('/tarefas'),
          child: const Text(
            'VER TUDO',
            style: TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 9,
              letterSpacing: 0.4,
              color: LiriunColors.violet300,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class _NextTaskCard extends StatelessWidget {
  const _NextTaskCard({required this.task, required this.onTap});
  final Task task;
  final VoidCallback onTap;

  String _hora(DateTime? d) {
    if (d == null) return '';
    final h = d.hour.toString().padLeft(2, '0');
    final m = d.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  bool get _alta => task.priority == Priority.high;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0x0AFFFFFF),
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            border: Border.all(color: LiriunColors.borderHi),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: LiriunColors.text,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Container(
                          width: 5,
                          height: 5,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: task.category.color,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          task.category.label,
                          style: const TextStyle(
                            fontSize: 10,
                            color: LiriunColors.textMuted,
                          ),
                        ),
                        if (task.scheduledFor != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            _hora(task.scheduledFor),
                            style: const TextStyle(
                              fontFamily: 'Geist Mono',
                              fontSize: 10,
                              color: LiriunColors.textFaint,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              if (_alta)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0x1AF0B36E),
                    border: Border.all(color: const Color(0x47F0B36E)),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'ALTA',
                    style: TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 9,
                      letterSpacing: 0.4,
                      color: Color(0xFFF0B36E),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0x05FFFFFF),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Column(
        children: const [
          Icon(Icons.event_available_outlined,
              color: LiriunColors.textFaint, size: 28),
          SizedBox(height: 10),
          Text(
            'Dia limpo.',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: LiriunColors.text,
              letterSpacing: -0.2,
            ),
          ),
          SizedBox(height: 4),
          Text(
            'Toque no mic pra adicionar.',
            style: TextStyle(
              fontSize: 12,
              color: LiriunColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
