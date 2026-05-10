import "package:dio/dio.dart";

/// Extrai mensagem amigável de um erro vindo da API.
///
/// Prioridade:
/// 1. ProblemDetails RFC 7807 do backend (detail/message/title)
/// 2. Tipo do DioException (timeout, sem conexão)
/// 3. Status HTTP (401, 429, 5xx)
/// 4. Fallback genérico
///
/// Nunca expor `err.toString()` cru pra UI — vaza stack/JSON interno.
String errorMessage(Object err, [String fallback = "Algo deu errado. Tenta de novo."]) {
  if (err is DioException) {
    final data = err.response?.data;
    if (data is Map) {
      final msg = data["detail"] ?? data["message"] ?? data["title"];
      if (msg is String && msg.isNotEmpty) return msg;
    }
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return "Conexão devagar. Tenta de novo.";
      case DioExceptionType.connectionError:
        return "Sem conexão com o servidor.";
      default:
        break;
    }
    final code = err.response?.statusCode;
    if (code == 401) return "Credenciais inválidas.";
    if (code == 429) return "Bati no limite. Espera um pouco.";
    if (code != null && code >= 500) return "Servidor com erro. Tenta de novo.";
  }
  return fallback;
}
