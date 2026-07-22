// Arquivo central de estilo do app: cores e tipografia padrão usadas em
// todas as telas. Qualquer cor ou tamanho/peso de fonte novo deve entrar
// aqui como token, em vez de valor solto direto no StyleSheet da tela.
export const cores = {
  navy: "#1D2040",
  navyClaro: "#2B3160",
  azul: "#1B7EAD",
  azulEscuro: "#22699B",
  azulClaro: "#EAF4FA",
  azulSuave: "#F0F9FF", // fundo de estado "aberto" / seleção
  azulBordaSuave: "#BAE6FD",
  azulBordaAtiva: "#7DD3FC", // borda de item selecionado (checklist)
  azulForte: "#1D4ED8",
  fundo: "#F5F5F4", // stone-100
  fundoAlt: "#FAFAF9", // stone-50
  cartao: "#FFFFFF",
  branco: "#FFFFFF",
  borda: "#E7E5E4", // stone-200
  bordaInput: "#D6D3D1", // stone-300
  texto: "#1C1917", // stone-900
  textoForte: "#44403C", // stone-700
  textoMuted: "#78716C", // stone-500
  textoFraco: "#A8A29E", // stone-400
  amarelo: "#FFFBEB",
  amareloTexto: "#92400E",
  amareloForte: "#B45309",
  amareloBorda: "#FDE68A",
  verde: "#ECFDF5",
  verdeTexto: "#065F46",
  verdeForte: "#047857",
  verdeBorda: "#A7F3D0",
  vermelho: "#FEF2F2",
  vermelhoTexto: "#B91C1C",
  vermelhoForte: "#DC2626",
  vermelhoBorda: "#FECACA",
  azulBadgeFundo: "#EFF6FF",
  azulBadgeTexto: "#1E40AF",
  azulBadgeBorda: "#BFDBFE",
};

// Escala única de tamanho e peso de fonte usada nos textos do app.
export const fontes = {
  tamanho: {
    xxs: 9,
    xs: 10,
    sm: 11,
    base: 12,
    md: 13,
    lg: 14,
    xl: 15,
    xxl: 16,
    titulo: 20,
    hero: 22,
  },
  peso: {
    medio: "600",
    negrito: "700",
    extra: "800",
  },
};

export const STATUS_CFG = {
  pendente: { label: "Pendente", cor: cores.amareloTexto, fundo: cores.amarelo, borda: cores.amareloBorda },
  aprovado: { label: "Aprovado", cor: cores.verdeTexto, fundo: cores.verde, borda: cores.verdeBorda },
  recusado: { label: "Recusado", cor: cores.vermelhoTexto, fundo: cores.vermelho, borda: cores.vermelhoBorda },
  pago: { label: "Pago", cor: cores.azulBadgeTexto, fundo: cores.azulBadgeFundo, borda: cores.azulBadgeBorda },
};

export const VIAGEM_CFG = {
  aberta: { label: "Aberta", cor: "#0369A1", fundo: cores.azulSuave, borda: cores.azulBordaSuave },
  fechada: { label: "Acerto fechado", cor: cores.textoForte, fundo: cores.fundo, borda: cores.bordaInput },
};

// Status do acerto individual de um participante dentro da viagem
export const PARTICIPANTE_CFG = {
  aberto: { label: "Em aberto", cor: "#0369A1", fundo: cores.azulSuave, borda: cores.azulBordaSuave },
  fechado: { label: "Fechado", cor: cores.textoForte, fundo: cores.fundo, borda: cores.bordaInput },
};

export const TIPO_CREDITO_CFG = {
  diaria: { label: "Diária" },
  outro: { label: "Outro crédito" },
};

export const ICON_POR_NOME = {
  utensils: "silverware-fork-knife",
  lavanderia: "washing-machine",
  material: "package-variant",
  receipt: "receipt",
};

export const brl = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtData = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export const hoje = () => new Date().toISOString().slice(0, 10);
