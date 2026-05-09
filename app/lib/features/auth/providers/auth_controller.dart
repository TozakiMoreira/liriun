import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../../core/api/auth_api.dart";
import "../../../core/api/session_provider.dart";

class AuthController {
  AuthController(this._api, this._session);

  final AuthApi _api;
  final SessionController _session;

  Future<void> entrar({required String email, required String senha}) async {
    final res = await _api.login(email: email, senha: senha);
    await _session.setSession(Session(usuario: res.usuario, token: res.token));
  }

  Future<void> cadastrar({
    required String nome,
    required String email,
    required String senha,
  }) async {
    final res = await _api.cadastrar(nome: nome, email: email, senha: senha);
    await _session.setSession(Session(usuario: res.usuario, token: res.token));
  }

  Future<void> sair() async {
    await _session.clear();
  }

  Future<void> esqueciSenha(String email) async {
    await _api.esqueciSenha(email);
  }
}

final authControllerProvider = Provider<AuthController>((ref) {
  final api = ref.watch(authApiProvider);
  final session = ref.read(sessionControllerProvider.notifier);
  return AuthController(api, session);
});
