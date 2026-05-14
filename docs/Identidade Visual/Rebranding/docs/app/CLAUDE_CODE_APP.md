# Liriun App · Guia de Implementação

> Manual canônico pra Claude Code construir o app mobile do **Liriun**. Leia este arquivo do início ao fim antes de codar uma linha.

---

## 0 · Como usar este manual

Este arquivo trabalha junto com:

| Arquivo | Pra quê |
|---|---|
| `liriun-app-v2.html` | **Reference visual.** Abra no navegador e use como source-of-truth do design. Tem 15 telas em iPhone frames com anotações ao lado de cada uma. |
| `liriun-motion.html` | Biblioteca de motion-primitivos + estados (loading, empty, error). Reference complementar. |
| `liriun-brand-kit/` | Tokens, fontes, ícones, assets. Sempre consultar antes de inventar valor. |
| `CLAUDE_CODE.md` | Princípios gerais (tokens, anti-patterns, do's & don'ts). |

**Workflow recomendado:** abra `liriun-app-v2.html` lado-a-lado com o seu editor. Cada tela tem seu número (1.1, 1.2, etc) — referencie aqui quando estiver implementando.

---

## 1 · Stack obrigatória

### Plataforma
- **Flutter 3.24+** (Dart 3.5+) — alvo iOS 17+ e Android 13+
- Build mode: Material 3 ligado mas customizado pra parecer iOS HIG (densidade, tipografia, motion)

### Pacotes essenciais
```yaml
dependencies:
  flutter:
    sdk: flutter
  go_router: ^14.0.0           # navegação declarativa
  flutter_animate: ^4.5.0      # animações simples
  flutter_riverpod: ^2.5.0     # state management
  google_fonts: ^6.0.0         # Geist
  flutter_svg: ^2.0.0          # ícones vetoriais
  cached_network_image: ^3.0.0
  speech_to_text: ^7.0.0       # voz
  permission_handler: ^11.0.0  # mic permission
  intl: ^0.19.0
  confetti: ^0.7.0             # celebrações
  flutter_launcher_icons: ^0.13.0  # gerar ícones do app

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.0
  riverpod_generator: ^2.4.0
```

### Fontes
- **Geist** (Vercel · OFL) — corpo e UI
- **Geist Mono** (Vercel · OFL) — overlines, métricas
- Copie os .ttf de `liriun-brand-kit/` ou use `google_fonts` (preferível)

---

## 2 · Estrutura do projeto

```
liriun_app/
├─ assets/
│  ├─ fonts/                 ← Geist + Geist Mono
│  ├─ icons/                 ← SVGs do brand kit
│  └─ images/
├─ ios/Runner/Assets.xcassets/AppIcon.appiconset/  ← gerar via flutter_launcher_icons
├─ android/app/src/main/res/                       ← idem
├─ lib/
│  ├─ main.dart
│  ├─ app.dart               ← MaterialApp + theme + router
│  ├─ theme/
│  │  ├─ liriun_colors.dart      ← os tokens (mapeie 1:1 de tokens.json)
│  │  ├─ liriun_text_styles.dart
│  │  ├─ liriun_durations.dart   ← 180/220/360/520ms
│  │  └─ liriun_curves.dart      ← cubic-beziers
│  ├─ router/
│  │  └─ app_router.dart         ← go_router config
│  ├─ features/
│  │  ├─ onboarding/             ← 1.1–1.5 do liriun-motion.html
│  │  ├─ today/                  ← 1.1–1.3 do liriun-app-v2.html
│  │  ├─ voice/                  ← 2.1–2.3 do liriun-app-v2.html
│  │  ├─ tasks/                  ← 3.1–3.3 do liriun-app-v2.html
│  │  ├─ calendar/               ← 4.1–4.2 do liriun-app-v2.html
│  │  ├─ insights/               ← 4.3 do liriun-app-v2.html
│  │  ├─ capture/                ← 5.1 do liriun-app-v2.html
│  │  └─ settings/
│  ├─ widgets/
│  │  ├─ mic_fab.dart            ← 3 estados (idle/listening/processing)
│  │  ├─ waveform_bars.dart      ← 32 barras animadas
│  │  ├─ liriun_mark.dart        ← logo
│  │  ├─ category_chip.dart
│  │  ├─ task_card.dart
│  │  ├─ shimmer_box.dart
│  │  ├─ pulse_ring.dart         ← rings concentric
│  │  ├─ liriun_button.dart      ← primary/secondary/ghost/destructive
│  │  └─ confetti_burst.dart
│  ├─ models/
│  │  ├─ task.dart
│  │  ├─ category.dart
│  │  └─ insight.dart
│  └─ services/
│     ├─ voice_service.dart      ← STT + IA extraction
│     ├─ task_service.dart       ← CRUD + sync
│     └─ insight_service.dart    ← compute insights
```

---

## 3 · Tema base (lib/theme/liriun_colors.dart)

```dart
import 'package:flutter/material.dart';

class LColors {
  // Surfaces
  static const bg          = Color(0xFF07080B);
  static const surface     = Color(0xFF0E1014);
  static const surfaceHi   = Color(0xFF14161C);
  
  // Text
  static const text        = Color(0xF5F4F6FC); // 96%
  static const muted       = Color(0xA6F4F6FC); // 65%
  static const faint       = Color(0x6BF4F6FC); // 42%
  static const dim         = Color(0x47F4F6FC); // 28%
  
  // Brand
  static const violet400   = Color(0xFFA88BFF);
  static const violet500   = Color(0xFF9C7BFF);
  static const violet600   = Color(0xFF7C7DF6);
  static const blue        = Color(0xFF5B8DEF);
  
  // Categories
  static const catWork     = Color(0xFF7AA9FF);
  static const catHealth   = Color(0xFF7BD7B0);
  static const catHome     = Color(0xFFF0B36E);
  static const catPerson   = Color(0xFFC8A0FF);
  static const catFinance  = Color(0xFFE58FB0);
  
  // Borders
  static const border      = Color(0x12FFFFFF); // 7%
  static const borderHi    = Color(0x22FFFFFF); // 13%
  
  // Semantic
  static const success     = Color(0xFF7BD7B0);
  static const warning     = Color(0xFFF0B36E);
  static const danger      = Color(0xFFEE7A8E);
  
  // Brand gradient
  static const brandGrad = LinearGradient(
    colors: [violet400, violet600, blue],
    stops: [0.0, 0.55, 1.0],
    begin: Alignment.topLeft, end: Alignment.bottomRight,
  );
}

class LDurations {
  static const fast  = Duration(milliseconds: 180);
  static const base  = Duration(milliseconds: 220);
  static const slow  = Duration(milliseconds: 360);
  static const xslow = Duration(milliseconds: 520);
}

class LCurves {
  static const standard = Cubic(0.4, 0.0, 0.2, 1.0);
  static const decel    = Cubic(0.25, 0.1, 0.25, 1.0);
  static const expo     = Cubic(0.16, 1.0, 0.3, 1.0);
}
```

---

## 4 · Roteamento (go_router)

```dart
final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/',           builder: (_,__) => const SplashScreen()),
    GoRoute(path: '/onboarding', builder: (_,__) => const OnboardingFlow()),
    GoRoute(path: '/permission', builder: (_,__) => const MicPermission()),
    GoRoute(path: '/auth',       builder: (_,__) => const SignIn()),
    
    ShellRoute(
      builder: (_,__, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/today',    builder: (_,__) => const TodayScreen()),
        GoRoute(path: '/tasks',    builder: (_,__) => const TasksCollections()),
        GoRoute(path: '/calendar', builder: (_,__) => const CalendarMonth()),
        GoRoute(path: '/insights', builder: (_,__) => const InsightsScreen()),
      ],
    ),
    
    GoRoute(path: '/tasks/:catId',        builder: (ctx, st) => TaskInside(catId: st.pathParameters['catId']!)),
    GoRoute(path: '/task/:id',            builder: (ctx, st) => TaskDetail(taskId: st.pathParameters['id']!)),
    GoRoute(path: '/calendar/:date',      builder: (ctx, st) => CalendarDay(date: st.pathParameters['date']!)),
    GoRoute(path: '/share/:type/:value',  builder: (ctx, st) => ShareCard(...)),
    
    // Voice sheet — page-rise transition
    GoRoute(
      path: '/voice',
      pageBuilder: (ctx, st) => CustomTransitionPage(
        child: const VoiceFlow(),
        transitionDuration: LDurations.slow,
        reverseTransitionDuration: LDurations.base,
        transitionsBuilder: (_, anim, ___, child) => SlideTransition(
          position: Tween(begin: const Offset(0,1), end: Offset.zero)
            .animate(CurvedAnimation(parent: anim, curve: LCurves.decel)),
          child: child,
        ),
      ),
    ),
    
    // Quick capture — modal over current screen
    GoRoute(
      path: '/capture',
      pageBuilder: (ctx, st) => CustomTransitionPage(
        opaque: false, barrierColor: Colors.black54,
        transitionDuration: LDurations.slow,
        child: const QuickCapture(),
        transitionsBuilder: ... // slide up + backdrop fade
      ),
    ),
  ],
);
```

---

## 5 · Especificação de cada tela

### 5.1 · MainShell (tab bar + mic FAB)

- **Tab bar** custom (não `BottomNavigationBar` padrão):
  - 4 tabs: **Hoje** · **Tarefas** · **Calendário** · **Insights**
  - Glass effect: `Container` com `BackdropFilter` (blur 28, saturação 160%)
  - Background `Color(0x14, 0x16, 0x1C, 0.92)`, border 1px branco 12%
- **Mic FAB flutuante** sobre o centro da tab bar:
  - 64×64, gradient `brandGrad`, shadow glow
  - Tap → navega para `/voice`
  - Long-press → abre `/capture` (Quick Capture)
  - **Estado idle:** anima box-shadow expandindo+desvanecendo (lm-glow keyframe, 2.4s loop)

### 5.2 · Today (1.1 / 1.2 / 1.3 do v2.html)

**3 variações dependendo da hora:**
- 5:00–11:59 → morning layout (sugestão proativa + featured next)
- 12:00–18:59 → midday (progress ring + remaining)
- 19:00–04:59 → evening (reflection + day stamp + tomorrow brief)

**Como decidir o layout:** `final variant = TodayVariant.fromHour(DateTime.now().hour);`

**Componentes-chave:**
- **DayShape widget** (top horizontal timeline): `CustomPaint` desenha track + event dots em posições baseadas em horário
- **Liriun Suggestion card**: aparece com `slideInFromTop + fade` 360ms decel
- **Progress ring** (midday): `CustomPaint` com `Canvas.drawArc`, anima stroke 0→target ao montar
- **Day stamp** (evening): 6 retângulos em row, com box-shadow glow nos completed

### 5.3 · Voice Flow (2.1 / 2.2 / 2.3)

**Página única com 3 estados:** `VoiceFlowState.listening` → `processing` → `saved`. Use `AnimatedSwitcher` com `FadeTransition` 360ms entre estados.

**Listening (2.1):**
- Background: gradient radial `Color(0x0A,0x0C,0x12)` + glow violet
- `PulseRing` widget (3 rings, defasados 0.5s, lm-pulse-ring keyframe)
- Mic central com escala loop 1.4s
- Waveform: 32 barras `AnimatedBuilder` cada uma com `Tween<double>(0.25 → 1)` cíclico, fase aleatória
- Live transcript: aparece word-by-word como `RichText` (use o pacote `speech_to_text` com `onResult`)

**Processing (2.2):**
- Mark com shimmer (gradient passando)
- Transcript com palavras-chave em highlight colorido (chamar uma `extractEntities()` que retorna spans com entity types)
- Cards de extração: aparecem com stagger 0.2s usando `AnimatedList` ou `Future.delayed`

**Saved (2.3):**
- Check stroke draw: `CustomPaint` animando `path metric extract` 0→1 em 550ms
- Confetti: `ConfettiController.play()` com 6 cores do brand kit
- Preview card: `slideInFromBottom + fade` 500ms
- Haptic: `HapticFeedback.notificationFeedback(NotificationFeedbackType.success)`

### 5.4 · Tasks Collections (3.1)

- Grid 2 colunas com `GridView.count(crossAxisCount: 2)`
- Cada CollectionCard:
  - Gradient sutil da cor da categoria (alpha 0.10 → 0.02)
  - Cover blob: círculo borrado no canto top-right
  - Dot indicator com glow
  - Progress bar 3px no fundo
  - Tap → `/tasks/:catId` (hero transition do dot pra header da próxima tela)

### 5.5 · Tasks Inside (3.2)

- Header com glow da categoria
- Tab bar custom: Abertas / Concluídas / Arquivadas
- Lista agrupada por seções de tempo (Hoje / Esta semana / Sem prazo)
- Swipe direito numa task → concluir (com haptic + animação color change)
- Swipe esquerdo → arquivar
- Long-press → menu de ações

### 5.6 · Task Detail (3.3)

- **Full-screen page** (não BottomSheet)
- Hero gradient da categoria no topo
- Avatar circular pra pessoa (gradient se não tiver foto)
- Liriun lembra card: gradient soft
- Bottom action bar: Concluir (primary) + Edit (icon button)

### 5.7 · Calendar Month (4.1)

- Stats strip no topo (4 colunas com separadores)
- Grid 7×6 com `GridView.builder`
- Cada dia com cor de heat baseada em `daysActivity[day]`
- Today com gradient + shadow
- Tap num dia → bottom sheet com tarefas do dia
- Swipe horizontal → trocar mês

### 5.8 · Calendar Day (4.2)

- Timeline vertical com slots de hora
- Eventos como cards posicionados
- Slot livre mostra sugestão Liriun como pill clicável
- "Agora" indicator: linha horizontal pulsando

### 5.9 · Insights (4.3)

- Year heat 52 colunas (cada uma 1 semana)
- Narrative insight cards: ícone + título + descrição
- Streak card grande no fundo (orange + violet gradient)

### 5.10 · Quick Capture (5.1)

- Modal flutuante com backdrop blur
- 3 modos: Voz / Texto / Foto
- Default: voz, com rings pulsando
- Quick chips no rodapé: Hoje / Amanhã / Semana / Sem prazo
- Persistente sobre qualquer tela (gesture `LongPress` em qualquer lugar abre)

### 5.11 · Achievement Shareable (5.3)

- Tela completa com card central 9:16
- Card é screenshotado via `RepaintBoundary` + `toImage()`
- Compartilhamento via `share_plus` pra Instagram / WhatsApp / X

---

## 6 · Voice Service (o coração do app)

```dart
// services/voice_service.dart
class VoiceService {
  final SpeechToText _stt = SpeechToText();
  
  Stream<VoiceState> startListening() async* {
    final ok = await _stt.initialize();
    if (!ok) { yield VoiceState.error('Mic não disponível'); return; }
    
    HapticFeedback.lightImpact();
    
    final controller = StreamController<String>();
    _stt.listen(
      onResult: (r) => controller.add(r.recognizedWords),
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 2),
      localeId: 'pt_BR',
    );
    
    await for (final transcript in controller.stream) {
      yield VoiceState.listening(transcript);
    }
    
    HapticFeedback.softImpact();
    yield const VoiceState.processing();
    
    // Send to extraction API
    final task = await extractTask(transcript);
    
    HapticFeedback.notificationFeedback(NotificationFeedbackType.success);
    yield VoiceState.saved(task);
  }
  
  Future<Task> extractTask(String transcript) async {
    // Chama backend de IA com transcript
    // Recebe { title, when, who, category, priority }
    // Retorna Task model
  }
}
```

---

## 7 · Animações — replicar do mockup

Cada `@keyframes lm-*` em `liriun-motion-tokens.jsx` tem equivalente em Flutter:

| Web keyframe | Flutter equivalent |
|---|---|
| `lm-pulse-ring` | `AnimationController(duration: 2s)` → `Tween<double>(0.85→1.8)` no scale + `Tween<double>(0→0.6→0)` no opacity |
| `lm-pulse-scale` | `AnimationController(duration: 1.4s, vsync)..repeat(reverse: true)` com `Tween(1.0 → 1.06)` |
| `lm-bar-listen` | Por barra, `Tween(0.25→1.0)` com Curve `easeInOut`, fase aleatória via `delayed` |
| `lm-shimmer` | `ShaderMask` com gradient transladando via `LinearGradient` shift |
| `lm-rise` | `SlideTransition` + `FadeTransition` 360ms decel |
| `lm-spin` | `RotationTransition` 1s linear, repeat |
| `lm-confetti-N` | Use o pacote `confetti` configurado com `Path` paths customizados pras cores |

---

## 8 · Data model

```dart
@freezed
class Task with _$Task {
  const factory Task({
    required String id,
    required String title,
    String? notes,
    required DateTime createdAt,
    DateTime? scheduledFor,
    Duration? duration,
    DateTime? completedAt,
    required Category category,
    Priority? priority,
    Person? person,
    List<String>? prepNotes,
    @Default(false) bool isArchived,
  }) = _Task;
}

enum Priority { low, medium, high }
enum Category { work, health, home, personal, finance, idea }

@freezed
class Person with _$Person { ... }
```

---

## 9 · Acessibilidade (não-negociável)

- `Semantics` em todos os botões custom
- `MediaQuery.of(context).disableAnimations` → desliga animações decorativas
- Mínimo de 44×44 dp em hit areas
- `Focus` visível: gradient ring violet 4dp ao redor de focused widgets

---

## 10 · Checklist · ordem de entrega sugerida

- [ ] **Setup** (Flutter create + pacotes + tema + fontes)
- [ ] **Splash + Onboarding** (5 telas — usa `liriun-motion.html` §1)
- [ ] **Mic Permission** + Auth (Apple/Google)
- [ ] **MainShell + tab bar + mic FAB** (sem conteúdo das tabs ainda)
- [ ] **Today** (3 variantes — usa `liriun-app-v2.html` §1)
- [ ] **Voice Flow** (3 estados — §2)
- [ ] **Tasks Collections** (§3.1)
- [ ] **Task Inside** (§3.2)
- [ ] **Task Detail** (§3.3)
- [ ] **Calendar Month** (§4.1)
- [ ] **Calendar Day** (§4.2)
- [ ] **Insights** (§4.3)
- [ ] **Quick Capture** (§5.1)
- [ ] **Notifications** + Lock Screen Widget (§5.2)
- [ ] **Shareable** (§5.3)
- [ ] Settings + Profile
- [ ] Empty states (usa `liriun-motion.html` §3)
- [ ] **Polishing** — micro-animações, haptic feedback, sound design opcional

---

## 11 · O que NÃO fazer

- ❌ Não use `BottomNavigationBar` padrão. Faça custom.
- ❌ Não use `Material` colors. Sempre tokens do `liriun_colors.dart`.
- ❌ Não use `CupertinoActivityIndicator`. Use nossos spinners custom.
- ❌ Não use ícones Material (`Icons.mic`). Use SVGs do brand kit.
- ❌ Não use `showDialog` padrão. Sempre custom transitions.
- ❌ Não anime sem checar `MediaQuery.disableAnimations`.

---

— Última atualização: maio 2026 · v 2.0 (mobile-first)
