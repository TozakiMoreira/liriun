# Liriun · App Flutter

Mobile (Android + iOS APENAS — sem Web). Agente de voz como diferencial.

> **Status: será refeito do zero.** O código atual desta pasta vai ser descartado e reconstruído — a reconstrução
> começa depois que o site (`../site/`) estiver finalizado. Regras e direção pretendida: [`CLAUDE.md`](CLAUDE.md).
> Contexto do projeto: [`../docs/CONTEXTO_APP.md`](../docs/CONTEXTO_APP.md).

## Direção pretendida

- **Flutter** (Android + iOS), dark mode default, identidade visual do brand kit (provisória).
- Consome o **backend .NET** (REST + JWT) — mesma API do site. Sem acesso direto ao Supabase.
- **Agente de voz** no centro (entrada por voz + texto, `/captura/conversar` e `/captura/conversar-audio`).
- Stack de detalhe (state, navegação, estrutura) a decidir na reconstrução — inclinação: Riverpod + go_router +
  feature-first, mas nada é compromisso.

## Rodar (quando existir projeto Flutter de novo)

```bash
cd app
flutter pub get
# emulador Android: localhost do PC = 10.0.2.2
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000
# produção
flutter run --dart-define=API_BASE_URL=https://api.liriun.com
```

O backend precisa estar de pé (ver [`../README.md`](../README.md)).
