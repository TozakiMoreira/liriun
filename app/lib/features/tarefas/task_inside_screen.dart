import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../models/task_mapper.dart';

class TaskInsideScreen extends ConsumerStatefulWidget {
  const TaskInsideScreen({super.key, required this.categoryId});

  final String categoryId;

  @override
  ConsumerState<TaskInsideScreen> createState() => _TaskInsideScreenState();
}

class _TaskInsideScreenState extends ConsumerState<TaskInsideScreen> {
  int _tab = 0;

  bool _isToday(DateTime d) {
    final n = DateTime.now();
    return d.year == n.year && d.month == n.month && d.day == n.day;
  }

  bool _isThisWeek(DateTime d) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final endWeek = today.add(const Duration(days: 7));
    final dn = DateTime(d.year, d.month, d.day);
    return dn.isAfter(today) && dn.isBefore(endWeek);
  }

  String _relativo(DateTime d) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(d.year, d.month, d.day);
    final diff = target.difference(today).inDays;
    if (diff == 0) return 'HOJE';
    if (diff == 1) return 'AMANHÃ';
    if (diff > 1 && diff <= 6) {
      const wd = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
      return wd[d.weekday - 1];
    }
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final pendentesAsync = ref.watch(pendentesProvider);
    final concluidasAsync = ref.watch(concluidasProvider);

    return Scaffold(
      backgroundColor: LiriunColors.bg,
      body: pendentesAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: LiriunColors.violet300),
        ),
        error: (e, _) => Center(
          child: Text('Erro: $e',
              style: const TextStyle(color: LiriunColors.danger)),
        ),
        data: (pendentes) {
          final concluidas = concluidasAsync.valueOrNull ?? [];
          final pendentesCat = pendentes
              .where((t) =>
                  t.categorias.any((c) => c.id == widget.categoryId))
              .toList();
          final concluidasCat = concluidas
              .where((t) =>
                  t.categorias.any((c) => c.id == widget.categoryId))
              .toList();
          final total = pendentesCat.length + concluidasCat.length;
          final done = concluidasCat.length;
          final pct = total == 0 ? 0.0 : done / total;
          final categoryName = [...pendentesCat, ...concluidasCat]
                  .expand((t) => t.categorias)
                  .where((c) => c.id == widget.categoryId)
                  .map((c) => c.nome)
                  .firstOrNull ??
              'Categoria';
          final color = pendentesCat.isNotEmpty
              ? pendentesCat.first.toTask().category.color
              : (concluidasCat.isNotEmpty
                  ? concluidasCat.first.toTask().category.color
                  : LiriunColors.violet400);
          final tabTasks =
              _tab == 0 ? pendentesCat : concluidasCat;

          return SafeArea(
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(18, 8, 18, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        GestureDetector(
                          onTap: () => context.pop(),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.chevron_left_rounded,
                                  size: 16, color: LiriunColors.textMuted),
                              SizedBox(width: 4),
                              Text(
                                'VOLTAR',
                                style: TextStyle(
                                  fontFamily: 'Geist Mono',
                                  fontSize: 10,
                                  letterSpacing: 0.4,
                                  color: LiriunColors.textFaint,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: 0.16),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                    color: color.withValues(alpha: 0.32)),
                                boxShadow: [
                                  BoxShadow(
                                    color: color.withValues(alpha: 0.20),
                                    blurRadius: 16,
                                  ),
                                ],
                              ),
                              child: Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: color,
                                  boxShadow: [
                                    BoxShadow(
                                      color: color,
                                      blurRadius: 8,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  categoryName,
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w600,
                                    color: LiriunColors.text,
                                    letterSpacing: -0.5,
                                    height: 1,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '$done DE $total · ${(pct * 100).round()}%',
                                  style: const TextStyle(
                                    fontFamily: 'Geist Mono',
                                    fontSize: 9,
                                    letterSpacing: 0.4,
                                    color: LiriunColors.textFaint,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Container(
                          height: 4,
                          decoration: BoxDecoration(
                            color: const Color(0x0FFFFFFF),
                            borderRadius: BorderRadius.circular(99),
                          ),
                          child: FractionallySizedBox(
                            alignment: Alignment.centerLeft,
                            widthFactor: pct.clamp(0.0, 1.0),
                            child: Container(
                              decoration: BoxDecoration(
                                color: color,
                                borderRadius: BorderRadius.circular(99),
                                boxShadow: [
                                  BoxShadow(
                                    color: color.withValues(alpha: 0.55),
                                    blurRadius: 12,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                      ],
                    ),
                  ),
                ),
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _TabsDelegate(
                    selected: _tab,
                    abertas: pendentesCat.length,
                    concluidas: concluidasCat.length,
                    onSelect: (i) => setState(() => _tab = i),
                  ),
                ),
                if (tabTasks.isEmpty)
                  const SliverPadding(
                    padding: EdgeInsets.fromLTRB(18, 30, 18, 0),
                    sliver: SliverToBoxAdapter(
                      child: Center(
                        child: Text(
                          'Sem tarefas aqui ainda.',
                          style: TextStyle(
                            color: LiriunColors.textFaint,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                  )
                else
                  ..._buildGroups(tabTasks, color),
                const SliverToBoxAdapter(child: SizedBox(height: 140)),
              ],
            ),
          );
        },
      ),
    );
  }

  List<Widget> _buildGroups(List<TarefaDto> items, Color catColor) {
    final hoje = items.where((t) => _isToday(t.dataPrazo)).toList();
    final semana = items
        .where((t) => !_isToday(t.dataPrazo) && _isThisWeek(t.dataPrazo))
        .toList();
    final depois = items
        .where((t) =>
            !_isToday(t.dataPrazo) &&
            !_isThisWeek(t.dataPrazo) &&
            t.dataPrazo.isAfter(DateTime.now()))
        .toList();
    final groups = <(String, List<TarefaDto>)>[
      if (hoje.isNotEmpty) ('HOJE', hoje),
      if (semana.isNotEmpty) ('ESTA SEMANA', semana),
      if (depois.isNotEmpty) ('DEPOIS', depois),
    ];
    return [
      for (final (label, list) in groups)
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(18, 14, 18, 0),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, i) {
                if (i == 0) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Text(
                      '$label · ${list.length}',
                      style: const TextStyle(
                        fontFamily: 'Geist Mono',
                        fontSize: 9,
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.w600,
                        color: LiriunColors.textFaint,
                      ),
                    ),
                  );
                }
                final t = list[i - 1];
                return _TaskRow(
                  dto: t,
                  weekdayHint:
                      label == 'ESTA SEMANA' || label == 'DEPOIS'
                          ? _relativo(t.dataPrazo)
                          : null,
                  catColor: catColor,
                  onToggle: () async {
                    HapticFeedback.lightImpact();
                    try {
                      if (t.concluidaEm == null) {
                        await ref
                            .read(tarefasApiProvider)
                            .concluir(t.id);
                      } else {
                        await ref
                            .read(tarefasApiProvider)
                            .reabrir(t.id);
                      }
                    } catch (err) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Falha: $err'),
                            duration: const Duration(seconds: 3),
                            backgroundColor: LiriunColors.surfaceHi,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      }
                    }
                    ref.invalidate(pendentesProvider);
                    ref.invalidate(concluidasProvider);
                  },
                  onTap: () => context.push('/task/${t.id}'),
                );
              },
              childCount: list.length + 1,
            ),
          ),
        ),
    ];
  }
}

class _TabsDelegate extends SliverPersistentHeaderDelegate {
  _TabsDelegate({
    required this.selected,
    required this.abertas,
    required this.concluidas,
    required this.onSelect,
  });
  final int selected;
  final int abertas;
  final int concluidas;
  final void Function(int) onSelect;

  @override
  double get minExtent => 44;
  @override
  double get maxExtent => 44;

  @override
  Widget build(BuildContext context, double shrink, bool overlap) {
    return Container(
      color: LiriunColors.bg,
      padding: const EdgeInsets.fromLTRB(18, 6, 18, 0),
      child: Stack(
        children: [
          Positioned(
            left: 18,
            right: 18,
            bottom: 0,
            child: Container(height: 1, color: LiriunColors.border),
          ),
          Row(
            children: [
              _tab('Abertas', 0, abertas),
              const SizedBox(width: 16),
              _tab('Concluídas', 1, concluidas),
              const SizedBox(width: 16),
              _tab('Arquivadas', 2, 0),
            ],
          ),
        ],
      ),
    );
  }

  Widget _tab(String label, int i, int n) {
    final active = selected == i;
    return GestureDetector(
      onTap: () => onSelect(i),
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.fromLTRB(0, 0, 0, 10),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: active ? LiriunColors.violet400 : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: active ? LiriunColors.text : LiriunColors.textFaint,
                letterSpacing: -0.1,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
              decoration: BoxDecoration(
                color: active
                    ? LiriunColors.violet400.withValues(alpha: 0.10)
                    : const Color(0x0AFFFFFF),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '$n',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  color: active
                      ? LiriunColors.violet300
                      : LiriunColors.textFaint,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _TabsDelegate old) =>
      old.selected != selected ||
      old.abertas != abertas ||
      old.concluidas != concluidas;
}

class _TaskRow extends StatelessWidget {
  const _TaskRow({
    required this.dto,
    required this.weekdayHint,
    required this.catColor,
    required this.onToggle,
    required this.onTap,
  });
  final TarefaDto dto;
  final String? weekdayHint;
  final Color catColor;
  final VoidCallback onToggle;
  final VoidCallback onTap;

  String? get _hora {
    if (dto.horarioFinal == null) return null;
    return dto.horarioFinal!.substring(0, 5);
  }

  bool get _alta => dto.prioridade <= 2;
  bool get _done => dto.concluidaEm != null;
  bool get _prep =>
      dto.observacoes != null && dto.observacoes!.toLowerCase().contains('prep');

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: LiriunColors.border)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: onToggle,
                child: Container(
                  width: 18,
                  height: 18,
                  margin: const EdgeInsets.only(top: 2),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _done ? catColor : Colors.transparent,
                    border: Border.all(
                      color: _done ? catColor : LiriunColors.borderHi,
                      width: 1.5,
                    ),
                  ),
                  child: _done
                      ? const Icon(Icons.check_rounded,
                          size: 11, color: Colors.white)
                      : null,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            dto.nome,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: _done
                                  ? LiriunColors.textFaint
                                  : LiriunColors.text,
                              letterSpacing: -0.1,
                              decoration: _done
                                  ? TextDecoration.lineThrough
                                  : null,
                            ),
                          ),
                        ),
                        if (_prep) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: LiriunColors.violet400
                                  .withValues(alpha: 0.10),
                              border: Border.all(
                                color: LiriunColors.violet400
                                    .withValues(alpha: 0.22),
                              ),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              '+15M PREP',
                              style: TextStyle(
                                fontFamily: 'Geist Mono',
                                fontSize: 8,
                                color: LiriunColors.violet300,
                                letterSpacing: 0.4,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (_hora != null || _alta) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          if (_hora != null)
                            Text(
                              _hora!,
                              style: const TextStyle(
                                fontFamily: 'Geist Mono',
                                fontSize: 9,
                                color: LiriunColors.textFaint,
                                letterSpacing: 0.3,
                              ),
                            ),
                          if (_alta) ...[
                            if (_hora != null) const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 5, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0x1AF0B36E),
                                border: Border.all(
                                    color: const Color(0x3DF0B36E)),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'ALTA',
                                style: TextStyle(
                                  fontFamily: 'Geist Mono',
                                  fontSize: 8,
                                  color: Color(0xFFF0B36E),
                                  letterSpacing: 0.4,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              if (weekdayHint != null)
                Padding(
                  padding: const EdgeInsets.only(left: 6, top: 1),
                  child: Text(
                    weekdayHint!,
                    style: const TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 9,
                      letterSpacing: 0.3,
                      color: LiriunColors.textFaint,
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
