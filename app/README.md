# Liriun · App Flutter

Mobile (Android + iOS APENAS — sem Web). Junto com o site Next.js (`site/`), substitui o Angular V1 na nova arquitetura.

> O Angular V1 (`front/`) foi **removido do disco** em 2026-06-15 — source preservado no histórico git (`3bad961^`) pra consulta.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Flutter 3.24+ · Dart 3.5+ |
| Estado | Riverpod 2.6 (annotations + lint) |
| Rotas | go_router 14 (com auth guard) |
| Backend | **`.NET 10` Web API** (em `backend/`) — REST + JWT. Mesmo backend serve site Next.js |
| HTTP client | dio 5 + flutter_secure_storage (JWT em Keychain/EncryptedSharedPreferences) |
| Voz | speech_to_text + flutter_tts |
| Push | firebase_messaging (Fase posterior) |
| Code-gen | freezed + json_serializable + riverpod_generator |

## Estrutura

```
app/
├─ pubspec.yaml
├─ analysis_options.yaml
├─ lib/
│  ├─ main.dart                       ← entry, ProviderScope
│  ├─ core/
│  │  ├─ theme/
│  │  │  ├─ liriun_tokens.dart        ← cores, raios, durações brand kit
│  │  │  └─ liriun_theme.dart         ← ThemeData dark
│  │  ├─ router/app_router.dart       ← GoRouter + auth guard
│  │  └─ api/
│  │     ├─ dio_client.dart           ← Dio + interceptor JWT + secure storage
│  │     ├─ auth_api.dart             ← endpoints .NET (login/cadastro/me)
│  │     └─ session_provider.dart     ← AsyncNotifier sessão JWT
│  └─ features/
│     ├─ auth/
│     │  ├─ providers/auth_controller.dart
│     │  └─ screens/{login,signup}_screen.dart
│     ├─ shell/tab_shell.dart         ← NavigationBar 5 abas
│     ├─ falar/falar_screen.dart      ← chat com agente (mic FAB)
│     ├─ hoje/hoje_screen.dart        ← saudação + agenda do dia
│     ├─ tarefas/tarefas_screen.dart  ← lista, kanban, semana
│     ├─ atividade/atividade_screen.dart   ← conquistas + parabenização
│     └─ configuracoes/configuracoes_screen.dart
└─ assets/icons/
```

Mapeamento das telas vs Angular V1 (referência histórica — `front/` só existe no histórico git):

| Flutter | Angular V1 (histórico) |
|---|---|
| `/falar` | `/captura` (Modo Liriun) |
| `/hoje` | `/visao-geral` |
| `/tarefas` | `/tarefas` |
| `/atividade` | `/concluidas` (renomeada — V1 já fez essa transição) |
| `/configuracoes` | `/configuracoes` |

## Setup

### Pré-requisitos
- Flutter SDK 3.24+ — https://flutter.dev/docs/get-started/install
- Android Studio (Android SDK + emulador) ou Xcode (iOS)
- Backend `.NET` rodando local (`cd backend && dotnet run --project src/Liriun.Api`) ou disponível em URL pública

### Primeira vez

```bash
cd app
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

### Rodar dev (Android emulador / iOS)

A `API_BASE_URL` aponta pro backend `.NET`. Em emulador Android, `localhost` do PC é `10.0.2.2`.

```bash
# Android emulador (backend rodando local na porta 5000)
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000

# iOS simulator
flutter run --dart-define=API_BASE_URL=http://localhost:5000

# Produção
flutter run --dart-define=API_BASE_URL=https://api.liriun.com
```

### Build release

```bash
# Android APK
flutter build apk --release --dart-define=API_BASE_URL=https://api.liriun.com

# iOS (precisa Mac + Xcode — sócio testa)
flutter build ios --release --dart-define=API_BASE_URL=https://api.liriun.com
```

## Pendências Fase B

- [ ] `flutter create .` formal (preencher pastas nativas android/ e ios/ — só depois de instalar SDK)
- [ ] Importar fontes Geist + Geist Mono em `assets/fonts/` + declarar em pubspec
- [ ] Models freezed: Tarefa, Categoria, Usuario (mirror dos contratos da API .NET)
- [ ] Providers de dados: `tarefasRepository`, `categoriasRepository`
- [ ] Tela Login: Google Sign-In + Apple Sign-In (obrigatório iOS)
- [ ] Tela Falar: integração `speech_to_text` + chamada `POST /api/agente/interpretar` (backend .NET)
- [ ] Tela Hoje: listar tarefas do dia via API .NET (`GET /tarefas` filtrado por prazo)
- [ ] Tela Tarefas: 3 modos (Lista/Quadro/Semana)
- [ ] Tela Atividade: query stats + lista conquistas
- [ ] I18n: `lib/l10n/app_pt.arb` + `app_en.arb` (migrar ~280 chaves do `translations.ts` do Angular V1 — via histórico git `3bad961^`)
- [ ] Onboarding pós-cadastro: escolher categorias padrão + tour das 5 abas
- [ ] Push (FCM): permissão + lembretes prazo
- [ ] Offline: SQLite via Brick OU PowerSync (decidir)
- [ ] Wake word (Picovoice/openWakeWord) — Fase 3, NÃO MVP
