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

enum _Scope { mes, semana }

class _CalendarioScreenState extends ConsumerState<CalendarioScreen> {
  late DateTime _month;
  DateTime? _selected;
  _Scope _scope = _Scope.mes;

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

    final weekRef = _selected ?? DateTime.now();
    final weekStart = DateTime(weekRef.year, weekRef.month, weekRef.day)
        .subtract(Duration(days: (weekRef.weekday - 1) % 7));
    final weekEnd = weekStart.add(const Duration(days: 7));
    final scopedTasks = _scope == _Scope.mes
        ? all
            .where((t) =>
                t.dataPrazo.year == _month.year &&
                t.dataPrazo.month == _month.month)
            .toList()
        : all.where((t) {
            final d =
                DateTime(t.dataPrazo.year, t.dataPrazo.month, t.dataPrazo.day);
            return !d.isBefore(weekStart) && d.isBefore(weekEnd);
          }).toList();

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
                  Expanded(
                    child: Text(
                      _scope == _Scope.mes
                          ? _monthLabel(_month)
                          : _weekLabel(weekStart),
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w600,
                        color: LiriunColors.text,
                        letterSpacing: -0.6,
                      ),
                    ),
                  ),
                  _NavBtn(
                    icon: Icons.chevron_left_rounded,
                    onTap: () => setState(() {
                      if (_scope == _Scope.mes) {
                        _month = DateTime(_month.year, _month.month - 1);
                      } else {
                        final cur = _selected ?? DateTime.now();
                        _selected = cur.subtract(const Duration(days: 7));
                        _month = DateTime(_selected!.year, _selected!.month);
                      }
                    }),
                  ),
                  const SizedBox(width: 6),
                  _NavBtn(
                    icon: Icons.chevron_right_rounded,
                    onTap: () => setState(() {
                      if (_scope == _Scope.mes) {
                        _month = DateTime(_month.year, _month.month + 1);
                      } else {
                        final cur = _selected ?? DateTime.now();
                        _selected = cur.add(const Duration(days: 7));
                        _month = DateTime(_selected!.year, _selected!.month);
                      }
                    }),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _ScopeToggle(
                scope: _scope,
                onSelect: (s) => setState(() => _scope = s),
              ),
              const SizedBox(height: 18),
              _StatsStrip(
                total: scopedTasks.length,
                feitas:
                    scopedTasks.where((t) => t.concluidaEm != null).length,
                streak: _streak(all),
              ),
              const SizedBox(height: 18),
              if (_scope == _Scope.mes) ...[
                _MonthGrid(
                  month: _month,
                  byDay: byDay,
                  maxCount: maxCount,
                  selected: _selected,
                  onSelect: (d) {
                    setState(() => _selected = d);
                    final iso =
                        '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
                    context.push('/calendario/dia/$iso');
                  },
                ),
                const SizedBox(height: 16),
                _LegendRow(),
              ] else
                _WeekStrip(
                  reference: _selected ?? DateTime.now(),
                  allTasks: all,
                  onTap: (d) {
                    setState(() => _selected = d);
                    final iso =
                        '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
                    context.push('/calendario/dia/$iso');
                  },
                ),
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
              GestureDetector(
                onTap: _selected == null
                    ? null
                    : () {
                        final d = _selected!;
                        final iso =
                            '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
                        context.push('/calendario/dia/$iso');
                      },
                child: selectedTasks.isNotEmpty
                    ? Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          for (final t in selectedTasks) _DayTaskRow(task: t),
                        ],
                      )
                    : const EmptyState(
                        compact: true,
                        icon: Icons.weekend_outlined,
                        title: 'Dia leve.',
                        body: 'Sem compromissos nessa data.',
                      ),
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

  String _weekLabel(DateTime weekStart) {
    final end = weekStart.add(const Duration(days: 6));
    const abrev = [
      'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
      'jul', 'ago', 'set', 'out', 'nov', 'dez',
    ];
    final si = '${weekStart.day.toString().padLeft(2, '0')} ${abrev[weekStart.month - 1]}';
    final se = '${end.day.toString().padLeft(2, '0')} ${abrev[end.month - 1]}';
    return '$si – $se';
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
  const _ScopeToggle({required this.scope, required this.onSelect});
  final _Scope scope;
  final ValueChanged<_Scope> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0x0AFFFFFF),
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: _ScopeCell(
              icon: Icons.calendar_month_rounded,
              label: 'Mês',
              active: scope == _Scope.mes,
              onTap: () => onSelect(_Scope.mes),
            ),
          ),
          const SizedBox(width: 3),
          Expanded(
            child: _ScopeCell(
              icon: Icons.calendar_view_week_rounded,
              label: 'Semana',
              active: scope == _Scope.semana,
              onTap: () => onSelect(_Scope.semana),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScopeCell extends StatelessWidget {
  const _ScopeCell({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: LiriunDurations.fast,
        padding: const EdgeInsets.symmetric(vertical: 9),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: active ? LiriunColors.gradBrand : null,
          borderRadius: BorderRadius.circular(99),
          boxShadow: active
              ? [
                  BoxShadow(
                    color: LiriunColors.violet500.withValues(alpha: 0.30),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 14,
              color: active ? Colors.white : LiriunColors.textMuted,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: -0.1,
                color: active ? Colors.white : LiriunColors.textMuted,
              ),
            ),
          ],
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

class _WeekStrip extends StatefulWidget {
  const _WeekStrip({
    required this.reference,
    required this.allTasks,
    required this.onTap,
  });
  final DateTime reference;
  final List<TarefaDto> allTasks;
  final ValueChanged<DateTime> onTap;

  @override
  State<_WeekStrip> createState() => _WeekStripState();
}

class _WeekStripState extends State<_WeekStrip> {
  late DateTime _selected;

  @override
  void initState() {
    super.initState();
    _selected = DateTime(
        widget.reference.year, widget.reference.month, widget.reference.day);
  }

  List<TarefaDto> _tasksOn(DateTime d) {
    return widget.allTasks
        .where((t) =>
            t.dataPrazo.year == d.year &&
            t.dataPrazo.month == d.month &&
            t.dataPrazo.day == d.day)
        .toList()
      ..sort((a, b) {
        final ha = a.horarioFinal ?? '00:00';
        final hb = b.horarioFinal ?? '00:00';
        return ha.compareTo(hb);
      });
  }

  Color _catColor(TarefaDto t) {
    if (t.categorias.isEmpty) return LiriunColors.violet400;
    final n = t.categorias.first.nome.toLowerCase();
    if (n.contains('trabalho')) return LiriunColors.catWork;
    if (n.contains('saúde') ||
        n.contains('saude') ||
        n.contains('academia') ||
        n.contains('treino')) {
      return LiriunColors.catHealth;
    }
    if (n.contains('casa')) return LiriunColors.catHome;
    if (n.contains('finança') || n.contains('financa') || n.contains('gasto')) {
      return const Color(0xFFE58FB0);
    }
    return LiriunColors.catPersonal;
  }

  String _diaNomeMaisc(DateTime d) {
    const dias = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO'];
    return dias[d.weekday - 1];
  }

  @override
  Widget build(BuildContext context) {
    final base = DateTime(widget.reference.year, widget.reference.month,
        widget.reference.day);
    final dowMon0 = (base.weekday - 1) % 7;
    final weekStart = base.subtract(Duration(days: dowMon0));
    final dias = List.generate(7, (i) => weekStart.add(Duration(days: i)));
    const wd = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

    final tarefasDoDia = _tasksOn(_selected);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(
          height: 86,
          child: Row(
            children: [
              for (var i = 0; i < dias.length; i++) ...[
                Expanded(
                  child: _DayChip(
                    day: dias[i],
                    label: wd[i],
                    count: _tasksOn(dias[i]).length,
                    isSelected: dias[i] == _selected,
                    onTap: () => setState(() => _selected = dias[i]),
                  ),
                ),
                if (i < dias.length - 1) const SizedBox(width: 4),
              ],
            ],
          ),
        ),
        const SizedBox(height: 18),
        Row(
          children: [
            Text(
              '${_diaNomeMaisc(_selected)} · ${tarefasDoDia.length} TAREFA${tarefasDoDia.length == 1 ? '' : 'S'}',
              style: const TextStyle(
                fontFamily: 'Geist Mono',
                fontSize: 9,
                letterSpacing: 1.4,
                color: LiriunColors.textFaint,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            GestureDetector(
              onTap: () => widget.onTap(_selected),
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
        const SizedBox(height: 12),
        if (tarefasDoDia.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 22),
            child: Center(
              child: Column(
                children: const [
                  Icon(Icons.weekend_outlined,
                      size: 28, color: LiriunColors.textFaint),
                  SizedBox(height: 6),
                  Text(
                    'Dia leve. Sem compromissos.',
                    style: TextStyle(
                      fontSize: 12,
                      color: LiriunColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          for (final t in tarefasDoDia)
            _WeekTimelineRow(task: t, color: _catColor(t)),
      ],
    );
  }
}

class _DayChip extends StatelessWidget {
  const _DayChip({
    required this.day,
    required this.label,
    required this.count,
    required this.isSelected,
    required this.onTap,
  });
  final DateTime day;
  final String label;
  final int count;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final dotColor = isSelected
        ? Colors.white.withValues(alpha: 0.85)
        : LiriunColors.violet300;
    final dotCount = count.clamp(0, 3);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          gradient: isSelected ? LiriunColors.gradBrand : null,
          color: isSelected ? null : const Color(0x0AFFFFFF),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? Colors.transparent
                : LiriunColors.border,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: LiriunColors.violet500.withValues(alpha: 0.40),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ]
              : null,
        ),
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Geist Mono',
                fontSize: 9,
                letterSpacing: 0.4,
                fontWeight: FontWeight.w600,
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.85)
                    : LiriunColors.textFaint,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${day.day}',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.3,
                color: isSelected ? Colors.white : LiriunColors.text,
                height: 1,
              ),
            ),
            const SizedBox(height: 6),
            SizedBox(
              height: 4,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (var i = 0; i < dotCount; i++) ...[
                    Container(
                      width: 4,
                      height: 4,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: dotColor,
                      ),
                    ),
                    if (i < dotCount - 1) const SizedBox(width: 3),
                  ],
                  if (count == 0)
                    Container(
                      width: 4,
                      height: 4,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: LiriunColors.border,
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

class _WeekTimelineRow extends StatelessWidget {
  const _WeekTimelineRow({required this.task, required this.color});
  final TarefaDto task;
  final Color color;

  String get _hora => task.horarioFinal == null
      ? '--:--'
      : task.horarioFinal!.substring(0, 5);

  String? get _dur => task.observacoes != null && task.observacoes!.contains('min')
      ? null
      : null;

  @override
  Widget build(BuildContext context) {
    final done = task.concluidaEm != null;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 48,
            child: Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                _hora,
                style: const TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 10,
                  letterSpacing: 0.4,
                  color: LiriunColors.textFaint,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 16),
            child: Container(
              width: 9,
              height: 9,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: color,
                boxShadow: [
                  BoxShadow(
                    color: color.withValues(alpha: 0.55),
                    blurRadius: 8,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0x0AFFFFFF),
                borderRadius: BorderRadius.circular(11),
                border: Border.all(color: LiriunColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    task.nome,
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
                  if (_dur != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      _dur!,
                      style: const TextStyle(
                        fontFamily: 'Geist Mono',
                        fontSize: 9,
                        letterSpacing: 0.3,
                        color: LiriunColors.textFaint,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
