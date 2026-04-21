# Migrations — passo a passo

Comandos rodados a partir de `backend/`.

## 1. Instalar o CLI do EF (uma vez só na máquina)

```bash
dotnet tool install --global dotnet-ef
```

Se já tiver instalado:
```bash
dotnet tool update --global dotnet-ef
```

## 2. Configurar connection string (user-secrets — não commitar)

Pega a connection string do Supabase em: **Project Settings → Database → Connection string → URI** (escolhe a opção "Session" pooler, porta 5432).

Formato Npgsql:
```
Host=aws-0-sa-east-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.SEU_PROJECT_REF;Password=SUA_SENHA;Ssl Mode=Require;Trust Server Certificate=true
```

Aplicar via user-secrets no projeto Api:
```bash
cd src/Jarvis.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Jarvis" "Host=...;Port=5432;..."
cd ../..
```

## 3. Gerar a primeira migration

O projeto de **startup** é `Jarvis.Api` (onde o DI está). O projeto do **DbContext** é `Jarvis.Infra`.

```bash
dotnet ef migrations add InitialCreate \
  --project src/Jarvis.Infra \
  --startup-project src/Jarvis.Api \
  --output-dir Data/Migrations
```

Vai criar os arquivos em `src/Jarvis.Infra/Data/Migrations/`. Commita junto.

## 4. Aplicar no Supabase

```bash
dotnet ef database update \
  --project src/Jarvis.Infra \
  --startup-project src/Jarvis.Api
```

Depois disso, as tabelas existem no Supabase. Valida no dashboard do Supabase: **Table Editor** → devem aparecer `usuarios`, `categorias`, `prazos`, `tarefas`, `tarefas_categorias` e `__EFMigrationsHistory`.

## 5. Futuras mudanças no schema

Sempre que mudar uma entidade / configuration:

```bash
# gera nova migration
dotnet ef migrations add NomeDescritivoDaMudanca \
  --project src/Jarvis.Infra --startup-project src/Jarvis.Api \
  --output-dir Data/Migrations

# aplica
dotnet ef database update \
  --project src/Jarvis.Infra --startup-project src/Jarvis.Api
```

## Desfazer migration (antes de aplicar em prod)

```bash
# volta o banco pra migration anterior
dotnet ef database update NomeDaMigrationAnterior \
  --project src/Jarvis.Infra --startup-project src/Jarvis.Api

# remove o arquivo da última migration
dotnet ef migrations remove \
  --project src/Jarvis.Infra --startup-project src/Jarvis.Api
```
