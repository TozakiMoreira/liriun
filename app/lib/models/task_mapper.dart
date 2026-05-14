import '../core/api/tarefas_api.dart';
import 'task.dart';

extension TarefaDtoMapper on TarefaDto {
  Task toTask() {
    return Task(
      id: id,
      title: nome,
      notes: observacoes,
      createdAt: criadaEm,
      scheduledFor: _scheduledDateTime(),
      completedAt: concluidaEm,
      category: _categoryFromName(categorias.isEmpty ? null : categorias.first.nome),
      priority: _priorityFromInt(prioridade),
    );
  }

  DateTime? _scheduledDateTime() {
    if (horarioFinal == null) return dataPrazo;
    final parts = horarioFinal!.split(':');
    final h = int.tryParse(parts[0]) ?? 0;
    final m = parts.length > 1 ? int.tryParse(parts[1]) ?? 0 : 0;
    return DateTime(dataPrazo.year, dataPrazo.month, dataPrazo.day, h, m);
  }

  Category _categoryFromName(String? n) {
    if (n == null) return Category.personal;
    final lower = n.toLowerCase();
    if (lower.contains('trabalho') || lower.contains('work')) return Category.work;
    if (lower.contains('saúde') || lower.contains('saude') || lower.contains('health')) return Category.health;
    if (lower.contains('casa') || lower.contains('home')) return Category.home;
    if (lower.contains('finança') || lower.contains('financa') || lower.contains('finance') || lower.contains('gasto')) return Category.finance;
    return Category.personal;
  }

  Priority? _priorityFromInt(int p) {
    switch (p) {
      case 1:
      case 2:
        return Priority.high;
      case 4:
        return Priority.low;
      default:
        return Priority.medium;
    }
  }
}
