import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/captura_api.dart';
import '../../core/api/tarefas_api.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../widgets/mic_fab.dart';

class FalarScreen extends ConsumerStatefulWidget {
  const FalarScreen({super.key});

  @override
  ConsumerState<FalarScreen> createState() => _FalarScreenState();
}

class _FalarScreenState extends ConsumerState<FalarScreen> {
  final _scrollController = ScrollController();
  final _inputController = TextEditingController();
  final List<_Msg> _messages = [];

  @override
  void dispose() {
    _scrollController.dispose();
    _inputController.dispose();
    super.dispose();
  }

  String _saudacao() {
    final h = DateTime.now().hour;
    if (h >= 5 && h < 12) return 'Bom dia';
    if (h >= 12 && h < 19) return 'Boa tarde';
    return 'Boa noite';
  }

  bool _sending = false;

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send(String text) async {
    if (text.trim().isEmpty || _sending) return;
    final input = text.trim();
    setState(() {
      _messages.add(_Msg.user(input));
      _inputController.clear();
      _sending = true;
    });
    _scrollToBottom();

    try {
      final historico = _messages
          .where((m) => m.text.isNotEmpty)
          .map((m) =>
              MensagemDto(papel: m.isUser ? 'usuario' : 'liriun', texto: m.text))
          .toList();
      final res =
          await ref.read(capturaApiProvider).conversar(historico: historico);
      if (!mounted) return;
      setState(() {
        _messages.add(_Msg.liriun(res.mensagem, sugestao: res.tarefa));
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _messages.add(_Msg.liriun(
            'Falha ao conectar. Verifica conexão ou tenta de novo.'));
      });
    } finally {
      if (mounted) setState(() => _sending = false);
      _scrollToBottom();
    }
  }

  Future<void> _salvarSugestao(SugestaoTarefaDto s, int msgIndex) async {
    if (s.dataPrazo == null) return;
    try {
      await ref.read(tarefasApiProvider).criar(
            nome: s.titulo,
            prioridade: s.prioridade ?? 3,
            dataPrazo: s.dataPrazo!,
            horarioFinal: s.horarioFinal,
            categoriaIds: s.categoriaIds.isEmpty ? null : s.categoriaIds,
            observacoes: s.observacoes,
          );
      if (!mounted) return;
      setState(() {
        _messages[msgIndex] =
            _Msg(text: _messages[msgIndex].text, isUser: false);
        _messages.add(_Msg.liriun('Anotado. Tem mais?'));
      });
      ref.invalidate(pendentesProvider);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _messages.add(_Msg.liriun('Não consegui salvar. Tenta de novo.'));
      });
    }
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final empty = _messages.isEmpty;
    return Scaffold(
      backgroundColor: LiriunColors.bg,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Expanded(
              child: empty ? _emptyHero() : _chatList(),
            ),
            _composer(),
          ],
        ),
      ),
    );
  }

  Widget _emptyHero() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '${_saudacao()},',
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w600,
                letterSpacing: -0.6,
                color: LiriunColors.text,
              ),
            ),
            const SizedBox(height: 4),
            ShaderMask(
              shaderCallback: (rect) =>
                  LiriunColors.gradBrand.createShader(rect),
              child: const Text(
                'como posso ajudar?',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.6,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 28),
            MicFab(
              size: 84,
              onTap: () => context.push('/voice'),
            ),
            const SizedBox(height: 16),
            const Text(
              'Toque pra falar',
              style: TextStyle(
                fontSize: 11,
                letterSpacing: 1.4,
                color: LiriunColors.textFaint,
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'ou escreva embaixo',
              style: TextStyle(
                fontSize: 11,
                color: LiriunColors.textFaint,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _chatList() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      itemCount: _messages.length,
      itemBuilder: (context, i) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _bubble(_messages[i]),
          if (_messages[i].sugestao != null)
            _sugestaoCard(_messages[i].sugestao!, i),
        ],
      ),
    );
  }

  Widget _sugestaoCard(SugestaoTarefaDto s, int msgIndex) {
    return Container(
      margin: const EdgeInsets.only(left: 10, top: 6, bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            LiriunColors.violet400.withValues(alpha: 0.10),
            LiriunColors.violet700.withValues(alpha: 0.04),
          ],
        ),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        border:
            Border.all(color: LiriunColors.violet400.withValues(alpha: 0.32)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'TAREFA PRONTA',
            style: TextStyle(
              fontSize: 9,
              letterSpacing: 1.4,
              color: LiriunColors.violet300,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            s.titulo,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: LiriunColors.text,
              letterSpacing: -0.2,
            ),
          ),
          if (s.dataPrazo != null) ...[
            const SizedBox(height: 4),
            Text(
              _fmtData(s.dataPrazo!, s.horarioFinal),
              style: const TextStyle(
                fontSize: 12,
                color: LiriunColors.textMuted,
              ),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              GestureDetector(
                onTap: () => _salvarSugestao(s, msgIndex),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: LiriunColors.gradBrand,
                    borderRadius: BorderRadius.circular(LiriunRadii.pill),
                  ),
                  child: const Text(
                    'Salvar',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
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

  String _fmtData(DateTime d, String? h) {
    final dd = d.day.toString().padLeft(2, '0');
    final mm = d.month.toString().padLeft(2, '0');
    if (h != null) {
      final hh = h.substring(0, 5);
      return '$dd/$mm às $hh';
    }
    return '$dd/$mm';
  }

  Widget _bubble(_Msg m) {
    final isUser = m.isUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        decoration: BoxDecoration(
          gradient: isUser ? LiriunColors.gradBrand : null,
          color: isUser ? null : const Color(0x10FFFFFF),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(14),
            topRight: const Radius.circular(14),
            bottomLeft: Radius.circular(isUser ? 14 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 14),
          ),
          border: isUser
              ? null
              : Border.all(color: LiriunColors.border),
        ),
        child: Text(
          m.text,
          style: TextStyle(
            fontSize: 14,
            color: isUser ? Colors.white : LiriunColors.text,
            height: 1.45,
          ),
        ),
      ),
    );
  }

  Widget _composer() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 8, 14, 100),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        decoration: BoxDecoration(
          color: LiriunColors.surfaceHi,
          borderRadius: BorderRadius.circular(LiriunRadii.xl),
          border: Border.all(color: LiriunColors.borderHi),
        ),
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.mic_rounded,
                  color: LiriunColors.violet300, size: 22),
              onPressed: () => context.push('/voice'),
            ),
            Expanded(
              child: TextField(
                controller: _inputController,
                style: const TextStyle(
                  color: LiriunColors.text,
                  fontSize: 14,
                ),
                decoration: const InputDecoration(
                  hintText: 'Escreva uma tarefa...',
                  hintStyle: TextStyle(
                    color: LiriunColors.textFaint,
                    fontSize: 14,
                  ),
                  border: InputBorder.none,
                  isCollapsed: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 10),
                ),
                onSubmitted: _send,
              ),
            ),
            const SizedBox(width: 4),
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => _send(_inputController.text),
                borderRadius: BorderRadius.circular(LiriunRadii.pill),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: const BoxDecoration(
                    gradient: LiriunColors.gradBrand,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.arrow_upward_rounded,
                    color: Colors.white,
                    size: 18,
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

class _Msg {
  _Msg({required this.text, required this.isUser, this.sugestao});
  _Msg.user(this.text)
      : isUser = true,
        sugestao = null;
  _Msg.liriun(this.text, {this.sugestao}) : isUser = false;

  final String text;
  final bool isUser;
  final SugestaoTarefaDto? sugestao;

  _Msg copyWith({SugestaoTarefaDto? sugestao}) =>
      _Msg(text: text, isUser: isUser, sugestao: sugestao);
}
