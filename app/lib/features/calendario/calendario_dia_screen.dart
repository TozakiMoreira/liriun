import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../models/task.dart';
import '../../models/task_mapper.dart';

class CalendarioDiaScreen extends ConsumerWidget {
  const CalendarioDiaScreen({super.key, required this.date});

  final DateTime date;

  bool _matchDay(DateTime d) =>
      d.year == date.year && d.month == date.month && d.day == date.day;

  String _kicker() {
    const dias = [
      'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO'
    ];
    const meses = [
      'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
    ];
    final now = DateTime.now();
    final hoje = date.year == now.year &&
        date.month == now.month &&
        date.day == now.day;
    final base =
        '${dias[date.weekday - 1]} · ${date.day.toString().padLeft(2, '0')} ${meses[date.month - 1]}';
    return hoje ? '$base · HOJE' : base;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendentes = ref.watch(pendentesProvider);
    final concluidas = ref.watch(concluidasProvider);

    final dtos = <TarefaDto>[
      ...?pendentes.valueOrNull,
      ...?concluidas.valueOrNull,
    ].where((t) => _matchDay(t.dataPrazo)).toList();

    final tasks = dtos.map((d) => d.toTask()).toList()
      ..sort((a, b) {
        final ta = a.scheduledFor ?? a.createdAt;
        final tb = b.scheduledFor ?? b.createdAt;
        return ta.compareTo(tb);
      });

    final ocupadasMin = tasks.fold<int>(0, (sum, t) {
      final dur = t.duration?.inMinutes ?? 30;
      return sum + dur;
    });
    final libreP = ((1 - (ocupadasMin / (16 * 60))).clamp(0.0, 1.0) * 100).round();

    return Scaffold(
      backgroundColor: LiriunColors.surface,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left_rounded,
                        color: LiriunColors.text, size: 28),
                    onPressed: () => context.pop(),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.add_rounded,
                        color: LiriunColors.text),
                    onPressed: () => context.push('/voice'),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 6, 20, 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _kicker(),
                          style: const TextStyle(
                            fontFamily: 'Geist Mono',
                            fontSize: 9,
                            letterSpacing: 1.4,
                            fontWeight: FontWeight.w600,
                            color: LiriunColors.textFaint,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Seu dia',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w600,
                            letterSpacing: -0.5,
                            color: LiriunColors.text,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '$libreP% LIVRE',
                    style: const TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 9,
                      letterSpacing: 0.4,
                      color: LiriunColors.violet300,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: tasks.isEmpty
                  ? _emptyDay(context)
                  : _Timeline(tasks: tasks),
            ),
          ],
        ),
      ),
    );
  }

  Widget _emptyDay(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 36),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    LiriunColors.violet400.withValues(alpha: 0.18),
                    LiriunColors.violet700.withValues(alpha: 0.06),
                  ],
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                    color: LiriunColors.violet400.withValues(alpha: 0.32)),
              ),
              child: const Icon(Icons.weekend_outlined,
                  size: 36, color: LiriunColors.violet300),
            ),
            const SizedBox(height: 16),
            const Text(
              'Dia leve.',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w600,
                color: LiriunColors.text,
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Sem compromissos. Aproveita, descansa ou abre espaço pra algo importante.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: LiriunColors.textMuted,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: () => context.push('/voice'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                decoration: BoxDecoration(
                  gradient: LiriunColors.gradBrand,
                  borderRadius: BorderRadius.circular(LiriunRadii.pill),
                ),
                child: const Text(
                  'Adicionar tarefa',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    letterSpacing: -0.1,
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

class _Slot {
  _Slot.event(this.time, this.task)
      : free = false,
        suggest = null;
  _Slot.free(this.time, {this.suggest})
      : free = true,
        task = null;

  final DateTime time;
  final Task? task;
  final bool free;
  final String? suggest;
}

class _Timeline extends StatelessWidget {
  const _Timeline({required this.tasks});
  final List<Task> tasks;

  bool _isCurrent(Task t) {
    final now = DateTime.now();
    if (!_sameDay(now, t.scheduledFor ?? t.createdAt)) return false;
    if (t.scheduledFor == null) return false;
    final start = t.scheduledFor!;
    final dur = t.duration ?? const Duration(minutes: 30);
    final end = start.add(dur);
    return now.isAfter(start) && now.isBefore(end);
  }

  bool _sameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  String _horaStr(DateTime d) =>
      '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';

  String _dur(Task t) {
    final m = t.duration?.inMinutes;
    if (m == null) return '';
    if (m >= 60) {
      final h = m ~/ 60;
      final rest = m % 60;
      return rest == 0 ? '${h}h' : '${h}h ${rest}m';
    }
    return '${m}min';
  }

  String _sugestaoPara(int hora) {
    if (hora < 9) return 'Aquecer com tarefa leve';
    if (hora < 12) return 'Bloco de foco profundo';
    if (hora < 14) return 'Pausa pro almoço';
    if (hora < 17) return 'Tarefa importante';
    if (hora < 19) return 'Encerrar pendências';
    return 'Recuperar energia';
  }

  List<_Slot> _slots() {
    final scheduled = tasks.where((t) => t.scheduledFor != null).toList()
      ..sort((a, b) => a.scheduledFor!.compareTo(b.scheduledFor!));
    if (scheduled.isEmpty) return [];
    final out = <_Slot>[];
    final base = scheduled.first.scheduledFor!;
    DateTime cur = DateTime(base.year, base.month, base.day, 8);
    final endOfDay = DateTime(base.year, base.month, base.day, 21);

    for (final t in scheduled) {
      final start = t.scheduledFor!;
      while (cur.isBefore(start) &&
          start.difference(cur).inHours >= 1) {
        out.add(_Slot.free(cur, suggest: _sugestaoPara(cur.hour)));
        cur = cur.add(const Duration(hours: 2));
      }
      out.add(_Slot.event(start, t));
      final dur = t.duration ?? const Duration(minutes: 30);
      cur = start.add(dur);
    }
    while (cur.isBefore(endOfDay) &&
        endOfDay.difference(cur).inHours >= 2) {
      out.add(_Slot.free(cur, suggest: _sugestaoPara(cur.hour)));
      cur = cur.add(const Duration(hours: 2));
    }
    return out;
  }

  @override
  Widget build(BuildContext context) {
    final slots = _slots();
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(50, 8, 18, 120),
      child: Stack(
        children: [
          Positioned(
            top: 8,
            bottom: 8,
            left: -22,
            child: Container(
              width: 2,
              decoration: BoxDecoration(
                color: const Color(0x0DFFFFFF),
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (final s in slots)
                s.free ? _freeRow(s) : _eventRow(s),
            ],
          ),
        ],
      ),
    );
  }

  Widget _eventRow(_Slot s) {
    final t = s.task!;
    final current = _isCurrent(t);
    final done = t.completedAt != null;
    final color = t.category.color;
    final dur = _dur(t);
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            left: -56,
            top: 2,
            child: Text(
              _horaStr(s.time),
              style: const TextStyle(
                fontFamily: 'Geist Mono',
                fontSize: 9,
                letterSpacing: 0.4,
                color: LiriunColors.textFaint,
              ),
            ),
          ),
          Positioned(
            left: -26,
            top: 4,
            child: Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: color,
                boxShadow: [
                  BoxShadow(
                    color: color.withValues(alpha: current ? 0.7 : 0.4),
                    blurRadius: current ? 12 : 6,
                    spreadRadius: current ? 4 : 0,
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: current
                  ? color.withValues(alpha: 0.12)
                  : const Color(0x09FFFFFF),
              borderRadius: BorderRadius.circular(11),
              border: Border.all(
                color: current
                    ? color.withValues(alpha: 0.50)
                    : LiriunColors.border,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        t.title,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: done
                              ? LiriunColors.textFaint
                              : LiriunColors.text,
                          letterSpacing: -0.1,
                          decoration:
                              done ? TextDecoration.lineThrough : null,
                        ),
                      ),
                    ),
                    if (t.priority == Priority.high)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: const Color(0x1AF0B36E),
                          border: Border.all(
                              color: const Color(0x47F0B36E)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'ALTA',
                          style: TextStyle(
                            fontFamily: 'Geist Mono',
                            fontSize: 8,
                            letterSpacing: 0.4,
                            color: Color(0xFFF0B36E),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  current
                      ? '${dur.isEmpty ? "" : "$dur · "}AGORA'
                      : (dur.isEmpty
                          ? t.category.label
                          : '$dur · ${t.category.label}'),
                  style: const TextStyle(
                    fontFamily: 'Geist Mono',
                    fontSize: 9,
                    letterSpacing: 0.3,
                    color: LiriunColors.textFaint,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _freeRow(_Slot s) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            left: -56,
            top: 2,
            child: Text(
              _horaStr(s.time),
              style: const TextStyle(
                fontFamily: 'Geist Mono',
                fontSize: 9,
                letterSpacing: 0.4,
                color: LiriunColors.textFaint,
              ),
            ),
          ),
          Positioned(
            left: -23,
            top: 6,
            child: Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: LiriunColors.borderHi,
                border: Border.all(color: LiriunColors.border),
              ),
            ),
          ),
          Row(
            children: [
              const Text(
                'Espaço livre',
                style: TextStyle(
                  fontSize: 11,
                  color: LiriunColors.textFaint,
                  fontWeight: FontWeight.w500,
                  letterSpacing: -0.1,
                ),
              ),
              if (s.suggest != null) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: LiriunColors.violet400.withValues(alpha: 0.10),
                    borderRadius: BorderRadius.circular(99),
                    border: Border.all(
                      color: LiriunColors.violet400.withValues(alpha: 0.22),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.auto_awesome_rounded,
                        size: 9,
                        color: LiriunColors.violet300,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        s.suggest!,
                        style: const TextStyle(
                          fontFamily: 'Geist Mono',
                          fontSize: 9,
                          letterSpacing: 0.3,
                          color: LiriunColors.violet300,
                          fontWeight: FontWeight.w500,
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
  }
}
