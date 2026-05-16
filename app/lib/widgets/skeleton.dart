import 'package:flutter/material.dart';

import '../core/theme/liriun_tokens.dart';

class Skeleton extends StatefulWidget {
  const Skeleton({
    super.key,
    this.width,
    this.height = 14,
    this.radius = 6,
  });

  final double? width;
  final double height;
  final double radius;

  @override
  State<Skeleton> createState() => _SkeletonState();
}

class _SkeletonState extends State<Skeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) {
        final t = _ctrl.value;
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.radius),
            gradient: LinearGradient(
              begin: Alignment(-1 + t * 2, 0),
              end: Alignment(1 + t * 2, 0),
              colors: const [
                Color(0x08FFFFFF),
                Color(0x14FFFFFF),
                Color(0x08FFFFFF),
              ],
              stops: const [0.0, 0.5, 1.0],
            ),
            border: Border.all(color: LiriunColors.border),
          ),
        );
      },
    );
  }
}

class TaskRowSkeleton extends StatelessWidget {
  const TaskRowSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 11),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Skeleton(width: 20, height: 20, radius: 99),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Skeleton(height: 14, radius: 4),
                SizedBox(height: 6),
                Skeleton(width: 80, height: 10, radius: 4),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class TaskListSkeleton extends StatelessWidget {
  const TaskListSkeleton({super.key, this.count = 4});
  final int count;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var i = 0; i < count; i++)
          Container(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: LiriunColors.border)),
            ),
            child: const TaskRowSkeleton(),
          ),
      ],
    );
  }
}
