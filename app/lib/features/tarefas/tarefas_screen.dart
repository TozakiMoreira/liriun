import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../models/task.dart';
import '../../models/task_mapper.dart';

class TarefasScreen extends ConsumerStatefulWidget {
  const TarefasScreen({super.key});

  @override
  ConsumerState<TarefasScreen> createState() => _TarefasScreenState();
}

enum _Filter { hoje, semana, atrasadas, semPrazo }

class _TarefasScreenState extends ConsumerState<TarefasScreen> {
  _Filter _filter = _Filter.hoje;

  bool _matchFilter(Task t, _Filter f) {
    final now = DateTime.now();
    final d = t.scheduledFor ?? t.createdAt;
    switch (f) {
      case _Filter.hoje:
        return d.year == now.year && d.month == now.month && d.day == now.day;
      case _Filter.semana:
        return d.difference(now).inDays.abs() <= 7;
      case _Filter.atrasadas:
        return t.scheduledFor != null &&
            t.scheduledFor!.isBefore(now) &&
            t.completedAt == null;
      case _Filter.semPrazo:
        return t.scheduledFor == null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final pendentesAsync = ref.watch(pendentesProvider);
    return Scaffold(
      backgroundColor: LiriunColors.surface,
      body: SafeArea(
        bottom: false,
        child: pendentesAsync.when(
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
          data: (dtos) {
            final tasks = dtos.map((d) => d.toTask()).toList();
            final byCategoryDto = <String, _Coll>{};
            for (final d in dtos) {
              for (final c in d.categorias) {
                final coll = byCategoryDto.putIfAbsent(
                    c.id, () => _Coll(id: c.id, nome: c.nome));
                coll.total += 1;
                if (d.concluidaEm != null) coll.done += 1;
              }
            }
            final colls = byCategoryDto.values.toList()
              ..sort((a, b) => b.total.compareTo(a.total));

            final counts = {
              _Filter.hoje: tasks.where((t) => _matchFilter(t, _Filter.hoje)).length,
              _Filter.semana: tasks.where((t) => _matchFilter(t, _Filter.semana)).length,
              _Filter.atrasadas:
                  tasks.where((t) => _matchFilter(t, _Filter.atrasadas)).length,
              _Filter.semPrazo: tasks.where((t) => _matchFilter(t, _Filter.semPrazo)).length,
            };

            final smartPrioritarias =
                tasks.where((t) => t.priority == Priority.high && t.completedAt == null).length;
            final smartHoje = tasks
                .where((t) => t.completedAt == null && _matchFilter(t, _Filter.hoje))
                .length;
            final smartSemCat =
                tasks.where((t) => t.category == Category.personal).length;

            return ListView(
              padding: const EdgeInsets.fromLTRB(18, 22, 18, 140),
              children: [
                _Header(),
                const SizedBox(height: 14),
                _SearchField(),
                const SizedBox(height: 12),
                _FilterChips(
                  selected: _filter,
                  counts: counts,
                  onSelect: (f) => setState(() => _filter = f),
                ),
                const SizedBox(height: 22),
                if (colls.isNotEmpty) ...[
                  const _SectionLabel('COLEÇÕES'),
                  const SizedBox(height: 10),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 1.15,
                    ),
                    itemCount: colls.length,
                    itemBuilder: (context, i) {
                      final c = colls[i];
                      return _CollectionCard(
                        coll: c,
                        onTap: () => context.push('/tarefas/cat/${c.id}'),
                      );
                    },
                  ),
                  const SizedBox(height: 22),
                ],
                const _SectionLabel('LISTAS INTELIGENTES'),
                const SizedBox(height: 8),
                _SmartList(
                  items: [
                    _Smart(icon: '★', label: 'Prioritárias', count: smartPrioritarias),
                    _Smart(icon: '◷', label: 'Agendadas hoje', count: smartHoje),
                    _Smart(icon: '⊘', label: 'Sem categoria', count: smartSemCat),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _Coll {
  _Coll({required this.id, required this.nome});
  final String id;
  final String nome;
  int total = 0;
  int done = 0;

  Color get color {
    final l = nome.toLowerCase();
    if (l.contains('trabalho')) return LiriunColors.catWork;
    if (l.contains('saúde') || l.contains('saude')) return LiriunColors.catHealth;
    if (l.contains('casa')) return LiriunColors.catHome;
    if (l.contains('finança') || l.contains('financa') || l.contains('gasto')) {
      return LiriunColors.catFinance;
    }
    return LiriunColors.catPersonal;
  }
}

class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'SUAS COLEÇÕES',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 1.4,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.textFaint,
                ),
              ),
              SizedBox(height: 4),
              Text(
                'Tarefas',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.6,
                  color: LiriunColors.text,
                ),
              ),
            ],
          ),
        ),
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0x0DFFFFFF),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: LiriunColors.border),
          ),
          child: const Icon(Icons.search_rounded,
              size: 16, color: LiriunColors.textMuted),
        ),
      ],
    );
  }
}

class _SearchField extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0x08FFFFFF),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Row(
        children: const [
          Icon(Icons.search, size: 14, color: LiriunColors.textFaint),
          SizedBox(width: 8),
          Text(
            'Buscar por título ou pessoa...',
            style: TextStyle(
              fontSize: 12,
              color: LiriunColors.textFaint,
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChips extends StatelessWidget {
  const _FilterChips({
    required this.selected,
    required this.counts,
    required this.onSelect,
  });
  final _Filter selected;
  final Map<_Filter, int> counts;
  final void Function(_Filter) onSelect;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _chip(_Filter.hoje, 'Hoje'),
          const SizedBox(width: 6),
          _chip(_Filter.semana, 'Semana'),
          const SizedBox(width: 6),
          _chip(_Filter.atrasadas, 'Atrasadas'),
          const SizedBox(width: 6),
          _chip(_Filter.semPrazo, 'Sem prazo'),
        ],
      ),
    );
  }

  Widget _chip(_Filter f, String label) {
    final active = selected == f;
    final n = counts[f] ?? 0;
    return GestureDetector(
      onTap: () => onSelect(f),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: active
              ? LiriunColors.violet400.withValues(alpha: 0.10)
              : const Color(0x09FFFFFF),
          borderRadius: BorderRadius.circular(LiriunRadii.pill),
          border: Border.all(
            color: active
                ? LiriunColors.violet400.withValues(alpha: 0.30)
                : LiriunColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: active ? LiriunColors.violet300 : LiriunColors.textMuted,
                letterSpacing: -0.1,
              ),
            ),
            const SizedBox(width: 5),
            Text(
              '$n',
              style: const TextStyle(
                fontFamily: 'Geist Mono',
                fontSize: 9,
                color: LiriunColors.textFaint,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label);
  final String label;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2),
      child: Text(
        label,
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
}

class _CollectionCard extends StatelessWidget {
  const _CollectionCard({required this.coll, required this.onTap});
  final _Coll coll;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final pct = coll.total == 0 ? 0.0 : coll.done / coll.total;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              stops: const [0.0, 0.7],
              colors: [
                coll.color.withValues(alpha: 0.10),
                const Color(0x05FFFFFF),
              ],
            ),
            border: Border.all(color: coll.color.withValues(alpha: 0.22)),
          ),
          child: Stack(
            children: [
              Positioned(
                top: -16,
                right: -16,
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: coll.color.withValues(alpha: 0.18),
                  ),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 9,
                    height: 9,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: coll.color,
                      boxShadow: [
                        BoxShadow(
                          color: coll.color.withValues(alpha: 0.66),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    coll.nome,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: LiriunColors.text,
                      letterSpacing: -0.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(99),
                    child: LinearProgressIndicator(
                      value: pct,
                      minHeight: 3,
                      backgroundColor: const Color(0x0DFFFFFF),
                      valueColor:
                          AlwaysStoppedAnimation(coll.color.withValues(alpha: 0.8)),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${coll.done}/${coll.total}',
                        style: const TextStyle(
                          fontFamily: 'Geist Mono',
                          fontSize: 9,
                          color: LiriunColors.textFaint,
                          letterSpacing: 0.3,
                        ),
                      ),
                      Text(
                        '${(pct * 100).round()}%',
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
            ],
          ),
        ),
      ),
    );
  }
}

class _Smart {
  _Smart({required this.icon, required this.label, required this.count});
  final String icon;
  final String label;
  final int count;
}

class _SmartList extends StatelessWidget {
  const _SmartList({required this.items});
  final List<_Smart> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0x06FFFFFF),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Column(
        children: [
          for (var i = 0; i < items.length; i++) ...[
            _row(items[i]),
            if (i < items.length - 1)
              Container(
                height: 1,
                margin: const EdgeInsets.symmetric(horizontal: 12),
                color: LiriunColors.border,
              ),
          ],
        ],
      ),
    );
  }

  Widget _row(_Smart it) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
      child: Row(
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              color: LiriunColors.violet400.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(7),
            ),
            alignment: Alignment.center,
            child: Text(
              it.icon,
              style: const TextStyle(
                fontFamily: 'Geist Mono',
                fontSize: 11,
                color: LiriunColors.violet300,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              it.label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: LiriunColors.text,
                letterSpacing: -0.1,
              ),
            ),
          ),
          Text(
            '${it.count}',
            style: const TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 10,
              color: LiriunColors.textFaint,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(width: 6),
          const Icon(Icons.chevron_right_rounded,
              size: 14, color: LiriunColors.textDim),
        ],
      ),
    );
  }
}
