import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";

import "../../../core/api/error_message.dart";
import "../../../core/theme/liriun_tokens.dart";
import "../../../widgets/liriun_mark.dart";
import "../providers/auth_controller.dart";

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _senhaCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;
  String? _erro;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _senhaCtrl.dispose();
    super.dispose();
  }

  Future<void> _entrar() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _erro = null;
    });
    try {
      await ref.read(authControllerProvider).entrar(
            email: _emailCtrl.text.trim(),
            senha: _senhaCtrl.text,
          );
      if (mounted) context.go("/hoje");
    } catch (err) {
      setState(() => _erro = errorMessage(err, "Falha no login. Verifica e-mail e senha."));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
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
                              color: LiriunColors.violet500.withValues(alpha: 0.35),
                              blurRadius: 28,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const LiriunMark(size: 56),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      "Entre no Liriun",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -0.8,
                        color: LiriunColors.text,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Sua próxima tarefa, na voz.",
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: LiriunColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 32),
                    TextFormField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      decoration: const InputDecoration(hintText: "E-mail"),
                      validator: (v) =>
                          (v == null || !v.contains("@")) ? "E-mail inválido" : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _senhaCtrl,
                      obscureText: true,
                      autofillHints: const [AutofillHints.password],
                      decoration: const InputDecoration(hintText: "Senha"),
                      validator: (v) =>
                          (v == null || v.isEmpty) ? "Senha obrigatória" : null,
                    ),
                    if (_erro != null) ...[
                      const SizedBox(height: 12),
                      Text(_erro!, style: const TextStyle(color: LiriunColors.danger)),
                    ],
                    const SizedBox(height: 24),
                    FilledButton(
                      onPressed: _loading ? null : _entrar,
                      child: _loading
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text("Entrar"),
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => context.go("/cadastro"),
                      child: const Text("Criar conta"),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
