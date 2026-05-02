# Jarvis Mobile (front2)

Stack: **Expo SDK 52 + React Native + Expo Router + NativeWind + TanStack Query + Zustand + Sonner**.
Pasta paralela ao `front/` Angular. Quando atingir paridade, renomeia.

## Pré-requisitos

- Node 20+ (testado em 22.15)
- App **Expo Go** instalado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- PC e celular na mesma rede WiFi
- Backend `Jarvis.Api` rodando

## Rodar

```bash
cd front2
cp .env.example .env
```

### 1. Pegar IP do PC na rede

Windows PowerShell:
```powershell
ipconfig | findstr IPv4
```

Pega o IP da rede WiFi (algo tipo `192.168.0.10` ou `10.0.0.5`).

### 2. Editar `.env`

```
EXPO_PUBLIC_API_URL=http://192.168.0.10:5108
```

### 3. Backend escutar em todas as interfaces

`backend/src/Jarvis.Api/Properties/launchSettings.json` — troca o profile `http`:

```json
"applicationUrl": "http://0.0.0.0:5108"
```

(ou roda `dotnet run --urls=http://0.0.0.0:5108` direto)

E libera o firewall do Windows na porta 5108 (vai aparecer prompt na primeira execução).

### 4. CORS no backend (se for testar `npx expo start --web`)

`Program.cs` linha 49 — adicionar `http://localhost:8081`:
```csharp
.WithOrigins("http://localhost:4200", "http://localhost:8081")
```

> Não precisa pra rodar via Expo Go no celular — só pra testar no navegador.

### 5. Iniciar Expo

```bash
npm start
```

Abre Expo Go no celular, escaneia o QR code do terminal. Hot reload automático.

Atalhos no terminal Metro:
- `a` — emulador Android
- `i` — simulador iOS (precisa Mac)
- `w` — navegador

## Estrutura

```
front2/
├── app/                       # rotas Expo Router (file-based)
│   ├── _layout.tsx            # root: Query, GH, SafeArea, Toaster
│   ├── index.tsx              # redirect inicial baseado em auth
│   ├── onboarding.tsx         # setup inicial
│   ├── (auth)/                # grupo: login, cadastro
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── cadastro.tsx
│   └── (app)/                 # grupo autenticado: tabs
│       ├── _layout.tsx        # Tabs (captura, tarefas, concluidas, ajustes)
│       ├── captura.tsx
│       ├── tarefas.tsx
│       ├── concluidas.tsx
│       └── configuracoes.tsx
├── src/
│   ├── api/                   # HTTP client + tipos do backend
│   ├── components/            # UI primitives (Button, Input, Sheet, ...)
│   ├── hooks/                 # TanStack Query hooks
│   ├── stores/                # Zustand (auth)
│   ├── lib/                   # secureStore, format
│   ├── theme/                 # tokens
│   └── config/                # env
├── global.css                 # Tailwind base
├── tailwind.config.js         # tokens (mesmas cores do front Angular)
├── app.json                   # config Expo
└── package.json
```

## Roadmap de fases

- [x] **Fase 0** — scaffold + tema + tooling
- [x] **Fase 1** — auth (login/cadastro/JWT em SecureStore) + onboarding
- [x] **Fase 2** — captura + tarefas + tarefa-form (modal) + concluídas + ajustes
- [ ] **Fase 3** — polish: skeletons, animações Reanimated, BottomSheet via @gorhom, swipe-to-complete, modo Jarvis com IA
- [ ] **Fase 4** — i18n setup (TIER 4), PWA web build, app icon + splash
- [ ] **Fase 5** — EAS Build → APK Android instalável + TestFlight iOS via cloud build

## Funcionalidades já implementadas

- Login + Cadastro com validação
- JWT persistido em **expo-secure-store** (Keychain iOS / Keystore Android)
- AuthGuard via Expo Router groups + redirects
- Onboarding com categorias e prazos padrão (pula se usuário já tem dados)
- Captura: cards de modo Manual/Jarvis (Jarvis em "EM BREVE" até integrar Gemini)
- Tarefas: agrupamento por categoria, atrasadas em destaque, optimistic update ao concluir, **haptic feedback**, pull-to-refresh
- Form de tarefa (modal): nome, multi-select de categorias, prioridade em chips, prazo em chips
- Concluídas com filtros de período (hoje / 7d / 30d / tudo)
- Ajustes: CRUD de categorias e prazos com Alert de confirmação antiva
- Logout com confirmação
- Toasts (Sonner) em vez de mensagens em texto
- Tratamento de erros via ProblemDetails (RFC 7807) do backend
- ApiClient com interceptor de 401 → logout automático

## Notas

- **iOS via Mac**: pra build local iOS precisa Mac. Sem Mac, usa **EAS Build** (cloud) na Fase 5.
- **Apple Watch / Wear OS**: extensões nativas separadas (Swift / Kotlin) — futuro.
- **Smartwatch lógica**: reutiliza o `src/api/` e `src/stores/` via tRPC ou REST.
