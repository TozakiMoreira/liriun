import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/notification_service.dart';
import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../models/task.dart';
import '../../models/task_mapper.dart';
import '../../widgets/liriun_mark.dart';
import 'editar_tarefa_sheet.dart';

class TaskDetailScreen extends ConsumerWidget {
  const TaskDetailScreen({super.key, required this.taskId});

  final String taskId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
          final dtos = [...pendentes, ...concluidas];
          TarefaDto? dto;
          for (final t in dtos) {
            if (t.id == taskId) {
              dto = t;
              break;
            }
          }
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
          return _body(context, ref, dto, dto.toTask());
        },
      ),
    );
  }

  Future<void> _abrirMenu(
      BuildContext context, WidgetRef ref, TarefaDto dto) async {
    final acao = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: const Color(0xA6000000),
      builder: (ctx) => Container(
        margin: const EdgeInsets.all(12),
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 16),
        decoration: BoxDecoration(
          color: const Color(0xEB14161C),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: LiriunColors.borderHi),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
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
              ListTile(
                leading: const Icon(Icons.edit_outlined,
                    color: LiriunColors.violet300),
                title: const Text('Editar', style: TextStyle(color: LiriunColors.text)),
                onTap: () => Navigator.of(ctx).pop('editar'),
              ),
              ListTile(
                leading: const Icon(Icons.delete_outline_rounded,
                    color: LiriunColors.danger),
                title: const Text('Excluir',
                    style: TextStyle(color: LiriunColors.danger)),
                onTap: () => Navigator.of(ctx).pop('excluir'),
              ),
            ],
          ),
        ),
      ),
    );
    if (acao == 'editar' && context.mounted) {
      final ok = await showEditarTarefaSheet(context: context, task: dto.toTask());
      if (ok == true) {
        ref.invalidate(pendentesProvider);
        ref.invalidate(concluidasProvider);
      }
    } else if (acao == 'excluir' && context.mounted) {
      try {
        await ref.read(tarefasApiProvider).excluir(dto.id);
        ref.invalidate(pendentesProvider);
        ref.invalidate(concluidasProvider);
        if (context.mounted) context.pop();
      } catch (err) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Falha ao excluir: $err'),
              backgroundColor: LiriunColors.surfaceHi,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    }
  }

  Widget _body(
      BuildContext context, WidgetRef ref, TarefaDto dto, Task task) {
    final color = task.category.color;
    final done = task.completedAt != null;
    if (!done && task.scheduledFor != null &&
        task.scheduledFor!.isAfter(DateTime.now())) {
      ref.read(notificationServiceProvider).agendarLembrete(
            taskId: task.id,
            titulo: task.title,
            quando: task.scheduledFor!,
          );
    } else if (done) {
      ref.read(notificationServiceProvider).cancelar(task.id);
    }
    return Stack(
      children: [
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          height: 220,
          child: IgnorePointer(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    color.withValues(alpha: 0.24),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
        ),
        SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _RoundBtn(
                      icon: Icons.chevron_left_rounded,
                      onTap: () => context.pop(),
                    ),
                    _RoundBtn(
                      icon: Icons.more_horiz_rounded,
                      onTap: () => _abrirMenu(context, ref, dto),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(18, 16, 18, 120),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _CategoryChip(
                        label: task.category.label,
                        color: color,
                      ),
                      const SizedBox(height: 14),
                      Text(
                        task.title,
                        style: const TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.8,
                          color: LiriunColors.text,
                          height: 1.08,
                        ),
                      ),
                      if (task.notes != null && task.notes!.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text(
                          task.notes!,
                          style: const TextStyle(
                            fontSize: 13,
                            color: LiriunColors.textMuted,
                            height: 1.55,
                            letterSpacing: -0.1,
                          ),
                        ),
                      ],
                      const SizedBox(height: 18),
                      _QuickFacts(task: task, dto: dto),
                      const SizedBox(height: 14),
                      _LiriunLembra(task: task),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        Positioned(
          left: 18,
          right: 18,
          bottom: 28,
          child: Row(
            children: [
              Expanded(
                flex: 2,
                child: GestureDetector(
                  onTap: () async {
                    HapticFeedback.mediumImpact();
                    try {
                      if (!done) {
                        await ref.read(tarefasApiProvider).concluir(task.id);
                      } else {
                        await ref.read(tarefasApiProvider).reabrir(task.id);
                      }
                      ref.invalidate(pendentesProvider);
                      ref.invalidate(concluidasProvider);
                      if (context.mounted) context.pop();
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
                  },
                  child: Container(
                    height: 46,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      gradient: LiriunColors.gradBrand,
                      borderRadius: BorderRadius.circular(13),
                      boxShadow: [
                        BoxShadow(
                          color: LiriunColors.violet500.withValues(alpha: 0.35),
                          blurRadius: 22,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          done ? Icons.refresh_rounded : Icons.check_rounded,
                          color: Colors.white,
                          size: 14,
                        ),
                        const SizedBox(width: 7),
                        Text(
                          done ? 'Reabrir' : 'Concluir',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                            letterSpacing: -0.1,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () async {
                  final ok = await showEditarTarefaSheet(
                    context: context,
                    task: task,
                  );
                  if (ok == true) {
                    ref.invalidate(pendentesProvider);
                    ref.invalidate(concluidasProvider);
                  }
                },
                child: Container(
                  width: 46,
                  height: 46,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: const Color(0x0AFFFFFF),
                    borderRadius: BorderRadius.circular(13),
                    border: Border.all(color: LiriunColors.borderHi),
                  ),
                  child: const Icon(
                    Icons.edit_outlined,
                    size: 16,
                    color: LiriunColors.textMuted,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _RoundBtn extends StatelessWidget {
  const _RoundBtn({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: const Color(0x0DFFFFFF),
          shape: BoxShape.circle,
          border: Border.all(color: LiriunColors.border),
        ),
        child: Icon(icon, size: 18, color: LiriunColors.textMuted),
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.42)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(shape: BoxShape.circle, color: color),
          ),
          const SizedBox(width: 7),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: color,
              fontWeight: FontWeight.w600,
              letterSpacing: -0.1,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickFacts extends StatelessWidget {
  const _QuickFacts({required this.task, required this.dto});
  final Task task;
  final TarefaDto dto;

  String _relativo(DateTime? d) {
    if (d == null) return 'Sem prazo';
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(d.year, d.month, d.day);
    final diff = target.difference(today).inDays;
    const wd = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    final dataFmt =
        '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}';
    String prefixo;
    if (diff == 0) {
      prefixo = 'Hoje';
    } else if (diff == 1) {
      prefixo = 'Amanhã';
    } else if (diff == -1) {
      prefixo = 'Ontem';
    } else {
      prefixo = wd[d.weekday - 1];
    }
    final base = '$prefixo · $dataFmt';
    if (d.hour == 0 && d.minute == 0) return base;
    final hh = d.hour.toString().padLeft(2, '0');
    final mn = d.minute.toString().padLeft(2, '0');
    return '$base · $hh:$mn';
  }

  String? _dur() {
    final d = task.duration;
    if (d == null) return null;
    final m = d.inMinutes;
    if (m < 60) return '$m min';
    final h = (m / 60).floor();
    final rem = m % 60;
    return rem == 0 ? '$h h' : '${h}h ${rem}min';
  }

  String _prio() {
    switch (task.priority) {
      case Priority.high:
        return 'Alta';
      case Priority.low:
        return 'Baixa';
      case Priority.medium:
      case null:
        return 'Normal';
    }
  }

  Color _prioColor() {
    if (task.priority == Priority.high) return const Color(0xFFF0B36E);
    return LiriunColors.text;
  }

  @override
  Widget build(BuildContext context) {
    final rows = <_Fact>[
      _Fact(k: 'QUANDO', v: _relativo(task.scheduledFor)),
      _Fact(k: 'DURAÇÃO', v: _dur() ?? '—'),
      _Fact(
          k: 'COM',
          v: task.person ?? '—',
          av: task.person != null,
          vc: task.person == null ? LiriunColors.textMuted : null),
      _Fact(
          k: 'LEMBRETE',
          v: '15 min antes',
          vc: LiriunColors.textMuted),
      _Fact(
          k: 'PRIORIDADE',
          v: _prio(),
          vc: _prioColor()),
    ];
    return Container(
      decoration: BoxDecoration(
        color: const Color(0x06FFFFFF),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Column(
        children: [
          for (var i = 0; i < rows.length; i++) ...[
            _FactRow(fact: rows[i]),
            if (i < rows.length - 1)
              Container(height: 1, color: LiriunColors.border),
          ],
        ],
      ),
    );
  }
}

class _Fact {
  _Fact({
    required this.k,
    required this.v,
    this.av = false,
    this.vc,
  });
  final String k;
  final String v;
  final bool av;
  final Color? vc;
}

class _FactRow extends StatelessWidget {
  const _FactRow({required this.fact});
  final _Fact fact;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Text(
            fact.k,
            style: const TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 10,
              letterSpacing: 0.6,
              color: LiriunColors.textFaint,
              fontWeight: FontWeight.w600,
            ),
          ),
          const Spacer(),
          if (fact.av) ...[
            Container(
              width: 22,
              height: 22,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LiriunColors.gradBrand,
              ),
              child: Text(
                fact.v.isNotEmpty ? fact.v[0].toUpperCase() : '?',
                style: const TextStyle(
                  fontSize: 10,
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Text(
            fact.v,
            style: TextStyle(
              fontSize: 13,
              color: fact.vc ?? LiriunColors.text,
              fontWeight: FontWeight.w600,
              letterSpacing: -0.1,
            ),
          ),
        ],
      ),
    );
  }
}

class _LiriunLembra extends StatelessWidget {
  const _LiriunLembra({required this.task});
  final Task task;

  String _msg() {
    final prep = task.prepNotes;
    if (prep != null && prep.isNotEmpty) return prep.first;
    if (task.person != null) {
      return 'Encontro com ${task.person}. Levar contexto da última conversa.';
    }
    if (task.category == Category.work) {
      return 'Foco profissional. Reserve o tempo no calendário pra não atropelar.';
    }
    if (task.category == Category.health) {
      return 'Cuidado com você. Saúde também é produtividade.';
    }
    return 'Tudo certo. Quando começar, foca só nisso.';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            LiriunColors.violet400.withValues(alpha: 0.10),
            LiriunColors.violet700.withValues(alpha: 0.03),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border:
            Border.all(color: LiriunColors.violet400.withValues(alpha: 0.22)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const LiriunMark(size: 14),
              const SizedBox(width: 6),
              const Text(
                'LIRIUN LEMBRA',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.violet300,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            _msg(),
            style: const TextStyle(
              fontSize: 11,
              color: LiriunColors.text,
              fontWeight: FontWeight.w500,
              height: 1.45,
              letterSpacing: -0.1,
            ),
          ),
        ],
      ),
    );
  }
}
