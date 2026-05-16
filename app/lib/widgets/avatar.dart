import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../core/theme/liriun_tokens.dart';

class LiriunAvatar extends StatelessWidget {
  const LiriunAvatar({
    super.key,
    required this.nome,
    this.fotoUrl,
    this.size = 56,
    this.ringWidth = 2,
  });

  final String nome;
  final String? fotoUrl;
  final double size;
  final double ringWidth;

  String get _inicial => nome.trim().isEmpty ? '?' : nome.trim()[0].toUpperCase();

  Uint8List? _base64Bytes() {
    final url = fotoUrl;
    if (url == null || !url.startsWith('data:')) return null;
    final idx = url.indexOf(',');
    if (idx < 0) return null;
    try {
      return base64Decode(url.substring(idx + 1));
    } catch (_) {
      return null;
    }
  }

  bool get _isNetwork =>
      fotoUrl != null &&
      (fotoUrl!.startsWith('http://') || fotoUrl!.startsWith('https://'));

  @override
  Widget build(BuildContext context) {
    final bytes = _base64Bytes();
    final inner = size - ringWidth * 2;
    Widget child;
    if (bytes != null) {
      child = Image.memory(
        bytes,
        width: inner,
        height: inner,
        fit: BoxFit.cover,
        gaplessPlayback: true,
        errorBuilder: (_, __, ___) => _fallback(inner),
      );
    } else if (_isNetwork) {
      child = Image.network(
        fotoUrl!,
        width: inner,
        height: inner,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _fallback(inner),
      );
    } else {
      child = _fallback(inner);
    }

    return Container(
      padding: EdgeInsets.all(ringWidth),
      decoration: const BoxDecoration(
        gradient: LiriunColors.gradBrand,
        shape: BoxShape.circle,
      ),
      child: ClipOval(
        child: Container(
          width: inner,
          height: inner,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: LiriunColors.surfaceHi,
            border: Border.all(color: LiriunColors.bg, width: 2),
          ),
          child: ClipOval(child: child),
        ),
      ),
    );
  }

  Widget _fallback(double s) {
    return Container(
      width: s,
      height: s,
      alignment: Alignment.center,
      decoration: const BoxDecoration(shape: BoxShape.circle),
      child: Text(
        _inicial,
        style: TextStyle(
          fontSize: s * 0.42,
          fontWeight: FontWeight.w600,
          color: LiriunColors.text,
        ),
      ),
    );
  }
}
