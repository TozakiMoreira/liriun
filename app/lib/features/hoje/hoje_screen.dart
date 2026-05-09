import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

class HojeScreen extends ConsumerWidget {
  const HojeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text("Hoje")),
      body: const Center(
        child: Text("Hoje · agenda + saudação. (stub V1)"),
      ),
    );
  }
}
