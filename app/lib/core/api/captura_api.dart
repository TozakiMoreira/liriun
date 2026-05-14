import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'dio_client.dart';

class MensagemDto {
  MensagemDto({required this.papel, required this.texto});
  final String papel; // "usuario" | "liriun"
  final String texto;
  Map<String, dynamic> toJson() => {'papel': papel, 'texto': texto};
}

class SugestaoTarefaDto {
  SugestaoTarefaDto({
    required this.titulo,
    required this.categoriaIds,
    this.dataPrazo,
    this.horarioFinal,
    this.prioridade,
    this.observacoes,
  });

  final String titulo;
  final List<String> categoriaIds;
  final DateTime? dataPrazo;
  final String? horarioFinal;
  final int? prioridade;
  final String? observacoes;

  factory SugestaoTarefaDto.fromJson(Map<String, dynamic> j) {
    return SugestaoTarefaDto(
      titulo: j['titulo'] as String,
      categoriaIds:
          ((j['categoriaIds'] as List?) ?? []).cast<String>().toList(),
      dataPrazo: j['dataPrazo'] == null
          ? null
          : DateTime.parse(j['dataPrazo'] as String),
      horarioFinal: j['horarioFinal'] as String?,
      prioridade: j['prioridade'] as int?,
      observacoes: j['observacoes'] as String?,
    );
  }
}

class ConversaDto {
  ConversaDto({
    required this.mensagem,
    this.tarefa,
    required this.completo,
    this.transcricaoUsuario,
  });

  final String mensagem;
  final SugestaoTarefaDto? tarefa;
  final bool completo;
  final String? transcricaoUsuario;

  factory ConversaDto.fromJson(Map<String, dynamic> j) {
    return ConversaDto(
      mensagem: j['mensagem'] as String,
      tarefa: j['tarefa'] == null
          ? null
          : SugestaoTarefaDto.fromJson(j['tarefa'] as Map<String, dynamic>),
      completo: j['completo'] as bool? ?? false,
      transcricaoUsuario: j['transcricaoUsuario'] as String?,
    );
  }
}

class CapturaApi {
  CapturaApi(this._dio);
  final Dio _dio;

  Future<ConversaDto> conversar({
    required List<MensagemDto> historico,
    String idioma = 'pt',
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/captura/conversar',
      data: {
        'mensagens': historico.map((m) => m.toJson()).toList(),
        'idioma': idioma,
      },
    );
    return ConversaDto.fromJson(res.data!);
  }
}

final capturaApiProvider = Provider<CapturaApi>((ref) {
  return CapturaApi(ref.watch(dioProvider));
});
