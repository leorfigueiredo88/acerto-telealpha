// Camada de acesso a dados — mesmo contrato usada no app web
// (src/lib/api.js), convertendo entre o schema do Supabase
// (snake_case) e o formato usado pelas telas (camelCase).
import { supabase, supabaseSemSessao } from "./supabase";

function mapUsuario(u) {
  return { id: u.id, nome: u.nome, email: u.email, papel: u.papel, senhaProvisoria: u.senha_provisoria, ativo: u.ativo };
}

function mapCategoria(c) {
  return { id: c.id, nome: c.nome, icone: c.icone };
}

function mapParticipante(p) {
  return {
    usuarioId: p.usuario_id,
    status: p.status,
    fechadoPor: p.fechado_por ?? undefined,
    fechadoEm: p.fechado_em ?? undefined,
  };
}

function mapViagem(v) {
  return {
    id: v.id,
    nome: v.nome,
    destino: v.destino,
    inicio: v.data_inicio,
    fim: v.data_fim,
    status: v.status,
    participantes: (v.viagem_participantes ?? []).map(mapParticipante),
    criadaPor: v.criada_por,
  };
}

function mapDespesa(d) {
  return {
    id: d.id,
    viagemId: d.viagem_id,
    usuarioId: d.usuario_id,
    categoriaId: d.categoria_id,
    valor: Number(d.valor),
    data: d.data_despesa,
    descricao: d.descricao,
    estabelecimento: d.estabelecimento ?? "",
    status: d.status,
    motivoRecusa: d.motivo_recusa ?? undefined,
    aprovadoPor: d.aprovado_por ?? undefined,
  };
}

function mapCredito(c) {
  return {
    id: c.id,
    viagemId: c.viagem_id,
    usuarioId: c.usuario_id,
    tipo: c.tipo,
    valor: Number(c.valor),
    descricao: c.descricao ?? "",
    lancadoPor: c.lancado_por,
    confirmado: c.confirmado, // null = aguardando · true = recebido · false = não recebido
    confirmadoEm: c.confirmado_em ?? undefined,
    notificacaoLida: c.notificacao_lida,
  };
}

/* ---------- autenticação ---------- */
export async function signIn(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return data.subscription;
}

/* ---------- leitura ---------- */
export async function fetchPerfil(usuarioId) {
  const { data, error } = await supabase.from("usuarios").select("*").eq("id", usuarioId).single();
  if (error) throw error;
  return mapUsuario(data);
}

// Traz todo mundo (ativo e inativo) — a tela Equipe do gestor precisa ver
// e reativar quem está desativado. Quem só precisa de gente ativa (ex.:
// seletor de participantes de uma viagem) filtra u.ativo no próprio uso.
export async function fetchUsuarios() {
  const { data, error } = await supabase.from("usuarios").select("*").order("nome");
  if (error) throw error;
  return data.map(mapUsuario);
}

export async function fetchCategorias() {
  const { data, error } = await supabase.from("categorias").select("*").eq("ativo", true).order("id");
  if (error) throw error;
  return data.map(mapCategoria);
}

export async function fetchViagens() {
  const { data, error } = await supabase
    .from("viagens")
    .select("*, viagem_participantes(usuario_id, status, fechado_por, fechado_em)")
    .order("data_inicio", { ascending: false });
  if (error) throw error;
  return data.map(mapViagem);
}

export async function fetchDespesas() {
  const { data, error } = await supabase.from("despesas").select("*").order("data_despesa", { ascending: false });
  if (error) throw error;
  return data.map(mapDespesa);
}

export async function fetchCreditos() {
  const { data, error } = await supabase.from("creditos_viagem").select("*").order("criado_em", { ascending: false });
  if (error) throw error;
  return data.map(mapCredito);
}

/* ---------- escrita ---------- */
export async function criarDespesa({ viagemId, usuarioId, valor, categoriaId, data, descricao, estabelecimento }) {
  const { error } = await supabase.from("despesas").insert({
    viagem_id: viagemId,
    usuario_id: usuarioId,
    categoria_id: categoriaId,
    valor,
    data_despesa: data,
    descricao,
    estabelecimento: estabelecimento || null,
  });
  if (error) throw error;
}

export async function decidirDespesa(id, status, motivoRecusa, aprovadoPor) {
  const { error } = await supabase
    .from("despesas")
    .update({
      status,
      motivo_recusa: motivoRecusa ?? null,
      aprovado_por: aprovadoPor,
      aprovado_em: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function criarViagem({ nome, destino, inicio, fim, participantes, criadaPor }) {
  const { data: viagem, error } = await supabase
    .from("viagens")
    .insert({ nome, destino, data_inicio: inicio, data_fim: fim, criada_por: criadaPor })
    .select()
    .single();
  if (error) throw error;

  const linhas = participantes.map((usuario_id) => ({ viagem_id: viagem.id, usuario_id }));
  const { error: perr } = await supabase.from("viagem_participantes").insert(linhas);
  if (perr) throw perr;

  return viagem.id;
}

// Gestor estende (ou corrige) a data de término de uma viagem já criada —
// útil quando a viagem acaba durando mais do que o previsto.
//
// Usa .select() pra forçar o Postgres a devolver a linha alterada: sem
// isso, um UPDATE bloqueado pela RLS (ex.: usuário não é gestor, ou não
// está ativo) retorna sucesso silencioso — 0 linhas afetadas, sem erro
// — e a UI acha que salvou quando na verdade nada mudou no banco.
export async function atualizarDataFimViagem(viagemId, novaDataFim) {
  const { data, error } = await supabase
    .from("viagens")
    .update({ data_fim: novaDataFim })
    .eq("id", viagemId)
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Não foi possível atualizar a viagem — confira se você está logado como gestor.");
  }
}

export async function criarCredito({ viagemId, usuarioId, tipo, valor, descricao, lancadoPor }) {
  const { error } = await supabase.from("creditos_viagem").insert({
    viagem_id: viagemId,
    usuario_id: usuarioId,
    tipo,
    valor,
    descricao: descricao || null,
    lancado_por: lancadoPor,
  });
  if (error) throw error;
}

export async function confirmarCredito(id, confirmado) {
  const { error } = await supabase.rpc("confirmar_credito", { p_credito_id: id, p_confirmado: confirmado });
  if (error) throw error;
}

// Gestor "vê" as confirmações/contestações de crédito de uma viagem —
// derruba o indicador de notificação (não usa RPC: a policy de UPDATE
// de creditos_viagem para gestor já cobre essa coluna).
export async function marcarCreditosVistos(viagemId) {
  const { error } = await supabase
    .from("creditos_viagem")
    .update({ notificacao_lida: true })
    .eq("viagem_id", viagemId)
    .eq("notificacao_lida", false);
  if (error) throw error;
}

export async function fecharAcertoParticipante(viagemId, usuarioId) {
  const { error } = await supabase.rpc("fechar_acerto_participante", {
    p_viagem_id: viagemId,
    p_usuario_id: usuarioId,
  });
  if (error) throw error;
}

// Cadastra a conta de login do novo colaborador (papel "colaborador" é
// atribuído automaticamente pelo trigger on_auth_user_created no banco).
// Usa supabaseSemSessao para não substituir a sessão do gestor logado.
// Requer que "Confirm email" esteja desligado no projeto Supabase
// (Authentication → Providers → Email), senão o funcionário só consegue
// entrar depois de confirmar o e-mail.
export async function criarColaborador({ nome, email, senha }) {
  const { error } = await supabaseSemSessao.auth.signUp({
    email,
    password: senha,
    options: { data: { nome } },
  });
  if (error) throw error;
}

// Troca a senha do usuário logado e derruba a flag "senha_provisoria",
// usada para forçar a troca no primeiro login (senha definida pelo gestor).
export async function trocarSenha(novaSenha) {
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) throw error;
  const { error: erroFlag } = await supabase.rpc("marcar_senha_trocada");
  if (erroFlag) throw erroFlag;
}

// Gestor aciona o envio do e-mail de redefinição de senha para um
// colaborador que esqueceu a senha. O link de recuperação abre no
// navegador (não tem deep link de volta pro app mobile) — por isso usa
// a "Site URL" configurada no painel do Supabase como destino, que deve
// apontar para o app web publicado (é lá que a nova senha é definida).
export async function enviarRedefinicaoSenha(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    console.error("Falha ao enviar redefinição de senha:", error);
    throw error;
  }
}

// Gestor desativa/reativa um funcionário — ele deixa de aparecer nas
// listas de participantes e não consegue mais logar, mas despesas,
// viagens e créditos já lançados por ele continuam intactos.
export async function definirStatusColaborador(usuarioId, ativo) {
  const { error } = await supabase.rpc("definir_status_colaborador", {
    p_usuario_id: usuarioId,
    p_ativo: ativo,
  });
  if (error) throw error;
}

// Inclui novos participantes numa viagem já existente. Cada um entra com
// status "aberto" (o valor default da coluna) — o fechamento continua
// individual, então isso não mexe em quem já está fechado na viagem.
export async function adicionarParticipantes(viagemId, usuarioIds) {
  const linhas = usuarioIds.map((usuario_id) => ({ viagem_id: viagemId, usuario_id }));
  const { error } = await supabase.from("viagem_participantes").insert(linhas);
  if (error) throw error;
}
