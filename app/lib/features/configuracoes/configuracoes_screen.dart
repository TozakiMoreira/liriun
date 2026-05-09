import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";

import "../auth/providers/auth_controller.dart";

class ConfiguracoesScreen extends ConsumerWidget {
  const ConfiguracoesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text("Configurações")),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: const Text("Perfil"),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.label_outline),
            title: const Text("Categorias"),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.translate),
            title: const Text("Idioma"),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.dark_mode_outlined),
            title: const Text("Tema"),
            onTap: () {},
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
