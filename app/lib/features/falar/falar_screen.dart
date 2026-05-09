import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";

import "../../core/theme/liriun_tokens.dart";

class FalarScreen extends ConsumerWidget {
  const FalarScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text("Falar")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Bom dia,",
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.w600, letterSpacing: -0.6),
            ),
            ShaderMask(
              shaderCallback: (rect) => LiriunColors.gradBrand.createShader(rect),
              child: const Text(
                "como posso ajudar?",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.6,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 48),
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: LiriunColors.gradBrand,
                borderRadius: BorderRadius.circular(LiriunRadii.pill),
                boxShadow: [
                  BoxShadow(
                    color: LiriunColors.violet500.withValues(alpha: 0.45),
                    blurRadius: 24,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: const Icon(Icons.mic, color: Colors.white, size: 32),
            ),
            const SizedBox(height: 12),
            Text(
              "Toque pra falar",
              style: TextStyle(color: LiriunColors.textMuted, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}
