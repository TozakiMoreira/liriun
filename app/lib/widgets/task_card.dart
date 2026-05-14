import 'package:flutter/material.dart';

import '../core/theme/liriun_tokens.dart';
import '../models/task.dart';

class TaskCard extends StatelessWidget {
  const TaskCard({
    super.key,
    required this.task,
    this.onTap,
    this.onToggle,
  });

  final Task task;
  final VoidCallback? onTap;
  final VoidCallback? onToggle;

  @override
  Widget build(BuildContext context) {
    final cat = task.category;
    final done = task.completedAt != null;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0x0AFFFFFF),
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            border: Border.all(color: LiriunColors.border),
          ),
          child: Row(
            children: [
              GestureDetector(
                onTap: onToggle,
                child: Container(
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: done ? cat.color : LiriunColors.borderHi,
                      width: 1.5,
                    ),
                    color: done ? cat.color : Colors.transparent,
                  ),
                  child: done
                      ? const Icon(Icons.check_rounded,
                          size: 14, color: Colors.white)
                      : null,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: done
                            ? LiriunColors.textMuted
                            : LiriunColors.text,
                        decoration:
                            done ? TextDecoration.lineThrough : null,
                        letterSpacing: -0.1,
                      ),
                    ),
                    if (task.scheduledFor != null) ...[
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Container(
                            width: 5,
                            height: 5,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: cat.color,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _formatWhen(task.scheduledFor!),
                            style: const TextStyle(
                              fontFamily: 'GeistMono',
                              fontSize: 10,
                              color: LiriunColors.textFaint,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              if (task.priority == Priority.high)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: LiriunColors.warning.withValues(alpha: 0.10),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: LiriunColors.warning.withValues(alpha: 0.28),
                    ),
                  ),
                  child: const Text(
                    'ALTA',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w600,
                      color: LiriunColors.warning,
                      letterSpacing: 0.4,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatWhen(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}
