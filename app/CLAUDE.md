# App Flutter — Liriun

> Contexto geral, domínio, terminologia e tom de voz: `../CLAUDE.md`. Arquitetura/estado: `../docs/CONTEXTO_APP.md`.
> Identidade visual (provisória): `../docs/Identidade Visual/Rebranding/brand-kit/`.
> **Dono:** Pedro. **Android + iOS APENAS — sem Web.** O agente de voz é o diferencial mobile.

## ⚠️ Status: será REFEITO DO ZERO

O conteúdo atual de `app/` (a pasta `lib/`, telas, etc) **vai ser descartado e reconstruído do zero**. Não invista
em entender nem evoluir o código existente. A reconstrução começa **depois que o site estiver finalizado** (o site
é o foco atual). Enquanto isso, este arquivo registra a **direção pretendida** — não o que existe.

## Direção pretendida (quando começar a reconstrução)

- **Flutter (Android + iOS)**, dark mode default, identidade visual do brand kit (provisória).
- **Backend .NET é a fonte de verdade** — o app consome a API REST + JWT (sem acesso direto ao Supabase, sem lógica
  de negócio duplicada). Auth só e-mail/senha (cadastro exige código de convite — beta fechado).
- **Agente de voz** como centro: entrada por voz + texto, mesmo backend do site (`/captura/conversar` e
  `/captura/conversar-audio` multimodal). Decidir no início: STT/TTS nativos do dispositivo vs. mandar áudio pro
  backend como o site faz.
- **Meta de UX:** usabilidade parecida com o site (referência Duolingo). Se não der pra manter os dois no mesmo
  nível, o **app tem prioridade de excelência**.
- State management, navegação, estrutura de pastas: **decidir na hora da reconstrução** (Riverpod + go_router +
  feature-first são a inclinação, mas nada é compromisso — o objetivo é funcional primeiro, depois refinar).

## Regras que valem desde o começo

- **Terminologia e tom de voz** do Liriun (ver `../CLAUDE.md`): "Tarefa"/"Categoria", mordomo seco, sem emoji.
- **Tokens, não valores soltos** (cores/durações do brand kit). Tipografia **Geist**. Dark default. Ícones lineares.
- **Domínio** espelha os contratos da **API .NET**, não o schema do banco. `DataPrazo` é obrigatória; status
  "atrasada" vem calculado do backend; prioridades urgente/importante/normal/baixa.
- Acessibilidade desde o início (hit area mín. 44×44, respeitar reduce-motion, semantics em botões custom).

> Push (FCM), recorrência, wake word: fora de escopo na primeira versão — ver `../docs/CONTEXTO_APP.md` §11.
