# Telealpha · Acerto de Despesas

Aplicativo interno de acerto e conciliação de despesas por viagem.
Stack: **React + Vite + Tailwind CSS v4 + Supabase (PostgreSQL)**.

## Como rodar no VS Code

Pré-requisito: **Node.js 20+** (verifique com `node -v`).

```bash
# 1. Abra a pasta no VS Code e instale as dependências
npm install

# 2. Rode em modo desenvolvimento
npm run dev
# abre em http://localhost:5173
```

O app já funciona de imediato com **dados simulados** (login de
demonstração como Colaborador ou Gestor) — não precisa de banco para
ver o protótipo rodando.

## Conectando ao Supabase (dados reais)

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No painel, abra **SQL Editor** e execute, **nesta ordem**:
   `supabase/migrations/0001_schema_inicial.sql`,
   `supabase/migrations/0002_auth_e_seguranca.sql` (auth real, RLS nas
   demais tabelas, coluna `estabelecimento` e trava de segurança no
   fechamento do acerto) e
   `supabase/migrations/0003_atualiza_categorias.sql` (categorias:
   Alimentação, Lavanderia, Material, Outros) e
   `supabase/migrations/0004_creditos_e_fechamento_individual.sql`
   (créditos/diárias por colaborador + fechamento do acerto individual) e
   `supabase/migrations/0005_troca_senha_obrigatoria.sql` (obriga a
   trocar a senha provisória no primeiro login) e
   `supabase/migrations/0006_desativar_colaborador.sql` (gestor
   desativa/reativa funcionário) e
   `supabase/migrations/0007_notificacao_confirmacao_credito.sql`
   (notifica o gestor, dentro do app, quando um colaborador confirma ou
   contesta um crédito) e
   `supabase/migrations/0008_endurecimento_seguranca.sql` (fecha
   brechas de RLS — veja a seção **Segurança** abaixo).
3. Em **Storage**, crie os buckets `comprovantes` (fotos das notas) e
   `relatorios` (PDFs de acerto).
4. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL`
   e `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
5. Pronto — com `.env.local` preenchido, o app detecta automaticamente
   o Supabase configurado (`src/lib/supabase.js`) e usa dados reais via
   `src/lib/api.js`, com tela de login por e-mail/senha
   (`Authentication → Users` no painel para criar as primeiras contas).

### Criando usuários e promovendo um gestor

O próprio gestor cadastra novos funcionários **de dentro do app** (aba
"Equipe" no web e no mobile) — define nome, e-mail e uma senha
provisória, que deve repassar ao funcionário por fora do app (ela não
fica salva em nenhum lugar visível depois do cadastro). A conta já
nasce com papel `colaborador` (trigger `on_auth_user_created`) e com
`senha_provisoria = true` — no primeiro login, o app trava numa tela
obrigatória de troca de senha antes de liberar qualquer outra tela.

**Importante:** para o funcionário conseguir entrar imediatamente com
a senha provisória, desligue a confirmação por e-mail do projeto:
**Authentication → Providers → Email → "Confirm email"** (deixe
desmarcado). Com essa opção ligada (padrão do Supabase), a conta é
criada mas fica bloqueada até alguém clicar num link de confirmação
que o app não envia.

Alternativa manual, sem passar pelo app: cadastrar direto em
**Authentication → Users → Add user** no painel (marcando **Auto
Confirm User**).

Para tornar alguém gestor (não tem tela para isso — é uma exceção
rara), rode no SQL Editor:

```sql
update usuarios set papel = 'gestor' where email = 'fulano@empresa.com';
```

### Funcionário esqueceu a senha

Na aba "Equipe", o gestor clica em **"Redefinir senha"** ao lado do
nome — isso dispara um e-mail de redefinição para o funcionário, que
define a própria senha nova ao clicar no link. Quando ele salva a
nova senha, `senha_provisoria` também é zerada (não precisa trocar de
novo no login seguinte).

Isso exige duas coisas configuradas no painel do Supabase:

1. **Authentication → URL Configuration → Redirect URLs**: adicione a
   URL onde o app **web** roda (ex.: `http://localhost:5173` em
   desenvolvimento, e a URL real depois que publicar o app). É essa
   página que recebe o link do e-mail e mostra a tela de nova senha —
   o app mobile não trata esse link diretamente, então o funcionário
   sempre define a senha nova pelo navegador (mesmo se só usa o
   celular no dia a dia), e depois loga normalmente no app mobile com
   a senha atualizada.
2. **Authentication → URL Configuration → Site URL**: mesma URL do
   item acima — é o destino padrão usado quando o link é disparado
   pelo app mobile (que não informa `redirectTo` explicitamente).

Como esse fluxo também depende do envio de e-mail pelo Supabase, ele
está sujeito ao mesmo limite de envio que pode gerar o erro "email
rate limit exceeded" em testes seguidos — espere alguns minutos entre
tentativas. Se clicar em "Redefinir senha" e nada parecer acontecer,
abra o Console do navegador (F12) — os erros dessa chamada são
logados lá (`Falha ao enviar redefinição de senha: ...`), o que ajuda
a identificar se é a URL de redirecionamento que falta configurar, o
limite de e-mail, ou outra coisa.

### Removendo um funcionário

Não existe exclusão de verdade — apagar a conta de outra pessoa exige
uma chave privilegiada que nunca deve ficar no código do app, e mesmo
com ela, apagar quebraria despesas/viagens/créditos que esse
funcionário já lançou (é histórico financeiro). Por isso, na aba
"Equipe", o botão **"Desativar"** marca o funcionário como inativo:
ele não consegue mais logar e some das listas de novas viagens, mas
tudo que ele já lançou continua nos relatórios normalmente. Dá para
reverter a qualquer momento com **"Reativar"**.

## Segurança

Migration `0008_endurecimento_seguranca.sql` corrige quatro brechas
encontradas numa revisão do projeto — rode-a mesmo em projetos já em
produção (é segura de aplicar sobre dados existentes):

1. **Tabela de auditoria sem RLS.** `despesa_eventos` nunca teve Row
   Level Security habilitado — qualquer usuário autenticado conseguia
   ler, gravar ou apagar o histórico de aprovações/recusas de despesas
   de toda a empresa direto pela API REST do Supabase. Agora só é
   possível ler os próprios eventos (ou todos, sendo gestor); escrever
   só acontece pela trigger interna.
2. **Views bypassavam a RLS de despesas.** `vw_acerto_viagem`,
   `vw_resumo_colaborador` e `vw_gastos_mensais` rodavam com o
   privilégio de quem criou a view (comportamento padrão do Postgres),
   não de quem consulta — na prática, qualquer usuário autenticado
   conseguia puxar os dados financeiros de todos os colaboradores por
   essas views, ignorando a RLS de `despesas`. Agora usam
   `security_invoker`, então respeitam a RLS de quem está logado.
3. **"Desativar funcionário" não revogava acesso de verdade.** A
   flag `ativo` só escondia o colaborador das listas do app — a conta
   continuava valendo para todo o resto (a sessão dele simplesmente
   nunca era invalidada no banco). Agora `ativo` é checado em todas as
   policies e RPCs sensíveis: uma conta desativada perde acesso a
   despesas, viagens e créditos mesmo que ainda consiga autenticar.
4. **Bypass das regras de confirmação/fechamento via API direta.** As
   policies que permitem ao gestor atualizar `creditos_viagem` e
   `viagem_participantes` eram amplas demais: davam para reescrever
   `confirmado`/`confirmado_em` de um crédito (fingindo que o
   colaborador confirmou algo que ele não confirmou) ou forçar o
   fechamento de um participante sem resolver despesas/créditos
   pendentes — bastava chamar a API REST direto, pulando as RPCs
   `confirmar_credito` e `fechar_acerto_participante` que existem
   exatamente para impedir isso. Agora essas colunas só mudam através
   das RPCs (uma trigger bloqueia qualquer outra via).

**Avaliado e deixado como está, por decisão consciente:** o cadastro
de colaboradores usa `supabase.auth.signUp` (mesma API pública que
qualquer app usa para login), então qualquer pessoa com a URL/anon key
do projeto (que fica embutida no bundle do app — é pública por
natureza) consegue se autocadastrar como colaborador sem passar pelo
gestor. Depois das correções acima, essa conta forjada não enxerga
despesas, viagens ou créditos de ninguém (a RLS barra por não ser
participante de nada), mas ainda consegue ler nome/e-mail de toda a
equipe (policy `usuarios_select`, necessária para listar participantes
nas viagens). Fechar isso de vez exige ou (a) restringir o cadastro a
um domínio de e-mail corporativo — trivial de adicionar em
`handle_new_user()` — ou (b) desligar o cadastro público no projeto e
passar a criar colaboradores por uma Edge Function com a service role
key. Nenhuma das duas foi aplicada por enquanto.

**Fora do escopo do banco, vale revisar também:**
- No painel do Supabase, em **Authentication → Rate Limits**, os
  limites padrão de tentativas de login/e-mail já ajudam contra força
  bruta — não há nada a mudar no código para isso.
- A senha provisória do web (`gerarSenhaProvisoria` em `src/App.jsx`)
  agora usa `crypto.getRandomValues`. A versão do mobile
  (`mobile/src/screens/gestor/NovoColaboradorScreen.js`) ainda usa
  `Math.random` — não é crítico (é uma senha de uso único, trocada
  obrigatoriamente no primeiro login), mas para igualar ao web seria
  necessário adicionar a dependência nativa `expo-crypto`.
- A sessão do app mobile fica em `AsyncStorage` (não criptografado no
  dispositivo). Para um app com dados financeiros, o ideal é trocar
  por `expo-secure-store` (Keychain/Keystore) — também depende de
  adicionar uma dependência nativa nova, por isso não foi feito nesta
  rodada.
- Os buckets `comprovantes` e `relatorios` do Storage (passo 3 acima)
  ainda não têm nenhuma policy de acesso — hoje não são um risco
  porque nenhuma tela do app efetivamente faz upload para eles ainda
  (a foto do comprovante no mobile é só local, para o OCR). Quando essa
  integração for implementada, é essencial criar policies de Storage
  (ex.: colaborador só lê/escreve os próprios comprovantes; relatórios
  só o gestor) antes de ligar o upload de verdade.
- `.env.example` do app web tinha a URL e a anon key **reais** do
  projeto commitadas como "exemplo" (já corrigido para um placeholder,
  igual ao `mobile/.env.example`). Como este projeto ainda não é um
  repositório Git, essa chave nunca chegou a ser publicada — mas se
  esta pasta já foi compartilhada por fora (zip, upload, etc.), vale
  considerar girar a anon key em **Project Settings → API** por
  precaução.

## Estrutura

```
acerto-telealpha/
├── index.html
├── vite.config.js
├── package.json
├── .env.example              # modelo das variáveis do Supabase
├── src/
│   ├── main.jsx              # bootstrap React
│   ├── index.css             # Tailwind v4 + tokens da marca
│   ├── App.jsx               # AppDemo (mock) + AppReal (Supabase), 2 perfis + viagens + relatório
│   ├── lib/supabase.js       # cliente Supabase (null se .env.local não configurado)
│   ├── lib/api.js            # camada de dados: auth + CRUD contra o Supabase
│   └── assets/logo.png       # logo oficial Telealpha
├── mobile/                    # app React Native (Expo) — mesmo backend, telas mobile-first
│   └── src/                    # lib/api.js, context/, navigation/, screens/ (colaborador/gestor)
├── supabase/
│   └── migrations/
│       ├── 0001_schema_inicial.sql               # tabelas, triggers, RLS (despesas), views
│       ├── 0002_auth_e_seguranca.sql             # auth real, RLS completa, coluna estabelecimento
│       ├── 0003_atualiza_categorias.sql          # categorias: Alimentação, Lavanderia, Material, Outros
│       ├── 0004_creditos_e_fechamento_individual.sql # créditos/diárias + fechamento por colaborador
│       ├── 0005_troca_senha_obrigatoria.sql      # troca de senha obrigatória no primeiro login
│       ├── 0006_desativar_colaborador.sql        # gestor desativa/reativa funcionário
│       ├── 0007_notificacao_confirmacao_credito.sql # notifica gestor (in-app) ao confirmar/contestar crédito
│       └── 0008_endurecimento_seguranca.sql      # RLS/views/RPCs — ver seção Segurança
└── scripts/
    └── gerar_relatorio_acerto.py     # gerador do PDF de acerto (backend)
```

## Roadmap sugerido de evolução

1. ~~**Autenticação real** — Supabase Auth (e-mail/senha) + tabela `usuarios`.~~ ✅ feito (`AppReal`, `src/lib/api.js`, migration `0002`).
2. **Quebrar o `App.jsx`** em `pages/` e `components/` conforme a
   estrutura crescer (o protótipo é um arquivo único de propósito,
   para facilitar a leitura inicial).
3. **Upload real de comprovantes** — Storage + OCR (Google Vision /
   AWS Textract) via Edge Function preenchendo `despesas.ocr_dados`.
4. **PDF em produção** — portar `scripts/gerar_relatorio_acerto.py`
   para uma Edge Function (pdf-lib) ou rodar como serviço Python,
   salvando em `relatorios/` e gravando `viagens.relatorio_url`.
5. **Realtime** — assinar mudanças em `despesas` para a conciliação do
   gestor atualizar sozinha quando um colaborador lança despesa.

## Regras de negócio garantidas no banco

- Só **participantes** lançam despesa na viagem (trigger).
- **Recusa exige motivo** (constraint).
- Trilha de auditoria imutável em `despesa_eventos`.
- **O fechamento do acerto é individual, por colaborador** (`viagem_participantes.status`),
  não pela viagem toda — cada participante segue no seu próprio ritmo.
  Quando todos os participantes de uma viagem já fecharam, a viagem em si
  passa a exibir `status = 'fechada'` automaticamente (é só um resumo visual).
- Colaborador com o acerto **fechado não lança mais despesas** nem recebe
  novos créditos naquela viagem (triggers).
- **Fechamento de um colaborador é bloqueado** (`fechar_acerto_participante()`
  via RPC) enquanto ele tiver despesas pendentes **ou** créditos/diárias
  ainda não confirmados por ele.
- Créditos/diárias (`creditos_viagem`) só podem ser confirmados pelo próprio
  colaborador que os recebeu (`confirmar_credito()` via RPC).
