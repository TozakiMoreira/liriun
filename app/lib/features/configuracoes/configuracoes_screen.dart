import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/session_provider.dart';
import '../../core/theme/liriun_tokens.dart';
import '../../widgets/avatar.dart';
import '../auth/providers/auth_controller.dart';
import 'modals.dart';

class ConfiguracoesScreen extends ConsumerWidget {
  const ConfiguracoesScreen({super.key});

  void _snack(BuildContext context, String label) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text('$label — em breve.'),
          duration: const Duration(seconds: 2),
          backgroundColor: LiriunColors.surfaceHi,
          behavior: SnackBarBehavior.floating,
        ),
      );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: LiriunColors.bg,
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'SUA CONTA',
                style: TextStyle(
                  fontSize: 9,
                  letterSpacing: 1.6,
                  color: LiriunColors.violet300,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Configurações',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w600,
                  color: LiriunColors.text,
                  letterSpacing: -0.6,
                ),
              ),
              const SizedBox(height: 18),
              _Profile(
                onEdit: () async {
                  await showLiriunSheet<bool>(
                    context: context,
                    child: const EditarPerfilSheet(),
                  );
                },
              ),
              const SizedBox(height: 14),
              _Section(
                title: 'Segurança',
                items: [
                  _Item(
                    icon: Icons.lock_outline_rounded,
                    label: 'Alterar senha',
                    onTap: () async {
                      final ok = await showLiriunSheet<bool>(
                        context: context,
                        child: const AlterarSenhaSheet(),
                      );
                      if (ok == true && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Senha alterada.'),
                            duration: Duration(seconds: 2),
                            backgroundColor: LiriunColors.surfaceHi,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      }
                    },
                  ),
                ],
              ),
              const SizedBox(height: 14),
              _Section(
                title: 'Preferências',
                items: [
                  _Item(
                    icon: Icons.translate_rounded,
                    label: 'Idioma',
                    sub: 'Português',
                    onTap: () => _snack(context, 'Idioma'),
                  ),
                  _Item(
                    icon: Icons.dark_mode_outlined,
                    label: 'Tema',
                    sub: 'Dark',
                    onTap: () => _snack(context, 'Tema'),
                  ),
                  _Item(
                    icon: Icons.label_outline_rounded,
                    label: 'Categorias',
                    onTap: () => _snack(context, 'Categorias'),
                  ),
                  _Item(
                    icon: Icons.notifications_active_outlined,
                    label: 'Notificações',
                    sub: 'preview',
                    onTap: () => context.push('/notificacoes/preview'),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              _Section(
                title: 'Integrações',
                items: [
                  _Item(
                    icon: Icons.calendar_today_rounded,
                    label: 'Google Calendar',
                    sub: 'em breve',
                    onTap: () => _snack(context, 'Google Calendar'),
                  ),
                  _Item(
                    icon: Icons.notifications_outlined,
                    label: 'Apple Reminders',
                    sub: 'em breve',
                    onTap: () => _snack(context, 'Apple Reminders'),
                  ),
                  _Item(
                    icon: Icons.workspace_premium_outlined,
                    label: 'Notion',
                    sub: 'em breve',
                    onTap: () => _snack(context, 'Notion'),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              _SairButton(
                onTap: () async {
                  await ref.read(authControllerProvider).sair();
                  if (context.mounted) context.go('/login');
                },
              ),
              const SizedBox(height: 10),
              _ExcluirButton(
                onTap: () async {
                  final ok = await showLiriunSheet<bool>(
                    context: context,
                    child: const ExcluirContaSheet(),
                  );
                  if (ok == true && context.mounted) {
                    await ref.read(authControllerProvider).sair();
                    if (context.mounted) context.go('/login');
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Profile extends ConsumerWidget {
  const _Profile({required this.onEdit});
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionAsync = ref.watch(sessionControllerProvider);
    final session = sessionAsync.valueOrNull;
    final nome = session?.usuario.nome ?? 'Usuário';
    final email = session?.usuario.email ?? '';
    final fotoUrl = session?.usuario.fotoUrl;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onEdit,
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0x0AFFFFFF),
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            border: Border.all(color: LiriunColors.borderHi),
          ),
          child: Row(
        children: [
          LiriunAvatar(nome: nome, fotoUrl: fotoUrl, size: 60),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  nome,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: LiriunColors.text,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  email,
                  style: const TextStyle(
                    fontSize: 12,
                    color: LiriunColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.chevron_right_rounded,
            color: LiriunColors.textFaint,
          ),
        ],
      ),
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.items});
  final String title;
  final List<_Item> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title.toUpperCase(),
          style: const TextStyle(
            fontSize: 9,
            letterSpacing: 1.6,
            color: LiriunColors.textFaint,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: const Color(0x0AFFFFFF),
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            border: Border.all(color: LiriunColors.border),
          ),
          child: Column(
            children: [
              for (var i = 0; i < items.length; i++) ...[
                items[i],
                if (i < items.length - 1)
                  Container(
                    height: 1,
                    margin: const EdgeInsets.only(left: 50),
                    color: LiriunColors.border,
                  ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _Item extends StatelessWidget {
  const _Item({
    required this.icon,
    required this.label,
    this.sub,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final String? sub;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              Icon(icon, size: 20, color: LiriunColors.violet300),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: LiriunColors.text,
                    letterSpacing: -0.2,
                  ),
                ),
              ),
              if (sub != null) ...[
                Text(
                  sub!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: LiriunColors.textFaint,
                  ),
                ),
                const SizedBox(width: 6),
              ],
              const Icon(
                Icons.chevron_right_rounded,
                size: 18,
                color: LiriunColors.textFaint,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SairButton extends StatelessWidget {
  const _SairButton({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: const Color(0x10FFFFFF),
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            border: Border.all(color: LiriunColors.borderHi),
          ),
          child: const Text(
            'Sair',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: LiriunColors.text,
              letterSpacing: -0.2,
            ),
          ),
        ),
      ),
    );
  }
}

class _ExcluirButton extends StatelessWidget {
  const _ExcluirButton({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: LiriunColors.danger.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(LiriunRadii.md),
            border: Border.all(
              color: LiriunColors.danger.withValues(alpha: 0.32),
            ),
          ),
          child: const Text(
            'Excluir conta',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: LiriunColors.danger,
              letterSpacing: -0.2,
            ),
          ),
        ),
      ),
    );
  }
}
