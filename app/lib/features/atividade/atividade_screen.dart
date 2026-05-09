import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

class AtividadeScreen extends ConsumerWidget {
  const AtividadeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text("Atividade")),
      body: const Center(
        child: Text("Conquistas + parabenização. (stub V1)"),
      ),
    );
  }
}
