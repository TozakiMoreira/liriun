import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "core/router/app_router.dart";
import "core/theme/liriun_theme.dart";

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarBrightness: Brightness.dark,
    statusBarIconBrightness: Brightness.light,
  ));

  runApp(const ProviderScope(child: LiriunApp()));
}

class LiriunApp extends ConsumerWidget {
  const LiriunApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: "Liriun",
      debugShowCheckedModeBanner: false,
      theme: buildLiriunDarkTheme(),
      darkTheme: buildLiriunDarkTheme(),
      themeMode: ThemeMode.dark,
      routerConfig: router,
    );
  }
}
