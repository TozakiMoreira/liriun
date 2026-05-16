import 'dart:convert';
import 'dart:io';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/api/auth_api.dart';
import '../../core/api/error_message.dart';
import '../../core/api/session_provider.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../widgets/avatar.dart';

Future<T?> showLiriunSheet<T>({
  required BuildContext context,
  required Widget child,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    barrierColor: const Color(0xA6000000),
    builder: (ctx) {
      return BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
        child: Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 12,
            right: 12,
            top: 24,
          ),
          child: Container(
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
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
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
                    const SizedBox(height: 14),
                    child,
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    },
  );
}

class EditarPerfilSheet extends ConsumerStatefulWidget {
  const EditarPerfilSheet({super.key});

  @override
  ConsumerState<EditarPerfilSheet> createState() => _EditarPerfilSheetState();
}

class _EditarPerfilSheetState extends ConsumerState<EditarPerfilSheet> {
  final _nomeCtl = TextEditingController();
  final _emailCtl = TextEditingController();
  bool _loading = false;
  bool _uploadingFoto = false;
  String? _erro;
  String? _fotoUrl;

  @override
  void initState() {
    super.initState();
    final session = ref.read(sessionControllerProvider).valueOrNull;
    _nomeCtl.text = session?.usuario.nome ?? '';
    _emailCtl.text = session?.usuario.email ?? '';
    _fotoUrl = session?.usuario.fotoUrl;
  }

  Future<void> _trocarFoto() async {
    HapticFeedback.lightImpact();
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 75,
    );
    if (picked == null) return;
    setState(() => _uploadingFoto = true);
    try {
      final bytes = await File(picked.path).readAsBytes();
      final mime = picked.path.toLowerCase().endsWith('.png')
          ? 'image/png'
          : 'image/jpeg';
      final dataUrl = 'data:$mime;base64,${base64Encode(bytes)}';
      final novo = await ref.read(authApiProvider).atualizarFoto(dataUrl);
      final token =
          ref.read(sessionControllerProvider).valueOrNull?.token ?? '';
      await ref
          .read(sessionControllerProvider.notifier)
          .setSession(Session(usuario: novo, token: token));
      if (mounted) setState(() => _fotoUrl = novo.fotoUrl);
    } catch (err) {
      if (mounted) setState(() => _erro = errorMessage(err, 'Falha ao subir foto.'));
    } finally {
      if (mounted) setState(() => _uploadingFoto = false);
    }
  }

  Future<void> _removerFoto() async {
    setState(() => _uploadingFoto = true);
    try {
      final novo = await ref.read(authApiProvider).atualizarFoto(null);
      final token =
          ref.read(sessionControllerProvider).valueOrNull?.token ?? '';
      await ref
          .read(sessionControllerProvider.notifier)
          .setSession(Session(usuario: novo, token: token));
      if (mounted) setState(() => _fotoUrl = null);
    } catch (err) {
      if (mounted) setState(() => _erro = errorMessage(err, 'Falha ao remover foto.'));
    } finally {
      if (mounted) setState(() => _uploadingFoto = false);
    }
  }

  @override
  void dispose() {
    _nomeCtl.dispose();
    _emailCtl.dispose();
    super.dispose();
  }

  Future<void> _salvar() async {
    if (_nomeCtl.text.trim().isEmpty || !_emailCtl.text.contains('@')) {
      setState(() => _erro = 'Nome e e-mail válidos são obrigatórios.');
      return;
    }
    setState(() {
      _loading = true;
      _erro = null;
    });
    try {
      final novo = await ref.read(authApiProvider).atualizarPerfil(
            nome: _nomeCtl.text.trim(),
            email: _emailCtl.text.trim(),
          );
      // Atualiza sessão local
      final token = ref.read(sessionControllerProvider).valueOrNull?.token ?? '';
      await ref
          .read(sessionControllerProvider.notifier)
          .setSession(Session(usuario: novo, token: token));
      if (mounted) Navigator.of(context).pop(true);
    } catch (err) {
      setState(() => _erro = errorMessage(err, 'Falha ao salvar perfil.'));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'EDITAR PERFIL',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Geist Mono',
            fontSize: 10,
            letterSpacing: 1.6,
            fontWeight: FontWeight.w600,
            color: LiriunColors.violet300,
          ),
        ),
        const SizedBox(height: 16),
        Center(
          child: GestureDetector(
            onTap: _uploadingFoto ? null : _trocarFoto,
            child: Stack(
              alignment: Alignment.center,
              children: [
                LiriunAvatar(
                  nome: _nomeCtl.text,
                  fotoUrl: _fotoUrl,
                  size: 88,
                ),
                if (_uploadingFoto)
                  Container(
                    width: 88,
                    height: 88,
                    decoration: const BoxDecoration(
                      color: Color(0x80000000),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: CircularProgressIndicator(
                          strokeWidth: 2.4, color: Colors.white),
                    ),
                  )
                else
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        gradient: LiriunColors.gradBrand,
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: LiriunColors.surfaceHi, width: 2),
                      ),
                      child: const Icon(Icons.camera_alt_rounded,
                          size: 14, color: Colors.white),
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        if (_fotoUrl != null && !_uploadingFoto)
          Center(
            child: TextButton(
              onPressed: _removerFoto,
              child: const Text(
                'Remover foto',
                style: TextStyle(
                  fontSize: 12,
                  color: LiriunColors.textFaint,
                ),
              ),
            ),
          ),
        const SizedBox(height: 10),
        _input(label: 'Nome', controller: _nomeCtl),
        const SizedBox(height: 10),
        _input(
          label: 'E-mail',
          controller: _emailCtl,
          keyboardType: TextInputType.emailAddress,
        ),
        if (_erro != null) ...[
          const SizedBox(height: 10),
          Text(_erro!,
              style: const TextStyle(color: LiriunColors.danger, fontSize: 12)),
        ],
        const SizedBox(height: 16),
        _primaryCta(
          label: _loading ? 'Salvando...' : 'Salvar',
          loading: _loading,
          onTap: _salvar,
        ),
      ],
    );
  }
}

class AlterarSenhaSheet extends ConsumerStatefulWidget {
  const AlterarSenhaSheet({super.key});

  @override
  ConsumerState<AlterarSenhaSheet> createState() => _AlterarSenhaSheetState();
}

class _AlterarSenhaSheetState extends ConsumerState<AlterarSenhaSheet> {
  final _atualCtl = TextEditingController();
  final _novaCtl = TextEditingController();
  final _confirmaCtl = TextEditingController();
  bool _loading = false;
  String? _erro;

  @override
  void dispose() {
    _atualCtl.dispose();
    _novaCtl.dispose();
    _confirmaCtl.dispose();
    super.dispose();
  }

  Future<void> _salvar() async {
    if (_novaCtl.text.length < 6) {
      setState(() => _erro = 'Nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (_novaCtl.text != _confirmaCtl.text) {
      setState(() => _erro = 'Confirmação não bate.');
      return;
    }
    setState(() {
      _loading = true;
      _erro = null;
    });
    try {
      await ref.read(authApiProvider).alterarSenha(
            senhaAtual: _atualCtl.text,
            novaSenha: _novaCtl.text,
          );
      if (mounted) Navigator.of(context).pop(true);
    } catch (err) {
      setState(() => _erro = errorMessage(err, 'Falha ao alterar senha.'));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'ALTERAR SENHA',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Geist Mono',
            fontSize: 10,
            letterSpacing: 1.6,
            fontWeight: FontWeight.w600,
            color: LiriunColors.violet300,
          ),
        ),
        const SizedBox(height: 16),
        _input(label: 'Senha atual', controller: _atualCtl, obscure: true),
        const SizedBox(height: 10),
        _input(label: 'Nova senha', controller: _novaCtl, obscure: true),
        const SizedBox(height: 10),
        _input(label: 'Confirmar', controller: _confirmaCtl, obscure: true),
        if (_erro != null) ...[
          const SizedBox(height: 10),
          Text(_erro!,
              style: const TextStyle(color: LiriunColors.danger, fontSize: 12)),
        ],
        const SizedBox(height: 16),
        _primaryCta(
          label: _loading ? 'Salvando...' : 'Alterar',
          loading: _loading,
          onTap: _salvar,
        ),
      ],
    );
  }
}

class ExcluirContaSheet extends ConsumerStatefulWidget {
  const ExcluirContaSheet({super.key});

  @override
  ConsumerState<ExcluirContaSheet> createState() => _ExcluirContaSheetState();
}

class _ExcluirContaSheetState extends ConsumerState<ExcluirContaSheet> {
  final _senhaCtl = TextEditingController();
  bool _loading = false;
  String? _erro;

  @override
  void dispose() {
    _senhaCtl.dispose();
    super.dispose();
  }

  Future<void> _excluir() async {
    setState(() {
      _loading = true;
      _erro = null;
    });
    try {
      await ref.read(authApiProvider).excluirConta(_senhaCtl.text);
      if (mounted) Navigator.of(context).pop(true);
    } catch (err) {
      setState(() => _erro = errorMessage(err, 'Falha ao excluir conta.'));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Icon(Icons.warning_amber_rounded,
            color: LiriunColors.danger, size: 32),
        const SizedBox(height: 8),
        const Text(
          'EXCLUIR CONTA',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Geist Mono',
            fontSize: 10,
            letterSpacing: 1.6,
            fontWeight: FontWeight.w600,
            color: LiriunColors.danger,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Isso é irreversível. Suas tarefas, categorias e dados desaparecem.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 12,
            color: LiriunColors.textMuted,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 14),
        _input(label: 'Sua senha', controller: _senhaCtl, obscure: true),
        if (_erro != null) ...[
          const SizedBox(height: 10),
          Text(_erro!,
              style: const TextStyle(color: LiriunColors.danger, fontSize: 12)),
        ],
        const SizedBox(height: 16),
        GestureDetector(
          onTap: _loading ? null : _excluir,
          child: Container(
            height: 48,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: LiriunColors.danger.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(LiriunRadii.md),
              border:
                  Border.all(color: LiriunColors.danger.withValues(alpha: 0.5)),
            ),
            child: Text(
              _loading ? 'Excluindo...' : 'Excluir definitivamente',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: LiriunColors.danger,
                letterSpacing: -0.1,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

Widget _input({
  required String label,
  required TextEditingController controller,
  bool obscure = false,
  TextInputType? keyboardType,
}) {
  return TextField(
    controller: controller,
    obscureText: obscure,
    keyboardType: keyboardType,
    style: const TextStyle(fontSize: 14, color: LiriunColors.text),
    decoration: InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(
        fontSize: 13,
        color: LiriunColors.textFaint,
      ),
      filled: true,
      fillColor: const Color(0x0AFFFFFF),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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
        borderSide:
            const BorderSide(color: LiriunColors.violet500, width: 1.5),
      ),
    ),
  );
}

Widget _primaryCta({
  required String label,
  required bool loading,
  required VoidCallback onTap,
}) {
  return GestureDetector(
    onTap: loading ? null : onTap,
    child: Container(
      height: 48,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: LiriunColors.gradBrand,
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        boxShadow: [
          BoxShadow(
            color: LiriunColors.violet700.withValues(alpha: 0.32),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: loading
          ? const SizedBox(
              height: 18,
              width: 18,
              child: CircularProgressIndicator(
                  strokeWidth: 2, color: Colors.white))
          : Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.white,
                letterSpacing: -0.1,
              ),
            ),
    ),
  );
}
