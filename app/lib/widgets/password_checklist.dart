import 'package:flutter/material.dart';

import '../core/theme/liriun_tokens.dart';

class PasswordRequirement {
  PasswordRequirement(this.label, this.test);
  final String label;
  final bool Function(String) test;
}

class PasswordChecklist extends StatelessWidget {
  PasswordChecklist({super.key, required this.password});

  final String password;

  static final List<PasswordRequirement> requirements = [
    PasswordRequirement('Mínimo 8 caracteres', (p) => p.length >= 8),
    PasswordRequirement('Uma letra maiúscula', (p) => p.contains(RegExp(r'[A-Z]'))),
    PasswordRequirement('Um número', (p) => p.contains(RegExp(r'[0-9]'))),
    PasswordRequirement(
      'Um caractere especial',
      (p) => p.contains(RegExp(r'[!@#\$%^&*(),.?":{}|<>_\-+=\[\];/\\]')),
    ),
  ];

  static bool isValid(String password) =>
      requirements.every((r) => r.test(password));

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final r in requirements) ...[
          Row(
            children: [
              AnimatedContainer(
                duration: LiriunDurations.fast,
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: r.test(password)
                      ? LiriunColors.success
                      : Colors.transparent,
                  border: Border.all(
                    color: r.test(password)
                        ? LiriunColors.success
                        : LiriunColors.borderHi,
                    width: 1.2,
                  ),
                ),
                child: r.test(password)
                    ? const Icon(Icons.check_rounded,
                        size: 10, color: Colors.white)
                    : null,
              ),
              const SizedBox(width: 8),
              Text(
                r.label,
                style: TextStyle(
                  fontSize: 11,
                  color: r.test(password)
                      ? LiriunColors.text
                      : LiriunColors.textFaint,
                  letterSpacing: -0.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
        ],
      ],
    );
  }
}
