import 'package:confetti/confetti.dart';
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

enum _VoiceState { permission, listening, texto, processing, saved, error }

class VoiceFlowScreen extends ConsumerStatefulWidget {
  const VoiceFlowScreen({super.key});

  @override
  ConsumerState<VoiceFlowScreen> createState() => _VoiceFlowScreenState();
}

class _VoiceFlowScreenState extends ConsumerState<VoiceFlowScreen>
    with TickerProviderStateMixin {
  _VoiceState _state = _VoiceState.listening;
  String _transcript = '';
  String? _errorMsg;
  SugestaoTarefaDto? _sugestao;
  String? _mensagemAgente;
  final _textCtl = TextEditingController();
  late final ConfettiController _confetti;
  late final AnimationController _checkController;

  @override
  void initState() {
    super.initState();
    _confetti = ConfettiController(duration: const Duration(milliseconds: 1200));
    _checkController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 550),
    );
    WidgetsBinding.instance.addPostFrameCallback((_) => _startListening());
  }

  Future<void> _startListening() async {
    final voice = ref.read(voiceServiceProvider);
    HapticFeedback.lightImpact();
    final ok = await voice.initialize();
    if (!ok) {
      setState(() {
        _state = _VoiceState.error;
        _errorMsg =
            'Permissão de microfone negada. Libera nas configurações.';
      });
      return;
    }
    setState(() => _state = _VoiceState.listening);
    await voice.startListening(
      onResult: (text, isFinal) {
        if (!mounted) return;
        setState(() => _transcript = text);
        if (isFinal && text.trim().isNotEmpty) {
          _onTranscriptDone(text);
        }
      },
    );
  }

  Future<void> _onTranscriptDone(String text) async {
    HapticFeedback.lightImpact();
    setState(() => _state = _VoiceState.processing);
    try {
      final res = await ref.read(capturaApiProvider).conversar(
        historico: [MensagemDto(papel: 'usuario', texto: text)],
      );
      if (!mounted) return;
      setState(() {
        _state = _VoiceState.saved;
        _sugestao = res.tarefa;
        _mensagemAgente = res.mensagem;
      });
      HapticFeedback.heavyImpact();
      _confetti.play();
      _checkController.forward();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _state = _VoiceState.error;
        _errorMsg = 'Não consegui processar. Tenta de novo.';
      });
    }
  }

  Future<void> _stop() async {
    await ref.read(voiceServiceProvider).cancel();
    if (mounted) context.pop();
  }

  Future<void> _salvar() async {
    final s = _sugestao;
    if (s == null || s.dataPrazo == null) return;
    try {
      await ref.read(tarefasApiProvider).criar(
            nome: s.titulo,
            prioridade: s.prioridade ?? 3,
            dataPrazo: s.dataPrazo!,
            horarioFinal: s.horarioFinal,
            categoriaIds: s.categoriaIds.isEmpty ? null : s.categoriaIds,
            observacoes: s.observacoes,
          );
      ref.invalidate(pendentesProvider);
      if (mounted) context.pop();
    } catch (_) {}
  }

  @override
  void dispose() {
    _confetti.dispose();
    _checkController.dispose();
    _textCtl.dispose();
    ref.read(voiceServiceProvider).cancel();
    super.dispose();
  }

  Future<void> _switchToTexto() async {
    HapticFeedback.selectionClick();
    await ref.read(voiceServiceProvider).cancel();
    setState(() {
      _state = _VoiceState.texto;
      _transcript = '';
    });
  }

  Future<void> _switchToVoz() async {
    HapticFeedback.selectionClick();
    setState(() => _transcript = '');
    await _startListening();
  }

  Future<void> _enviarTexto() async {
    final txt = _textCtl.text.trim();
    if (txt.isEmpty) return;
    _textCtl.clear();
    await _onTranscriptDone(txt);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0C12),
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment.center,
                    radius: 0.8,
                    colors: [
                      LiriunColors.violet400.withValues(alpha: 0.2),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              top: 8,
              left: 8,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: _stop,
              ),
            ),
            AnimatedSwitcher(
              duration: LiriunDurations.slow,
              switchInCurve: LiriunCurves.decel,
              switchOutCurve: LiriunCurves.standard,
              child: _content(),
            ),
            if (_state == _VoiceState.saved)
              Align(
                alignment: Alignment.center,
                child: ConfettiWidget(
                  confettiController: _confetti,
                  blastDirectionality: BlastDirectionality.explosive,
                  shouldLoop: false,
                  colors: const [
                    LiriunColors.violet400,
                    LiriunColors.violet700,
                    LiriunColors.success,
                    LiriunColors.warning,
                    LiriunColors.violet300,
                  ],
                  numberOfParticles: 18,
                  emissionFrequency: 0.04,
                  gravity: 0.2,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _content() {
    switch (_state) {
      case _VoiceState.permission:
      case _VoiceState.listening:
        return _Listening(
          key: const ValueKey('listening'),
          transcript: _transcript,
          onSwitchToTexto: _switchToTexto,
        );
      case _VoiceState.texto:
        return _Texto(
          key: const ValueKey('texto'),
          controller: _textCtl,
          onSend: _enviarTexto,
          onSwitchToVoz: _switchToVoz,
        );
      case _VoiceState.processing:
        return const _Processing(key: ValueKey('processing'));
      case _VoiceState.saved:
        return _Saved(
          key: const ValueKey('saved'),
          checkController: _checkController,
          sugestao: _sugestao,
          mensagem: _mensagemAgente,
          onSalvar: _salvar,
          onMaisUma: () {
            setState(() {
              _transcript = '';
              _sugestao = null;
              _mensagemAgente = null;
            });
            _checkController.reset();
            _startListening();
          },
        );
      case _VoiceState.error:
        return _Error(
          key: const ValueKey('error'),
          message: _errorMsg ?? 'Erro',
          onRetry: () {
            setState(() => _transcript = '');
            _startListening();
          },
        );
    }
  }
}

class _Listening extends StatelessWidget {
  const _Listening({
    super.key,
    required this.transcript,
    required this.onSwitchToTexto,
  });
  final String transcript;
  final VoidCallback onSwitchToTexto;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 36, 20, 0),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
                decoration: BoxDecoration(
                  color: LiriunColors.violet400.withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(LiriunRadii.pill),
                  border: Border.all(
                      color: LiriunColors.violet400.withValues(alpha: 0.30)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                          shape: BoxShape.circle, color: Color(0xFFFF5B6B)),
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      'OUVINDO',
                      style: TextStyle(
                        fontSize: 9,
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.w600,
                        color: LiriunColors.violet300,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 26),
              Text(
                transcript.isEmpty
                    ? 'Fala como pensa...'
                    : '"$transcript"',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w500,
                  color: transcript.isEmpty
                      ? LiriunColors.textFaint
                      : LiriunColors.text,
                  height: 1.4,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
        ),
        Stack(
          alignment: Alignment.center,
          children: const [
            PulseRing(size: 220),
            _BigMic(),
          ],
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 36),
          child: Column(
            children: [
              const WaveformBars(),
              const SizedBox(height: 16),
              const Text(
                'TOQUE NO X PRA PARAR',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 1.4,
                  color: LiriunColors.textFaint,
                ),
              ),
              const SizedBox(height: 14),
              GestureDetector(
                onTap: onSwitchToTexto,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0x0AFFFFFF),
                    borderRadius: BorderRadius.circular(LiriunRadii.pill),
                    border: Border.all(color: LiriunColors.borderHi),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.keyboard_alt_outlined,
                          size: 14, color: LiriunColors.textMuted),
                      SizedBox(width: 6),
                      Text(
                        'Prefiro escrever',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: LiriunColors.textMuted,
                          letterSpacing: -0.1,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Texto extends StatelessWidget {
  const _Texto({
    super.key,
    required this.controller,
    required this.onSend,
    required this.onSwitchToVoz,
  });
  final TextEditingController controller;
  final Future<void> Function() onSend;
  final VoidCallback onSwitchToVoz;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 36, vertical: 20),
            child: Column(
              children: [
                Text(
                  'ESCREVE',
                  style: TextStyle(
                    fontFamily: 'Geist Mono',
                    fontSize: 10,
                    letterSpacing: 1.6,
                    fontWeight: FontWeight.w600,
                    color: LiriunColors.violet300,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'O que você precisa anotar?',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w600,
                    color: LiriunColors.text,
                    letterSpacing: -0.4,
                    height: 1.2,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: TextField(
              controller: controller,
              autofocus: true,
              maxLines: 3,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => onSend(),
              style: const TextStyle(
                fontSize: 15,
                color: LiriunColors.text,
                height: 1.5,
              ),
              decoration: InputDecoration(
                hintText: 'Reunião com Marina amanhã às 9, prioridade alta...',
                hintStyle: const TextStyle(
                  fontSize: 14,
                  color: LiriunColors.textFaint,
                  height: 1.5,
                ),
                filled: true,
                fillColor: const Color(0x0AFFFFFF),
                contentPadding: const EdgeInsets.all(14),
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
                  borderSide: const BorderSide(
                      color: LiriunColors.violet500, width: 1.5),
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: Row(
              children: [
                GestureDetector(
                  onTap: onSwitchToVoz,
                  child: Container(
                    height: 48,
                    width: 48,
                    decoration: BoxDecoration(
                      color: const Color(0x10FFFFFF),
                      borderRadius: BorderRadius.circular(LiriunRadii.md),
                      border: Border.all(color: LiriunColors.borderHi),
                    ),
                    child: const Icon(Icons.mic_rounded,
                        color: LiriunColors.violet300, size: 20),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: GestureDetector(
                    onTap: onSend,
                    child: Container(
                      height: 48,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        gradient: LiriunColors.gradBrand,
                        borderRadius: BorderRadius.circular(LiriunRadii.md),
                        boxShadow: [
                          BoxShadow(
                            color: LiriunColors.violet700
                                .withValues(alpha: 0.32),
                            blurRadius: 18,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Text(
                        'Anotar',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BigMic extends StatelessWidget {
  const _BigMic();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 132,
      height: 132,
      decoration: BoxDecoration(
        gradient: LiriunColors.gradBrand,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: LiriunColors.violet400.withValues(alpha: 0.55),
            blurRadius: 80,
            spreadRadius: 8,
          ),
        ],
      ),
      child: const Icon(Icons.mic_rounded, color: Colors.white, size: 54),
    );
  }
}

class _Processing extends StatelessWidget {
  const _Processing({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              gradient: LiriunColors.gradBrand,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.auto_awesome,
                color: Colors.white, size: 36),
          ),
          const SizedBox(height: 24),
          const Text(
            'Entendendo',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w600,
              color: LiriunColors.text,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Liriun está extraindo o que importa',
            style: TextStyle(
              fontSize: 13,
              color: LiriunColors.textMuted,
              letterSpacing: -0.1,
            ),
          ),
        ],
      ),
    );
  }
}

class _Saved extends StatelessWidget {
  const _Saved({
    super.key,
    required this.checkController,
    required this.sugestao,
    required this.mensagem,
    required this.onSalvar,
    required this.onMaisUma,
  });

  final AnimationController checkController;
  final SugestaoTarefaDto? sugestao;
  final String? mensagem;
  final VoidCallback onSalvar;
  final VoidCallback onMaisUma;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 60),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              color: LiriunColors.success.withValues(alpha: 0.12),
              shape: BoxShape.circle,
              border:
                  Border.all(color: LiriunColors.success.withValues(alpha: 0.5)),
            ),
            child: AnimatedBuilder(
              animation: checkController,
              builder: (context, _) => CustomPaint(
                painter: _CheckmarkPainter(checkController.value),
              ),
            ),
          ),
          const SizedBox(height: 22),
          if (sugestao != null) ...[
            Text(
              sugestao!.titulo,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w600,
                color: LiriunColors.text,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              _summary(sugestao!),
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: LiriunColors.textMuted,
                height: 1.5,
              ),
            ),
          ] else ...[
            const Text(
              'Pronto.',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w600,
                color: LiriunColors.text,
              ),
            ),
            const SizedBox(height: 8),
            if (mensagem != null)
              Text(
                mensagem!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  color: LiriunColors.textMuted,
                  height: 1.5,
                ),
              ),
          ],
          const SizedBox(height: 28),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: onMaisUma,
                  child: Container(
                    height: 44,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0x10FFFFFF),
                      borderRadius: BorderRadius.circular(LiriunRadii.md),
                      border: Border.all(color: LiriunColors.borderHi),
                    ),
                    child: const Text(
                      'Mais uma',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: LiriunColors.text,
                      ),
                    ),
                  ),
                ),
              ),
              if (sugestao != null && sugestao!.dataPrazo != null) ...[
                const SizedBox(width: 8),
                Expanded(
                  child: GestureDetector(
                    onTap: onSalvar,
                    child: Container(
                      height: 44,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        gradient: LiriunColors.gradBrand,
                        borderRadius: BorderRadius.circular(LiriunRadii.md),
                      ),
                      child: const Text(
                        'Salvar tarefa',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  String _summary(SugestaoTarefaDto s) {
    final parts = <String>[];
    if (s.dataPrazo != null) {
      final dd = s.dataPrazo!.day.toString().padLeft(2, '0');
      final mm = s.dataPrazo!.month.toString().padLeft(2, '0');
      parts.add('$dd/$mm');
    }
    if (s.horarioFinal != null) parts.add('às ${s.horarioFinal!.substring(0, 5)}');
    return parts.join(' ');
  }
}

class _Error extends StatelessWidget {
  const _Error({super.key, required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded,
                size: 48, color: LiriunColors.warning),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: LiriunColors.textMuted,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 22),
            GestureDetector(
              onTap: onRetry,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  gradient: LiriunColors.gradBrand,
                  borderRadius: BorderRadius.circular(LiriunRadii.pill),
                ),
                child: const Text(
                  'Tentar de novo',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckmarkPainter extends CustomPainter {
  _CheckmarkPainter(this.t);
  final double t;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = LiriunColors.success
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    final w = size.width;
    final h = size.height;
    final path = Path()
      ..moveTo(w * 0.25, h * 0.55)
      ..lineTo(w * 0.45, h * 0.75)
      ..lineTo(w * 0.75, h * 0.35);

    final pm = path.computeMetrics().first;
    canvas.drawPath(pm.extractPath(0, pm.length * t), paint);
  }

  @override
  bool shouldRepaint(covariant _CheckmarkPainter old) => old.t != t;
}
