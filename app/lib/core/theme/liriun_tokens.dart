import 'package:flutter/material.dart';

/// Design tokens canônicos do brand kit Liriun v1.0.
/// Espelhados 1:1 de `docs/Identidade Visual/Rebranding/brand-kit/05-tokens/tokens.json`.
/// NÃO alterar valores aqui — sempre sincronizar com tokens.json.
class LiriunColors {
  LiriunColors._();

  // Violet scale
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

  // Surfaces
  static const bg = Color(0xFF07080B);
  static const surface = Color(0xFF0E1014);
  static const surfaceHi = Color(0xFF14161C);

  // Text — rgba alpha aplicado via Color.fromARGB
  static const text = Color.fromARGB(245, 244, 246, 252); // 0.96
  static const textMuted = Color.fromARGB(166, 244, 246, 252); // 0.65
  static const textFaint = Color.fromARGB(107, 244, 246, 252); // 0.42
  static const textDim = Color.fromARGB(71, 244, 246, 252); // 0.28

  // Borders
  static const border = Color.fromARGB(15, 255, 255, 255); // 0.06
  static const borderHi = Color.fromARGB(26, 255, 255, 255); // 0.10
  static const borderGlow = Color.fromARGB(82, 156, 123, 255); // 0.32

  // Semantic
  static const success = Color(0xFF4ADE80);
  static const warning = Color(0xFFFBBF24);
  static const danger = Color(0xFFF87171);
  static const info = Color(0xFF5B8DEF);

  // Categorias (mesmas do guide app)
  static const catWork = Color(0xFF7AA9FF);
  static const catHealth = Color(0xFF7BD7B0);
  static const catHome = Color(0xFFF0B36E);
  static const catPersonal = Color(0xFFC8A0FF);
  static const catFinance = Color(0xFFE58FB0);

  /// Gradient brand canônico: 135° violet400 → violet600 → violet700
  static const gradBrand = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [violet400, violet600, violet700],
    stops: [0.0, 0.55, 1.0],
  );

  /// Gradient shine — overlay glass nos cards
  static const gradShine = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0x52FFFFFF), Color(0x00FFFFFF)],
    stops: [0.0, 0.4],
  );
}

class LiriunFontSize {
  LiriunFontSize._();
  static const xs = 12.0;
  static const sm = 13.0;
  static const base = 15.0;
  static const md = 17.0;
  static const lg = 22.0;
  static const xl = 28.0;
  static const x2l = 36.0;
  static const x3l = 48.0;
  static const x4l = 64.0;
  static const x5l = 88.0;
}

class LiriunRadii {
  LiriunRadii._();
  static const xs = 6.0;
  static const sm = 10.0;
  static const md = 14.0;
  static const lg = 18.0;
  static const xl = 22.0;
  static const xxl = 28.0;
  static const pill = 999.0;
}

class LiriunSpace {
  LiriunSpace._();
  static const s1 = 4.0;
  static const s2 = 8.0;
  static const s3 = 12.0;
  static const s4 = 16.0;
  static const s5 = 20.0;
  static const s6 = 24.0;
  static const s8 = 32.0;
  static const s10 = 40.0;
  static const s12 = 48.0;
  static const s16 = 64.0;
  static const s20 = 80.0;
  static const s24 = 96.0;
}

class LiriunShadows {
  LiriunShadows._();
  static const sm = BoxShadow(color: Color(0x33000000), blurRadius: 2, offset: Offset(0, 1));
  static const md = BoxShadow(color: Color(0x4D000000), blurRadius: 16, offset: Offset(0, 4));
  static const lg = BoxShadow(color: Color(0x73000000), blurRadius: 32, offset: Offset(0, 12));
  static const xl = BoxShadow(color: Color(0x8C000000), blurRadius: 60, offset: Offset(0, 30));
  static BoxShadow glow = BoxShadow(
    color: LiriunColors.violet700.withValues(alpha: 0.32),
    blurRadius: 18,
    offset: const Offset(0, 6),
  );
}

class LiriunDurations {
  LiriunDurations._();
  static const fast = Duration(milliseconds: 180);
  static const base = Duration(milliseconds: 220);
  static const slow = Duration(milliseconds: 360);
  static const xslow = Duration(milliseconds: 520);
}

class LiriunCurves {
  LiriunCurves._();
  static const standard = Cubic(0.4, 0.0, 0.2, 1.0);
  static const decel = Cubic(0.25, 0.1, 0.25, 1.0);
  static const expo = Cubic(0.16, 1.0, 0.3, 1.0);
}
