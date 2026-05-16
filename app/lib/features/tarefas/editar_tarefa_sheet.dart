import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/error_message.dart';
import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../models/task.dart';

Future<bool?> showEditarTarefaSheet({
  required BuildContext context,
  required Task task,
}) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    barrierColor: const Color(0xA6000000),
    builder: (ctx) => BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          left: 12,
          right: 12,
          top: 24,
        ),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xEB14161C),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: LiriunColors.borderHi),
            boxShadow: const [
              BoxShadow(
                color: Color(0x80000000),
                blurRadius: 60,
                offset: Offset(0, 30),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
              child: _EditarTarefaForm(task: task),
            ),
          ),
        ),
      ),
    ),
  );
}

class _EditarTarefaForm extends ConsumerStatefulWidget {
  const _EditarTarefaForm({required this.task});
  final Task task;

  @override
  ConsumerState<_EditarTarefaForm> createState() => _EditarTarefaFormState();
}

class _EditarTarefaFormState extends ConsumerState<_EditarTarefaForm> {
  late final TextEditingController _nomeCtl;
  late final TextEditingController _notesCtl;
  late DateTime _data;
  TimeOfDay? _hora;
  Priority _prioridade = Priority.medium;
  bool _loading = false;
  String? _erro;

  @override
  void initState() {
    super.initState();
    _nomeCtl = TextEditingController(text: widget.task.title);
    _notesCtl = TextEditingController(text: widget.task.notes ?? '');
    _data = widget.task.scheduledFor ?? widget.task.createdAt;
    if (widget.task.scheduledFor != null) {
      final d = widget.task.scheduledFor!;
      _hora = TimeOfDay(hour: d.hour, minute: d.minute);
    }
    _prioridade = widget.task.priority ?? Priority.medium;
  }

  @override
  void dispose() {
    _nomeCtl.dispose();
    _notesCtl.dispose();
    super.dispose();
  }

  Future<void> _pickData() async {
    HapticFeedback.selectionClick();
    final picked = await showDatePicker(
      context: context,
      initialDate: _data,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.dark(
            primary: LiriunColors.violet500,
            onPrimary: Colors.white,
            surface: LiriunColors.surfaceHi,
            onSurface: LiriunColors.text,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _data = picked);
  }

  Future<void> _pickHora() async {
    HapticFeedback.selectionClick();
    final picked = await showTimePicker(
      context: context,
      initialTime: _hora ?? const TimeOfDay(hour: 9, minute: 0),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.dark(
            primary: LiriunColors.violet500,
            onPrimary: Colors.white,
            surface: LiriunColors.surfaceHi,
            onSurface: LiriunColors.text,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _hora = picked);
  }

  int _prioridadeApi(Priority p) {
    switch (p) {
      case Priority.high:
        return 2;
      case Priority.medium:
        return 3;
      case Priority.low:
        return 4;
    }
  }

  Future<void> _salvar() async {
    if (_nomeCtl.text.trim().isEmpty) {
      setState(() => _erro = 'Nome obrigatório.');
      return;
    }
    setState(() {
      _loading = true;
      _erro = null;
    });
    try {
      final dataIso = DateTime(_data.year, _data.month, _data.day);
      final horario = _hora == null
          ? null
          : '${_hora!.hour.toString().padLeft(2, '0')}:${_hora!.minute.toString().padLeft(2, '0')}:00';
      await ref.read(tarefasApiProvider).atualizar(
            id: widget.task.id,
            nome: _nomeCtl.text.trim(),
            prioridade: _prioridadeApi(_prioridade),
            dataPrazo: dataIso,
            horarioFinal: horario,
            observacoes:
                _notesCtl.text.trim().isEmpty ? null : _notesCtl.text.trim(),
          );
      ref.invalidate(pendentesProvider);
      ref.invalidate(concluidasProvider);
      if (mounted) Navigator.of(context).pop(true);
    } catch (err) {
      setState(() => _erro = errorMessage(err, 'Falha ao salvar.'));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          width: 36,
          height: 4,
          margin: const EdgeInsets.only(bottom: 14, top: 4),
          decoration: BoxDecoration(
            color: const Color(0x2EFFFFFF),
            borderRadius: BorderRadius.circular(99),
          ),
        ),
        const Center(
          child: Text(
            'EDITAR TAREFA',
            style: TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 10,
              letterSpacing: 1.6,
              fontWeight: FontWeight.w600,
              color: LiriunColors.violet300,
            ),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _nomeCtl,
          autofocus: true,
          style: const TextStyle(fontSize: 16, color: LiriunColors.text),
          decoration: _inputDeco('Nome da tarefa'),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: _pickData,
                child: _Field(
                  label: 'QUANDO',
                  value:
                      '${_data.day.toString().padLeft(2, '0')}/${_data.month.toString().padLeft(2, '0')}',
                  icon: Icons.event_outlined,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: GestureDetector(
                onTap: _pickHora,
                child: _Field(
                  label: 'HORA',
                  value: _hora == null
                      ? '—'
                      : '${_hora!.hour.toString().padLeft(2, '0')}:${_hora!.minute.toString().padLeft(2, '0')}',
                  icon: Icons.access_time_rounded,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        const _SectionLabel('PRIORIDADE'),
        const SizedBox(height: 8),
        Row(
          children: [
            _priChip('Baixa', Priority.low),
            const SizedBox(width: 6),
            _priChip('Normal', Priority.medium),
            const SizedBox(width: 6),
            _priChip('Alta', Priority.high),
          ],
        ),
        const SizedBox(height: 10),
        TextField(
          controller: _notesCtl,
          maxLines: 3,
          style: const TextStyle(fontSize: 14, color: LiriunColors.text),
          decoration: _inputDeco('Observações (opcional)'),
        ),
        if (_erro != null) ...[
          const SizedBox(height: 10),
          Text(_erro!,
              style: const TextStyle(color: LiriunColors.danger, fontSize: 12)),
        ],
        const SizedBox(height: 16),
        GestureDetector(
          onTap: _loading ? null : _salvar,
          child: Container(
            height: 48,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              gradient: LiriunColors.gradBrand,
              borderRadius: BorderRadius.circular(LiriunRadii.md),
              boxShadow: [
                BoxShadow(
                  color: LiriunColors.violet700.withValues(alpha: 0.32),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: _loading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white))
                : const Text(
                    'Salvar',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                      letterSpacing: -0.1,
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _priChip(String label, Priority p) {
    final active = _prioridade == p;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _prioridade = p),
        child: AnimatedContainer(
          duration: LiriunDurations.fast,
          padding: const EdgeInsets.symmetric(vertical: 10),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: active ? LiriunColors.gradBrand : null,
            color: active ? null : const Color(0x0AFFFFFF),
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            border: Border.all(
              color: active
                  ? LiriunColors.violet400.withValues(alpha: 0.40)
                  : LiriunColors.border,
            ),
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
      ),
    );
  }

  InputDecoration _inputDeco(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(
          fontSize: 14,
          color: LiriunColors.textFaint,
        ),
        filled: true,
        fillColor: const Color(0x0AFFFFFF),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(LiriunRadii.md),
          borderSide: const BorderSide(color: LiriunColors.borderHi),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(LiriunRadii.md),
          borderSide: const BorderSide(color: LiriunColors.borderHi),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(LiriunRadii.md),
          borderSide:
              const BorderSide(color: LiriunColors.violet500, width: 1.5),
        ),
      );
}

class _Field extends StatelessWidget {
  const _Field({required this.label, required this.value, required this.icon});
  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0x0AFFFFFF),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        border: Border.all(color: LiriunColors.borderHi),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: LiriunColors.textMuted),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 8,
                  letterSpacing: 1.2,
                  color: LiriunColors.textFaint,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.text,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Text(
        text,
        style: const TextStyle(
          fontFamily: 'Geist Mono',
          fontSize: 9,
          letterSpacing: 1.4,
          fontWeight: FontWeight.w600,
          color: LiriunColors.textFaint,
        ),
      );
}
