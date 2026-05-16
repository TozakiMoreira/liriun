import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/error_message.dart';
import '../../core/api/session_provider.dart';
import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../models/task.dart';
import '../../models/task_mapper.dart';
import '../../widgets/avatar.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/liriun_mark.dart';
import '../../widgets/skeleton.dart';

enum TodayVariant { morning, midday, evening }

TodayVariant _variantFromHour(int h) {
  if (h >= 5 && h < 12) return TodayVariant.morning;
  if (h >= 12 && h < 19) return TodayVariant.midday;
  return TodayVariant.evening;
}

class HojeScreen extends ConsumerWidget {
  const HojeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final now = DateTime.now();
    final variant = _variantFromHour(now.hour);
    final session = ref.watch(sessionControllerProvider).valueOrNull;
    final nome = session?.usuario.nome.split(' ').first ?? 'você';
    final fotoUrl = session?.usuario.fotoUrl;

    final pendentesAsync = ref.watch(pendentesProvider);
    final concluidasAsync = ref.watch(concluidasProvider);

    return Scaffold(
      backgroundColor: variant == TodayVariant.evening
          ? const Color(0xFF0E0F18)
          : LiriunColors.surface,
      body: Stack(
        children: [
          if (variant == TodayVariant.evening)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 240,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: const Alignment(0.6, -1),
                    radius: 1.3,
                    colors: [
                      const Color(0xFFF0B36E).withValues(alpha: 0.14),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.7],
                  ),
                ),
              ),
            ),
          SafeArea(
            bottom: false,
            child: RefreshIndicator(
              color: LiriunColors.violet300,
              backgroundColor: LiriunColors.surfaceHi,
              onRefresh: () async {
                ref.invalidate(pendentesProvider);
                ref.invalidate(concluidasProvider);
              },
              child: pendentesAsync.when(
                loading: () => const Padding(
                  padding: EdgeInsets.fromLTRB(20, 22, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Skeleton(width: 120, height: 9, radius: 3),
                      SizedBox(height: 8),
                      Skeleton(width: 200, height: 28, radius: 6),
                      SizedBox(height: 22),
                      Skeleton(height: 96, radius: 14),
                      SizedBox(height: 16),
                      TaskListSkeleton(count: 3),
                    ],
                  ),
                ),
                error: (e, _) => Center(
                  child: Text('Erro: $e',
                      style: const TextStyle(color: LiriunColors.danger)),
                ),
                data: (pendentes) {
                  final concluidas = concluidasAsync.valueOrNull ?? [];
                  final hojeTasks = pendentes
                      .where((t) => _isToday(t.dataPrazo) || t.status == 3)
                      .map((d) => d.toTask())
                      .toList()
                    ..sort((a, b) => (a.scheduledFor ?? a.createdAt)
                        .compareTo(b.scheduledFor ?? b.createdAt));
                  final feitasHoje = concluidas
                      .where(
                          (t) => t.concluidaEm != null && _isToday(t.concluidaEm!))
                      .map((d) => d.toTask())
                      .toList();
                  final amanha = DateTime.now().add(const Duration(days: 1));
                  final amanhaTasks = pendentes
                      .where((t) =>
                          t.dataPrazo.year == amanha.year &&
                          t.dataPrazo.month == amanha.month &&
                          t.dataPrazo.day == amanha.day)
                      .map((d) => d.toTask())
                      .toList()
                    ..sort((a, b) => (a.scheduledFor ?? a.createdAt)
                        .compareTo(b.scheduledFor ?? b.createdAt));
                  final streak = _calcStreak(concluidas);

                  switch (variant) {
                    case TodayVariant.morning:
                      return _MorningView(
                        nome: nome,
                        fotoUrl: fotoUrl,
                        now: now,
                        streak: streak,
                        hojeTasks: hojeTasks,
                      );
                    case TodayVariant.midday:
                      return _MiddayView(
                        nome: nome,
                        fotoUrl: fotoUrl,
                        now: now,
                        streak: streak,
                        pendentes: hojeTasks,
                        feitas: feitasHoje,
                      );
                    case TodayVariant.evening:
                      return _EveningView(
                        nome: nome,
                        fotoUrl: fotoUrl,
                        now: now,
                        streak: streak,
                        pendentes: hojeTasks,
                        feitas: feitasHoje,
                        amanhaTasks: amanhaTasks,
                      );
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  bool _isToday(DateTime d) {
    final n = DateTime.now();
    return d.year == n.year && d.month == n.month && d.day == n.day;
  }

  int _calcStreak(List<TarefaDto> concluidas) {
    final dates = <String>{};
    for (final t in concluidas) {
      if (t.concluidaEm != null) {
        final d = t.concluidaEm!;
        dates.add('${d.year}-${d.month}-${d.day}');
      }
    }
    var streak = 0;
    final now = DateTime.now();
    var cursor = DateTime(now.year, now.month, now.day);
    while (dates.contains('${cursor.year}-${cursor.month}-${cursor.day}')) {
      streak++;
      cursor = cursor.subtract(const Duration(days: 1));
    }
    return streak;
  }
}

String _kicker(DateTime now, String? sufixo) {
  const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  final hh = now.hour.toString().padLeft(2, '0');
  final mm = now.minute.toString().padLeft(2, '0');
  final base = '${dias[now.weekday - 1]} · $hh:$mm';
  return sufixo == null ? base : '$base · $sufixo';
}

Widget _topHeader({
  required BuildContext context,
  required String nome,
  required String? fotoUrl,
  required int streak,
  required DateTime now,
  required TodayVariant variant,
}) {
  final saudacao = switch (variant) {
    TodayVariant.morning => 'Bom dia,',
    TodayVariant.midday => 'Boa tarde,',
    TodayVariant.evening => 'Boa noite,',
  };
  return Row(
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      GestureDetector(
        onTap: () => context.push('/configuracoes'),
        child: LiriunAvatar(nome: nome, fotoUrl: fotoUrl, size: 48),
      ),
      const SizedBox(width: 12),
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _kicker(now, null),
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
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              text: TextSpan(
                style: const TextStyle(
                  fontFamily: 'Geist',
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.4,
                  color: LiriunColors.text,
                ),
                children: [
                  TextSpan(text: '$saudacao '),
                  TextSpan(
                    text: nome,
                    style: const TextStyle(color: LiriunColors.violet300),
                  ),
                  const TextSpan(text: '.'),
                ],
              ),
            ),
          ],
        ),
      ),
      if (streak > 0)
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF0B36E).withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(LiriunRadii.pill),
            border: Border.all(
                color: const Color(0xFFF0B36E).withValues(alpha: 0.32)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.local_fire_department_rounded,
                  size: 12, color: Color(0xFFF0B36E)),
              const SizedBox(width: 3),
              Text(
                '${streak}d',
                style: const TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFF0B36E),
                  letterSpacing: 0.4,
                ),
              ),
            ],
          ),
        ),
    ],
  );
}

Widget _sectionLabel(String text) => Text(
      text,
      style: const TextStyle(
        fontFamily: 'Geist Mono',
        fontSize: 9,
        letterSpacing: 1.2,
        fontWeight: FontWeight.w600,
        color: LiriunColors.textFaint,
      ),
    );

// ─── 1. MORNING ─────────────────────────────────────────
class _MorningView extends StatelessWidget {
  const _MorningView({
    required this.nome,
    required this.fotoUrl,
    required this.now,
    required this.streak,
    required this.hojeTasks,
  });

  final String nome;
  final String? fotoUrl;
  final DateTime now;
  final int streak;
  final List<Task> hojeTasks;

  String _timeUntil(DateTime? when) {
    if (when == null) return '';
    final diff = when.difference(now);
    if (diff.isNegative) return 'atrasada';
    final h = diff.inHours;
    final m = diff.inMinutes % 60;
    if (h > 0) return 'em ${h}h ${m}m';
    return 'em ${m}m';
  }

  @override
  Widget build(BuildContext context) {
    final next = hojeTasks.firstWhere(
      (t) => t.completedAt == null,
      orElse: () => Task(
        id: '',
        title: '',
        createdAt: now,
        category: Category.personal,
      ),
    );
    final hasNext = next.id.isNotEmpty;
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 140),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _topHeader(
            context: context,
            nome: nome,
            fotoUrl: fotoUrl,
            streak: streak,
            now: now,
            variant: TodayVariant.morning,
          ),
          const SizedBox(height: 22),
          _DayShape(tasks: hojeTasks, now: now),
          const SizedBox(height: 14),
          const _LiriunSugereMorning(),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _sectionLabel(hasNext
                  ? 'A SEGUIR · ${_timeUntil(next.scheduledFor)}'
                  : 'A SEGUIR'),
              GestureDetector(
                onTap: () => context.go('/tarefas'),
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
          ),
          const SizedBox(height: 8),
          if (hasNext)
            _NextTaskCard(
                task: next, onTap: () => context.push('/task/${next.id}'))
          else
            const EmptyState(
              icon: Icons.event_available_outlined,
              title: 'Dia limpo.',
              body: 'Toque no mic central pra adicionar.',
            ),
        ],
      ),
    );
  }
}

// ─── 2. MIDDAY ──────────────────────────────────────────
class _MiddayView extends StatelessWidget {
  const _MiddayView({
    required this.nome,
    required this.fotoUrl,
    required this.now,
    required this.streak,
    required this.pendentes,
    required this.feitas,
  });

  final String nome;
  final String? fotoUrl;
  final DateTime now;
  final int streak;
  final List<Task> pendentes;
  final List<Task> feitas;

  @override
  Widget build(BuildContext context) {
    final restantes = pendentes.where((t) => t.completedAt == null).toList();
    final total = pendentes.length + feitas.length;
    final done = feitas.length;
    final pct = total == 0 ? 0.0 : done / total;
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 140),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _topHeader(
            context: context,
            nome: nome,
            fotoUrl: fotoUrl,
            streak: streak,
            now: now,
            variant: TodayVariant.midday,
          ),
          const SizedBox(height: 18),
          ShaderMask(
            shaderCallback: (b) =>
                LiriunColors.gradBrand.createShader(b),
            child: Text(
              total == 0
                  ? 'Sem tarefas hoje.'
                  : '$done concluída${done == 1 ? '' : 's'}, ${restantes.length} aberta${restantes.length == 1 ? '' : 's'}.',
              style: const TextStyle(
                fontFamily: 'Geist',
                fontSize: 18,
                fontWeight: FontWeight.w500,
                letterSpacing: -0.3,
                color: Colors.white,
                height: 1.3,
              ),
            ),
          ),
          const SizedBox(height: 22),
          _ProgressRingCard(pct: pct, done: done, total: total),
          const SizedBox(height: 18),
          if (restantes.isNotEmpty) ...[
            _sectionLabel('RESTAM · ${restantes.length} TAREFA${restantes.length == 1 ? '' : 'S'}'),
            const SizedBox(height: 10),
            for (var i = 0; i < restantes.length; i++)
              _RemainingRow(
                task: restantes[i],
                showDivider: i < restantes.length - 1,
                onTap: () => context.push('/task/${restantes[i].id}'),
              ),
            const SizedBox(height: 18),
          ],
          if (feitas.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _sectionLabel('FEITO · ${feitas.length}'),
                if (streak > 0)
                  Text(
                    '+$streak STREAK',
                    style: const TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 9,
                      letterSpacing: 0.4,
                      color: LiriunColors.success,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 4,
              runSpacing: 4,
              children: [for (final t in feitas) _DoneChip(task: t)],
            ),
          ],
        ],
      ),
    );
  }
}

// ─── 3. EVENING ─────────────────────────────────────────
class _EveningView extends StatelessWidget {
  const _EveningView({
    required this.nome,
    required this.fotoUrl,
    required this.now,
    required this.streak,
    required this.pendentes,
    required this.feitas,
    required this.amanhaTasks,
  });

  final String nome;
  final String? fotoUrl;
  final DateTime now;
  final int streak;
  final List<Task> pendentes;
  final List<Task> feitas;
  final List<Task> amanhaTasks;

  @override
  Widget build(BuildContext context) {
    final naoFeitas = pendentes.where((t) => t.completedAt == null).toList();
    final total = pendentes.length + feitas.length;
    final done = feitas.length;
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 140),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _topHeader(
            context: context,
            nome: nome,
            fotoUrl: fotoUrl,
            streak: streak,
            now: now,
            variant: TodayVariant.evening,
          ),
          const SizedBox(height: 18),
          RichText(
            text: TextSpan(
              style: const TextStyle(
                fontFamily: 'Geist',
                fontSize: 18,
                fontWeight: FontWeight.w500,
                letterSpacing: -0.3,
                color: LiriunColors.textMuted,
                height: 1.3,
              ),
              children: [
                TextSpan(
                  text: total == 0
                      ? 'Dia silencioso. '
                      : 'Você fechou $done de $total. ',
                ),
                TextSpan(
                  text: _frase(done, total),
                  style: const TextStyle(
                      color: Color(0xFFF0B36E),
                      fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          _DayShape(
            tasks: [...pendentes, ...feitas],
            now: now,
          ),
          if (naoFeitas.isNotEmpty) ...[
            const SizedBox(height: 16),
            _FicouPraDepois(task: naoFeitas.first),
          ],
          if (amanhaTasks.isNotEmpty) ...[
            const SizedBox(height: 16),
            _LiriunSugereAmanha(tasks: amanhaTasks),
          ],
        ],
      ),
    );
  }

  String _frase(int done, int total) {
    if (total == 0) return 'Amanhã abre novo.';
    if (done == total) return 'Dia rendido.';
    if (done >= total * 0.6) return 'Não foi mal.';
    return 'Amanhã abre novo.';
  }
}

// ─── shared widgets ─────────────────────────────────────

class _DayShape extends StatelessWidget {
  const _DayShape({required this.tasks, required this.now});
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
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
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
              _sectionLabel('SEU DIA'),
              Text(
                scheduled.isEmpty
                    ? 'LIVRE'
                    : '${scheduled.length} MOMENTO${scheduled.length == 1 ? '' : 'S'}',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 10,
                  letterSpacing: 0.6,
                  color: scheduled.isEmpty
                      ? LiriunColors.textFaint
                      : LiriunColors.violet300,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),
          SizedBox(
            height: 56,
            child: LayoutBuilder(builder: (context, c) {
              final w = c.maxWidth;
              final nowX = w * _pct(now);
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  Positioned(
                    top: 22,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 3,
                      decoration: BoxDecoration(
                        color: const Color(0x14FFFFFF),
                        borderRadius: BorderRadius.circular(1.5),
                      ),
                    ),
                  ),
                  for (final t in scheduled)
                    Positioned(
                      left: w * _pct(t.scheduledFor!) - 3,
                      top: 9,
                      child: Container(
                        width: 6,
                        height: 28,
                        decoration: BoxDecoration(
                          color: t.category.color,
                          borderRadius: BorderRadius.circular(3),
                          boxShadow: [
                            BoxShadow(
                              color: t.category.color.withValues(alpha: 0.45),
                              blurRadius: 10,
                            ),
                          ],
                        ),
                      ),
                    ),
                  Positioned(
                    left: nowX - 9,
                    top: 14,
                    child: Container(
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        gradient: LiriunColors.gradBrand,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: LiriunColors.violet400.withValues(alpha: 0.40),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                    ),
                  ),
                  for (final hh in [0.0, 0.375, 0.5625, 0.75, 1.0])
                    Positioned(
                      left: w * hh - 10,
                      top: 40,
                      child: Text(
                        {0.0: '06', 0.375: '12', 0.5625: '15', 0.75: '18', 1.0: '22'}[hh]!,
                        style: const TextStyle(
                          fontFamily: 'Geist Mono',
                          fontSize: 10,
                          letterSpacing: 0.6,
                          color: LiriunColors.textFaint,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                ],
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _LiriunSugereMorning extends StatelessWidget {
  const _LiriunSugereMorning();

  @override
  Widget build(BuildContext context) {
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
            children: const [
              LiriunMark(size: 16),
              SizedBox(width: 6),
              Text(
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
          const Text(
            'Você tem espaço logo cedo. Aproveite pra começar pela tarefa que mais pesa.',
            style: TextStyle(
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

class _NextTaskCard extends StatelessWidget {
  const _NextTaskCard({required this.task, required this.onTap});
  final Task task;
  final VoidCallback onTap;

  String _hora(DateTime? d) {
    if (d == null) return '';
    return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0x0AFFFFFF),
            borderRadius: BorderRadius.circular(12),
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
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: LiriunColors.text,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 5),
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
                              letterSpacing: 0.3,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              if (task.priority == Priority.high)
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

class _ProgressRingCard extends StatelessWidget {
  const _ProgressRingCard({
    required this.pct,
    required this.done,
    required this.total,
  });
  final double pct;
  final int done;
  final int total;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0x06FFFFFF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 84,
            height: 84,
            child: CustomPaint(
              painter: _RingPainter(pct: pct),
            ),
          ),
          const SizedBox(width: 18),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '${(pct * 100).round()}',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w600,
                        color: LiriunColors.text,
                        letterSpacing: -0.8,
                        height: 1,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      '%',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: LiriunColors.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '$done DE $total · NO RITMO',
                  style: const TextStyle(
                    fontFamily: 'Geist Mono',
                    fontSize: 9,
                    letterSpacing: 0.4,
                    fontWeight: FontWeight.w600,
                    color: LiriunColors.textFaint,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Mantém o passo até o fim da tarde.',
                  style: TextStyle(
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
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter({required this.pct});
  final double pct;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 8;
    final bg = Paint()
      ..color = const Color(0x14FFFFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;
    canvas.drawCircle(center, radius, bg);
    final shader = LiriunColors.gradBrand.createShader(
        Rect.fromCircle(center: center, radius: radius));
    final fg = Paint()
      ..shader = shader
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      pct * 2 * pi,
      false,
      fg,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter old) => old.pct != pct;
}

class _RemainingRow extends StatelessWidget {
  const _RemainingRow({
    required this.task,
    required this.showDivider,
    required this.onTap,
  });
  final Task task;
  final bool showDivider;
  final VoidCallback onTap;

  String _info() {
    final parts = <String>[];
    if (task.scheduledFor != null) {
      final d = task.scheduledFor!;
      parts.add(
          '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}');
    }
    if (task.duration != null) {
      parts.add('${task.duration!.inMinutes} MIN');
    }
    return parts.join(' · ');
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          border: showDivider
              ? const Border(
                  bottom: BorderSide(color: LiriunColors.border),
                )
              : null,
        ),
        child: Row(
          children: [
            Container(
              width: 18,
              height: 18,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: LiriunColors.borderHi, width: 1.5),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    task.title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: LiriunColors.text,
                      letterSpacing: -0.1,
                    ),
                  ),
                  const SizedBox(height: 4),
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
                      const SizedBox(width: 8),
                      Text(
                        _info(),
                        style: const TextStyle(
                          fontFamily: 'Geist Mono',
                          fontSize: 9,
                          color: LiriunColors.textFaint,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ],
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

class _DoneChip extends StatelessWidget {
  const _DoneChip({required this.task});
  final Task task;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: LiriunColors.success.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(8),
        border:
            Border.all(color: LiriunColors.success.withValues(alpha: 0.18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_rounded,
              size: 11, color: LiriunColors.success),
          const SizedBox(width: 5),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 180),
            child: Text(
              task.title,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: LiriunColors.success.withValues(alpha: 0.85),
                letterSpacing: -0.1,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LiriunSugereAmanha extends StatelessWidget {
  const _LiriunSugereAmanha({required this.tasks});
  final List<Task> tasks;

  String _hora(DateTime? d) {
    if (d == null) return '';
    return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }

  String _diaLabel() {
    final amanha = DateTime.now().add(const Duration(days: 1));
    const nomes = [
      'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'
    ];
    return nomes[amanha.weekday - 1];
  }

  String _narrativa() {
    if (tasks.isEmpty) return '';
    final dia = _diaLabel();
    if (tasks.length == 1) {
      final t = tasks.first;
      final hora = _hora(t.scheduledFor);
      return hora.isEmpty
          ? '${_capitalize(dia)} tem só ${t.title.toLowerCase()}.'
          : '${_capitalize(dia)} começa às $hora com ${t.title.toLowerCase()}.';
    }
    final primeira = tasks.first;
    final ultima = tasks.last;
    final hp = _hora(primeira.scheduledFor);
    final hu = _hora(ultima.scheduledFor);
    final partes = <String>[];
    if (hp.isNotEmpty) {
      partes.add('${_capitalize(dia)} começa às $hp com ${primeira.title.toLowerCase()}.');
    } else {
      partes.add('${_capitalize(dia)} já tem ${tasks.length} compromissos.');
    }
    if (hu.isNotEmpty && ultima.id != primeira.id) {
      partes.add('Termina às $hu.');
    }
    return partes.join(' ');
  }

  String? _cuidado() {
    if (tasks.isEmpty) return null;
    final primeira = tasks.first;
    final h = primeira.scheduledFor?.hour;
    if (h == null) return 'Dia flexível. Aproveita pra desacelerar.';
    if (h < 7) return 'Começa cedo. Garante o sono — corpo agradece.';
    if (h < 9) return 'Manhã ativa. Durma pelo menos 7 horas.';
    if (h < 12) {
      return 'Primeiro compromisso só às ${h.toString().padLeft(2, '0')}h. Aproveita pra descansar — saúde mental também é produtividade.';
    }
    return 'Manhã livre. Dorme até tarde se puder.';
  }

  String _capitalize(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';

  @override
  Widget build(BuildContext context) {
    final cuidado = _cuidado();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            LiriunColors.violet400.withValues(alpha: 0.16),
            LiriunColors.violet700.withValues(alpha: 0.06),
          ],
        ),
        borderRadius: BorderRadius.circular(LiriunRadii.lg),
        border:
            Border.all(color: LiriunColors.violet400.withValues(alpha: 0.32)),
        boxShadow: [
          BoxShadow(
            color: LiriunColors.violet700.withValues(alpha: 0.15),
            blurRadius: 22,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const LiriunMark(size: 22),
              const SizedBox(width: 8),
              Text(
                'AMANHÃ · ${tasks.length} COMPROMISSO${tasks.length == 1 ? '' : 'S'}',
                style: const TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 10,
                  letterSpacing: 1.6,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.violet300,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            _narrativa(),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: LiriunColors.text,
              height: 1.4,
              letterSpacing: -0.2,
            ),
          ),
          if (cuidado != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0x14FFFFFF),
                borderRadius: BorderRadius.circular(LiriunRadii.md),
                border: Border.all(color: LiriunColors.border),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.bedtime_outlined,
                    size: 16,
                    color: LiriunColors.violet300,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      cuidado,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: LiriunColors.textMuted,
                        height: 1.5,
                        letterSpacing: -0.1,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _FicouPraDepois extends ConsumerStatefulWidget {
  const _FicouPraDepois({required this.task});
  final Task task;

  @override
  ConsumerState<_FicouPraDepois> createState() => _FicouPraDepoisState();
}

class _FicouPraDepoisState extends ConsumerState<_FicouPraDepois> {
  bool _reagendando = false;
  bool _concluindo = false;

  int _prioridadeApi(Priority? p) {
    switch (p) {
      case Priority.high:
        return 2;
      case Priority.low:
        return 4;
      case Priority.medium:
      case null:
        return 3;
    }
  }

  Future<void> _abrirReagendar() async {
    if (_reagendando || _concluindo) return;
    final agora = DateTime.now();
    final hoje = DateTime(agora.year, agora.month, agora.day);
    final escolha = await showModalBottomSheet<DateTime>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: const Color(0xA6000000),
      builder: (ctx) => _ReagendarSheet(hoje: hoje),
    );
    if (escolha != null) {
      await _reagendarPara(escolha);
    }
  }

  Future<void> _reagendarPara(DateTime data) async {
    setState(() => _reagendando = true);
    try {
      final dataDia = DateTime(data.year, data.month, data.day);
      final horaOriginal = widget.task.scheduledFor;
      final horario = horaOriginal == null
          ? null
          : '${horaOriginal.hour.toString().padLeft(2, '0')}:${horaOriginal.minute.toString().padLeft(2, '0')}:00';
      await ref.read(tarefasApiProvider).atualizar(
            id: widget.task.id,
            nome: widget.task.title,
            prioridade: _prioridadeApi(widget.task.priority),
            dataPrazo: dataDia,
            horarioFinal: horario,
            observacoes: widget.task.notes,
          );
      ref.invalidate(pendentesProvider);
      ref.invalidate(concluidasProvider);
      if (mounted) {
        final agora = DateTime.now();
        final hoje = DateTime(agora.year, agora.month, agora.day);
        final diff = dataDia.difference(hoje).inDays;
        final label = diff == 1
            ? 'amanhã'
            : diff <= 7
                ? 'em $diff dias'
                : '${dataDia.day.toString().padLeft(2, '0')}/${dataDia.month.toString().padLeft(2, '0')}';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Reagendado pra $label.'),
            duration: const Duration(seconds: 2),
            backgroundColor: LiriunColors.surfaceHi,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (err) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage(err, 'Falha ao reagendar.')),
            duration: const Duration(seconds: 3),
            backgroundColor: LiriunColors.surfaceHi,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _reagendando = false);
    }
  }

  Future<void> _concluir() async {
    if (_reagendando || _concluindo) return;
    setState(() => _concluindo = true);
    try {
      await ref.read(tarefasApiProvider).concluir(widget.task.id);
      ref.invalidate(pendentesProvider);
      ref.invalidate(concluidasProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Concluída.'),
            duration: Duration(seconds: 2),
            backgroundColor: LiriunColors.surfaceHi,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (err) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage(err, 'Falha ao concluir.')),
            duration: const Duration(seconds: 3),
            backgroundColor: LiriunColors.surfaceHi,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _concluindo = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0x0FF0B36E),
        borderRadius: BorderRadius.circular(14),
        border:
            Border.all(color: const Color(0xFFF0B36E).withValues(alpha: 0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              SizedBox(
                width: 6,
                height: 6,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0xFFF0B36E),
                  ),
                ),
              ),
              SizedBox(width: 6),
              Text(
                'FICOU PRA DEPOIS',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFF0B36E),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            widget.task.title,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: LiriunColors.text,
              letterSpacing: -0.1,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _ActionButton(
                  label: 'Reagendar',
                  loading: _reagendando,
                  filled: true,
                  onTap: _abrirReagendar,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _ActionButton(
                  label: 'Concluir',
                  loading: _concluindo,
                  filled: false,
                  onTap: _concluir,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.loading,
    required this.filled,
    required this.onTap,
  });
  final String label;
  final bool loading;
  final bool filled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: loading ? null : onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          height: 32,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: filled ? const Color(0x0FFFFFFF) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: LiriunColors.border),
          ),
          child: loading
              ? const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                    strokeWidth: 1.6,
                    valueColor:
                        AlwaysStoppedAnimation(LiriunColors.textMuted),
                  ),
                )
              : Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color:
                        filled ? LiriunColors.text : LiriunColors.textFaint,
                    letterSpacing: -0.1,
                  ),
                ),
        ),
      ),
    );
  }
}

class _ReagendarSheet extends StatelessWidget {
  const _ReagendarSheet({required this.hoje});
  final DateTime hoje;

  Future<void> _abrirCalendario(BuildContext context) async {
    final escolha = await showDatePicker(
      context: context,
      initialDate: hoje.add(const Duration(days: 1)),
      firstDate: hoje,
      lastDate: hoje.add(const Duration(days: 365 * 2)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.dark(
            primary: LiriunColors.violet400,
            onPrimary: Colors.white,
            surface: LiriunColors.surfaceHi,
            onSurface: LiriunColors.text,
          ),
        ),
        child: child!,
      ),
    );
    if (escolha != null && context.mounted) {
      Navigator.of(context).pop(escolha);
    }
  }

  @override
  Widget build(BuildContext context) {
    final opcoes = <(String, DateTime)>[
      ('Amanhã', hoje.add(const Duration(days: 1))),
      ('Em 3 dias', hoje.add(const Duration(days: 3))),
      ('Em 1 semana', hoje.add(const Duration(days: 7))),
    ];
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
      decoration: BoxDecoration(
        color: const Color(0xEB14161C),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: LiriunColors.borderHi),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: 14),
              decoration: BoxDecoration(
                color: const Color(0x2DFFFFFF),
                borderRadius: BorderRadius.circular(99),
              ),
            ),
            const Text(
              'Reagendar para',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: LiriunColors.text,
                letterSpacing: -0.1,
              ),
            ),
            const SizedBox(height: 14),
            for (final (label, data) in opcoes) ...[
              _OpcaoTile(
                label: label,
                dia: '${data.day.toString().padLeft(2, '0')}/${data.month.toString().padLeft(2, '0')}',
                onTap: () => Navigator.of(context).pop(data),
              ),
              const SizedBox(height: 6),
            ],
            const SizedBox(height: 4),
            _OpcaoTile(
              label: 'Escolher data...',
              dia: '',
              icon: Icons.calendar_month_rounded,
              onTap: () => _abrirCalendario(context),
            ),
          ],
        ),
      ),
    );
  }
}

class _OpcaoTile extends StatelessWidget {
  const _OpcaoTile({
    required this.label,
    required this.dia,
    required this.onTap,
    this.icon,
  });
  final String label;
  final String dia;
  final VoidCallback onTap;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0x08FFFFFF),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: LiriunColors.border),
          ),
          child: Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 16, color: LiriunColors.violet300),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: LiriunColors.text,
                    letterSpacing: -0.1,
                  ),
                ),
              ),
              if (dia.isNotEmpty)
                Text(
                  dia,
                  style: const TextStyle(
                    fontFamily: 'Geist Mono',
                    fontSize: 11,
                    color: LiriunColors.textFaint,
                    letterSpacing: 0.3,
                  ),
                ),
              const SizedBox(width: 6),
              const Icon(
                Icons.chevron_right_rounded,
                size: 16,
                color: LiriunColors.textFaint,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

