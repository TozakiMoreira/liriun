import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:go_router/go_router.dart';

import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../widgets/empty_state.dart';

class CalendarioScreen extends ConsumerStatefulWidget {
  const CalendarioScreen({super.key});

  @override
  ConsumerState<CalendarioScreen> createState() => _CalendarioScreenState();
}

class _CalendarioScreenState extends ConsumerState<CalendarioScreen> {
  late DateTime _month;
  DateTime? _selected;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _month = DateTime(now.year, now.month);
    _selected = now;
  }

  @override
  Widget build(BuildContext context) {
    final pendentesAsync = ref.watch(pendentesProvider);
    final concluidasAsync = ref.watch(concluidasProvider);

    final byDay = <int, int>{};
    final all = [
      ...?pendentesAsync.valueOrNull,
      ...?concluidasAsync.valueOrNull,
    ];
    for (final t in all) {
      if (t.dataPrazo.year == _month.year &&
          t.dataPrazo.month == _month.month) {
        byDay[t.dataPrazo.day] = (byDay[t.dataPrazo.day] ?? 0) + 1;
      }
    }
    final maxCount = byDay.values.fold<int>(0, (a, b) => a > b ? a : b);

    final selectedTasks = _selected == null
        ? <TarefaDto>[]
        : all.where((t) =>
            t.dataPrazo.year == _selected!.year &&
            t.dataPrazo.month == _selected!.month &&
            t.dataPrazo.day == _selected!.day).toList();

    return Scaffold(
      backgroundColor: LiriunColors.bg,
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'SUA AGENDA',
                style: TextStyle(
                  fontSize: 9,
                  letterSpacing: 1.6,
                  color: LiriunColors.violet300,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  Text(
                    _monthLabel(_month),
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w600,
                      color: LiriunColors.text,
                      letterSpacing: -0.6,
                    ),
                  ),
                  const Spacer(),
                  _NavBtn(
                    icon: Icons.chevron_left_rounded,
                    onTap: () => setState(() {
                      _month = DateTime(_month.year, _month.month - 1);
                    }),
                  ),
                  const SizedBox(width: 6),
                  _NavBtn(
                    icon: Icons.chevron_right_rounded,
                    onTap: () => setState(() {
                      _month = DateTime(_month.year, _month.month + 1);
                    }),
                  ),
                  const SizedBox(width: 10),
                  const _ScopeToggle(),
                ],
              ),
              const SizedBox(height: 18),
              _StatsStrip(
                total: all.length,
                feitas: all.where((t) => t.concluidaEm != null).length,
                streak: _streak(all),
              ),
              const SizedBox(height: 18),
              _MonthGrid(
                month: _month,
                byDay: byDay,
                maxCount: maxCount,
                selected: _selected,
                onSelect: (d) => setState(() => _selected = d),
              ),
              const SizedBox(height: 16),
              _LegendRow(),
              const SizedBox(height: 26),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _selectedHeader().toUpperCase(),
                    style: const TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 9,
                      letterSpacing: 1.6,
                      color: LiriunColors.violet300,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (_selected != null)
                    GestureDetector(
                      onTap: () {
                        final iso =
                            '${_selected!.year}-${_selected!.month.toString().padLeft(2, '0')}-${_selected!.day.toString().padLeft(2, '0')}';
                        context.push('/calendario/dia/$iso');
                      },
                      child: const Text(
                        'ABRIR DIA →',
                        style: TextStyle(
                          fontFamily: 'Geist Mono',
                          fontSize: 9,
                          letterSpacing: 1.2,
                          color: LiriunColors.violet300,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              if (selectedTasks.isNotEmpty)
                for (final t in selectedTasks)
                  _DayTaskRow(task: t)
              else
                const EmptyState(
                  compact: true,
                  icon: Icons.weekend_outlined,
                  title: 'Dia leve.',
                  body: 'Sem compromissos nessa data.',
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _monthLabel(DateTime d) {
    const names = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    return '${names[d.month - 1]} ${d.year}';
  }

  String _selectedHeader() {
    final d = _selected!;
    final now = DateTime.now();
    if (d.year == now.year && d.month == now.month && d.day == now.day) {
      return 'HOJE';
    }
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}';
  }

  int _streak(List<TarefaDto> all) {
    final feitas = all.where((t) => t.concluidaEm != null).map((t) {
      final c = t.concluidaEm!;
      return DateTime(c.year, c.month, c.day);
    }).toSet();
    if (feitas.isEmpty) return 0;
    final now = DateTime.now();
    var cur = DateTime(now.year, now.month, now.day);
    if (!feitas.contains(cur)) {
      cur = cur.subtract(const Duration(days: 1));
      if (!feitas.contains(cur)) return 0;
    }
    var count = 0;
    while (feitas.contains(cur)) {
      count += 1;
      cur = cur.subtract(const Duration(days: 1));
    }
    return count;
  }
}

class _ScopeToggle extends StatelessWidget {
  const _ScopeToggle();

  @override
  Widget build(BuildContext context) {
    return const Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _ScopeCell(label: 'M', active: true),
        SizedBox(width: 4),
        _ScopeCell(label: 'S', active: false),
        SizedBox(width: 4),
        _ScopeCell(label: 'A', active: false),
      ],
    );
  }
}

class _ScopeCell extends StatelessWidget {
  const _ScopeCell({required this.label, required this.active});
  final String label;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 28,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: active
            ? LiriunColors.violet400.withValues(alpha: 0.14)
            : const Color(0x0AFFFFFF),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: active
              ? LiriunColors.violet400.withValues(alpha: 0.32)
              : LiriunColors.border,
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Geist Mono',
          fontSize: 10,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.4,
          color: active ? LiriunColors.violet300 : LiriunColors.textMuted,
        ),
      ),
    );
  }
}

class _NavBtn extends StatelessWidget {
  const _NavBtn({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(LiriunRadii.sm),
        child: Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: const Color(0x10FFFFFF),
            borderRadius: BorderRadius.circular(LiriunRadii.sm),
            border: Border.all(color: LiriunColors.borderHi),
          ),
          child: Icon(icon, size: 18, color: LiriunColors.textMuted),
        ),
      ),
    );
  }
}

class _StatsStrip extends StatelessWidget {
  const _StatsStrip({
    required this.total,
    required this.feitas,
    required this.streak,
  });
  final int total;
  final int feitas;
  final int streak;

  @override
  Widget build(BuildContext context) {
    final foco = total == 0 ? 0 : ((feitas / total) * 100).round();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0x0AFFFFFF),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        border: Border.all(color: LiriunColors.borderHi),
      ),
      child: Row(
        children: [
          Expanded(child: _StatCell(label: 'TAREFAS', value: '$total')),
          _VDivider(),
          Expanded(child: _StatCell(label: 'CONCLUÍDAS', value: '$feitas')),
          _VDivider(),
          Expanded(child: _StatCell(label: 'FOCO', value: '$foco%')),
          _VDivider(),
          Expanded(child: _StatCell(label: 'STREAK', value: '${streak}d')),
        ],
      ),
    );
  }
}

class _StatCell extends StatelessWidget {
  const _StatCell({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: LiriunColors.text,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 8,
            letterSpacing: 1.4,
            color: LiriunColors.textFaint,
          ),
        ),
      ],
    );
  }
}

class _VDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
      Container(width: 1, height: 28, color: LiriunColors.border);
}

class _MonthGrid extends StatelessWidget {
  const _MonthGrid({
    required this.month,
    required this.byDay,
    required this.maxCount,
    required this.selected,
    required this.onSelect,
  });

  final DateTime month;
  final Map<int, int> byDay;
  final int maxCount;
  final DateTime? selected;
  final void Function(DateTime) onSelect;

  @override
  Widget build(BuildContext context) {
    final firstDay = DateTime(month.year, month.month, 1);
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final weekdayOffset = firstDay.weekday % 7; // dom=0
    final today = DateTime.now();

    final cells = <Widget>[];
    for (var i = 0; i < weekdayOffset; i++) {
      cells.add(const SizedBox.shrink());
    }
    for (var d = 1; d <= daysInMonth; d++) {
      final date = DateTime(month.year, month.month, d);
      final count = byDay[d] ?? 0;
      final intensity = maxCount == 0 ? 0.0 : count / maxCount;
      final isToday = d == today.day &&
          month.month == today.month &&
          month.year == today.year;
      final isSelected = selected != null &&
          selected!.year == month.year &&
          selected!.month == month.month &&
          selected!.day == d;
      cells.add(_DayCell(
        day: d,
        intensity: intensity,
        isToday: isToday,
        isSelected: isSelected,
        onTap: () => onSelect(date),
      ));
    }

    return Column(
      children: [
        Row(
          children: const ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
              .map((d) => Expanded(
                    child: Center(
                      child: Text(
                        d,
                        style: const TextStyle(
                          fontSize: 9,
                          letterSpacing: 1,
                          color: LiriunColors.textFaint,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ))
              .toList(),
        ),
        const SizedBox(height: 8),
        GridView.count(
          crossAxisCount: 7,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 4,
          crossAxisSpacing: 4,
          children: cells,
        ),
      ],
    );
  }
}

class _DayCell extends StatelessWidget {
  const _DayCell({
    required this.day,
    required this.intensity,
    required this.isToday,
    required this.isSelected,
    required this.onTap,
  });

  final int day;
  final double intensity;
  final bool isToday;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final heat = LiriunColors.violet400.withValues(alpha: intensity * 0.6);
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: LiriunDurations.fast,
        decoration: BoxDecoration(
          gradient: isToday ? LiriunColors.gradBrand : null,
          color: isToday ? null : heat,
          borderRadius: BorderRadius.circular(8),
          border: isSelected && !isToday
              ? Border.all(color: LiriunColors.violet300, width: 1.5)
              : null,
          boxShadow: isToday
              ? [
                  BoxShadow(
                    color: LiriunColors.violet700.withValues(alpha: 0.45),
                    blurRadius: 12,
                  ),
                ]
              : null,
        ),
        child: Center(
          child: Text(
            '$day',
            style: TextStyle(
              fontSize: 12,
              fontWeight: isToday ? FontWeight.w700 : FontWeight.w500,
              color: isToday ? Colors.white : LiriunColors.text,
            ),
          ),
        ),
      ),
    );
  }
}

class _LegendRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        const Text(
          'MENOS',
          style: TextStyle(
              fontSize: 9, letterSpacing: 1, color: LiriunColors.textFaint),
        ),
        const SizedBox(width: 6),
        ...[0.0, 0.2, 0.4, 0.6, 0.85].map((i) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 1),
              child: Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: LiriunColors.violet400.withValues(alpha: i),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            )),
        const SizedBox(width: 6),
        const Text(
          'MAIS',
          style: TextStyle(
              fontSize: 9, letterSpacing: 1, color: LiriunColors.textFaint),
        ),
      ],
    );
  }
}

class _DayTaskRow extends StatelessWidget {
  const _DayTaskRow({required this.task});
  final TarefaDto task;

  @override
  Widget build(BuildContext context) {
    final color = task.categorias.isEmpty
        ? LiriunColors.violet400
        : _colorFromName(task.categorias.first.nome);
    final hora = task.horarioFinal?.substring(0, 5) ?? '—:—';
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(
            width: 50,
            child: Text(
              hora,
              style: const TextStyle(
                fontSize: 11,
                color: LiriunColors.textFaint,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0x05FFFFFF),
                borderRadius: BorderRadius.circular(LiriunRadii.sm),
                border: Border.all(color: LiriunColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 5,
                    height: 5,
                    decoration:
                        BoxDecoration(shape: BoxShape.circle, color: color),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      task.nome,
                      style: const TextStyle(
                        fontSize: 13,
                        color: LiriunColors.text,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  if (task.concluidaEm != null)
                    const Icon(
                      Icons.check_circle_rounded,
                      size: 14,
                      color: LiriunColors.success,
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _colorFromName(String n) {
    final l = n.toLowerCase();
    if (l.contains('trabalho')) return LiriunColors.catWork;
    if (l.contains('saúde') || l.contains('saude')) return LiriunColors.catHealth;
    if (l.contains('casa')) return LiriunColors.catHome;
    if (l.contains('finança') || l.contains('financa')) return LiriunColors.catFinance;
    return LiriunColors.catPersonal;
  }
}
