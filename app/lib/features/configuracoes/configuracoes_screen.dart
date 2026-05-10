import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";

import "../auth/providers/auth_controller.dart";

class ConfiguracoesScreen extends ConsumerWidget {
  const ConfiguracoesScreen({super.key});

  void _emBreve(BuildContext context, String label) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text("$label — em breve."),
          duration: const Duration(seconds: 2),
        ),
      );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text("Configurações")),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: const Text("Perfil"),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _emBreve(context, "Perfil"),
          ),
          ListTile(
            leading: const Icon(Icons.label_outline),
            title: const Text("Categorias"),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _emBreve(context, "Categorias"),
          ),
          ListTile(
            leading: const Icon(Icons.translate),
            title: const Text("Idioma"),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _emBreve(context, "Idioma"),
          ),
          ListTile(
            leading: const Icon(Icons.dark_mode_outlined),
            title: const Text("Tema"),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _emBreve(context, "Tema"),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.redAccent),
            title: const Text("Sair", style: TextStyle(color: Colors.redAccent)),
            onTap: () async {
              await ref.read(authControllerProvider).sair();
              if (context.mounted) context.go("/login");
            },
          ),
        ],
      ),
    );
  }
}
