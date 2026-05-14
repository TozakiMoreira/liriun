import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../models/task.dart';
import '../../models/task_mapper.dart';
import '../../widgets/task_card.dart';

class TaskInsideScreen extends ConsumerStatefulWidget {
  const TaskInsideScreen({super.key, required this.categoryId});

  final String categoryId;

  @override
  ConsumerState<TaskInsideScreen> createState() => _TaskInsideScreenState();
}

class _TaskInsideScreenState extends ConsumerState<TaskInsideScreen> {
  int _tab = 0;

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
          final categoryTasks = pendentes
              .where((t) => t.categorias.any((c) => c.id == widget.categoryId))
              .map((d) => d.toTask())
              .toList();
          final categoryName = pendentes
                  .expand((t) => t.categorias)
                  .firstWhere(
                    (c) => c.id == widget.categoryId,
                    orElse: () => TarefaCategoriaDto(
                        id: widget.categoryId, nome: 'Categoria'),
                  )
                  .nome;
          final tasks = _tab == 0
              ? categoryTasks
              : concluidasAsync.valueOrNull
                      ?.where((t) =>
                          t.categorias.any((c) => c.id == widget.categoryId))
                      .map((d) => d.toTask())
                      .toList() ??
                  [];
          final color = tasks.isNotEmpty
              ? tasks.first.category.color
              : LiriunColors.violet400;

          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 180,
                pinned: true,
                backgroundColor: LiriunColors.bg,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back_rounded,
                      color: LiriunColors.text),
                  onPressed: () => context.pop(),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          color.withValues(alpha: 0.22),
                          LiriunColors.bg,
                        ],
                      ),
                    ),
                  ),
                  title: Text(
                    categoryName,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      letterSpacing: -0.4,
                      color: LiriunColors.text,
                    ),
                  ),
                  titlePadding:
                      const EdgeInsets.fromLTRB(60, 0, 20, 16),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                  child: _Tabs(
                    selected: _tab,
                    onSelect: (i) => setState(() => _tab = i),
                  ),
                ),
              ),
              if (tasks.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Text(
                      _tab == 0 ? 'Sem tarefas abertas' : 'Sem concluídas',
                      style: const TextStyle(
                        color: LiriunColors.textFaint,
                        fontSize: 13,
                      ),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, i) {
                        final t = tasks[i];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: TaskCard(
                            task: t,
                            onTap: () => context.push('/task/${t.id}'),
                            onToggle: () async {
                              try {
                                if (t.completedAt == null) {
                                  await ref
                                      .read(tarefasApiProvider)
                                      .concluir(t.id);
                                } else {
                                  await ref
                                      .read(tarefasApiProvider)
                                      .reabrir(t.id);
                                }
                              } catch (_) {}
                              ref.invalidate(pendentesProvider);
                              ref.invalidate(concluidasProvider);
                            },
                          ),
                        );
                      },
                      childCount: tasks.length,
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _Tabs extends StatelessWidget {
  const _Tabs({required this.selected, required this.onSelect});
  final int selected;
  final void Function(int) onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0x0AFFFFFF),
        borderRadius: BorderRadius.circular(LiriunRadii.pill),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Row(
        children: [
          Expanded(child: _tab('Abertas', 0)),
          Expanded(child: _tab('Concluídas', 1)),
        ],
      ),
    );
  }

  Widget _tab(String label, int i) {
    final active = selected == i;
    return GestureDetector(
      onTap: () => onSelect(i),
      child: AnimatedContainer(
        duration: LiriunDurations.fast,
        padding: const EdgeInsets.symmetric(vertical: 8),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: active ? LiriunColors.gradBrand : null,
          borderRadius: BorderRadius.circular(LiriunRadii.pill),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: active ? Colors.white : LiriunColors.textMuted,
            letterSpacing: -0.1,
          ),
        ),
      ),
    );
  }
}
