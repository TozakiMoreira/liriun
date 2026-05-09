import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

class TarefasScreen extends ConsumerWidget {
  const TarefasScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text("Tarefas")),
      body: const Center(
        child: Text("Lista · Quadro · Semana. (stub V1)"),
      ),
    );
  }
}
