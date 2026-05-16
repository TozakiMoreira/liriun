import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../models/task.dart';
import '../../models/task_mapper.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/skeleton.dart';

enum _Filter { none, hoje, semana, atrasadas, prioritarias, semCategoria }

class TarefasScreen extends ConsumerStatefulWidget {
  const TarefasScreen({super.key});

  @override
  ConsumerState<TarefasScreen> createState() => _TarefasScreenState();
}

class _TarefasScreenState extends ConsumerState<TarefasScreen> {
  _Filter _filter = _Filter.none;
  String _busca = '';
  final _buscaCtrl = TextEditingController();

  @override
  void dispose() {
    _buscaCtrl.dispose();
    super.dispose();
  }

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

  bool _isOverdue(TarefaDto t) {
    if (t.concluidaEm != null) return false;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final dn = DateTime(t.dataPrazo.year, t.dataPrazo.month, t.dataPrazo.day);
    return dn.isBefore(today);
  }

  String _relativo(DateTime d) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(d.year, d.month, d.day);
    final diff = target.difference(today).inDays;
    if (diff == 0) return 'HOJE';
    if (diff == 1) return 'AMANHÃ';
    if (diff == -1) return 'ONTEM';
    if (diff > 1 && diff <= 6) return 'EM ${diff}D';
    if (diff < -1 && diff >= -6) return '${diff.abs()}D ATRÁS';
    if (diff > 6 && diff <= 13) {
      const wd = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
      return wd[d.weekday - 1];
    }
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}';
  }

  Map<String, _CatGroup> _coletar(
      List<TarefaDto> pendentes, List<TarefaDto> concluidas) {
    final all = <String, _CatGroup>{};
    void add(TarefaDto t, bool done) {
      for (final c in t.categorias) {
        final g = all.putIfAbsent(
          c.id,
          () => _CatGroup(id: c.id, nome: c.nome, total: 0, done: 0),
        );
        g.total += 1;
        if (done) g.done += 1;
      }
    }

    for (final t in pendentes) {
      add(t, false);
    }
    for (final t in concluidas) {
      add(t, true);
    }
    return all;
  }

  Color _catColor(String nome) {
    final lower = nome.toLowerCase();
    if (lower.contains('trabalho') || lower.contains('work')) return LiriunColors.catWork;
    if (lower.contains('saúde') ||
        lower.contains('saude') ||
        lower.contains('health') ||
        lower.contains('academia') ||
        lower.contains('treino') ||
        lower.contains('exerc')) {
      return LiriunColors.catHealth;
    }
    if (lower.contains('casa') || lower.contains('home')) return LiriunColors.catHome;
    if (lower.contains('finança') ||
        lower.contains('financa') ||
        lower.contains('gasto') ||
        lower.contains('dinheiro')) {
      return const Color(0xFFE58FB0);
    }
    return LiriunColors.catPersonal;
  }

  int _countHoje(List<TarefaDto> pendentes) =>
      pendentes.where((t) => _isToday(t.dataPrazo)).length;
  int _countSemana(List<TarefaDto> pendentes) => pendentes
      .where((t) => !_isToday(t.dataPrazo) && _isThisWeek(t.dataPrazo))
      .length;
  int _countAtrasadas(List<TarefaDto> pendentes) =>
      pendentes.where(_isOverdue).length;
  int _countPrioritarias(List<TarefaDto> pendentes) =>
      pendentes.where((t) => t.prioridade <= 2).length;
  int _countSemCategoria(List<TarefaDto> pendentes) =>
      pendentes.where((t) => t.categorias.isEmpty).length;

  List<TarefaDto> _filtrar(List<TarefaDto> pendentes) {
    Iterable<TarefaDto> it = pendentes;
    switch (_filter) {
      case _Filter.hoje:
        it = it.where((t) => _isToday(t.dataPrazo));
      case _Filter.semana:
        it = it.where((t) =>
            !_isToday(t.dataPrazo) && _isThisWeek(t.dataPrazo));
      case _Filter.atrasadas:
        it = it.where(_isOverdue);
      case _Filter.prioritarias:
        it = it.where((t) => t.prioridade <= 2);
      case _Filter.semCategoria:
        it = it.where((t) => t.categorias.isEmpty);
      case _Filter.none:
        break;
    }
    if (_busca.isNotEmpty) {
      final q = _busca.toLowerCase();
      it = it.where((t) => t.nome.toLowerCase().contains(q));
    }
    return it.toList();
  }

  @override
  Widget build(BuildContext context) {
    final pendentesAsync = ref.watch(pendentesProvider);
    final concluidasAsync = ref.watch(concluidasProvider);

    return Scaffold(
      backgroundColor: LiriunColors.surface,
      body: SafeArea(
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
                  Skeleton(width: 100, height: 9, radius: 3),
                  SizedBox(height: 8),
                  Skeleton(width: 140, height: 26, radius: 6),
                  SizedBox(height: 22),
                  Skeleton(height: 36, radius: 12),
                  SizedBox(height: 14),
                  Skeleton(height: 30, radius: 99),
                  SizedBox(height: 18),
                  TaskListSkeleton(count: 5),
                ],
              ),
            ),
            error: (e, _) => Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Text(
                  'Erro: $e',
                  style: const TextStyle(color: LiriunColors.danger),
                ),
              ),
            ),
            data: (pendentes) {
              final concluidas = concluidasAsync.valueOrNull ?? [];
              final cats = _coletar(pendentes, concluidas);

              return CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
                    sliver: SliverToBoxAdapter(
                      child: _Header(
                        onSearchTap: () =>
                            FocusScope.of(context).requestFocus(FocusNode()),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
                    sliver: SliverToBoxAdapter(
                      child: _SearchField(
                        controller: _buscaCtrl,
                        onChanged: (v) => setState(() => _busca = v),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                    sliver: SliverToBoxAdapter(
                      child: _QuickFilters(
                        active: _filter,
                        counts: {
                          _Filter.hoje: _countHoje(pendentes),
                          _Filter.semana: _countSemana(pendentes),
                          _Filter.atrasadas: _countAtrasadas(pendentes),
                        },
                        onTap: (f) => setState(() {
                          _filter = _filter == f ? _Filter.none : f;
                        }),
                      ),
                    ),
                  ),
                  if (_filter != _Filter.none || _busca.isNotEmpty)
                    ..._buildLista(_filtrar(pendentes))
                  else ...[
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
                      sliver: SliverToBoxAdapter(
                        child: _CollectionsSection(
                          cats: cats.values.toList(),
                          colorOf: _catColor,
                        ),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
                      sliver: SliverToBoxAdapter(
                        child: _SmartLists(
                          counts: {
                            _Filter.prioritarias:
                                _countPrioritarias(pendentes),
                            _Filter.hoje: _countHoje(pendentes),
                            _Filter.semCategoria:
                                _countSemCategoria(pendentes),
                          },
                          onTap: (f) => setState(() => _filter = f),
                        ),
                      ),
                    ),
                  ],
                  const SliverToBoxAdapter(child: SizedBox(height: 140)),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  String _filterLabel(_Filter f) {
    switch (f) {
      case _Filter.hoje:
        return 'Hoje';
      case _Filter.semana:
        return 'Semana';
      case _Filter.atrasadas:
        return 'Atrasadas';
      case _Filter.prioritarias:
        return 'Prioritárias';
      case _Filter.semCategoria:
        return 'Sem categoria';
      case _Filter.none:
        return '';
    }
  }

  Widget _activeFilterBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => setState(() {
              _filter = _Filter.none;
              _busca = '';
              _buscaCtrl.clear();
            }),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: LiriunColors.violet400.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(99),
                border: Border.all(
                    color: LiriunColors.violet400.withValues(alpha: 0.32)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.chevron_left_rounded,
                      size: 14, color: LiriunColors.violet300),
                  const SizedBox(width: 4),
                  Text(
                    _filter == _Filter.none
                        ? 'Busca: "$_busca"'
                        : _filterLabel(_filter),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: LiriunColors.violet300,
                      letterSpacing: -0.1,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.close_rounded,
                      size: 12, color: LiriunColors.violet300),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildLista(List<TarefaDto> items) {
    final bar = SliverToBoxAdapter(child: _activeFilterBar());
    if (items.isEmpty) {
      return [
        bar,
        const SliverPadding(
          padding: EdgeInsets.fromLTRB(20, 18, 20, 0),
          sliver: SliverToBoxAdapter(
            child: EmptyState(
              icon: Icons.search_off_rounded,
              title: 'Nada por aqui.',
              body: 'Ajusta o filtro ou a busca.',
            ),
          ),
        ),
      ];
    }
    return [
      bar,
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
        sliver: SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, i) {
              final t = items[i];
              return _TaskRow(
                dto: t,
                task: t.toTask(),
                weekdayHint: _relativo(t.dataPrazo),
                onToggle: () async {
                  HapticFeedback.lightImpact();
                  try {
                    if (t.concluidaEm == null) {
                      await ref.read(tarefasApiProvider).concluir(t.id);
                    } else {
                      await ref.read(tarefasApiProvider).reabrir(t.id);
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
            childCount: items.length,
          ),
        ),
      ),
    ];
  }
}

class _CatGroup {
  _CatGroup({
    required this.id,
    required this.nome,
    required this.total,
    required this.done,
  });
  final String id;
  final String nome;
  int total;
  int done;
}

class _Header extends StatelessWidget {
  const _Header({required this.onSearchTap});
  final VoidCallback onSearchTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
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
        GestureDetector(
          onTap: onSearchTap,
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: const Color(0x0DFFFFFF),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: LiriunColors.border),
            ),
            child: const Icon(Icons.search_rounded,
                size: 14, color: LiriunColors.textMuted),
          ),
        ),
      ],
    );
  }
}

class _SearchField extends StatelessWidget {
  const _SearchField({required this.controller, required this.onChanged});
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0x08FFFFFF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.search_rounded,
              size: 13, color: LiriunColors.textFaint),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: onChanged,
              style: const TextStyle(
                fontSize: 12,
                color: LiriunColors.text,
                letterSpacing: -0.1,
              ),
              decoration: const InputDecoration(
                hintText: 'Buscar por título...',
                hintStyle: TextStyle(
                  fontSize: 12,
                  color: LiriunColors.textFaint,
                  letterSpacing: -0.1,
                ),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 10),
                isDense: true,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickFilters extends StatelessWidget {
  const _QuickFilters({
    required this.active,
    required this.counts,
    required this.onTap,
  });
  final _Filter active;
  final Map<_Filter, int> counts;
  final ValueChanged<_Filter> onTap;

  @override
  Widget build(BuildContext context) {
    final items = [
      (_Filter.hoje, 'Hoje'),
      (_Filter.semana, 'Semana'),
      (_Filter.atrasadas, 'Atrasadas'),
    ];
    return SizedBox(
      height: 30,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemBuilder: (_, i) {
          final (f, label) = items[i];
          final on = active == f;
          final n = counts[f] ?? 0;
          return GestureDetector(
            onTap: () => onTap(f),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: on
                    ? LiriunColors.violet400.withValues(alpha: 0.10)
                    : const Color(0x09FFFFFF),
                borderRadius: BorderRadius.circular(99),
                border: Border.all(
                  color: on
                      ? LiriunColors.violet400.withValues(alpha: 0.32)
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
                      letterSpacing: -0.1,
                      color: on ? LiriunColors.violet300 : LiriunColors.textMuted,
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
        },
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemCount: items.length,
      ),
    );
  }
}

class _CollectionsSection extends StatelessWidget {
  const _CollectionsSection({required this.cats, required this.colorOf});
  final List<_CatGroup> cats;
  final Color Function(String) colorOf;

  @override
  Widget build(BuildContext context) {
    if (cats.isEmpty) {
      return const EmptyState(
        icon: Icons.folder_outlined,
        title: 'Sem coleções ainda.',
        body: 'Categorias aparecem aqui conforme você cria tarefas.',
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(left: 2, bottom: 10),
          child: Text(
            'COLEÇÕES',
            style: TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 9,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w600,
              color: LiriunColors.textFaint,
            ),
          ),
        ),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisExtent: 110,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
          ),
          itemCount: cats.length,
          itemBuilder: (_, i) {
            final cat = cats[i];
            final c = colorOf(cat.nome);
            final pct = cat.total == 0 ? 0.0 : cat.done / cat.total;
            return _CollectionCard(group: cat, color: c, pct: pct);
          },
        ),
      ],
    );
  }
}

class _CollectionCard extends StatelessWidget {
  const _CollectionCard({
    required this.group,
    required this.color,
    required this.pct,
  });
  final _CatGroup group;
  final Color color;
  final double pct;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => context.push('/tarefas/cat/${group.id}'),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                color.withValues(alpha: 0.10),
                const Color(0x05FFFFFF),
              ],
            ),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withValues(alpha: 0.22)),
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
                    color: color.withValues(alpha: 0.18),
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
                      color: color,
                      boxShadow: [
                        BoxShadow(
                          color: color.withValues(alpha: 0.55),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    group.nome,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: LiriunColors.text,
                      letterSpacing: -0.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 3,
                    decoration: BoxDecoration(
                      color: const Color(0x0DFFFFFF),
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: FractionallySizedBox(
                      alignment: Alignment.centerLeft,
                      widthFactor: pct.clamp(0.0, 1.0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.85),
                          borderRadius: BorderRadius.circular(99),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${group.done}/${group.total}',
                        style: const TextStyle(
                          fontFamily: 'Geist Mono',
                          fontSize: 9,
                          letterSpacing: 0.3,
                          color: LiriunColors.textFaint,
                        ),
                      ),
                      Text(
                        '${(pct * 100).round()}%',
                        style: const TextStyle(
                          fontFamily: 'Geist Mono',
                          fontSize: 9,
                          letterSpacing: 0.3,
                          color: LiriunColors.textFaint,
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

class _SmartLists extends StatelessWidget {
  const _SmartLists({required this.counts, required this.onTap});
  final Map<_Filter, int> counts;
  final ValueChanged<_Filter> onTap;

  @override
  Widget build(BuildContext context) {
    final items = [
      (_Filter.prioritarias, '★', 'Prioritárias'),
      (_Filter.hoje, '◷', 'Agendadas hoje'),
      (_Filter.semCategoria, '⊘', 'Sem categoria'),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(left: 2, bottom: 8),
          child: Text(
            'LISTAS INTELIGENTES',
            style: TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 9,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w600,
              color: LiriunColors.textFaint,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: const Color(0x06FFFFFF),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: LiriunColors.border),
          ),
          child: Column(
            children: [
              for (var i = 0; i < items.length; i++) ...[
                _SmartItem(
                  icon: items[i].$2,
                  label: items[i].$3,
                  count: counts[items[i].$1] ?? 0,
                  onTap: () => onTap(items[i].$1),
                ),
                if (i < items.length - 1)
                  Container(
                    height: 1,
                    margin: const EdgeInsets.only(left: 46),
                    color: LiriunColors.border,
                  ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _SmartItem extends StatelessWidget {
  const _SmartItem({
    required this.icon,
    required this.label,
    required this.count,
    required this.onTap,
  });
  final String icon;
  final String label;
  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
          child: Row(
            children: [
              Container(
                width: 22,
                height: 22,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: LiriunColors.violet400.withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(7),
                ),
                child: Text(
                  icon,
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
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: LiriunColors.text,
                    letterSpacing: -0.1,
                  ),
                ),
              ),
              Text(
                '$count',
                style: const TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 10,
                  color: LiriunColors.textFaint,
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(width: 8),
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

class _TaskRow extends StatelessWidget {
  const _TaskRow({
    required this.dto,
    required this.task,
    required this.onTap,
    required this.onToggle,
    required this.weekdayHint,
  });

  final TarefaDto dto;
  final Task task;
  final VoidCallback onTap;
  final VoidCallback onToggle;
  final String weekdayHint;

  bool get _alta => task.priority == Priority.high;
  bool get _done => task.completedAt != null;

  String? get _hora {
    final h = task.scheduledFor;
    if (h == null) return null;
    return '${h.hour.toString().padLeft(2, '0')}:${h.minute.toString().padLeft(2, '0')}';
  }

  Color get _catColor => task.category.color;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 11),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: LiriunColors.border)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: onToggle,
                child: Container(
                  width: 20,
                  height: 20,
                  margin: const EdgeInsets.only(top: 1),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _done ? _catColor : Colors.transparent,
                    border: Border.all(
                      color: _done ? _catColor : LiriunColors.borderHi,
                      width: 1.5,
                    ),
                  ),
                  child: _done
                      ? const Icon(Icons.check_rounded,
                          size: 12, color: Colors.white)
                      : null,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: _done
                            ? LiriunColors.textFaint
                            : LiriunColors.text,
                        letterSpacing: -0.1,
                        decoration:
                            _done ? TextDecoration.lineThrough : null,
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
                            color: _catColor,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          task.category.label,
                          style: const TextStyle(
                            fontSize: 10,
                            color: LiriunColors.textMuted,
                          ),
                        ),
                        if (_hora != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            _hora!,
                            style: const TextStyle(
                              fontFamily: 'Geist Mono',
                              fontSize: 10,
                              letterSpacing: 0.3,
                              color: LiriunColors.textFaint,
                            ),
                          ),
                        ],
                        if (_alta) ...[
                          const SizedBox(width: 8),
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
                                letterSpacing: 0.4,
                                color: Color(0xFFF0B36E),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              if (weekdayHint.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(left: 6, top: 1),
                  child: Text(
                    weekdayHint,
                    style: const TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 10,
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
