import "package:flutter/material.dart";
import "package:go_router/go_router.dart";

import "../../core/theme/liriun_tokens.dart";

/// Shell com TabBar inferior. Aba "Falar" é a primeira após login (decisão V1).
/// Ordem: Falar · Hoje · Tarefas · Atividade · Configurações.
class TabShell extends StatelessWidget {
  const TabShell({super.key, required this.child});

  final Widget child;

  static const _items = <_NavItem>[
    _NavItem(label: "Falar", icon: Icons.mic_none, route: "/falar"),
    _NavItem(label: "Hoje", icon: Icons.today_outlined, route: "/hoje"),
    _NavItem(label: "Tarefas", icon: Icons.checklist_outlined, route: "/tarefas"),
    _NavItem(label: "Atividade", icon: Icons.emoji_events_outlined, route: "/atividade"),
    _NavItem(label: "Ajustes", icon: Icons.settings_outlined, route: "/configuracoes"),
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
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selected,
        backgroundColor: LiriunColors.surface,
        indicatorColor: LiriunColors.violet500.withValues(alpha: 0.18),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        onDestinationSelected: (i) => context.go(_items[i].route),
        destinations: [
          for (final item in _items)
            NavigationDestination(
              icon: Icon(item.icon, color: LiriunColors.textMuted),
              selectedIcon: Icon(item.icon, color: LiriunColors.violet400),
              label: item.label,
            ),
        ],
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
