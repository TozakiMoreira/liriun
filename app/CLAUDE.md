# App Flutter — Liriun

> Regras específicas do app. Setup, estrutura de pastas detalhada e pendências: `README.md` (nesta pasta).
> Contexto geral do produto, domínio, terminologia e tom de voz: `../CLAUDE.md`.
> Identidade visual (tokens/fontes): `../docs/Identidade Visual/Rebranding/brand-kit/`.
> **Dono:** Pedro. **Android + iOS APENAS — sem Web.** Agente de voz é o diferencial mobile.

## Stack
Flutter 3.24+ / Dart 3.5+ · Riverpod (state) · go_router (nav + auth guard) · dio + flutter_secure_storage (JWT
em Keychain/EncryptedSharedPreferences) · speech_to_text + flutter_tts (voz) · freezed + json_serializable ·
firebase_messaging (fase posterior).

## Estrutura (feature-first)
`lib/core/` (`api/`, `router/`, `theme/`) · `lib/features/` (`splash`, `onboarding`, `auth`, `shell`, `falar`,
`hoje`, `tarefas`, `calendario`, `atividade`, `capture`, `voice`, `notification`, `shareable`, `configuracoes`) ·
`lib/models/` · `lib/widgets/`. Abas principais no `shell`.

## Convenções não-negociáveis

- **Backend .NET é a fonte de verdade.** Todo dado via REST + JWT (dio no `core/api/`). Sem acesso direto ao Supabase, sem lógica de negócio duplicada no app.
- `API_BASE_URL` via `--dart-define` (emulador Android: `http://10.0.2.2:5000`; prod: `https://api.liriun.com`).
- Models via **freezed** espelhando os contratos da API .NET (não o schema do banco). Client gerado do OpenAPI quando disponível.
- **Tokens, não valores soltos:** cores/durações/curvas em `lib/core/theme/` (mapeadas do brand-kit). Nunca `Colors.*` do Material nem hex avulso.
- **Tipografia Geist / Geist Mono.** **Dark mode default.** **Sem emojis.** Ícones via SVG do brand kit (`flutter_svg`), não `Icons.*` do Material.
- **STT/TTS nativos** (`pt_BR`). Voz é primária — todo o fluxo de `falar`/`voice` gira em torno do gesto de falar.
- **Terminologia e tom de voz** do Liriun (ver `../CLAUDE.md`).
- **Acessibilidade:** `Semantics` em botões custom; respeitar `MediaQuery.disableAnimations`; hit area mín. 44×44.

## Rodar
`flutter pub get` → `flutter pub run build_runner build --delete-conflicting-outputs` → `flutter run --dart-define=API_BASE_URL=...`. Detalhe no `README.md`. Backend precisa estar de pé.
