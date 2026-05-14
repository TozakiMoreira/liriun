import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../models/task.dart';
import '../../models/task_mapper.dart';

class TaskDetailScreen extends ConsumerWidget {
  const TaskDetailScreen({super.key, required this.taskId});

  final String taskId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendentesAsync = ref.watch(pendentesProvider);
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
        data: (dtos) {
          final dto = dtos.cast<TarefaDto?>().firstWhere(
                (t) => t!.id == taskId,
                orElse: () => null,
              );
          if (dto == null) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Tarefa não encontrada',
                    style: TextStyle(color: LiriunColors.textMuted),
                  ),
                  TextButton(
                    onPressed: () => context.pop(),
                    child: const Text('Voltar'),
                  ),
                ],
              ),
            );
          }
          return _body(context, ref, dto.toTask());
        },
      ),
    );
  }

  Widget _body(BuildContext context, WidgetRef ref, Task task) {
    final color = task.category.color;
    return Stack(
      children: [
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: const [0.0, 0.5],
                colors: [
                  color.withValues(alpha: 0.30),
                  LiriunColors.bg,
                ],
              ),
            ),
          ),
        ),
        SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back_rounded,
                          color: LiriunColors.text),
                      onPressed: () => context.pop(),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.more_horiz_rounded,
                          color: LiriunColors.text),
                      onPressed: () {},
                    ),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(LiriunRadii.pill),
                          border: Border.all(
                              color: color.withValues(alpha: 0.40)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: color,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              task.category.label.toUpperCase(),
                              style: TextStyle(
                                fontSize: 9,
                                letterSpacing: 1.4,
                                fontWeight: FontWeight.w600,
                                color: color,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        task.title,
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w600,
                          color: LiriunColors.text,
                          letterSpacing: -1,
                          height: 1.1,
                        ),
                      ),
                      const SizedBox(height: 22),
                      _Row(
                        icon: Icons.event_outlined,
                        label: 'Quando',
                        value: _fmtDate(task.scheduledFor),
                      ),
                      if (task.person != null) ...[
                        const SizedBox(height: 12),
                        _Row(
                          icon: Icons.person_outline_rounded,
                          label: 'Com',
                          value: task.person!,
                        ),
                      ],
                      if (task.priority != null) ...[
                        const SizedBox(height: 12),
                        _Row(
                          icon: Icons.flag_outlined,
                          label: 'Prioridade',
                          value: _priLabel(task.priority!),
                        ),
                      ],
                      if (task.notes != null && task.notes!.isNotEmpty) ...[
                        const SizedBox(height: 22),
                        const Text(
                          'OBSERVAÇÕES',
                          style: TextStyle(
                            fontSize: 9,
                            letterSpacing: 1.4,
                            fontWeight: FontWeight.w600,
                            color: LiriunColors.textFaint,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0x0AFFFFFF),
                            borderRadius:
                                BorderRadius.circular(LiriunRadii.md),
                            border: Border.all(color: LiriunColors.border),
                          ),
                          child: Text(
                            task.notes!,
                            style: const TextStyle(
                              fontSize: 14,
                              color: LiriunColors.text,
                              height: 1.5,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                child: Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: const Color(0x10FFFFFF),
                        borderRadius: BorderRadius.circular(LiriunRadii.md),
                        border: Border.all(color: LiriunColors.borderHi),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.edit_outlined,
                            color: LiriunColors.text),
                        onPressed: () {},
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: GestureDetector(
                        onTap: () async {
                          HapticFeedback.mediumImpact();
                          try {
                            if (task.completedAt == null) {
                              await ref
                                  .read(tarefasApiProvider)
                                  .concluir(task.id);
                            } else {
                              await ref
                                  .read(tarefasApiProvider)
                                  .reabrir(task.id);
                            }
                          } catch (_) {}
                          ref.invalidate(pendentesProvider);
                          ref.invalidate(concluidasProvider);
                          if (context.mounted) context.pop();
                        },
                        child: Container(
                          height: 56,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            gradient: LiriunColors.gradBrand,
                            borderRadius:
                                BorderRadius.circular(LiriunRadii.md),
                            boxShadow: [
                              BoxShadow(
                                color: color.withValues(alpha: 0.35),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Text(
                            task.completedAt == null
                                ? 'Concluir'
                                : 'Reabrir',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                              letterSpacing: -0.2,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _fmtDate(DateTime? d) {
    if (d == null) return 'Sem prazo';
    final dd = d.day.toString().padLeft(2, '0');
    final mm = d.month.toString().padLeft(2, '0');
    final hh = d.hour.toString().padLeft(2, '0');
    final mn = d.minute.toString().padLeft(2, '0');
    return '$dd/$mm às $hh:$mn';
  }

  String _priLabel(Priority p) {
    switch (p) {
      case Priority.high:
        return 'Alta';
      case Priority.medium:
        return 'Normal';
      case Priority.low:
        return 'Baixa';
    }
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0x0AFFFFFF),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: LiriunColors.border),
          ),
          child: Icon(icon, size: 18, color: LiriunColors.textMuted),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label.toUpperCase(),
              style: const TextStyle(
                fontSize: 9,
                letterSpacing: 1.4,
                color: LiriunColors.textFaint,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: LiriunColors.text,
                letterSpacing: -0.2,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
