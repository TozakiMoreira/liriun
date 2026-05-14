import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../api/session_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/signup_screen.dart';
import '../../features/shell/tab_shell.dart';
import '../../features/hoje/hoje_screen.dart';
import '../../features/tarefas/tarefas_screen.dart';
import '../../features/atividade/atividade_screen.dart';
import '../../features/configuracoes/configuracoes_screen.dart';
import '../../features/calendario/calendario_screen.dart';
import '../../features/capture/quick_capture_screen.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../features/tarefas/task_detail_screen.dart';
import '../../features/tarefas/task_inside_screen.dart';
import '../../features/voice/voice_flow_screen.dart';
import '../theme/liriun_tokens.dart';

/// Router principal.
///
/// Auth guard: usuário sem sessão vai pra /login.
/// Após login, primeira tela = /hoje.
final appRouterProvider = Provider<GoRouter>((ref) {
  final shellNavKey = GlobalKey<NavigatorState>();
  final rootNavKey = GlobalKey<NavigatorState>();

  return GoRouter(
    navigatorKey: rootNavKey,
    initialLocation: '/hoje',
    refreshListenable: GoRouterRefreshNotifier(ref),
    redirect: (context, state) {
      final logado = ref.read(isAuthenticatedProvider);
      final loggingIn = state.matchedLocation == '/login' ||
          state.matchedLocation == '/cadastro';
      if (!logado && !loggingIn) return '/login';
      if (logado && loggingIn) return '/hoje';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/cadastro', builder: (_, __) => const SignupScreen()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      ShellRoute(
        navigatorKey: shellNavKey,
        builder: (context, state, child) => TabShell(child: child),
        routes: [
          GoRoute(path: '/hoje', builder: (_, __) => const HojeScreen()),
          GoRoute(path: '/tarefas', builder: (_, __) => const TarefasScreen()),
          GoRoute(path: '/calendario', builder: (_, __) => const CalendarioScreen()),
          GoRoute(path: '/atividade', builder: (_, __) => const AtividadeScreen()),
          GoRoute(path: '/configuracoes', builder: (_, __) => const ConfiguracoesScreen()),
        ],
      ),
      GoRoute(
        path: '/tarefas/cat/:catId',
        builder: (ctx, st) =>
            TaskInsideScreen(categoryId: st.pathParameters['catId']!),
      ),
      GoRoute(
        path: '/task/:id',
        builder: (ctx, st) =>
            TaskDetailScreen(taskId: st.pathParameters['id']!),
      ),
      GoRoute(
        path: '/voice',
        pageBuilder: (ctx, st) => CustomTransitionPage(
          child: const VoiceFlowScreen(),
          transitionDuration: LiriunDurations.slow,
          reverseTransitionDuration: LiriunDurations.base,
          transitionsBuilder: (_, anim, __, child) => SlideTransition(
            position: Tween(
              begin: const Offset(0, 1),
              end: Offset.zero,
            ).animate(CurvedAnimation(parent: anim, curve: LiriunCurves.decel)),
            child: child,
          ),
        ),
      ),
      GoRoute(
        path: '/capture',
        pageBuilder: (ctx, st) => CustomTransitionPage(
          child: const QuickCaptureScreen(),
          opaque: false,
          barrierColor: const Color(0x80000000),
          transitionDuration: LiriunDurations.slow,
          transitionsBuilder: (_, anim, __, child) => SlideTransition(
            position: Tween(
              begin: const Offset(0, 1),
              end: Offset.zero,
            ).animate(CurvedAnimation(parent: anim, curve: LiriunCurves.decel)),
            child: FadeTransition(opacity: anim, child: child),
          ),
        ),
      ),
    ],
  );
});

class GoRouterRefreshNotifier extends ChangeNotifier {
  GoRouterRefreshNotifier(this._ref) {
    _ref.listen(sessionControllerProvider, (_, __) => notifyListeners());
  }

  // ignore: unused_field
  final Ref _ref;
}
