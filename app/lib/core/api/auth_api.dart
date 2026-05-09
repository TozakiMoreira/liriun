import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "dio_client.dart";

/// Endpoints de auth do backend .NET.
/// Confirma rotas reais com `backend/src/Liriun.Api/Controllers/AuthController.cs`
/// e ajusta caminhos / payload conforme contrato.
class AuthApi {
  AuthApi(this._dio);

  final Dio _dio;

  Future<LoginResponse> login({required String email, required String senha}) async {
    final res = await _dio.post<Map<String, dynamic>>(
      "/api/auth/login",
      data: {"email": email, "senha": senha},
    );
    return LoginResponse.fromJson(res.data!);
  }

  Future<LoginResponse> cadastrar({
    required String nome,
    required String email,
    required String senha,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      "/api/auth/cadastro",
      data: {"nome": nome, "email": email, "senha": senha},
    );
    return LoginResponse.fromJson(res.data!);
  }

  Future<void> esqueciSenha(String email) async {
    await _dio.post<void>("/api/auth/esqueci-senha", data: {"email": email});
  }

  Future<UsuarioDto> meuPerfil() async {
    final res = await _dio.get<Map<String, dynamic>>("/api/usuarios/me");
    return UsuarioDto.fromJson(res.data!);
  }
}

final authApiProvider = Provider<AuthApi>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthApi(dio);
});

class LoginResponse {
  LoginResponse({required this.token, required this.usuario});

  final String token;
  final UsuarioDto usuario;

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json["token"] as String,
      usuario: UsuarioDto.fromJson(json["usuario"] as Map<String, dynamic>),
    );
  }
}

class UsuarioDto {
  UsuarioDto({
    required this.id,
    required this.nome,
    required this.email,
    this.fotoUrl,
  });

  final String id;
  final String nome;
  final String email;
  final String? fotoUrl;

  factory UsuarioDto.fromJson(Map<String, dynamic> json) {
    return UsuarioDto(
      id: json["id"] as String,
      nome: json["nome"] as String,
      email: json["email"] as String,
      fotoUrl: json["fotoUrl"] as String?,
    );
  }
}
