import 'package:flutter/material.dart';

import 'liriun_tokens.dart';

/// Constrói o ThemeData escuro Liriun.
/// Tipografia: Geist + Geist Mono (carregadas via assets ou system fallback).
ThemeData buildLiriunDarkTheme() {
  const colors = ColorScheme.dark(
    primary: LiriunColors.violet500,
    onPrimary: Colors.white,
    secondary: LiriunColors.violet700,
    onSecondary: Colors.white,
    surface: LiriunColors.surface,
    onSurface: LiriunColors.text,
    surfaceContainerHighest: LiriunColors.surfaceHi,
    error: LiriunColors.danger,
    onError: Colors.white,
    outline: LiriunColors.borderHi,
  );

  const textTheme = TextTheme(
    displayLarge: TextStyle(
      fontFamily: 'Geist',
      fontSize: LiriunFontSize.x4l,
      fontWeight: FontWeight.w600,
      letterSpacing: -2.0,
      height: 1.05,
      color: LiriunColors.text,
    ),
    displayMedium: TextStyle(
      fontFamily: 'Geist',
      fontSize: LiriunFontSize.x3l,
      fontWeight: FontWeight.w600,
      letterSpacing: -1.4,
      height: 1.1,
      color: LiriunColors.text,
    ),
    headlineLarge: TextStyle(
      fontFamily: 'Geist',
      fontSize: LiriunFontSize.x2l,
      fontWeight: FontWeight.w600,
      letterSpacing: -1.0,
      height: 1.15,
      color: LiriunColors.text,
    ),
    headlineMedium: TextStyle(
      fontFamily: 'Geist',
      fontSize: LiriunFontSize.xl,
      fontWeight: FontWeight.w600,
      letterSpacing: -0.6,
      color: LiriunColors.text,
    ),
    titleLarge: TextStyle(
      fontFamily: 'Geist',
      fontSize: LiriunFontSize.lg,
      fontWeight: FontWeight.w600,
      letterSpacing: -0.4,
      color: LiriunColors.text,
    ),
    titleMedium: TextStyle(
      fontFamily: 'Geist',
      fontSize: LiriunFontSize.md,
      fontWeight: FontWeight.w600,
      letterSpacing: -0.2,
      color: LiriunColors.text,
    ),
    bodyLarge: TextStyle(
      fontFamily: 'Geist',
      fontSize: LiriunFontSize.base,
      fontWeight: FontWeight.w400,
      letterSpacing: -0.1,
      height: 1.5,
      color: LiriunColors.text,
    ),
    bodyMedium: TextStyle(
      fontFamily: 'Geist',
      fontSize: LiriunFontSize.sm,
      fontWeight: FontWeight.w400,
      height: 1.5,
      color: LiriunColors.textMuted,
    ),
    labelMedium: TextStyle(
      fontFamily: 'Geist Mono',
      fontSize: LiriunFontSize.xs,
      fontWeight: FontWeight.w500,
      letterSpacing: 1.4,
      color: LiriunColors.textFaint,
    ),
  );

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: colors,
    scaffoldBackgroundColor: LiriunColors.bg,
    canvasColor: LiriunColors.bg,
    textTheme: textTheme,
    fontFamily: 'Geist',
    splashFactory: InkSparkle.splashFactory,
    appBarTheme: const AppBarTheme(
      backgroundColor: LiriunColors.bg,
      foregroundColor: LiriunColors.text,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
    ),
    cardTheme: CardThemeData(
      color: LiriunColors.surfaceHi,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(LiriunRadii.lg),
        side: const BorderSide(color: LiriunColors.borderHi, width: 1),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: LiriunColors.surfaceHi,
      hintStyle: const TextStyle(color: LiriunColors.textFaint),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        borderSide: const BorderSide(color: LiriunColors.borderHi),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        borderSide: const BorderSide(color: LiriunColors.borderHi),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        borderSide: const BorderSide(color: LiriunColors.violet500, width: 1.5),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: LiriunColors.violet500,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(LiriunRadii.md),
        ),
        textStyle: const TextStyle(
          fontFamily: 'Geist',
          fontSize: 15,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.1,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: LiriunColors.text,
        side: const BorderSide(color: LiriunColors.borderHi),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(LiriunRadii.md),
        ),
      ),
    ),
    dividerTheme: const DividerThemeData(
      color: LiriunColors.border,
      thickness: 1,
      space: 1,
    ),
  );
}
