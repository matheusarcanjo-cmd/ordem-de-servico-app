# Solicitações de Levantamento — Gestão de OS de Levantamentos de Campo

Aplicação web para abertura, aprovação e acompanhamento de OS de levantamentos rodoviários (FWD, VDR, MuMeter, Mancha de Areia, Pêndulo Britânico, Viga Benkelman, ICP e Retro Refletância), com controle de acesso por papéis, trilha de auditoria, anexos (KML/PDF/imagens) e view pronta para Power BI.

**Stack:** Next.js 14 (App Router) · Supabase (PostgreSQL + Auth + Storage) · Tailwind CSS · Zod.

## Papéis e permissões

| Ação | Solicitante | Aprovador | Editor | Admin |
|---|---|---|---|---|
| Criar OS | ✅ | ✅ (nasce aprovada) | ❌ | ✅ |
| Ver OS | Só as próprias | Todas | Todas | Todas |
| Aprovar / Rejeitar | ❌ | ✅ (não a própria) | ❌ | ✅ |
| Alterar status operacional | ❌ | ❌ | ✅ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ❌ | ✅ |

Fluxo de status: `pendente → aprovada → em_execucao → concluida` (OS abertas por Aprovador já nascem em `aprovada`), com `rejeitada` (a partir de pendente) e `cancelada` (a partir de qualquer estado não final). Toda transição é validada no backend (`src/lib/permissions.ts`) e gravada em `historico_status`.

## Logo da empresa

Coloque a logomarca em `public/logo-strata.png` (PNG com fundo transparente funciona melhor). Ela aparece na tela de login e na barra superior do dashboard, sobre um chip branco — funciona bem tanto para logos claras quanto escuras.

## Configuração (≈ 15 minutos)

### 1. Criar o projeto no Supabase
1. Acesse https://supabase.com, crie um projeto e guarde a senha do banco.
2. No **SQL Editor**, cole e execute o conteúdo de `supabase/migrations/001_schema.sql`. (Se você já tinha rodado a versão anterior da 001, execute apenas a `002_novos_tipos.sql`.)
3. Em **Storage**, crie um bucket chamado `anexos` (privado). Adicione duas policies simples: `SELECT` e `INSERT` para o papel `authenticated`.
4. Em **Authentication → Providers → Email**, desative "Allow new users to sign up" (garante que só o Admin cria usuários).

### 2. Configurar o app
```bash
cp .env.example .env.local   # preencha com Settings > API do Supabase
npm install
npm run dev                  # http://localhost:3000
```

### 3. Criar o primeiro Admin (seed)
No painel do Supabase, em **Authentication → Users → Add user**, crie seu usuário com e-mail e senha, marcando "Auto confirm". Depois, no SQL Editor:

```sql
update public.profiles
set papel = 'admin', deve_trocar_senha = false, nome = 'Seu Nome'
where email = 'seu@email.com';
```

A partir daí, todos os demais usuários são criados dentro do app, em **Usuários**, que gera uma senha provisória — o usuário é obrigado a trocá-la no primeiro acesso.

## Segurança em camadas

1. **Middleware** — bloqueia qualquer rota sem sessão.
2. **RLS no PostgreSQL** — leituras filtradas no banco: Solicitante literalmente não recebe OS de terceiros, mesmo que a API seja chamada diretamente.
3. **Server actions** — todas as escritas passam por `permissions.ts` (papel + transição válida + bloqueio de auto-aprovação) antes de tocar o banco via service role. A chave `SUPABASE_SERVICE_ROLE_KEY` nunca chega ao navegador.

## Power BI

Conecte o Power BI Desktop via conector **PostgreSQL** usando o host do banco (Settings → Database no Supabase) e leia a view `public.vw_ordens_completas`. Ela já entrega os campos condicionais achatados em colunas, quem aprovou, horas até aprovação e datas de início/conclusão da execução (SLA).

## Estrutura do projeto

```
supabase/migrations/001_schema.sql   Schema, RLS, triggers, view BI
src/lib/permissions.ts               Matriz de papéis e transições (fonte única)
src/lib/validation.ts                Zod: schemas condicionais FWD/VDR
src/actions/                         Server actions (auth, os, usuarios)
src/app/(app)/dashboard              Kanban/Tabela com filtros e cores
src/app/(app)/os/nova                Formulário dinâmico
src/app/(app)/os/[id]                Detalhe, ações, anexos, histórico
src/app/(app)/admin/usuarios         Gestão de usuários (Admin)
src/app/api/pendentes                Contagem para o sino de notificações
```

## Notificações por e-mail (nova OS)

Quando uma OS é criada, Aprovadores, Editores e Admins **ativos** recebem um e-mail com o resumo e um botão direto para a OS (o criador não recebe o próprio aviso). Configuração:

1. Crie uma conta gratuita em https://resend.com e gere uma **API Key**;
2. Cadastre na Vercel (e no `.env.local`): `RESEND_API_KEY`, `EMAIL_FROM` e `NEXT_PUBLIC_APP_URL`;
3. **Importante**: sem um domínio verificado no Resend, o modo de teste só entrega e-mails para o endereço da própria conta Resend. Para entregar à equipe, verifique o domínio da empresa (Resend → Domains → Add Domain, adicionando os registros DNS indicados) e use um remetente desse domínio no `EMAIL_FROM`;
4. Se `RESEND_API_KEY` não estiver configurada, o app funciona normalmente e apenas registra um aviso no log — o e-mail nunca bloqueia a criação da OS.

## Próximos passos sugeridos
- Campo estruturado de KM/estaca inicial e final (hoje coberto pelo anexo KML enviado na abertura da OS);
- Notificações por e-mail também na aprovação/rejeição (mesma infraestrutura Resend já instalada);
- Tempo real no badge via Supabase Realtime, substituindo o polling de 30 s.
