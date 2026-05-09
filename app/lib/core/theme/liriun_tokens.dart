import 'package:flutter/material.dart';

/// Design tokens canônicos do brand kit Liriun v1.0 (maio 2026).
/// Espelhados de `docs/Identidade Visual/Rebranding/05-tokens/tokens.css`.
class LiriunColors {
  LiriunColors._();

  // Brand violet
  static const violet50 = Color(0xFFF5F1FF);
  static const violet100 = Color(0xFFE8DEFF);
  static const violet200 = Color(0xFFD2BFFF);
  static const violet300 = Color(0xFFB79CFF);
  static const violet400 = Color(0xFFA88BFF);
  static const violet500 = Color(0xFF9C7BFF);
  static const violet600 = Color(0xFF7C7DF6);
  static const violet700 = Color(0xFF5B8DEF);
  static const violet800 = Color(0xFF4A5FD0);
  static const violet900 = Color(0xFF2E3A8F);

  // Surfaces (dark first)
  static const bg = Color(0xFF07080B);
  static const surface = Color(0xFF0E1014);
  static const surfaceHi = Color(0xFF14161C);

  // Text
  static const text = Color(0xF5F4F6FC); // 0.96 alpha aprox
  static const textMuted = Color(0xA6F4F6FC); // 0.65
  static const textFaint = Color(0x6BF4F6FC); // 0.42
  static const textDim = Color(0x47F4F6FC); // 0.28

  // Borders
  static const border = Color(0x0FFFFFFF); // 0.06
  static const borderHi = Color(0x1AFFFFFF); // 0.10
  static const borderGlow = Color(0x529C7BFF); // ~0.32

  // Semantic
  static const success = Color(0xFF7BD7B0);
  static const warning = Color(0xFFF0B36E);
  static const danger = Color(0xFFEE7A8E);
  static const info = Color(0xFF7AA9FF);

  // Categorias padrão (usadas no V1)
  static const catWork = Color(0xFF7AA9FF);
  static const catHealth = Color(0xFF7BD7B0);
  static const catHome = Color(0xFFF0B36E);
  static const catPersonal = Color(0xFFC8A0FF);

  /// Gradient brand 135° A88BFF → 7C7DF6 → 5B8DEF
  static const gradBrand = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [violet400, violet600, violet700],
    stops: [0.0, 0.55, 1.0],
  );
}

class LiriunRadii {
  LiriunRadii._();
  static const xs = 6.0;
  static const sm = 10.0;
  static const md = 14.0;
  static const lg = 18.0;
  static const xl = 22.0;
  static const xxl = 28.0;
  static const pill = 9999.0;
}

class LiriunDurations {
  LiriunDurations._();
  static const fast = Duration(milliseconds: 140);
  static const base = Duration(milliseconds: 220);
  static const slow = Duration(milliseconds: 360);
  static const xslow = Duration(milliseconds: 520);
}
