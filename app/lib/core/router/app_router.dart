import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";

import "../api/session_provider.dart";
import "../../features/auth/screens/login_screen.dart";
import "../../features/auth/screens/signup_screen.dart";
import "../../features/shell/tab_shell.dart";
import "../../features/hoje/hoje_screen.dart";
import "../../features/falar/falar_screen.dart";
import "../../features/tarefas/tarefas_screen.dart";
import "../../features/atividade/atividade_screen.dart";
import "../../features/configuracoes/configuracoes_screen.dart";

/// Router principal.
///
/// Auth guard: usuário sem sessão vai pra /login.
/// Após login, primeira tela = /falar (decisão V1).
final appRouterProvider = Provider<GoRouter>((ref) {
  final shellNavKey = GlobalKey<NavigatorState>();
  final rootNavKey = GlobalKey<NavigatorState>();

  return GoRouter(
    navigatorKey: rootNavKey,
    initialLocation: "/falar",
    refreshListenable: GoRouterRefreshNotifier(ref),
    redirect: (context, state) {
      final logado = ref.read(isAuthenticatedProvider);
      final loggingIn = state.matchedLocation == "/login" || state.matchedLocation == "/cadastro";
      if (!logado && !loggingIn) return "/login";
      if (logado && loggingIn) return "/falar";
      return null;
    },
    routes: [
      GoRoute(path: "/login", builder: (_, __) => const LoginScreen()),
      GoRoute(path: "/cadastro", builder: (_, __) => const SignupScreen()),
      ShellRoute(
        navigatorKey: shellNavKey,
        builder: (context, state, child) => TabShell(child: child),
        routes: [
          GoRoute(path: "/falar", builder: (_, __) => const FalarScreen()),
          GoRoute(path: "/hoje", builder: (_, __) => const HojeScreen()),
          GoRoute(path: "/tarefas", builder: (_, __) => const TarefasScreen()),
          GoRoute(path: "/atividade", builder: (_, __) => const AtividadeScreen()),
          GoRoute(path: "/configuracoes", builder: (_, __) => const ConfiguracoesScreen()),
        ],
      ),
    ],
  );
});

/// Bridge entre o estado de sessão e GoRouter.refreshListenable.
class GoRouterRefreshNotifier extends ChangeNotifier {
  GoRouterRefreshNotifier(this._ref) {
    _ref.listen(sessionControllerProvider, (_, __) => notifyListeners());
  }

  final Ref _ref;
}
