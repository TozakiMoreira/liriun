import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/liriun_tokens.dart';
import '../../widgets/mic_fab.dart';

/// MainShell custom: tab bar glass (4 abas) + Mic FAB flutuante no centro.
/// Ordem: Hoje · Tarefas · [Mic] · Calendário · Insights.
/// Tap Mic → /falar · Long-press Mic → /capture (Quick Capture).
class TabShell extends StatelessWidget {
  const TabShell({super.key, required this.child});

  final Widget child;

  static const _items = <_NavItem>[
    _NavItem(label: 'Hoje', icon: Icons.today_outlined, route: '/hoje'),
    _NavItem(label: 'Tarefas', icon: Icons.checklist_rounded, route: '/tarefas'),
    _NavItem(label: 'Agenda', icon: Icons.calendar_today_outlined, route: '/calendario'),
    _NavItem(label: 'Insights', icon: Icons.insights_outlined, route: '/atividade'),
  ];

  int _indexFromLocation(String location) {
    final i = _items.indexWhere((e) => location.startsWith(e.route));
    return i < 0 ? 0 : i;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final selected = _indexFromLocation(location);

    return Scaffold(
      backgroundColor: LiriunColors.bg,
      extendBody: true,
      body: child,
      floatingActionButton: MicFab(
        onTap: () => context.push('/voice'),
        onLongPress: () => context.push('/capture'),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: _GlassBar(selected: selected, items: _items),
    );
  }
}

class _GlassBar extends StatelessWidget {
  const _GlassBar({required this.selected, required this.items});

  final int selected;
  final List<_NavItem> items;

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 22, sigmaY: 22),
        child: Container(
          decoration: BoxDecoration(
            color: LiriunColors.surfaceHi.withValues(alpha: 0.88),
            border: const Border(
              top: BorderSide(color: LiriunColors.borderHi, width: 1),
            ),
          ),
          child: SafeArea(
            top: false,
            child: SizedBox(
              height: 64,
              child: Row(
                children: [
                  _tabSlot(context, 0, items[0]),
                  _tabSlot(context, 1, items[1]),
                  const SizedBox(width: 72), // espaço Mic FAB
                  _tabSlot(context, 2, items[2]),
                  _tabSlot(context, 3, items[3]),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _tabSlot(BuildContext context, int i, _NavItem item) {
    final active = selected == i;
    return Expanded(
      child: InkWell(
        onTap: () => context.go(item.route),
        borderRadius: BorderRadius.circular(LiriunRadii.md),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              item.icon,
              size: 22,
              color: active ? LiriunColors.violet300 : LiriunColors.textFaint,
            ),
            const SizedBox(height: 4),
            Text(
              item.label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                color: active ? LiriunColors.text : LiriunColors.textFaint,
                letterSpacing: -0.1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({required this.label, required this.icon, required this.route});
  final String label;
  final IconData icon;
  final String route;
}
