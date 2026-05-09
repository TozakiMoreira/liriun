import "dart:async";

import "package:flutter_riverpod/flutter_riverpod.dart";

import "auth_api.dart";
import "dio_client.dart";

/// Estado de sessão do usuário logado (JWT no secure storage).
class Session {
  const Session({required this.usuario, required this.token});
  final UsuarioDto usuario;
  final String token;
}

/// Notifier que mantém Session em memória e sincroniza com FlutterSecureStorage.
class SessionController extends AsyncNotifier<Session?> {
  @override
  Future<Session?> build() async {
    final storage = ref.read(secureStorageProvider);
    final token = await storage.readJwt();
    if (token == null || token.isEmpty) return null;

    try {
      final usuario = await ref.read(authApiProvider).meuPerfil();
      return Session(usuario: usuario, token: token);
    } catch (_) {
      // Token inválido. Limpa.
      await storage.clearJwt();
      return null;
    }
  }

  Future<void> setSession(Session session) async {
    final storage = ref.read(secureStorageProvider);
    await storage.writeJwt(session.token);
    state = AsyncData(session);
  }

  Future<void> clear() async {
    final storage = ref.read(secureStorageProvider);
    await storage.clearJwt();
    state = const AsyncData(null);
  }
}

final sessionControllerProvider =
    AsyncNotifierProvider<SessionController, Session?>(SessionController.new);

/// Helper síncrono — usado pelo router.
final isAuthenticatedProvider = Provider<bool>((ref) {
  final session = ref.watch(sessionControllerProvider);
  return session.maybeWhen(data: (s) => s != null, orElse: () => false);
});
