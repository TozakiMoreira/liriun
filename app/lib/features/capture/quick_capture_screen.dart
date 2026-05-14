import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/captura_api.dart';
import '../../core/api/tarefas_api.dart';
import '../../core/api/voice_service.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../widgets/pulse_ring.dart';
import '../../widgets/waveform_bars.dart';

enum _Mode { voz, texto }

class QuickCaptureScreen extends ConsumerStatefulWidget {
  const QuickCaptureScreen({super.key});

  @override
  ConsumerState<QuickCaptureScreen> createState() => _QuickCaptureScreenState();
}

class _QuickCaptureScreenState extends ConsumerState<QuickCaptureScreen> {
  _Mode _mode = _Mode.voz;
  String _transcript = '';
  bool _listening = false;
  bool _processing = false;
  final _textCtl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _startListening());
  }

  @override
  void dispose() {
    ref.read(voiceServiceProvider).cancel();
    _textCtl.dispose();
    super.dispose();
  }

  Future<void> _startListening() async {
    if (_mode != _Mode.voz) return;
    HapticFeedback.lightImpact();
    final voice = ref.read(voiceServiceProvider);
    final ok = await voice.initialize();
    if (!ok || !mounted) return;
    setState(() => _listening = true);
    await voice.startListening(
      onResult: (text, isFinal) {
        if (!mounted) return;
        setState(() => _transcript = text);
        if (isFinal && text.trim().isNotEmpty) _send(text);
      },
    );
  }

  Future<void> _send(String text) async {
    if (text.trim().isEmpty) return;
    setState(() {
      _listening = false;
      _processing = true;
    });
    try {
      final res = await ref.read(capturaApiProvider).conversar(
        historico: [MensagemDto(papel: 'usuario', texto: text)],
      );
      if (res.tarefa != null && res.tarefa!.dataPrazo != null) {
        await ref.read(tarefasApiProvider).criar(
              nome: res.tarefa!.titulo,
              prioridade: res.tarefa!.prioridade ?? 3,
              dataPrazo: res.tarefa!.dataPrazo!,
              horarioFinal: res.tarefa!.horarioFinal,
              categoriaIds: res.tarefa!.categoriaIds.isEmpty
                  ? null
                  : res.tarefa!.categoriaIds,
              observacoes: res.tarefa!.observacoes,
            );
        ref.invalidate(pendentesProvider);
        HapticFeedback.heavyImpact();
      }
      if (mounted) context.pop();
    } catch (_) {
      if (mounted) setState(() => _processing = false);
    }
  }

  void _switchMode(_Mode m) async {
    HapticFeedback.selectionClick();
    await ref.read(voiceServiceProvider).cancel();
    setState(() {
      _mode = m;
      _listening = false;
      _transcript = '';
    });
    if (m == _Mode.voz) _startListening();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          GestureDetector(
            onTap: () => context.pop(),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
              child: Container(
                color: const Color(0xFF07080B).withValues(alpha: 0.65),
              ),
            ),
          ),
          Positioned(
            top: 60,
            left: 18,
            right: 18,
            child: const Text(
              'CAPTURA RÁPIDA · DE QUALQUER TELA',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Geist Mono',
                fontSize: 9,
                letterSpacing: 1.2,
                color: LiriunColors.textFaint,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: GestureDetector(
              onTap: () {},
              child: Container(
                margin: EdgeInsets.fromLTRB(
                  12,
                  0,
                  12,
                  MediaQuery.of(context).padding.bottom + 24,
                ),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xEB14161C),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: LiriunColors.borderHi),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x80000000),
                      blurRadius: 60,
                      offset: Offset(0, 30),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 36,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0x2EFFFFFF),
                        borderRadius: BorderRadius.circular(99),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _modePill(_Mode.voz, Icons.mic_rounded, 'Voz'),
                        const SizedBox(width: 4),
                        _modePill(_Mode.texto, Icons.short_text_rounded, 'Texto'),
                      ],
                    ),
                    const SizedBox(height: 14),
                    if (_mode == _Mode.voz)
                      _vozContent()
                    else
                      _textoContent(),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 6,
                      alignment: WrapAlignment.center,
                      children: const [
                        _Chip('HOJE'),
                        _Chip('AMANHÃ'),
                        _Chip('SEMANA'),
                        _Chip('SEM PRAZO'),
                      ],
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

  Widget _modePill(_Mode m, IconData icon, String label) {
    final active = _mode == m;
    return GestureDetector(
      onTap: () => _switchMode(m),
      child: AnimatedContainer(
        duration: LiriunDurations.fast,
        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
        decoration: BoxDecoration(
          gradient: active ? LiriunColors.gradBrand : null,
          color: active ? null : const Color(0x0DFFFFFF),
          borderRadius: BorderRadius.circular(99),
          border: active ? null : Border.all(color: LiriunColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 12, color: active ? Colors.white : LiriunColors.textMuted),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: active ? Colors.white : LiriunColors.textMuted,
                letterSpacing: -0.1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _vozContent() {
    return Column(
      children: [
        SizedBox(
          height: 90,
          child: Stack(
            alignment: Alignment.center,
            children: [
              if (_listening) const PulseRing(size: 90),
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  gradient: LiriunColors.gradBrand,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: LiriunColors.violet400.withValues(alpha: 0.50),
                      blurRadius: 40,
                      offset: const Offset(0, 16),
                    ),
                  ],
                ),
                child: _processing
                    ? const Padding(
                        padding: EdgeInsets.all(22),
                        child: CircularProgressIndicator(
                            strokeWidth: 2.4, color: Colors.white),
                      )
                    : const Icon(Icons.mic_rounded,
                        color: Colors.white, size: 28),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 28,
          child: _listening
              ? const WaveformBars(barCount: 28, height: 28)
              : const SizedBox.shrink(),
        ),
        const SizedBox(height: 8),
        Text(
          _processing
              ? 'PROCESSANDO'
              : _listening
                  ? (_transcript.isEmpty
                      ? 'OUVINDO · FALE AGORA'
                      : '"$_transcript"')
                  : 'TOQUE NO MIC PRA INICIAR',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontFamily: 'Geist Mono',
            fontSize: 10,
            letterSpacing: 0.4,
            color: LiriunColors.textFaint,
          ),
        ),
      ],
    );
  }

  Widget _textoContent() {
    return Column(
      children: [
        TextField(
          controller: _textCtl,
          autofocus: true,
          maxLines: 2,
          style: const TextStyle(
            fontSize: 14,
            color: LiriunColors.text,
          ),
          decoration: InputDecoration(
            hintText: 'Diga rápido o que precisa...',
            hintStyle: const TextStyle(
              fontSize: 14,
              color: LiriunColors.textFaint,
            ),
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
              borderSide: const BorderSide(color: LiriunColors.violet500),
            ),
            contentPadding: const EdgeInsets.symmetric(
                horizontal: 12, vertical: 10),
            filled: true,
            fillColor: const Color(0x06FFFFFF),
          ),
        ),
        const SizedBox(height: 10),
        GestureDetector(
          onTap: () => _send(_textCtl.text),
          child: Container(
            width: double.infinity,
            height: 44,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              gradient: LiriunColors.gradBrand,
              borderRadius: BorderRadius.circular(LiriunRadii.md),
            ),
            child: const Text(
              'Capturar',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.white,
                letterSpacing: -0.2,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip(this.label);
  final String label;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0x0AFFFFFF),
        borderRadius: BorderRadius.circular(7),
        border: Border.all(color: LiriunColors.border),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontFamily: 'Geist Mono',
          fontSize: 9,
          letterSpacing: 0.3,
          color: LiriunColors.textMuted,
        ),
      ),
    );
  }
}
