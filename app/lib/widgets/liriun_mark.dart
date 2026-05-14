import 'package:flutter/material.dart';

/// Glyph oficial Liriun — PNG renderizado do brand-kit (icon-512.png).
/// Squircle gradient roxo→azul + waveform branco + dot.
class LiriunMark extends StatelessWidget {
  const LiriunMark({super.key, this.size = 32});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/icons/liriun-icon.png',
      width: size,
      height: size,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
    );
  }
}

/// Wordmark "Liriun" via SVG (texto + glyph).
class LiriunLockup extends StatelessWidget {
  const LiriunLockup({super.key, this.height = 32});
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          LiriunMark(size: height),
          SizedBox(width: height * 0.25),
          Text(
            'Liriun',
            style: TextStyle(
              fontFamily: 'Geist',
              fontSize: height * 0.85,
              fontWeight: FontWeight.w600,
              letterSpacing: -1,
              color: const Color.fromARGB(245, 244, 246, 252),
            ),
          ),
        ],
      ),
    );
  }
}
