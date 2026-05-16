import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:path_provider/path_provider.dart' show getTemporaryDirectory;
import 'package:share_plus/share_plus.dart';

import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../widgets/liriun_mark.dart';

class ShareCardScreen extends ConsumerStatefulWidget {
  const ShareCardScreen({super.key});

  @override
  ConsumerState<ShareCardScreen> createState() => _ShareCardScreenState();
}

class _ShareCardScreenState extends ConsumerState<ShareCardScreen> {
  final GlobalKey _cardKey = GlobalKey();
  bool _sharing = false;

  Future<void> _copyImage() async {
    HapticFeedback.lightImpact();
    try {
      final boundary = _cardKey.currentContext!.findRenderObject()
          as RenderRepaintBoundary;
      final image = await boundary.toImage(pixelRatio: 3.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return;
      final bytes = byteData.buffer.asUint8List();
      final dir = await getTemporaryDirectory();
      final file = await File('${dir.path}/liriun-streak.png')
          .writeAsBytes(bytes);
      await Clipboard.setData(ClipboardData(text: file.path));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Imagem copiada.'),
            duration: Duration(seconds: 2),
            backgroundColor: LiriunColors.surfaceHi,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (_) {}
  }

  Future<void> _share() async {
    if (_sharing) return;
    setState(() => _sharing = true);
    HapticFeedback.lightImpact();
    try {
      final boundary = _cardKey.currentContext!.findRenderObject()
          as RenderRepaintBoundary;
      final image = await boundary.toImage(pixelRatio: 3.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return;
      final bytes = byteData.buffer.asUint8List();
      final dir = await getTemporaryDirectory();
      final file = await File('${dir.path}/liriun-streak.png').writeAsBytes(bytes);
      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'image/png')],
        text: 'Meu streak no Liriun.',
      );
    } catch (_) {
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final concluidas = ref.watch(concluidasProvider).valueOrNull ?? [];
    final total = concluidas.length;

    // Streak
    final dates = <String>{};
    for (final t in concluidas) {
      if (t.concluidaEm != null) {
        final d = t.concluidaEm!;
        dates.add('${d.year}-${d.month}-${d.day}');
      }
    }
    var streak = 0;
    final now = DateTime.now();
    var cursor = DateTime(now.year, now.month, now.day);
    while (dates.contains('${cursor.year}-${cursor.month}-${cursor.day}')) {
      streak++;
      cursor = cursor.subtract(const Duration(days: 1));
    }

    // Foco
    final pendentesCount = ref.watch(pendentesProvider).valueOrNull?.length ?? 0;
    final fluxoTotal = total + pendentesCount;
    final foco = fluxoTotal == 0 ? 0 : ((total / fluxoTotal) * 100).round();

    // Best weekday
    final byWeekday = List<int>.filled(7, 0);
    for (final t in concluidas) {
      if (t.concluidaEm != null) {
        byWeekday[t.concluidaEm!.weekday - 1]++;
      }
    }
    final bestIdx = byWeekday.indexOf(byWeekday.fold(0, (a, b) => b > a ? b : a));
    const diasAbbr = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

    return Scaffold(
      backgroundColor: LiriunColors.bg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: const Color(0x0DFFFFFF),
                        borderRadius: BorderRadius.circular(99),
                        border: Border.all(color: LiriunColors.border),
                      ),
                      child: const Icon(Icons.close_rounded,
                          size: 16, color: LiriunColors.textMuted),
                    ),
                  ),
                  const Spacer(),
                  const Text(
                    'Compartilhar',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: LiriunColors.text,
                    ),
                  ),
                  const Spacer(),
                  const SizedBox(width: 32, height: 32),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: Center(
                child: RepaintBoundary(
                  key: _cardKey,
                  child: _StreakCard(
                    streak: streak,
                    total: total,
                    foco: foco,
                    bestDay: diasAbbr[bestIdx],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              child: Wrap(
                spacing: 6,
                runSpacing: 6,
                alignment: WrapAlignment.center,
                children: [
                  _ShareChip(
                    label: 'IG Story',
                    primary: true,
                    loading: _sharing,
                    onTap: _share,
                  ),
                  _ShareChip(
                    label: 'WhatsApp',
                    onTap: _share,
                  ),
                  _ShareChip(
                    label: 'X',
                    onTap: _share,
                  ),
                  _ShareChip(
                    label: 'Copiar imagem',
                    onTap: _copyImage,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StreakCard extends StatelessWidget {
  const _StreakCard({
    required this.streak,
    required this.total,
    required this.foco,
    required this.bestDay,
  });

  final int streak;
  final int total;
  final int foco;
  final String bestDay;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      height: 462, // 9:16
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          stops: [0.0, 0.6, 1.0],
          colors: [
            Color(0xFF1A1429),
            Color(0xFF0E1014),
            Color(0xFF0A0D18),
          ],
        ),
        borderRadius: BorderRadius.circular(22),
        border:
            Border.all(color: LiriunColors.violet400.withValues(alpha: 0.22)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x80000000),
            blurRadius: 50,
            offset: Offset(0, 20),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.hardEdge,
        children: [
          Positioned(
            top: -40,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      LiriunColors.violet400.withValues(alpha: 0.35),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.65],
                  ),
                ),
              ),
            ),
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(22),
            child: SizedBox(
              width: 260,
              height: 462,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        LiriunMark(size: 20),
                        SizedBox(width: 6),
                        Text(
                          'Liriun',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: LiriunColors.text,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    Center(
                      child: Column(
                        children: [
                          const Text(
                            'STREAK',
                            style: TextStyle(
                              fontFamily: 'Geist Mono',
                              fontSize: 9,
                              letterSpacing: 2,
                              fontWeight: FontWeight.w600,
                              color: LiriunColors.violet300,
                            ),
                          ),
                          const SizedBox(height: 6),
                          ShaderMask(
                            shaderCallback: (b) =>
                                LiriunColors.gradBrand.createShader(b),
                            child: Text(
                              '$streak',
                              style: const TextStyle(
                                fontSize: 88,
                                fontWeight: FontWeight.w700,
                                letterSpacing: -3,
                                color: Colors.white,
                                height: 1,
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            streak == 1 ? 'dia seguido' : 'dias seguidos',
                            style: const TextStyle(
                              fontSize: 11,
                              color: LiriunColors.textMuted,
                              letterSpacing: -0.1,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),
                    Row(
                      children: [
                        _mini('$total', 'TAREFAS'),
                        const SizedBox(width: 4),
                        _mini('$foco%', 'FOCO'),
                        const SizedBox(width: 4),
                        _mini(bestDay, 'TOP DIA'),
                      ],
                    ),
                    const Spacer(),
                    const Center(
                      child: Text(
                        'LIRIUN.COM',
                        style: TextStyle(
                          fontFamily: 'Geist Mono',
                          fontSize: 8,
                          letterSpacing: 1.2,
                          color: LiriunColors.textFaint,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _mini(String n, String l) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0x0DFFFFFF),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: LiriunColors.border),
        ),
        child: Column(
          children: [
            Text(
              n,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: LiriunColors.text,
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              l,
              style: const TextStyle(
                fontFamily: 'Geist Mono',
                fontSize: 7,
                letterSpacing: 0.4,
                color: LiriunColors.textFaint,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ShareChip extends StatelessWidget {
  const _ShareChip({
    required this.label,
    required this.onTap,
    this.primary = false,
    this.loading = false,
  });
  final String label;
  final VoidCallback onTap;
  final bool primary;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: loading ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          gradient: primary ? LiriunColors.gradBrand : null,
          color: primary ? null : const Color(0x0DFFFFFF),
          borderRadius: BorderRadius.circular(99),
          border: primary ? null : Border.all(color: LiriunColors.border),
          boxShadow: primary
              ? [
                  BoxShadow(
                    color: LiriunColors.violet500.withValues(alpha: 0.32),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ]
              : null,
        ),
        child: loading
            ? const SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(
                  strokeWidth: 1.8,
                  color: Colors.white,
                ),
              )
            : Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: primary ? Colors.white : LiriunColors.text,
                  letterSpacing: -0.1,
                ),
              ),
      ),
    );
  }
}
