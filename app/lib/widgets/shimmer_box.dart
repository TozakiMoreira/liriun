import 'package:flutter/material.dart';

import '../core/theme/liriun_tokens.dart';

class ShimmerBox extends StatefulWidget {
  const ShimmerBox({
    super.key,
    this.height = 56,
    this.width = double.infinity,
    this.radius = LiriunRadii.sm,
  });

  final double height;
  final double width;
  final double radius;

  @override
  State<ShimmerBox> createState() => _ShimmerBoxState();
}

class _ShimmerBoxState extends State<ShimmerBox>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;

  @override
  void initState() {
    super.initState();
    _c = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat();
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(widget.radius),
      child: AnimatedBuilder(
        animation: _c,
        builder: (context, _) {
          final t = _c.value;
          return Container(
            height: widget.height,
            width: widget.width,
            decoration: BoxDecoration(
              color: const Color(0x0AFFFFFF),
              gradient: LinearGradient(
                begin: Alignment(-1 + t * 2, 0),
                end: Alignment(1 + t * 2, 0),
                colors: const [
                  Color(0x00FFFFFF),
                  Color(0x14FFFFFF),
                  Color(0x00FFFFFF),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
