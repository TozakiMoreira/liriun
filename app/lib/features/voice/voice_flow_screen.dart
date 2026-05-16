import 'dart:async';

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
  Timer? _timer;
  Duration _listenTime = Duration.zero;
  DateTime? _listenStart;

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
    _listenStart = DateTime.now();
    _listenTime = Duration.zero;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(milliseconds: 200), (_) {
      if (!mounted || _listenStart == null) return;
      setState(() => _listenTime = DateTime.now().difference(_listenStart!));
    });
    await voice.startListening(
      onResult: (text, isFinal) {
        if (!mounted) return;
        setState(() => _transcript = text);
        if (isFinal && text.trim().length >= 3) {
          _onTranscriptDone(text);
        }
      },
    );
  }

  Future<void> _onTranscriptDone(String text) async {
    HapticFeedback.lightImpact();
    _timer?.cancel();
    _listenStart = null;
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
      ref.invalidate(concluidasProvider);
      if (mounted) context.pop();
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
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
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
          elapsed: _listenTime,
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
        return _Processing(
          key: const ValueKey('processing'),
          transcript: _transcript,
        );
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
    required this.elapsed,
    required this.onSwitchToTexto,
  });
  final String transcript;
  final Duration elapsed;
  final VoidCallback onSwitchToTexto;

  String _fmtTime(Duration d) {
    final s = d.inSeconds;
    return '${(s ~/ 60).toString().padLeft(1, '0')}:${(s % 60).toString().padLeft(2, '0')}';
  }

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
                    Text(
                      'OUVINDO · ${_fmtTime(elapsed)}',
                      style: const TextStyle(
                        fontFamily: 'Geist Mono',
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

class _Processing extends StatefulWidget {
  const _Processing({super.key, required this.transcript});
  final String transcript;

  @override
  State<_Processing> createState() => _ProcessingState();
}

class _ProcessingState extends State<_Processing>
    with TickerProviderStateMixin {
  late final AnimationController _progress;

  @override
  void initState() {
    super.initState();
    _progress = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();
  }

  @override
  void dispose() {
    _progress.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 60, 18, 60),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 30,
                height: 30,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  gradient: LiriunColors.gradBrand,
                  borderRadius: BorderRadius.circular(9),
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  size: 14,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 10),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Entendendo...',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: LiriunColors.text,
                      letterSpacing: -0.2,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'EXTRAINDO O QUE IMPORTA',
                    style: TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 9,
                      letterSpacing: 0.4,
                      color: LiriunColors.textFaint,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 18),
          if (widget.transcript.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0x06FFFFFF),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: LiriunColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'VOCÊ DISSE',
                    style: TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 9,
                      letterSpacing: 1.0,
                      color: LiriunColors.textFaint,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '"${widget.transcript}"',
                    style: const TextStyle(
                      fontSize: 13,
                      color: LiriunColors.text,
                      letterSpacing: -0.1,
                      height: 1.55,
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 16),
          const Text(
            'EXTRAÍDO',
            style: TextStyle(
              fontFamily: 'Geist Mono',
              fontSize: 9,
              letterSpacing: 1.2,
              color: LiriunColors.textFaint,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          for (final k in ['TÍTULO', 'QUANDO', 'CATEGORIA', 'PRIORIDADE'])
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: LiriunColors.violet400.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(11),
                  border: Border.all(
                    color: LiriunColors.violet400.withValues(alpha: 0.18),
                  ),
                ),
                child: Row(
                  children: [
                    Text(
                      k,
                      style: const TextStyle(
                        fontFamily: 'Geist Mono',
                        fontSize: 9,
                        letterSpacing: 0.4,
                        color: LiriunColors.textFaint,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      width: 60,
                      height: 8,
                      decoration: BoxDecoration(
                        color: const Color(0x14FFFFFF),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          const Spacer(),
          AnimatedBuilder(
            animation: _progress,
            builder: (_, __) => Container(
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0x0FFFFFFF),
                borderRadius: BorderRadius.circular(99),
              ),
              child: FractionallySizedBox(
                alignment: Alignment(-1 + (_progress.value * 2.4), 0),
                widthFactor: 0.4,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LiriunColors.gradBrand,
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 6),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'QUASE LÁ',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 0.4,
                  color: LiriunColors.textFaint,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                'Pré-visualização em instantes',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  letterSpacing: 0.4,
                  color: LiriunColors.textFaint,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
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

  String _quando(SugestaoTarefaDto s) {
    if (s.dataPrazo == null) return '';
    final d = s.dataPrazo!;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(d.year, d.month, d.day);
    final diff = target.difference(today).inDays;
    String dia;
    if (diff == 0) {
      dia = 'HOJE';
    } else if (diff == 1) {
      dia = 'AMANHÃ';
    } else {
      dia = '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}';
    }
    if (s.horarioFinal != null) {
      return '$dia · ${s.horarioFinal!.substring(0, 5)}';
    }
    return dia;
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(18, 60, 18, 120),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 280,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.rectangle,
                  borderRadius: BorderRadius.circular(140),
                  gradient: RadialGradient(
                    colors: [
                      LiriunColors.success.withValues(alpha: 0.20),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.7],
                  ),
                ),
              ),
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: LiriunColors.success.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                  border: Border.all(
                      color: LiriunColors.success.withValues(alpha: 0.5),
                      width: 1.5),
                ),
                child: AnimatedBuilder(
                  animation: checkController,
                  builder: (context, _) => CustomPaint(
                    painter: _CheckmarkPainter(checkController.value),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'Pronto.',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: LiriunColors.text,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            mensagem ?? 'Salva em instantes',
            style: const TextStyle(
              fontSize: 12,
              color: LiriunColors.textMuted,
            ),
          ),
          if (sugestao != null) ...[
            const SizedBox(height: 22),
            _PreviewCard(sugestao: sugestao!, quando: _quando(sugestao!)),
            const SizedBox(height: 14),
            _LiriunPergunta(
              onSalvar: onSalvar,
              onMaisUma: onMaisUma,
              salvavel: sugestao!.dataPrazo != null,
            ),
          ],
          const SizedBox(height: 22),
          GestureDetector(
            onTap: onMaisUma,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
              decoration: BoxDecoration(
                color: const Color(0x0FFFFFFF),
                borderRadius: BorderRadius.circular(99),
                border: Border.all(color: LiriunColors.borderHi),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.mic_rounded,
                      size: 14, color: LiriunColors.violet300),
                  SizedBox(width: 8),
                  Text(
                    'Falar mais uma',
                    style: TextStyle(
                      fontSize: 12,
                      color: LiriunColors.text,
                      fontWeight: FontWeight.w500,
                      letterSpacing: -0.1,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PreviewCard extends StatelessWidget {
  const _PreviewCard({required this.sugestao, required this.quando});
  final SugestaoTarefaDto sugestao;
  final String quando;

  @override
  Widget build(BuildContext context) {
    final alta = sugestao.prioridade != null && sugestao.prioridade! <= 2;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0x0AFFFFFF),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: LiriunColors.borderHi),
      ),
      child: Stack(
        children: [
          Positioned(
            top: -40,
            right: -40,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    LiriunColors.violet400.withValues(alpha: 0.12),
                    Colors.transparent,
                  ],
                  stops: const [0.0, 0.7],
                ),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 14,
                    height: 14,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LiriunColors.gradBrand,
                    ),
                    child: const Icon(Icons.auto_awesome_rounded,
                        size: 9, color: Colors.white),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'NOVA TAREFA',
                    style: TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 9,
                      letterSpacing: 1.4,
                      color: LiriunColors.violet300,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                sugestao.titulo,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.text,
                  letterSpacing: -0.2,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  if (quando.isNotEmpty)
                    Text(
                      quando,
                      style: const TextStyle(
                        fontFamily: 'Geist Mono',
                        fontSize: 9,
                        letterSpacing: 0.3,
                        color: LiriunColors.textFaint,
                      ),
                    ),
                  if (alta)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0x1AF0B36E),
                        borderRadius: BorderRadius.circular(5),
                        border: Border.all(
                            color: const Color(0x47F0B36E)),
                      ),
                      child: const Text(
                        'ALTA',
                        style: TextStyle(
                          fontFamily: 'Geist Mono',
                          fontSize: 8,
                          letterSpacing: 0.4,
                          color: Color(0xFFF0B36E),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _LiriunPergunta extends StatelessWidget {
  const _LiriunPergunta({
    required this.onSalvar,
    required this.onMaisUma,
    required this.salvavel,
  });
  final VoidCallback onSalvar;
  final VoidCallback onMaisUma;
  final bool salvavel;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            LiriunColors.violet400.withValues(alpha: 0.10),
            LiriunColors.violet700.withValues(alpha: 0.03),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border:
            Border.all(color: LiriunColors.violet400.withValues(alpha: 0.22)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 12,
                height: 12,
                alignment: Alignment.center,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LiriunColors.gradBrand,
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  size: 7,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 6),
              const Text(
                'LIRIUN CONFIRMA',
                style: TextStyle(
                  fontFamily: 'Geist Mono',
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.violet300,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Confere os detalhes. Salvo direto na sua lista de tarefas.',
            style: TextStyle(
              fontSize: 12,
              color: LiriunColors.text,
              fontWeight: FontWeight.w500,
              height: 1.45,
              letterSpacing: -0.1,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              if (salvavel)
                GestureDetector(
                  onTap: onSalvar,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      gradient: LiriunColors.gradBrand,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Salvar',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -0.1,
                      ),
                    ),
                  ),
                ),
              const SizedBox(width: 6),
              GestureDetector(
                onTap: onMaisUma,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    color: const Color(0x0AFFFFFF),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: LiriunColors.border),
                  ),
                  child: const Text(
                    'Refazer',
                    style: TextStyle(
                      fontSize: 11,
                      color: LiriunColors.textMuted,
                      fontWeight: FontWeight.w500,
                      letterSpacing: -0.1,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
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
