import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gal/gal.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart' show getTemporaryDirectory;
import 'package:share_plus/share_plus.dart';

import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../widgets/liriun_mark.dart';
import 'live_capture_screen.dart';

class ShareCardScreen extends ConsumerStatefulWidget {
  const ShareCardScreen({super.key});

  @override
  ConsumerState<ShareCardScreen> createState() => _ShareCardScreenState();
}

class _ShareCardScreenState extends ConsumerState<ShareCardScreen> {
  final GlobalKey _cardKey = GlobalKey();
  bool _sharing = false;
  File? _photo;
  File? _capturedShot;
  bool _autoLaunched = false;

  Widget _buildOverlay({
    required int streak,
    required int total,
    required int foco,
    required String bestDay,
    required int tasksHoje,
    String? acordouAs,
  }) {
    return _LiveOverlay(
      streak: streak,
      total: total,
      foco: foco,
      tasksHoje: tasksHoje,
      acordouAs: acordouAs,
    );
  }

  Future<void> _pickPhoto() async {
    HapticFeedback.lightImpact();
    final picker = ImagePicker();
    final xfile = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1080,
      imageQuality: 88,
    );
    if (xfile != null && mounted) {
      setState(() {
        _photo = File(xfile.path);
        _capturedShot = null;
      });
    }
  }

  Future<void> _takePhoto({
    required int streak,
    required int total,
    required int foco,
    required String bestDay,
    required int tasksHoje,
    String? acordouAs,
  }) async {
    HapticFeedback.lightImpact();
    try {
      final result = await Navigator.of(context).push<File>(
        MaterialPageRoute(
          fullscreenDialog: true,
          builder: (_) => LiveCaptureScreen(
            overlay: _buildOverlay(
              streak: streak,
              total: total,
              foco: foco,
              bestDay: bestDay,
              tasksHoje: tasksHoje,
              acordouAs: acordouAs,
            ),
          ),
        ),
      );
      if (result != null && mounted) {
        setState(() {
          _capturedShot = result;
          _photo = null;
        });
      }
    } catch (_) {}
  }

  Future<File?> _renderToFile() async {
    final boundary = _cardKey.currentContext!.findRenderObject()
        as RenderRepaintBoundary;
    final image = await boundary.toImage(pixelRatio: 3.0);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    if (byteData == null) return null;
    final bytes = byteData.buffer.asUint8List();
    final dir = await getTemporaryDirectory();
    return File('${dir.path}/liriun-streak-${DateTime.now().millisecondsSinceEpoch}.png')
        .writeAsBytes(bytes);
  }

  Future<void> _shareTo(String target) async {
    if (_sharing) return;
    setState(() => _sharing = true);
    HapticFeedback.lightImpact();
    try {
      final file = await _renderToFile();
      if (file == null) return;
      String texto;
      switch (target) {
        case 'instagram':
          texto = 'Meu progresso no Liriun. #liriun';
          break;
        case 'whatsapp':
          texto = 'Meu progresso no Liriun.';
          break;
        default:
          texto = 'Liriun';
      }
      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'image/png')],
        text: texto,
        subject: 'Meu Liriun',
      );
    } catch (err) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Falha ao compartilhar: $err'),
            duration: const Duration(seconds: 3),
            backgroundColor: LiriunColors.surfaceHi,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

  Future<void> _salvarNaGaleria() async {
    if (_sharing) return;
    setState(() => _sharing = true);
    HapticFeedback.lightImpact();
    try {
      final hasAccess = await Gal.hasAccess(toAlbum: true);
      if (!hasAccess) {
        final ok = await Gal.requestAccess(toAlbum: true);
        if (!ok) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Permissão de galeria negada.'),
                duration: Duration(seconds: 2),
                backgroundColor: LiriunColors.surfaceHi,
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
          return;
        }
      }
      final file = await _renderToFile();
      if (file == null) return;
      await Gal.putImage(file.path, album: 'Liriun');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Salvo na galeria.'),
            duration: Duration(seconds: 2),
            backgroundColor: LiriunColors.surfaceHi,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (err) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Falha ao salvar: $err'),
            duration: const Duration(seconds: 3),
            backgroundColor: LiriunColors.surfaceHi,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final concluidas = ref.watch(concluidasProvider).valueOrNull ?? [];
    final total = concluidas.length;

    // Hoje
    final hojeDt = DateTime.now();
    final hojeKey = '${hojeDt.year}-${hojeDt.month}-${hojeDt.day}';
    final hojeConcluidas = concluidas.where((t) {
      final c = t.concluidaEm;
      if (c == null) return false;
      return '${c.year}-${c.month}-${c.day}' == hojeKey;
    }).toList()
      ..sort((a, b) => a.concluidaEm!.compareTo(b.concluidaEm!));
    final tasksHoje = hojeConcluidas.length;
    final acordouAs = hojeConcluidas.isEmpty
        ? null
        : '${hojeConcluidas.first.concluidaEm!.hour.toString().padLeft(2, '0')}:${hojeConcluidas.first.concluidaEm!.minute.toString().padLeft(2, '0')}';

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

    if (!_autoLaunched) {
      _autoLaunched = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _takePhoto(
            streak: streak,
            total: total,
            foco: foco,
            bestDay: diasAbbr[bestIdx],
            tasksHoje: tasksHoje,
            acordouAs: acordouAs,
          );
        }
      });
    }

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
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _PhotoBtn(
                  icon: Icons.photo_camera_rounded,
                  label: 'Câmera',
                  onTap: () => _takePhoto(
                    streak: streak,
                    total: total,
                    foco: foco,
                    bestDay: diasAbbr[bestIdx],
                    tasksHoje: tasksHoje,
                    acordouAs: acordouAs,
                  ),
                ),
                const SizedBox(width: 6),
                _PhotoBtn(
                  icon: Icons.photo_library_rounded,
                  label: 'Galeria',
                  onTap: _pickPhoto,
                ),
                if (_photo != null || _capturedShot != null) ...[
                  const SizedBox(width: 6),
                  _PhotoBtn(
                    icon: Icons.close_rounded,
                    label: 'Remover',
                    onTap: () => setState(() {
                      _photo = null;
                      _capturedShot = null;
                    }),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 14),
            Expanded(
              child: Center(
                child: RepaintBoundary(
                  key: _cardKey,
                  child: _capturedShot != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(22),
                          child: SizedBox(
                            width: 260,
                            height: 462,
                            child: Image.file(_capturedShot!,
                                fit: BoxFit.cover),
                          ),
                        )
                      : _StreakCard(
                          streak: streak,
                          total: total,
                          foco: foco,
                          bestDay: diasAbbr[bestIdx],
                          tasksHoje: tasksHoje,
                          acordouAs: acordouAs,
                          photo: _photo,
                        ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _SocialBtn(
                    asset: 'assets/icons/instagram.png',
                    label: 'Instagram',
                    loading: _sharing,
                    onTap: () => _shareTo('instagram'),
                  ),
                  _SocialBtn(
                    asset: 'assets/icons/whatsapp.png',
                    label: 'WhatsApp',
                    loading: _sharing,
                    onTap: () => _shareTo('whatsapp'),
                  ),
                  _SocialBtn(
                    icon: Icons.download_rounded,
                    label: 'Salvar',
                    loading: _sharing,
                    onTap: _salvarNaGaleria,
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
    required this.tasksHoje,
    this.acordouAs,
    this.photo,
    this.glass = false,
  });

  final int streak;
  final int total;
  final int foco;
  final String bestDay;
  final int tasksHoje;
  final String? acordouAs;
  final File? photo;
  final bool glass;

  @override
  Widget build(BuildContext context) {
    final inner = Stack(
      clipBehavior: Clip.hardEdge,
      children: [
          if (photo != null && !glass)
            Positioned.fill(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: Image.file(photo!, fit: BoxFit.cover),
              ),
            ),
          if (photo != null && !glass)
            Positioned.fill(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      stops: const [0.0, 0.4, 1.0],
                      colors: [
                        Colors.black.withValues(alpha: 0.45),
                        Colors.black.withValues(alpha: 0.30),
                        Colors.black.withValues(alpha: 0.78),
                      ],
                    ),
                  ),
                ),
              ),
            ),
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
                      LiriunColors.violet400.withValues(alpha: 0.30),
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
                    const SizedBox(height: 26),
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
                                fontSize: 80,
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
                    const SizedBox(height: 18),
                    if (acordouAs != null || tasksHoje > 0) ...[
                      _MomentRow(
                        icon: Icons.wb_sunny_outlined,
                        label: 'COMECEI ÀS',
                        value: acordouAs ?? '—',
                      ),
                      const SizedBox(height: 6),
                      _MomentRow(
                        icon: Icons.check_rounded,
                        label: 'HOJE',
                        value:
                            '$tasksHoje tarefa${tasksHoje == 1 ? '' : 's'}',
                      ),
                      const SizedBox(height: 14),
                    ],
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
      );

    if (glass) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            width: 260,
            height: 462,
            decoration: BoxDecoration(
              color: const Color(0x33000000),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.16),
                width: 1.2,
              ),
            ),
            child: inner,
          ),
        ),
      );
    }

    return Container(
      width: 260,
      height: 462,
      decoration: BoxDecoration(
        gradient: photo == null
            ? const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                stops: [0.0, 0.6, 1.0],
                colors: [
                  Color(0xFF1A1429),
                  Color(0xFF0E1014),
                  Color(0xFF0A0D18),
                ],
              )
            : null,
        color: photo != null ? Colors.black : null,
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
      child: inner,
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

class _MomentRow extends StatelessWidget {
  const _MomentRow({
    required this.icon,
    required this.label,
    required this.value,
  });
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0x0FFFFFFF),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Row(
        children: [
          Icon(icon, size: 13, color: LiriunColors.violet300),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 9,
              letterSpacing: 0.6,
              color: LiriunColors.textFaint,
              fontWeight: FontWeight.w600,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontSize: 12,
              color: LiriunColors.text,
              fontWeight: FontWeight.w600,
              letterSpacing: -0.1,
            ),
          ),
        ],
      ),
    );
  }
}

class _PhotoBtn extends StatelessWidget {
  const _PhotoBtn({
    required this.icon,
    required this.label,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0x0DFFFFFF),
          borderRadius: BorderRadius.circular(99),
          border: Border.all(color: LiriunColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 13, color: LiriunColors.violet300),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: LiriunColors.text,
                letterSpacing: -0.1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SocialBtn extends StatelessWidget {
  const _SocialBtn({
    this.asset,
    this.icon,
    required this.label,
    required this.onTap,
    this.loading = false,
  });
  final String? asset;
  final IconData? icon;
  final String label;
  final VoidCallback onTap;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: loading ? null : onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 60,
            height: 60,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: const Color(0x14FFFFFF),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: LiriunColors.borderHi),
            ),
            child: loading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: LiriunColors.violet300,
                    ),
                  )
                : asset != null
                    ? Image.asset(asset!, width: 32, height: 32)
                    : Icon(icon, size: 26, color: LiriunColors.violet300),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: LiriunColors.text,
              letterSpacing: -0.1,
            ),
          ),
        ],
      ),
    );
  }
}

class _LiveOverlay extends StatelessWidget {
  const _LiveOverlay({
    required this.streak,
    required this.total,
    required this.foco,
    required this.tasksHoje,
    this.acordouAs,
  });

  final int streak;
  final int total;
  final int foco;
  final int tasksHoje;
  final String? acordouAs;

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Stack(
        children: [
          Positioned(
            right: 20,
            top: 100,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _statBlock(
                  'STREAK',
                  '$streak',
                  unit: streak == 1 ? 'dia' : 'dias',
                ),
                const SizedBox(height: 18),
                _statBlock(
                  'HOJE',
                  '$tasksHoje',
                  unit: tasksHoje == 1 ? 'tarefa' : 'tarefas',
                ),
                const SizedBox(height: 18),
                _statBlock('FOCO', '$foco%'),
                if (acordouAs != null) ...[
                  const SizedBox(height: 18),
                  _statBlock('COMECEI ÀS', acordouAs!),
                ],
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 100,
            child: Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LiriunColors.gradBrand,
                      boxShadow: [
                        BoxShadow(
                          color:
                              LiriunColors.violet500.withValues(alpha: 0.50),
                          blurRadius: 16,
                        ),
                      ],
                    ),
                    child: const LiriunMark(size: 20),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'LIRIUN',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: 2.4,
                      shadows: [
                        Shadow(color: Color(0x99000000), blurRadius: 14),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (total > 0)
            Positioned(
              left: 0,
              right: 0,
              bottom: 78,
              child: Center(
                child: Text(
                  '$total tarefas no total',
                  style: const TextStyle(
                    fontFamily: 'Geist Mono',
                    fontSize: 10,
                    color: Color(0xCCFFFFFF),
                    letterSpacing: 1.2,
                    shadows: [
                      Shadow(color: Color(0x99000000), blurRadius: 10),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _statBlock(String label, String value, {String? unit}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Geist Mono',
            fontSize: 11,
            letterSpacing: 1.4,
            color: Color(0xCCFFFFFF),
            fontWeight: FontWeight.w600,
            shadows: [
              Shadow(color: Color(0xB3000000), blurRadius: 10),
            ],
          ),
        ),
        const SizedBox(height: 2),
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 44,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: -1.5,
                height: 1,
                shadows: [
                  Shadow(color: Color(0xB3000000), blurRadius: 18),
                ],
              ),
            ),
            if (unit != null) ...[
              const SizedBox(width: 4),
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  unit,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Color(0xE6FFFFFF),
                    letterSpacing: -0.2,
                    shadows: [
                      Shadow(color: Color(0xB3000000), blurRadius: 10),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }
}
