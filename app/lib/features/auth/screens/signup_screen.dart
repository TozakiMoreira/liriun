import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/api/error_message.dart';
import '../../../core/theme/liriun_tokens.dart';
import '../../../widgets/liriun_mark.dart';
import '../../../widgets/password_checklist.dart';
import '../providers/auth_controller.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _nomeCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _senhaCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _aceitouTermos = false;
  bool _loading = false;
  String? _erro;
  String _senha = '';

  static const _urlTermos = 'https://liriun.com/pt/termos';
  static const _urlPrivacidade = 'https://liriun.com/pt/privacidade';

  @override
  void initState() {
    super.initState();
    _senhaCtrl.addListener(() {
      if (_senhaCtrl.text != _senha) {
        setState(() => _senha = _senhaCtrl.text);
      }
    });
  }

  @override
  void dispose() {
    _nomeCtrl.dispose();
    _emailCtrl.dispose();
    _senhaCtrl.dispose();
    super.dispose();
  }

  Future<void> _abrir(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        setState(() => _erro = 'Não consegui abrir: $url');
      }
    }
  }

  Future<void> _criar() async {
    if (!_formKey.currentState!.validate()) return;
    if (!PasswordChecklist.isValid(_senha)) {
      setState(() => _erro = 'Senha precisa atender aos requisitos.');
      return;
    }
    if (!_aceitouTermos) {
      setState(() =>
          _erro = 'É preciso aceitar os Termos e a Política de Privacidade.');
      return;
    }
    setState(() {
      _loading = true;
      _erro = null;
    });
    try {
      await ref.read(authControllerProvider).cadastrar(
            nome: _nomeCtrl.text.trim(),
            email: _emailCtrl.text.trim(),
            senha: _senhaCtrl.text,
          );
      if (mounted) context.go('/onboarding');
    } catch (err) {
      setState(
          () => _erro = errorMessage(err, 'Falha no cadastro. Tenta de novo.'));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: LiriunColors.bg,
      body: SafeArea(
        child: Stack(
          children: [
            Positioned(
              left: 4,
              top: 4,
              child: IconButton(
                icon: const Icon(Icons.chevron_left_rounded,
                    color: LiriunColors.text, size: 28),
                onPressed: () {
                  if (context.canPop()) {
                    context.pop();
                  } else {
                    context.go('/login');
                  }
                },
              ),
            ),
            Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 12),
                    Center(
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              LiriunColors.violet400.withValues(alpha: 0.15),
                              LiriunColors.violet700.withValues(alpha: 0.05),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(LiriunRadii.xl),
                          boxShadow: [
                            BoxShadow(
                              color: LiriunColors.violet500
                                  .withValues(alpha: 0.35),
                              blurRadius: 28,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const LiriunMark(size: 56),
                      ),
                    ),
                    const SizedBox(height: 22),
                    const Text(
                      'Criar conta',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -0.8,
                        color: LiriunColors.text,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Beta aberto · gratuito',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyMedium
                          ?.copyWith(color: LiriunColors.textMuted),
                    ),
                    const SizedBox(height: 26),
                    TextFormField(
                      controller: _nomeCtrl,
                      decoration: const InputDecoration(hintText: 'Nome'),
                      validator: (v) => (v == null || v.trim().isEmpty)
                          ? 'Nome obrigatório'
                          : null,
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(hintText: 'E-mail'),
                      validator: (v) => (v == null || !v.contains('@'))
                          ? 'E-mail inválido'
                          : null,
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _senhaCtrl,
                      obscureText: true,
                      decoration: const InputDecoration(hintText: 'Senha'),
                      validator: (v) => (v == null || v.isEmpty)
                          ? 'Senha obrigatória'
                          : null,
                    ),
                    const SizedBox(height: 10),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: PasswordChecklist(password: _senha),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Checkbox(
                          value: _aceitouTermos,
                          onChanged: (v) =>
                              setState(() => _aceitouTermos = v ?? false),
                          activeColor: LiriunColors.violet500,
                        ),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 14),
                            child: RichText(
                              text: TextSpan(
                                style: const TextStyle(
                                  fontFamily: 'Geist',
                                  fontSize: 13,
                                  height: 1.5,
                                  color: LiriunColors.textMuted,
                                ),
                                children: [
                                  const TextSpan(text: 'Li e aceito os '),
                                  TextSpan(
                                    text: 'Termos de Uso',
                                    style: const TextStyle(
                                      color: LiriunColors.violet300,
                                      fontWeight: FontWeight.w600,
                                      decoration: TextDecoration.underline,
                                      decorationColor: LiriunColors.violet300,
                                    ),
                                    recognizer: TapGestureRecognizer()
                                      ..onTap = () => _abrir(_urlTermos),
                                  ),
                                  const TextSpan(text: ' e a '),
                                  TextSpan(
                                    text: 'Política de Privacidade',
                                    style: const TextStyle(
                                      color: LiriunColors.violet300,
                                      fontWeight: FontWeight.w600,
                                      decoration: TextDecoration.underline,
                                      decorationColor: LiriunColors.violet300,
                                    ),
                                    recognizer: TapGestureRecognizer()
                                      ..onTap = () => _abrir(_urlPrivacidade),
                                  ),
                                  const TextSpan(text: '.'),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (_erro != null) ...[
                      const SizedBox(height: 12),
                      Text(_erro!,
                          style: const TextStyle(color: LiriunColors.danger)),
                    ],
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: _loading ? null : _criar,
                      child: _loading
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Criar conta'),
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => context.go('/login'),
                      child: const Text('Já tenho conta — entrar'),
                    ),
                  ],
                ),
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
