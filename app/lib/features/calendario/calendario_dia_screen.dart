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
              child: _Timeline(tasks: tasks, date: date),
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
  const _Timeline({required this.tasks, required this.date});
  final List<Task> tasks;
  final DateTime date;

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

  String? _sugestaoPara(int hora) {
    switch (hora) {
      case 8:
        return 'Café';
      case 12:
        return 'Almoço';
      case 19:
        return 'Janta';
      case 22:
        return 'Dormir';
      default:
        return null;
    }
  }

  List<_Slot> _slots() {
    const horasFixas = [8, 10, 12, 13, 15, 17, 19, 22];
    final scheduled = tasks.where((t) => t.scheduledFor != null).toList()
      ..sort((a, b) => a.scheduledFor!.compareTo(b.scheduledFor!));
    final base = DateTime(date.year, date.month, date.day);
    final tasksPorHora = <int, Task>{};
    for (final t in scheduled) {
      tasksPorHora[t.scheduledFor!.hour] = t;
    }
    final out = <_Slot>[];
    for (final h in horasFixas) {
      final hora = DateTime(base.year, base.month, base.day, h);
      final t = tasksPorHora[h];
      if (t != null) {
        out.add(_Slot.event(hora, t));
      } else {
        out.add(_Slot.free(hora, suggest: _sugestaoPara(h)));
      }
    }
    for (final t in scheduled) {
      if (!horasFixas.contains(t.scheduledFor!.hour)) {
        out.add(_Slot.event(t.scheduledFor!, t));
      }
    }
    out.sort((a, b) => a.time.compareTo(b.time));
    return out;
  }

  @override
  Widget build(BuildContext context) {
    final slots = _slots();
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(18, 8, 18, 120),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (var i = 0; i < slots.length; i++)
            _row(slots[i], isLast: i == slots.length - 1),
        ],
      ),
    );
  }

  Widget _row(_Slot s, {required bool isLast}) {
    final hasTask = !s.free;
    final t = s.task;
    final current = hasTask ? _isCurrent(t!) : false;
    final done = hasTask && t!.completedAt != null;
    final color = hasTask ? t!.category.color : LiriunColors.borderHi;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 56,
            child: Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                _horaStr(s.time),
                style: const TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 12,
                  letterSpacing: 0.4,
                  color: LiriunColors.textFaint,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
          SizedBox(
            width: 28,
            child: Column(
              children: [
                const SizedBox(height: 14),
                Container(
                  width: hasTask ? 14 : 9,
                  height: hasTask ? 14 : 9,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: hasTask ? color : Colors.transparent,
                    border: hasTask
                        ? null
                        : Border.all(
                            color: LiriunColors.borderHi, width: 1.4),
                    boxShadow: hasTask
                        ? [
                            BoxShadow(
                              color: color.withValues(
                                  alpha: current ? 0.7 : 0.45),
                              blurRadius: current ? 14 : 8,
                              spreadRadius: current ? 3 : 0,
                            ),
                          ]
                        : null,
                  ),
                ),
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.only(top: 4),
                    color: isLast
                        ? Colors.transparent
                        : const Color(0x14FFFFFF),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 22),
              child: hasTask
                  ? _eventCard(t!, current: current, done: done, color: color)
                  : _freeContent(s),
            ),
          ),
        ],
      ),
    );
  }

  Widget _eventCard(Task t,
      {required bool current, required bool done, required Color color}) {
    final dur = _dur(t);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: current
            ? color.withValues(alpha: 0.14)
            : const Color(0x0AFFFFFF),
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
                    color:
                        done ? LiriunColors.textFaint : LiriunColors.text,
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
                    border: Border.all(color: const Color(0x47F0B36E)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'ALTA',
                    style: TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 8,
                      letterSpacing: 0.4,
                      color: Color(0xFFF0B36E),
                      fontWeight: FontWeight.w600,
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
    );
  }

  Widget _freeContent(_Slot s) {
    return Padding(
      padding: const EdgeInsets.only(top: 14),
      child: Row(
        children: [
          const Text(
            'LIVRE',
            style: TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 12,
              letterSpacing: 0.6,
              color: LiriunColors.textFaint,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (s.suggest != null) ...[
            const SizedBox(width: 8),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
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
    );
  }
}
