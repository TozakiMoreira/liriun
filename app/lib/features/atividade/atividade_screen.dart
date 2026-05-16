import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../widgets/empty_state.dart';

class AtividadeScreen extends ConsumerWidget {
  const AtividadeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final concluidasAsync = ref.watch(concluidasProvider);
    final pendentesAsync = ref.watch(pendentesProvider);

    return Scaffold(
      backgroundColor: LiriunColors.surface,
      body: SafeArea(
        bottom: false,
        child: concluidasAsync.when(
          loading: () => const Center(
            child: CircularProgressIndicator(color: LiriunColors.violet300),
          ),
          error: (e, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Text('Erro: $e',
                  style: const TextStyle(color: LiriunColors.danger)),
            ),
          ),
          data: (concluidas) {
            final pendentes = pendentesAsync.valueOrNull ?? [];

            // 52 semanas — count completions per week
            final weeks = List<int>.filled(52, 0);
            final now = DateTime.now();
            for (final t in concluidas) {
              if (t.concluidaEm == null) continue;
              final diff = now.difference(t.concluidaEm!).inDays;
              if (diff < 0 || diff >= 364) continue;
              final w = 51 - (diff ~/ 7);
              if (w >= 0 && w < 52) weeks[w] += 1;
            }
            final total = concluidas.length;

            // Streak: dias consecutivos terminados em hoje com >= 1 conclusao
            final datesSet = <String>{};
            for (final t in concluidas) {
              if (t.concluidaEm != null) {
                final d = t.concluidaEm!;
                datesSet.add('${d.year}-${d.month}-${d.day}');
              }
            }
            var streak = 0;
            var cursor = DateTime(now.year, now.month, now.day);
            while (datesSet
                .contains('${cursor.year}-${cursor.month}-${cursor.day}')) {
              streak++;
              cursor = cursor.subtract(const Duration(days: 1));
            }

            // Categoria dominante
            final catCount = <String, int>{};
            for (final t in concluidas) {
              for (final c in t.categorias) {
                catCount[c.nome] = (catCount[c.nome] ?? 0) + 1;
              }
            }
            final topCat = catCount.entries.isEmpty
                ? null
                : (catCount.entries.toList()..sort((a, b) => b.value.compareTo(a.value)))
                    .first;

            // Dia mais produtivo
            final byWeekday = List<int>.filled(7, 0);
            for (final t in concluidas) {
              if (t.concluidaEm != null) byWeekday[t.concluidaEm!.weekday - 1]++;
            }
            final bestDayIdx = byWeekday.indexOf(byWeekday.fold(0, (a, b) => b > a ? b : a));

            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(18, 22, 18, 140),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Text(
                    'SUA JORNADA · ${now.year}',
                    style: const TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 9,
                      letterSpacing: 1.4,
                      fontWeight: FontWeight.w600,
                      color: LiriunColors.textFaint,
                    ),
                  ),
                  const SizedBox(height: 4),
                  RichText(
                    text: TextSpan(
                      style: const TextStyle(
                        fontFamily: 'Geist',
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -0.5,
                        color: LiriunColors.text,
                        height: 1.1,
                      ),
                      children: [
                        const TextSpan(text: 'Constância,\n'),
                        WidgetSpan(
                          child: ShaderMask(
                            shaderCallback: (b) =>
                                LiriunColors.gradBrand.createShader(b),
                            child: const Text(
                              'não perfeição.',
                              style: TextStyle(
                                fontFamily: 'Geist',
                                fontSize: 24,
                                fontWeight: FontWeight.w600,
                                letterSpacing: -0.5,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  if (total == 0) ...[
                    const EmptyState(
                      icon: Icons.insights_outlined,
                      title: 'Liriun ainda está te conhecendo.',
                      body: 'Conclua suas primeiras tarefas pra ver padrões aqui.',
                    ),
                  ] else ...[
                    _StreakCard(streak: streak),
                    const SizedBox(height: 14),
                    GestureDetector(
                      onTap: () => context.push('/share'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 16),
                        decoration: BoxDecoration(
                          gradient: LiriunColors.gradBrand,
                          borderRadius: BorderRadius.circular(LiriunRadii.md),
                          boxShadow: [
                            BoxShadow(
                              color: LiriunColors.violet500
                                  .withValues(alpha: 0.40),
                              blurRadius: 22,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.20),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.auto_awesome_rounded,
                                  size: 20, color: Colors.white),
                            ),
                            const SizedBox(width: 14),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Compartilhar conquista',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                  SizedBox(height: 3),
                                  Text(
                                    'Gera um card com streak + tarefas + ritmo.',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Color(0xCCFFFFFF),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.arrow_forward_rounded,
                                size: 18, color: Colors.white),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    _YearHeat(weeks: weeks, total: total),
                    const SizedBox(height: 18),
                    _Insights(
                      bestDay: bestDayIdx,
                      topCat: topCat?.key,
                      voicePct: _computeVoicePct(pendentes.length + total),
                      total: total,
                    ),
                  ],
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  // Placeholder: backend não rastreia origem voz/texto ainda
  int _computeVoicePct(int _) => 0;
}

class _YearHeat extends StatelessWidget {
  const _YearHeat({required this.weeks, required this.total});
  final List<int> weeks;
  final int total;

  Color _heat(int n) {
    if (n == 0) return const Color(0x0AFFFFFF);
    if (n <= 1) return LiriunColors.violet400.withValues(alpha: 0.18);
    if (n <= 3) return LiriunColors.violet400.withValues(alpha: 0.32);
    if (n <= 5) return LiriunColors.violet400.withValues(alpha: 0.50);
    return LiriunColors.violet400.withValues(alpha: 0.72);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
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
                '52 SEMANAS',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.textFaint,
                ),
              ),
              Text(
                '$total CONCLUÍDAS',
                style: const TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 0.4,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.violet300,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              for (final w in weeks)
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 1),
                    child: Container(
                      height: 22,
                      decoration: BoxDecoration(
                        color: _heat(w),
                        borderRadius: BorderRadius.circular(2),
                        border: Border.all(
                          color: LiriunColors.violet400.withValues(alpha: 0.06),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              _MonthLabel('JAN'),
              _MonthLabel('ABR'),
              _MonthLabel('JUL'),
              _MonthLabel('OUT'),
              _MonthLabel('DEZ'),
            ],
          ),
        ],
      ),
    );
  }
}

class _MonthLabel extends StatelessWidget {
  const _MonthLabel(this.label);
  final String label;
  @override
  Widget build(BuildContext context) => Text(
        label,
        style: const TextStyle(
          fontFamily: 'Geist Mono',
          fontSize: 8,
          letterSpacing: 0.4,
          color: LiriunColors.textFaint,
        ),
      );
}

class _Insights extends StatelessWidget {
  const _Insights({
    required this.bestDay,
    required this.topCat,
    required this.voicePct,
    required this.total,
  });
  final int bestDay;
  final String? topCat;
  final int voicePct;
  final int total;

  String _diaNome(int idx) {
    const nomes = ['segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados', 'domingos'];
    if (idx < 0 || idx >= 7) return 'dias variados';
    return nomes[idx];
  }

  @override
  Widget build(BuildContext context) {
    final insights = <_Insight>[
      if (total >= 3)
        _Insight(
            icon: '◷',
            label: 'Você é mais produtivo às ${_diaNome(bestDay)}',
            desc: 'Histórico aponta esse padrão.'),
      if (topCat != null)
        _Insight(
            icon: '↗',
            label: '$topCat lidera a sua semana',
            desc: 'Categoria com mais conclusões.'),
      _Insight(
          icon: '✱',
          label: total < 10 ? 'Comece pequeno' : 'Constância > velocidade',
          desc: total < 10
              ? '$total ${total == 1 ? "tarefa concluída" : "tarefas concluídas"} até agora.'
              : '$total concluídas. Seu ritmo é seu maior trunfo.'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'LIRIUN APRENDEU',
          style: TextStyle(
            fontFamily: 'Geist Mono',
            fontSize: 9,
            letterSpacing: 1.2,
            fontWeight: FontWeight.w600,
            color: LiriunColors.textFaint,
          ),
        ),
        const SizedBox(height: 10),
        for (final i in insights) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0x06FFFFFF),
              borderRadius: BorderRadius.circular(LiriunRadii.md),
              border: Border.all(color: LiriunColors.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    color: LiriunColors.violet400.withValues(alpha: 0.10),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    i.icon,
                    style: const TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 14,
                      color: LiriunColors.violet300,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        i.label,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: LiriunColors.text,
                          letterSpacing: -0.1,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        i.desc,
                        style: const TextStyle(
                          fontSize: 11,
                          color: LiriunColors.textMuted,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
      ],
    );
  }
}

class _Insight {
  _Insight({required this.icon, required this.label, required this.desc});
  final String icon;
  final String label;
  final String desc;
}

class _StreakCard extends StatelessWidget {
  const _StreakCard({required this.streak});
  final int streak;

  @override
  Widget build(BuildContext context) {
    final recorde = streak < 1 ? 1 : streak;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFFF0B36E).withValues(alpha: 0.10),
            LiriunColors.violet400.withValues(alpha: 0.06),
          ],
        ),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        border:
            Border.all(color: const Color(0xFFF0B36E).withValues(alpha: 0.24)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFF0B36E), LiriunColors.violet400],
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFF0B36E).withValues(alpha: 0.35),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: const Icon(Icons.local_fire_department_rounded,
                color: Colors.white, size: 22),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$streak ${streak == 1 ? "dia" : "dias"}',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.text,
                  letterSpacing: -0.5,
                  height: 1,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'STREAK ATUAL · RECORDE ${recorde}D',
                style: const TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 0.4,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFF0B36E),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
