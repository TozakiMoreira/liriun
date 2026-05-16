import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'dio_client.dart';

class TarefasApi {
  TarefasApi(this._dio);
  final Dio _dio;

  Future<List<TarefaDto>> pendentes() async {
    final res = await _dio.get<List<dynamic>>('/tarefas/pendentes');
    return (res.data ?? [])
        .cast<Map<String, dynamic>>()
        .map(TarefaDto.fromJson)
        .toList();
  }

  Future<List<TarefaDto>> concluidas() async {
    final res = await _dio.get<List<dynamic>>('/tarefas/concluidas');
    return (res.data ?? [])
        .cast<Map<String, dynamic>>()
        .map(TarefaDto.fromJson)
        .toList();
  }

  Future<TarefaDto> criar({
    required String nome,
    int prioridade = 3,
    required DateTime dataPrazo,
    String? horarioFinal,
    List<String>? categoriaIds,
    String? observacoes,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>('/tarefas', data: {
      'nome': nome,
      'prioridade': prioridade,
      'dataPrazo': dataPrazo.toIso8601String(),
      if (horarioFinal != null) 'horarioFinal': horarioFinal,
      if (categoriaIds != null) 'categoriaIds': categoriaIds,
      if (observacoes != null) 'observacoes': observacoes,
    });
    return TarefaDto.fromJson(res.data!);
  }

  Future<TarefaDto> atualizar({
    required String id,
    required String nome,
    int prioridade = 3,
    required DateTime dataPrazo,
    String? horarioFinal,
    List<String>? categoriaIds,
    String? observacoes,
  }) async {
    final res = await _dio.put<Map<String, dynamic>>('/tarefas/$id', data: {
      'nome': nome,
      'prioridade': prioridade,
      'dataPrazo': dataPrazo.toIso8601String(),
      if (horarioFinal != null) 'horarioFinal': horarioFinal,
      if (categoriaIds != null) 'categoriaIds': categoriaIds,
      if (observacoes != null) 'observacoes': observacoes,
    });
    return TarefaDto.fromJson(res.data!);
  }

  Future<void> concluir(String id) async {
    await _dio.post<void>('/tarefas/$id/concluir');
  }

  Future<void> reabrir(String id) async {
    await _dio.post<void>('/tarefas/$id/reabrir');
  }

  Future<void> excluir(String id) async {
    await _dio.delete<void>('/tarefas/$id');
  }
}

final tarefasApiProvider = Provider<TarefasApi>((ref) {
  return TarefasApi(ref.watch(dioProvider));
});

class TarefaDto {
  TarefaDto({
    required this.id,
    required this.nome,
    required this.prioridade,
    required this.status,
    required this.dataPrazo,
    this.horarioFinal,
    this.observacoes,
    required this.criadaEm,
    this.concluidaEm,
    required this.categorias,
  });

  final String id;
  final String nome;
  final int prioridade; // 1=Urgente, 2=Importante, 3=Normal, 4=Baixa
  final int status; // 1=Pendente, 2=Concluida, 3=Atrasada
  final DateTime dataPrazo;
  final String? horarioFinal;
  final String? observacoes;
  final DateTime criadaEm;
  final DateTime? concluidaEm;
  final List<TarefaCategoriaDto> categorias;

  factory TarefaDto.fromJson(Map<String, dynamic> j) {
    return TarefaDto(
      id: j['id'] as String,
      nome: j['nome'] as String,
      prioridade: j['prioridade'] as int,
      status: j['status'] as int,
      dataPrazo: DateTime.parse(j['dataPrazo'] as String),
      horarioFinal: j['horarioFinal'] as String?,
      observacoes: j['observacoes'] as String?,
      criadaEm: DateTime.parse(j['criadaEm'] as String),
      concluidaEm: j['concluidaEm'] == null
          ? null
          : DateTime.parse(j['concluidaEm'] as String),
      categorias: ((j['categorias'] as List?) ?? [])
          .cast<Map<String, dynamic>>()
          .map(TarefaCategoriaDto.fromJson)
          .toList(),
    );
  }
}

class TarefaCategoriaDto {
  TarefaCategoriaDto({required this.id, required this.nome});
  final String id;
  final String nome;

  factory TarefaCategoriaDto.fromJson(Map<String, dynamic> j) =>
      TarefaCategoriaDto(id: j['id'] as String, nome: j['nome'] as String);
}

/// Providers reativos.
final pendentesProvider = FutureProvider<List<TarefaDto>>((ref) async {
  return ref.watch(tarefasApiProvider).pendentes();
});

final concluidasProvider = FutureProvider<List<TarefaDto>>((ref) async {
  return ref.watch(tarefasApiProvider).concluidas();
});
