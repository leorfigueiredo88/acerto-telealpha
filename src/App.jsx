import { useState, useMemo, useEffect } from "react";
import {
  Utensils, WashingMachine, Package, Receipt, Camera, CheckCircle2, XCircle, Clock,
  Banknote, LogOut, Plus, History, LayoutDashboard, ScanLine, Loader2,
  ChevronRight, Filter, TrendingUp, Inbox, X, ShieldCheck, Plane,
  Users, Lock, FileText, Printer, MapPin, CalendarRange, ChevronLeft,
  Wallet, HandCoins, BadgeCheck, BadgeAlert, UserPlus, RefreshCw, KeyRound, Send, UserX, UserCheck
} from "lucide-react";
import { supabase } from "./lib/supabase";
import * as api from "./lib/api";

/* ============================================================
   MARCA TELEALPHA — cores extraídas da logo oficial
   navy #1D2040 · azul #1B7EAD
   ============================================================ */
const LOGO_FULL = "data:image/png;base64,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";
const LOGO_MARK = "data:image/png;base64,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";

/* ============================================================
   DADOS SIMULADOS (substituir por chamadas ao Supabase)
   ============================================================ */
// "let" (não "const"): no modo com Supabase conectado (ver AppReal),
// essas listas são substituídas pelos dados reais assim que chegam da
// API — catById()/userById() sempre leem o valor atual no momento da
// chamada, então os componentes já existentes passam a refletir os
// dados reais sem precisar receber tudo via props.
let CATEGORIAS = [
  { id: 1, nome: "Alimentação", Icon: Utensils },
  { id: 2, nome: "Lavanderia", Icon: WashingMachine },
  { id: 3, nome: "Material", Icon: Package },
  { id: 4, nome: "Outros", Icon: Receipt },
];

let USUARIOS = [
  { id: "u1", nome: "Ana Ribeiro", email: "ana@empresa.com", papel: "colaborador" },
  { id: "u2", nome: "Carlos Mota", email: "carlos@empresa.com", papel: "colaborador" },
  { id: "u3", nome: "Juliana Prado", email: "juliana@empresa.com", papel: "gestor" },
];

// Mapeia o campo "icone" (texto, vindo do banco) para o componente de ícone.
const ICON_MAP = { utensils: Utensils, lavanderia: WashingMachine, material: Package, receipt: Receipt };

// "participantes" é uma lista de objetos { usuarioId, status, fechadoPor?, fechadoEm? }:
// o fechamento do acerto é individual, por colaborador, não pela viagem toda
// (viagem.status só reflete um resumo — vira "fechada" quando todo mundo já fechou).
const VIAGENS_INICIAIS = [
  {
    id: "v1", nome: "Visita técnica — Cliente Norsul", destino: "Salvador/BA",
    inicio: "2026-07-08", fim: "2026-07-12", status: "aberta",
    participantes: [
      { usuarioId: "u1", status: "aberto" },
      { usuarioId: "u2", status: "aberto" },
    ],
    criadaPor: "u3",
  },
  {
    id: "v2", nome: "Feira de Negócios do Nordeste", destino: "Recife/PE",
    inicio: "2026-06-24", fim: "2026-07-06", status: "aberta",
    participantes: [
      { usuarioId: "u1", status: "fechado", fechadoPor: "u3", fechadoEm: "2026-07-07T14:00:00Z" },
      { usuarioId: "u2", status: "aberto" },
    ],
    criadaPor: "u3",
  },
];

const DESPESAS_INICIAIS = [
  { id: "d1", viagemId: "v1", usuarioId: "u1", categoriaId: 1, valor: 68.5, data: "2026-07-10", descricao: "Almoço com fornecedor", status: "pendente", estabelecimento: "Restaurante Sabor da Terra" },
  { id: "d2", viagemId: "v1", usuarioId: "u1", categoriaId: 3, valor: 245.9, data: "2026-07-09", descricao: "Material de apresentação para o cliente", status: "pendente", estabelecimento: "Gráfica Rápida Salvador" },
  { id: "d3", viagemId: "v1", usuarioId: "u1", categoriaId: 2, valor: 42.0, data: "2026-07-08", descricao: "Lavanderia do hotel", status: "aprovado", estabelecimento: "Hotel Vila Bahia" },
  { id: "d6", viagemId: "v1", usuarioId: "u2", categoriaId: 1, valor: 189.75, data: "2026-07-11", descricao: "Jantar com equipe de campo", status: "pendente", estabelecimento: "Restaurante Ponto do Peixe" },
  { id: "d4", viagemId: "v2", usuarioId: "u1", categoriaId: 1, valor: 54.2, data: "2026-06-28", descricao: "Jantar em viagem", status: "pago", estabelecimento: "Churrascaria Boi na Brasa" },
  { id: "d5", viagemId: "v2", usuarioId: "u1", categoriaId: 4, valor: 35.0, data: "2026-06-25", descricao: "Estacionamento aeroporto", status: "recusado", motivoRecusa: "Comprovante ilegível. Reenviar foto nítida.", estabelecimento: "EstaPark Aeroporto" },
  { id: "d7", viagemId: "v2", usuarioId: "u2", categoriaId: 2, valor: 38.0, data: "2026-07-02", descricao: "Lavanderia do hotel", status: "aprovado", estabelecimento: "Ibis Recife" },
  { id: "d8", viagemId: "v2", usuarioId: "u2", categoriaId: 1, valor: 42.9, data: "2026-07-01", descricao: "Café com equipe de campo", status: "pago", estabelecimento: "Padaria Pão Dourado" },
];

// "confirmado": null = aguardando o colaborador confirmar · true = recebido · false = colaborador diz que não recebeu
const CREDITOS_INICIAIS = [
  { id: "c1", viagemId: "v1", usuarioId: "u1", tipo: "diaria", valor: 400, descricao: "Diárias 08 a 12/07 (4 dias)", lancadoPor: "u3", confirmado: true, confirmadoEm: "2026-07-08T09:00:00Z", notificacaoLida: false },
  { id: "c2", viagemId: "v1", usuarioId: "u2", tipo: "diaria", valor: 400, descricao: "Diárias 08 a 12/07 (4 dias)", lancadoPor: "u3", confirmado: null, notificacaoLida: true },
  { id: "c3", viagemId: "v2", usuarioId: "u1", tipo: "diaria", valor: 260, descricao: "Diárias 24/06 a 06/07", lancadoPor: "u3", confirmado: true, confirmadoEm: "2026-07-07T08:30:00Z", notificacaoLida: true },
  { id: "c4", viagemId: "v2", usuarioId: "u2", tipo: "outro", valor: 150, descricao: "Adiantamento para hospedagem extra", lancadoPor: "u3", confirmado: false, confirmadoEm: "2026-07-05T18:00:00Z", notificacaoLida: false },
];

/* ============================================================
   HELPERS
   ============================================================ */
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtData = (iso) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
const fmtDataHora = (iso) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const catById = (id) => CATEGORIAS.find((c) => c.id === id);
const userById = (id) => USUARIOS.find((u) => u.id === id);
const participanteDe = (viagem, usuarioId) => viagem?.participantes.find((p) => p.usuarioId === usuarioId);
const hoje = () => new Date().toISOString().slice(0, 10);

const STATUS_CFG = {
  pendente: { label: "Pendente", Icon: Clock, cls: "bg-amber-50 text-amber-800 border-amber-200" },
  aprovado: { label: "Aprovado", Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  recusado: { label: "Recusado", Icon: XCircle, cls: "bg-red-50 text-red-800 border-red-200" },
  pago: { label: "Pago", Icon: Banknote, cls: "bg-blue-50 text-blue-800 border-blue-200" },
};

const VIAGEM_CFG = {
  aberta: { label: "Aberta", cls: "bg-sky-50 text-sky-800 border-sky-200" },
  fechada: { label: "Acerto fechado", cls: "bg-stone-100 text-stone-700 border-stone-300" },
};

const PARTICIPANTE_CFG = {
  aberto: { label: "Em aberto", cls: "bg-sky-50 text-sky-800 border-sky-200" },
  fechado: { label: "Fechado", cls: "bg-stone-100 text-stone-700 border-stone-300" },
};

const TIPO_CREDITO_CFG = {
  diaria: { label: "Diária" },
  outro: { label: "Outro crédito" },
};

function StatusBadge({ status }) {
  const { label, Icon, cls } = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      <Icon size={12} strokeWidth={2.5} /> {label}
    </span>
  );
}

function ViagemBadge({ status }) {
  const { label, cls } = VIAGEM_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status === "fechada" ? <Lock size={11} /> : <Plane size={11} />} {label}
    </span>
  );
}

function ParticipanteBadge({ status }) {
  const { label, cls } = PARTICIPANTE_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status === "fechado" ? <Lock size={11} /> : <Clock size={11} />} {label}
    </span>
  );
}

/* Uma linha de crédito (diária/outro repasse) lançado para o colaborador */
function LinhaCredito({ credito, onConfirmar }) {
  const cfg = TIPO_CREDITO_CFG[credito.tipo];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
        <HandCoins size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-stone-900">
          {cfg.label}{credito.descricao ? ` — ${credito.descricao}` : ""}
          {!onConfirmar && !credito.notificacaoLida && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Novo</span>
          )}
        </p>
        <p className="text-xs text-stone-500">
          {credito.confirmado === true && <>Confirmado em {fmtDataHora(credito.confirmadoEm)}</>}
          {credito.confirmado === false && <span className="text-red-600">Colaborador marcou como não recebido</span>}
          {credito.confirmado === null && <>Aguardando confirmação do colaborador</>}
        </p>
      </div>
      <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-stone-900">{brl(credito.valor)}</span>
      {onConfirmar && credito.confirmado !== true && (
        <div className="flex shrink-0 gap-1.5">
          <button onClick={() => onConfirmar(credito.id, true)} title="Confirmar recebimento"
            className={`rounded-lg border p-1.5 transition ${credito.confirmado === true ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-stone-200 text-stone-400 hover:border-emerald-300 hover:text-emerald-600"}`}>
            <BadgeCheck size={16} />
          </button>
          <button onClick={() => onConfirmar(credito.id, false)} title="Ainda não recebi"
            className={`rounded-lg border p-1.5 transition ${credito.confirmado === false ? "border-red-300 bg-red-50 text-red-700" : "border-stone-200 text-stone-400 hover:border-red-300 hover:text-red-600"}`}>
            <BadgeAlert size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* Comprovante simulado em estilo "bobina térmica" */
function ComprovanteTermico({ despesa, compacto }) {
  const cat = catById(despesa.categoriaId);
  const serra = "polygon(0 100%, 4% 0, 8% 100%, 12% 0, 16% 100%, 20% 0, 24% 100%, 28% 0, 32% 100%, 36% 0, 40% 100%, 44% 0, 48% 100%, 52% 0, 56% 100%, 60% 0, 64% 100%, 68% 0, 72% 100%, 76% 0, 80% 100%, 84% 0, 88% 100%, 92% 0, 96% 100%, 100% 0)";
  const serraInv = "polygon(0 0, 4% 100%, 8% 0, 12% 100%, 16% 0, 20% 100%, 24% 0, 28% 100%, 32% 0, 36% 100%, 40% 0, 44% 100%, 48% 0, 52% 100%, 56% 0, 60% 100%, 64% 0, 68% 100%, 72% 0, 76% 100%, 80% 0, 84% 100%, 88% 0, 92% 100%, 96% 0, 100% 100%)";
  return (
    <div className={`select-none font-mono text-[11px] leading-relaxed text-stone-700 ${compacto ? "w-56" : "mx-auto w-64"}`}>
      <div className="h-3 bg-stone-50" style={{ clipPath: serra }} />
      <div className="bg-stone-50 px-4 py-3 shadow-inner">
        <p className="text-center font-bold uppercase tracking-widest text-stone-800">{despesa.estabelecimento || "Estabelecimento"}</p>
        <p className="text-center text-stone-500">CNPJ 12.345.678/0001-90</p>
        <div className="my-2 border-t border-dashed border-stone-300" />
        <div className="flex justify-between"><span>DATA</span><span>{fmtData(despesa.data)}</span></div>
        <div className="flex justify-between"><span>CATEGORIA</span><span className="uppercase">{cat?.nome}</span></div>
        <div className="my-2 border-t border-dashed border-stone-300" />
        <div className="flex justify-between text-sm font-bold text-stone-900">
          <span>TOTAL</span><span>{brl(despesa.valor)}</span>
        </div>
        <div className="my-2 border-t border-dashed border-stone-300" />
        <p className="text-center text-stone-400">*** DOCUMENTO NAO FISCAL ***</p>
        <p className="text-center text-stone-400">simulacao de comprovante</p>
      </div>
      <div className="h-3 bg-stone-50" style={{ clipPath: serraInv }} />
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="no-print fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
      {msg}
    </div>
  );
}

/* ============================================================
   LOGIN
   ============================================================ */
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src={LOGO_FULL} alt="Telealpha" className="mx-auto mb-3 h-12 w-auto" />
          <p className="text-sm text-stone-500">Acerto e conciliação de despesas por viagem</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">E-mail corporativo</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@telealpha.com.br"
            className="mb-3 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Senha</label>
          <input type="password" placeholder="••••••••"
            className="mb-5 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />
          <p className="mb-2 text-center text-xs text-stone-400">Protótipo — escolha um perfil para entrar</p>
          <button onClick={() => onLogin(USUARIOS[0])}
            className="btn-brand mb-2 w-full rounded-lg py-2.5 text-sm font-semibold">
            Entrar como Colaborador (Ana)
          </button>
          <button onClick={() => onLogin(USUARIOS[2])}
            className="btn-accent-outline w-full rounded-lg py-2.5 text-sm font-semibold">
            Entrar como Gestor (Juliana)
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CASCA DO APP
   ============================================================ */
function Shell({ user, onLogout, tabs, tab, setTab, children }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="no-print sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_MARK} alt="Telealpha" className="h-9 w-auto" />
            <div>
              <p className="text-sm font-bold leading-none text-brand">Telealpha · Acerto</p>
              <p className="mt-0.5 text-[11px] leading-none text-stone-500">
                {user.papel === "gestor" ? "Painel do Gestor" : "Painel do Colaborador"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-stone-700 sm:block">{user.nome}</span>
            <button onClick={onLogout} title="Sair"
              className="rounded-lg border border-stone-200 p-2 text-stone-500 transition hover:bg-stone-50 hover:text-stone-800">
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                tab === id ? "tab-active" : "text-stone-600 hover:bg-stone-100"
              }`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

/* ============================================================
   COMPONENTES COMPARTILHADOS
   ============================================================ */
function CardResumo({ label, valor, qtd, Icon, tone }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</span>
        <span className={`rounded-lg p-1.5 ${tone}`}><Icon size={15} /></span>
      </div>
      <p className="mt-2 font-mono text-2xl font-bold tabular-nums tracking-tight text-stone-900">{brl(valor)}</p>
      <p className="mt-0.5 text-xs text-stone-500">{qtd} {qtd === 1 ? "lançamento" : "lançamentos"}</p>
    </div>
  );
}

function LinhaDespesa({ d, viagem, mostrarColab, onClick }) {
  const cat = catById(d.categoriaId);
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white p-3.5 text-left shadow-sm ${onClick ? "transition hover-accent-border hover:shadow" : ""}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
        <cat.Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-stone-900">{d.descricao}</p>
        <p className="text-xs text-stone-500">
          {mostrarColab && <>{userById(d.usuarioId)?.nome} · </>}
          {cat.nome} · {fmtData(d.data)}
          {viagem && <> · <span className="text-accent">{viagem.nome}</span></>}
        </p>
        {d.status === "recusado" && d.motivoRecusa && (
          <p className="mt-1 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">Motivo: {d.motivoRecusa}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-sm font-bold tabular-nums text-stone-900">{brl(d.valor)}</span>
        <StatusBadge status={d.status} />
      </div>
    </Tag>
  );
}

/* ============================================================
   PERFIL COLABORADOR
   ============================================================ */
function ModalNovaDespesa({ viagem, onFechar, onSubmit }) {
  const [ocrEstado, setOcrEstado] = useState("vazio");
  const [valor, setValor] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [estabelecimento, setEstabelecimento] = useState("");
  const [erro, setErro] = useState("");

  const simularOCR = () => {
    setOcrEstado("lendo");
    setTimeout(() => {
      setValor("54,90");
      setCategoriaId("1");
      setData("2026-07-14");
      setEstabelecimento("Restaurante Sabor Real");
      setDescricao("Almoço de negócios com o cliente");
      setOcrEstado("lido");
    }, 1400);
  };

  const enviar = () => {
    const v = parseFloat(String(valor).replace(/\./g, "").replace(",", "."));
    if (!v || v <= 0) return setErro("Informe um valor válido.");
    if (!categoriaId) return setErro("Selecione a categoria.");
    if (!data) return setErro("Informe a data da despesa.");
    if (!descricao.trim()) return setErro("Descreva a despesa para facilitar a aprovação.");
    setErro("");
    onSubmit({ viagemId: viagem.id, valor: v, categoriaId: Number(categoriaId), data, descricao: descricao.trim(), estabelecimento });
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-0 sm:items-center sm:p-4" onClick={onFechar}>
      <div onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">Novo lançamento</h3>
            <p className="mt-0.5 text-xs text-stone-500">{viagem.nome} — {viagem.destino}</p>
          </div>
          <button onClick={onFechar} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"><X size={18} /></button>
        </div>

        <div className="px-5 py-4">
          <button onClick={ocrEstado === "lendo" ? undefined : simularOCR}
            className={`mb-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-7 transition ${
              ocrEstado === "lido" ? "border-sky-300 bg-sky-50" : "border-stone-300 bg-stone-50 hover:border-sky-400 hover:bg-sky-50/50"
            }`}>
            {ocrEstado === "vazio" && (<>
              <Camera size={26} className="text-stone-400" />
              <span className="text-sm font-medium text-stone-700">Fotografar ou enviar recibo</span>
              <span className="text-xs text-stone-400">Os dados serão lidos automaticamente (OCR)</span>
            </>)}
            {ocrEstado === "lendo" && (<>
              <Loader2 size={26} className="animate-spin text-accent" />
              <span className="text-sm font-medium text-accent">Lendo comprovante…</span>
            </>)}
            {ocrEstado === "lido" && (<>
              <ScanLine size={26} className="text-accent" />
              <span className="text-sm font-medium text-brand">Dados lidos do comprovante</span>
              <span className="text-xs text-accent">Confira e ajuste os campos antes de enviar</span>
            </>)}
          </button>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Valor (R$)</label>
              <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" inputMode="decimal"
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 font-mono text-sm tabular-nums focus-brand" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Data da despesa</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Categoria</label>
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm focus-brand">
              <option value="">Selecione…</option>
              {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Descrição / justificativa</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3}
              placeholder="Ex.: abastecimento para visita ao cliente X"
              className="w-full resize-none rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />
          </div>

          {erro && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

          <button onClick={enviar}
            className="btn-brand mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold">
            <Plus size={16} /> Enviar para aprovação
          </button>
        </div>
      </div>
    </div>
  );
}

function ColaboradorView({ user, despesas, viagens, creditos, addDespesa, onConfirmarCredito, toast }) {
  const [tab, setTab] = useState("inicio");
  const [viagemAberta, setViagemAberta] = useState(null);
  const [lancando, setLancando] = useState(false);

  const minhas = despesas.filter((d) => d.usuarioId === user.id);
  const soma = (s) => minhas.filter((d) => d.status === s).reduce((a, d) => a + d.valor, 0);
  const qtd = (s) => minhas.filter((d) => d.status === s).length;
  const viagemDe = (d) => viagens.find((v) => v.id === d.viagemId);
  const minhasViagens = viagens.filter((v) => participanteDe(v, user.id));

  const tabs = [
    { id: "inicio", label: "Início", Icon: LayoutDashboard },
    { id: "historico", label: "Histórico", Icon: History },
  ];

  const mudarTab = (t) => { setTab(t); setViagemAberta(null); };

  return (
    <Shell user={user} onLogout={toast.logout} tabs={tabs} tab={tab} setTab={mudarTab}>
      {tab === "inicio" && !viagemAberta && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CardResumo label="Aprovadas" valor={soma("aprovado")} qtd={qtd("aprovado")} Icon={CheckCircle2} tone="bg-emerald-50 text-emerald-700" />
            <CardResumo label="Pendentes" valor={soma("pendente")} qtd={qtd("pendente")} Icon={Clock} tone="bg-amber-50 text-amber-700" />
            <CardResumo label="Pagas" valor={soma("pago")} qtd={qtd("pago")} Icon={Banknote} tone="bg-blue-50 text-blue-700" />
          </div>

          <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-stone-500">Minhas viagens</h2>
          {minhasViagens.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
              <Plane size={24} className="mx-auto mb-2 text-stone-300" />
              <p className="text-sm text-stone-500">Você ainda não foi incluído em nenhuma viagem.</p>
              <p className="mt-1 text-xs text-stone-400">Peça ao seu gestor para incluí-lo antes de lançar despesas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {minhasViagens.map((v) => (
                <button key={v.id} onClick={() => setViagemAberta(v.id)}
                  className="rounded-xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover-accent-border hover:shadow">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-stone-900">{v.nome}</p>
                    <ParticipanteBadge status={participanteDe(v, user.id).status} />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><MapPin size={12} /> {v.destino} · {fmtData(v.inicio)} a {fmtData(v.fim)}</p>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">Últimos lançamentos</h2>
            <button onClick={() => setTab("historico")} className="flex items-center gap-0.5 text-sm font-medium text-accent hover:underline">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {minhas.slice(0, 4).map((d) => <LinhaDespesa key={d.id} d={d} viagem={viagemDe(d)} />)}
          </div>
        </>
      )}

      {tab === "inicio" && viagemAberta && (() => {
        const v = viagens.find((x) => x.id === viagemAberta);
        if (!v) return null;
        const meuParticipante = participanteDe(v, user.id);
        const dv = minhas.filter((d) => d.viagemId === v.id);
        const meusCreditos = creditos.filter((c) => c.viagemId === v.id && c.usuarioId === user.id);
        const totalCreditosConfirmados = meusCreditos.filter((c) => c.confirmado === true).reduce((a, c) => a + c.valor, 0);
        const totalDespesasAprovadas = dv.filter((d) => d.status === "aprovado" || d.status === "pago").reduce((a, d) => a + d.valor, 0);
        return (
          <>
            <button onClick={() => setViagemAberta(null)}
              className="mb-4 flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              <ChevronLeft size={15} /> Minhas viagens
            </button>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-stone-900">{v.nome}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {v.destino}</span>
                    <span className="flex items-center gap-1"><CalendarRange size={12} /> {fmtData(v.inicio)} a {fmtData(v.fim)}</span>
                  </p>
                </div>
                <ParticipanteBadge status={meuParticipante.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-xs font-semibold uppercase text-stone-500">Despesas aprovadas</p>
                  <p className="font-mono text-lg font-bold tabular-nums text-stone-900">{brl(totalDespesasAprovadas)}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-xs font-semibold uppercase text-stone-500">Créditos confirmados</p>
                  <p className="font-mono text-lg font-bold tabular-nums text-stone-900">{brl(totalCreditosConfirmados)}</p>
                </div>
              </div>

              {meuParticipante.status === "aberto" ? (
                <button onClick={() => setLancando(true)}
                  className="btn-brand mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold sm:w-auto sm:px-5">
                  <Plus size={16} /> Nova despesa nesta viagem
                </button>
              ) : (
                <p className="mt-4 text-xs text-stone-500">Seu acerto desta viagem já foi fechado pelo gestor — não é mais possível lançar despesas.</p>
              )}
            </div>

            <h3 className="mb-2 mt-5 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-stone-500">
              <Wallet size={14} /> Diárias e créditos
            </h3>
            <div className="space-y-2">
              {meusCreditos.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
                  Nenhum crédito lançado pelo gestor nesta viagem ainda.
                </div>
              )}
              {meusCreditos.map((c) => (
                <LinhaCredito key={c.id} credito={c}
                  onConfirmar={(id, confirmado) => onConfirmarCredito(id, confirmado)} />
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">Minhas despesas nesta viagem</h3>
            <div className="space-y-2">
              {dv.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
                  Nenhuma despesa lançada nesta viagem ainda.
                </div>
              )}
              {dv.map((d) => <LinhaDespesa key={d.id} d={d} />)}
            </div>

            {lancando && (
              <ModalNovaDespesa viagem={v} onFechar={() => setLancando(false)}
                onSubmit={(dados) => { addDespesa(dados); setLancando(false); }} />
            )}
          </>
        );
      })()}

      {tab === "historico" && (
        <div className="space-y-2">
          {minhas.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
              Nenhuma despesa lançada ainda. Toque em uma viagem no Início para lançar a primeira.
            </div>
          )}
          {minhas.map((d) => <LinhaDespesa key={d.id} d={d} viagem={viagemDe(d)} />)}
        </div>
      )}
    </Shell>
  );
}

/* ============================================================
   GESTOR — CONCILIAÇÃO
   ============================================================ */
function ModalConciliacao({ despesa, viagem, onFechar, onAprovar, onRecusar }) {
  const [recusando, setRecusando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const colab = userById(despesa.usuarioId);
  const cat = catById(despesa.categoriaId);

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-0 sm:items-center sm:p-4" onClick={onFechar}>
      <div onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h3 className="text-base font-bold text-stone-900">Analisar despesa</h3>
          <button onClick={onFechar} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"><X size={18} /></button>
        </div>

        <div className="px-5 py-4">
          <ComprovanteTermico despesa={despesa} />

          <div className="mt-4 space-y-2 rounded-xl bg-stone-50 p-4 text-sm">
            <div className="flex justify-between"><span className="text-stone-500">Viagem</span><span className="max-w-[60%] truncate text-right font-medium text-stone-900">{viagem?.nome}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Colaborador</span><span className="font-medium text-stone-900">{colab?.nome}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Categoria</span><span className="font-medium text-stone-900">{cat?.nome}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Data</span><span className="font-medium text-stone-900">{fmtData(despesa.data)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Valor</span><span className="font-mono font-bold tabular-nums text-stone-900">{brl(despesa.valor)}</span></div>
            <div className="border-t border-stone-200 pt-2">
              <p className="text-stone-500">Justificativa</p>
              <p className="mt-0.5 font-medium text-stone-900">{despesa.descricao}</p>
            </div>
          </div>

          {!recusando ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setRecusando(true)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-red-300 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50">
                <XCircle size={16} /> Recusar
              </button>
              <button onClick={() => onAprovar(despesa.id)}
                className="btn-brand flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold">
                <CheckCircle2 size={16} /> Aprovar
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Motivo da recusa</label>
              <textarea autoFocus value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3}
                placeholder="Explique o motivo para o colaborador corrigir o lançamento"
                className="w-full resize-none rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => setRecusando(false)}
                  className="rounded-lg border border-stone-300 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50">Voltar</button>
                <button disabled={!motivo.trim()} onClick={() => onRecusar(despesa.id, motivo.trim())}
                  className="rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40">
                  Confirmar recusa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   GESTOR — NOVA VIAGEM
   ============================================================ */
function ModalNovaViagem({ onFechar, onCriar }) {
  const [nome, setNome] = useState("");
  const [destino, setDestino] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [erro, setErro] = useState("");
  const colaboradores = USUARIOS.filter((u) => u.papel === "colaborador" && u.ativo !== false);

  const toggle = (id) =>
    setParticipantes((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const criar = () => {
    if (!nome.trim()) return setErro("Dê um nome à viagem.");
    if (!destino.trim()) return setErro("Informe o destino.");
    if (!inicio || !fim) return setErro("Informe o período da viagem.");
    if (fim < inicio) return setErro("A data final não pode ser anterior à inicial.");
    if (participantes.length === 0) return setErro("Inclua ao menos um participante.");
    onCriar({ nome: nome.trim(), destino: destino.trim(), inicio, fim, participantes });
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-0 sm:items-center sm:p-4" onClick={onFechar}>
      <div onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h3 className="text-base font-bold text-stone-900">Nova viagem</h3>
          <button onClick={onFechar} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"><X size={18} /></button>
        </div>
        <div className="px-5 py-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Nome da viagem</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Visita técnica — Cliente X"
            className="mb-3 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Destino</label>
          <input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Cidade/UF"
            className="mb-3 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Início</label>
              <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Fim</label>
              <input type="date" value={fim} onChange={(e) => setFim(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />
            </div>
          </div>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Participantes</label>
          <div className="mb-3 space-y-1.5">
            {colaboradores.map((c) => (
              <label key={c.id} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition ${
                participantes.includes(c.id) ? "border-sky-300 bg-sky-50" : "border-stone-200 hover:bg-stone-50"
              }`}>
                <input type="checkbox" checked={participantes.includes(c.id)} onChange={() => toggle(c.id)}
                  className="h-4 w-4 accent-[#1B7EAD]" />
                <span className="font-medium text-stone-800">{c.nome}</span>
                <span className="ml-auto text-xs text-stone-400">{c.email}</span>
              </label>
            ))}
          </div>

          {erro && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

          <button onClick={criar} className="btn-brand flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold">
            <Plane size={16} /> Criar viagem
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   GESTOR — INCLUIR FUNCIONÁRIO EM VIAGEM JÁ EXISTENTE
   ============================================================ */
function ModalIncluirParticipante({ colaboradoresDisponiveis, onFechar, onIncluir }) {
  const [selecionados, setSelecionados] = useState([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const toggle = (id) =>
    setSelecionados((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const incluir = async () => {
    if (selecionados.length === 0) return setErro("Selecione ao menos um funcionário.");
    setErro("");
    setEnviando(true);
    try {
      await onIncluir(selecionados);
    } catch (e) {
      setErro(`Erro ao incluir: ${e.message}`);
      setEnviando(false);
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-0 sm:items-center sm:p-4" onClick={onFechar}>
      <div onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h3 className="text-base font-bold text-stone-900">Incluir funcionário na viagem</h3>
          <button onClick={onFechar} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"><X size={18} /></button>
        </div>
        <div className="px-5 py-4">
          {colaboradoresDisponiveis.length === 0 ? (
            <p className="rounded-lg bg-stone-50 px-3 py-4 text-center text-sm text-stone-500">
              Todos os funcionários ativos já participam desta viagem.
            </p>
          ) : (
            <div className="mb-3 space-y-1.5">
              {colaboradoresDisponiveis.map((c) => (
                <label key={c.id} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition ${
                  selecionados.includes(c.id) ? "border-sky-300 bg-sky-50" : "border-stone-200 hover:bg-stone-50"
                }`}>
                  <input type="checkbox" checked={selecionados.includes(c.id)} onChange={() => toggle(c.id)}
                    className="h-4 w-4 accent-[#1B7EAD]" />
                  <span className="font-medium text-stone-800">{c.nome}</span>
                  <span className="ml-auto text-xs text-stone-400">{c.email}</span>
                </label>
              ))}
            </div>
          )}

          {erro && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

          {colaboradoresDisponiveis.length > 0 && (
            <button onClick={incluir} disabled={enviando}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold disabled:opacity-60">
              <UserPlus size={16} /> {enviando ? "Incluindo…" : "Incluir na viagem"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   GESTOR — CADASTRAR NOVO FUNCIONÁRIO
   ============================================================ */
function gerarSenhaProvisoria() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const aleatorios = new Uint32Array(10);
  crypto.getRandomValues(aleatorios);
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[aleatorios[i] % chars.length];
  return s;
}

function ModalNovoColaborador({ onFechar, onCriar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState(gerarSenhaProvisoria());
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const criar = async () => {
    if (!nome.trim()) return setErro("Informe o nome do funcionário.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErro("Informe um e-mail válido.");
    if (senha.length < 6) return setErro("A senha provisória precisa ter pelo menos 6 caracteres.");
    setErro("");
    setEnviando(true);
    try {
      await onCriar({ nome: nome.trim(), email: email.trim(), senha });
    } catch (e) {
      setErro(`Erro ao cadastrar: ${e.message}`);
      setEnviando(false);
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-0 sm:items-center sm:p-4" onClick={onFechar}>
      <div onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h3 className="text-base font-bold text-stone-900">Novo funcionário</h3>
          <button onClick={onFechar} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"><X size={18} /></button>
        </div>
        <div className="px-5 py-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo"
            className="mb-3 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">E-mail</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com" type="email"
            className="mb-3 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Senha provisória</label>
          <div className="mb-1 flex gap-2">
            <input value={senha} onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 font-mono text-sm focus-brand" />
            <button type="button" onClick={() => setSenha(gerarSenhaProvisoria())} title="Gerar outra senha"
              className="shrink-0 rounded-lg border border-stone-300 px-3 text-stone-500 transition hover:bg-stone-50">
              <RefreshCw size={15} />
            </button>
          </div>
          <p className="mb-3 text-xs text-stone-400">Anote e compartilhe com o funcionário — não é possível ver essa senha de novo depois de cadastrar.</p>

          {erro && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

          <button onClick={criar} disabled={enviando}
            className="btn-brand flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold disabled:opacity-60">
            <UserPlus size={16} /> {enviando ? "Cadastrando…" : "Cadastrar funcionário"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   GESTOR — RELATÓRIO DE ACERTO (prévia do PDF)
   ============================================================ */
function RelatorioAcerto({ viagem, colaborador, despesas, creditos, gestor, onFechar }) {
  const meuParticipante = participanteDe(viagem, colaborador.id);
  const validas = despesas.filter((d) => d.status !== "recusado");
  const recusadas = despesas.filter((d) => d.status === "recusado");
  const totalDespesas = validas.reduce((a, d) => a + d.valor, 0);
  const totalCreditos = creditos.filter((c) => c.confirmado === true).reduce((a, c) => a + c.valor, 0);
  const saldo = totalDespesas - totalCreditos;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-stone-900/60 p-2 sm:p-6" onClick={onFechar}>
      <div onClick={(e) => e.stopPropagation()} className="mx-auto max-w-3xl">
        <div className="no-print mb-3 flex items-center justify-between rounded-xl bg-white/95 px-4 py-3 shadow">
          <p className="text-sm font-semibold text-stone-800">Prévia do relatório de acerto</p>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()}
              className="btn-accent flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold">
              <Printer size={15} /> Imprimir / Salvar PDF
            </button>
            <button onClick={onFechar} className="rounded-lg border border-stone-300 bg-white p-2 text-stone-500 hover:bg-stone-50"><X size={16} /></button>
          </div>
        </div>

        <div id="relatorio-acerto" className="rounded-xl bg-white p-8 shadow-xl">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between border-b-4 pb-4" style={{ borderColor: "var(--ta-navy)" }}>
            <img src={LOGO_FULL} alt="Telealpha" className="h-10 w-auto" />
            <div className="text-right">
              <p className="text-lg font-bold text-brand">Relatório de Acerto de Despesas</p>
              <p className="text-xs text-stone-500">Emitido em {fmtData(hoje())} · Documento nº {viagem.id.toUpperCase()}-{new Date().getFullYear()}</p>
            </div>
          </div>

          {/* Dados da viagem */}
          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div className="col-span-2"><p className="text-xs font-semibold uppercase text-stone-400">Viagem</p><p className="font-medium text-stone-900">{viagem.nome}</p></div>
            <div><p className="text-xs font-semibold uppercase text-stone-400">Destino</p><p className="font-medium text-stone-900">{viagem.destino}</p></div>
            <div><p className="text-xs font-semibold uppercase text-stone-400">Período</p><p className="font-medium text-stone-900">{fmtData(viagem.inicio)} a {fmtData(viagem.fim)}</p></div>
            <div className="col-span-2"><p className="text-xs font-semibold uppercase text-stone-400">Colaborador</p><p className="font-medium text-stone-900">{colaborador.nome}</p></div>
            <div><p className="text-xs font-semibold uppercase text-stone-400">Gestor responsável</p><p className="font-medium text-stone-900">{gestor.nome}</p></div>
            <div><p className="text-xs font-semibold uppercase text-stone-400">Status do acerto</p><p className="font-medium text-stone-900">{PARTICIPANTE_CFG[meuParticipante.status].label}</p></div>
          </div>

          {/* Tabela de despesas */}
          <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-brand">Despesas do acerto</p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-white" style={{ backgroundColor: "var(--ta-navy)" }}>
                <th className="px-2 py-1.5 font-semibold">Data</th>
                <th className="px-2 py-1.5 font-semibold">Categoria</th>
                <th className="px-2 py-1.5 font-semibold">Descrição</th>
                <th className="px-2 py-1.5 text-right font-semibold">Valor</th>
                <th className="px-2 py-1.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((d, i) => (
                <tr key={d.id} className={i % 2 ? "bg-stone-50" : ""}>
                  <td className="px-2 py-1.5 font-mono tabular-nums">{fmtData(d.data)}</td>
                  <td className="px-2 py-1.5">{catById(d.categoriaId)?.nome}</td>
                  <td className="px-2 py-1.5">{d.descricao}</td>
                  <td className={`px-2 py-1.5 text-right font-mono tabular-nums ${d.status === "recusado" ? "text-stone-400 line-through" : ""}`}>{brl(d.valor)}</td>
                  <td className="px-2 py-1.5">{STATUS_CFG[d.status].label}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold" style={{ borderColor: "var(--ta-navy)" }}>
                <td colSpan={3} className="px-2 py-2 text-right uppercase text-brand">Total de despesas</td>
                <td className="px-2 py-2 text-right font-mono tabular-nums text-brand">{brl(totalDespesas)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
          {recusadas.length > 0 && (
            <p className="mt-1 text-xs text-stone-500">* Despesas recusadas constam no relatório mas não compõem o total.</p>
          )}

          {/* Créditos recebidos */}
          <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-brand">Diárias e créditos</p>
          {creditos.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum crédito lançado para este colaborador nesta viagem.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-white" style={{ backgroundColor: "var(--ta-navy)" }}>
                  <th className="px-2 py-1.5 font-semibold">Tipo</th>
                  <th className="px-2 py-1.5 font-semibold">Descrição</th>
                  <th className="px-2 py-1.5 text-right font-semibold">Valor</th>
                  <th className="px-2 py-1.5 font-semibold">Confirmação</th>
                </tr>
              </thead>
              <tbody>
                {creditos.map((c, i) => (
                  <tr key={c.id} className={i % 2 ? "bg-stone-50" : ""}>
                    <td className="px-2 py-1.5">{TIPO_CREDITO_CFG[c.tipo].label}</td>
                    <td className="px-2 py-1.5">{c.descricao || "—"}</td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums">{brl(c.valor)}</td>
                    <td className="px-2 py-1.5">{c.confirmado ? "Confirmado pelo colaborador" : "Não recebido"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold" style={{ borderColor: "var(--ta-navy)" }}>
                  <td colSpan={2} className="px-2 py-2 text-right uppercase text-brand">Total de créditos confirmados</td>
                  <td className="px-2 py-2 text-right font-mono tabular-nums text-brand">{brl(totalCreditos)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}

          {/* Saldo final */}
          <div className="mt-5 flex items-center justify-between rounded-xl bg-brand px-5 py-4">
            <p className="text-sm font-bold uppercase tracking-wide text-white">
              {saldo >= 0 ? "Saldo a reembolsar ao colaborador" : "Saldo a descontar do colaborador"}
            </p>
            <p className="font-mono text-xl font-bold tabular-nums text-white">{brl(Math.abs(saldo))}</p>
          </div>

          {/* Comprovantes */}
          <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-wide text-brand">Comprovantes anexados</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {despesas.map((d) => (
              <div key={d.id} className="rounded-lg border border-stone-200 p-3">
                <ComprovanteTermico despesa={d} compacto />
                <p className="mt-2 text-xs text-stone-600">
                  <span className="font-semibold">{fmtData(d.data)}</span> · {catById(d.categoriaId)?.nome}
                  <br />{d.descricao} — <span className="font-mono font-semibold">{brl(d.valor)}</span> ({STATUS_CFG[d.status].label})
                </p>
              </div>
            ))}
          </div>

          {/* Assinaturas */}
          <div className="mt-10 grid grid-cols-2 gap-10 text-center text-xs text-stone-500">
            <div><div className="mb-1 border-t border-stone-400 pt-1">{colaborador.nome}<br />Colaborador</div></div>
            <div><div className="mb-1 border-t border-stone-400 pt-1">{gestor.nome}<br />Gestor responsável</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   GESTOR — LANÇAR CRÉDITO (DIÁRIA / OUTRO) PARA UM COLABORADOR
   ============================================================ */
function ModalNovoCredito({ colaborador, onFechar, onCriar }) {
  const [tipo, setTipo] = useState("diaria");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");

  const criar = () => {
    const v = parseFloat(String(valor).replace(/\./g, "").replace(",", "."));
    if (!v || v <= 0) return setErro("Informe um valor válido.");
    setErro("");
    onCriar({ tipo, valor: v, descricao: descricao.trim() });
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-0 sm:items-center sm:p-4" onClick={onFechar}>
      <div onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">Lançar crédito</h3>
            <p className="mt-0.5 text-xs text-stone-500">Para {colaborador.nome}</p>
          </div>
          <button onClick={onFechar} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"><X size={18} /></button>
        </div>

        <div className="px-5 py-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Tipo</label>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {Object.entries(TIPO_CREDITO_CFG).map(([valorTipo, cfg]) => (
              <button key={valorTipo} onClick={() => setTipo(valorTipo)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  tipo === valorTipo ? "border-sky-300 bg-sky-50 text-brand" : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}>
                {cfg.label}
              </button>
            ))}
          </div>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Valor (R$)</label>
          <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" inputMode="decimal"
            className="mb-3 w-full rounded-lg border border-stone-300 px-3 py-2.5 font-mono text-sm tabular-nums focus-brand" />

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Descrição (opcional)</label>
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2}
            placeholder="Ex.: Diárias de 08 a 12/07"
            className="w-full resize-none rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />

          {erro && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

          <button onClick={criar}
            className="btn-brand mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold">
            <HandCoins size={16} /> Lançar crédito
          </button>
        </div>
      </div>
    </div>
  );
}

/* Card de acerto individual de um participante, dentro do detalhe da viagem (gestor) */
function PainelParticipante({ viagem, participante, despesas, creditos, onAbrirDespesa, onLancarCredito, onFechar, onVerRelatorio }) {
  const colab = userById(participante.usuarioId);
  const pend = despesas.filter((d) => d.status === "pendente").length;
  const totalDespesas = despesas.filter((d) => d.status === "aprovado" || d.status === "pago").reduce((a, d) => a + d.valor, 0);
  const naoConfirmados = creditos.filter((c) => c.confirmado !== true).length;
  const totalCreditos = creditos.filter((c) => c.confirmado === true).reduce((a, c) => a + c.valor, 0);
  const saldo = totalDespesas - totalCreditos;
  const podeFechar = participante.status === "aberto" && pend === 0 && naoConfirmados === 0;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-bold text-stone-900">{colab?.nome}</p>
        <ParticipanteBadge status={participante.status} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-stone-50 p-2.5">
          <p className="text-[10px] font-semibold uppercase text-stone-500">Despesas</p>
          <p className="font-mono text-sm font-bold tabular-nums text-stone-900">{brl(totalDespesas)}</p>
        </div>
        <div className="rounded-lg bg-stone-50 p-2.5">
          <p className="text-[10px] font-semibold uppercase text-stone-500">Créditos</p>
          <p className="font-mono text-sm font-bold tabular-nums text-stone-900">{brl(totalCreditos)}</p>
        </div>
        <div className="rounded-lg bg-stone-50 p-2.5">
          <p className="text-[10px] font-semibold uppercase text-stone-500">Saldo</p>
          <p className="font-mono text-sm font-bold tabular-nums text-stone-900">{brl(saldo)}</p>
        </div>
      </div>

      {despesas.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {despesas.map((d) => (
            <LinhaDespesa key={d.id} d={d} onClick={d.status === "pendente" ? () => onAbrirDespesa(d) : undefined} />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-stone-500"><Wallet size={12} /> Créditos</p>
        {participante.status === "aberto" && (
          <button onClick={onLancarCredito} className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
            <Plus size={13} /> Lançar crédito
          </button>
        )}
      </div>
      {creditos.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {creditos.map((c) => <LinhaCredito key={c.id} credito={c} />)}
        </div>
      )}

      <div className="mt-3">
        {participante.status === "aberto" ? (
          <>
            <button onClick={onFechar} disabled={!podeFechar}
              title={!podeFechar ? "Concilie as despesas e aguarde a confirmação de todos os créditos" : ""}
              className="btn-brand flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold">
              <Lock size={15} /> Fechar acerto de {colab?.nome?.split(" ")[0]}
            </button>
            {!podeFechar && (
              <p className="mt-1.5 text-center text-xs text-amber-700">
                {pend > 0 && `${pend} despesa${pend !== 1 ? "s" : ""} pendente${pend !== 1 ? "s" : ""}`}
                {pend > 0 && naoConfirmados > 0 && " · "}
                {naoConfirmados > 0 && `${naoConfirmados} crédito${naoConfirmados !== 1 ? "s" : ""} não confirmado${naoConfirmados !== 1 ? "s" : ""}`}
              </p>
            )}
          </>
        ) : (
          <button onClick={onVerRelatorio}
            className="btn-accent flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold">
            <FileText size={15} /> Ver relatório do acerto
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   GESTOR — VIEW PRINCIPAL
   ============================================================ */
function GestorView({ user, despesas, setDespesas, viagens, setViagens, creditos, setCreditos, usuarios, setUsuarios, toast, onDecidir, onCriarViagem, onLancarCredito, onFecharParticipante, onCriarColaborador, onRedefinirSenha, onDefinirStatusColaborador, onIncluirParticipante, onMarcarCreditosVistos }) {
  const [tab, setTab] = useState("viagens");
  const [sel, setSel] = useState(null);
  const [viagemAberta, setViagemAberta] = useState(null);
  const [criandoViagem, setCriandoViagem] = useState(false);
  const [cadastrandoColaborador, setCadastrandoColaborador] = useState(false);
  const [incluindoParticipante, setIncluindoParticipante] = useState(false);
  const [lancandoCreditoPara, setLancandoCreditoPara] = useState(null); // usuarioId
  const [relatorioDe, setRelatorioDe] = useState(null); // { viagemId, usuarioId }
  const [fColab, setFColab] = useState("");
  const [fCat, setFCat] = useState("");
  const [fViagem, setFViagem] = useState("");
  const [fDe, setFDe] = useState("");
  const [fAte, setFAte] = useState("");

  const pendentes = useMemo(() =>
    despesas.filter((d) =>
      d.status === "pendente" &&
      (!fColab || d.usuarioId === fColab) &&
      (!fCat || d.categoriaId === Number(fCat)) &&
      (!fViagem || d.viagemId === fViagem) &&
      (!fDe || d.data >= fDe) &&
      (!fAte || d.data <= fAte)
    ).sort((a, b) => a.data.localeCompare(b.data)),
  [despesas, fColab, fCat, fViagem, fDe, fAte]);

  const mesAtual = "2026-07";
  const doMes = despesas.filter((d) => d.data.startsWith(mesAtual) && d.status !== "recusado");
  const totalMes = doMes.reduce((a, d) => a + d.valor, 0);
  const aguardando = despesas.filter((d) => d.status === "pendente");
  const porCategoria = CATEGORIAS.map((c) => ({
    ...c, total: doMes.filter((d) => d.categoriaId === c.id).reduce((a, d) => a + d.valor, 0),
  })).sort((a, b) => b.total - a.total);
  const maxCat = Math.max(...porCategoria.map((c) => c.total), 1);

  const decidir = (id, status, motivo) => {
    if (onDecidir) { onDecidir(id, status, motivo); setSel(null); return; }
    setDespesas((ds) => ds.map((d) => d.id === id ? { ...d, status, motivoRecusa: motivo ?? d.motivoRecusa, aprovadoPor: user.id } : d));
    setSel(null);
    toast.show(status === "aprovado" ? "Despesa aprovada" : "Despesa recusada");
  };

  const criarViagem = (dados) => {
    if (onCriarViagem) { onCriarViagem(dados); setCriandoViagem(false); return; }
    setViagens((vs) => [{
      id: `v${Date.now()}`, status: "aberta", criadaPor: user.id, ...dados,
      participantes: dados.participantes.map((usuarioId) => ({ usuarioId, status: "aberto" })),
    }, ...vs]);
    setCriandoViagem(false);
    toast.show("Viagem criada");
  };

  const lancarCredito = (dados) => {
    if (onLancarCredito) { onLancarCredito(dados); setLancandoCreditoPara(null); return; }
    setCreditos((cs) => [{ id: `c${Date.now()}`, lancadoPor: user.id, confirmado: null, ...dados }, ...cs]);
    setLancandoCreditoPara(null);
    toast.show("Crédito lançado");
  };

  const fecharParticipante = (viagemId, usuarioId) => {
    if (onFecharParticipante) { onFecharParticipante(viagemId, usuarioId); return; }
    setViagens((vs) => vs.map((v) => {
      if (v.id !== viagemId) return v;
      const participantes = v.participantes.map((p) =>
        p.usuarioId === usuarioId ? { ...p, status: "fechado", fechadoPor: user.id, fechadoEm: new Date().toISOString() } : p
      );
      const todosFechados = participantes.every((p) => p.status === "fechado");
      return { ...v, participantes, status: todosFechados ? "fechada" : v.status };
    }));
    toast.show("Acerto do colaborador fechado — relatório disponível");
  };

  const criarColaborador = async (dados) => {
    if (onCriarColaborador) {
      await onCriarColaborador(dados);
      setCadastrandoColaborador(false);
      return;
    }
    const { senha, ...resto } = dados;
    const novo = { id: `u${Date.now()}`, papel: "colaborador", ...resto };
    USUARIOS = [...usuarios, novo];
    setUsuarios(USUARIOS);
    setCadastrandoColaborador(false);
    toast.show("Funcionário cadastrado");
  };

  const redefinirSenha = async (colaborador) => {
    if (onRedefinirSenha) {
      try {
        await onRedefinirSenha(colaborador.email);
      } catch (e) {
        toast.show(`Erro ao enviar link: ${e.message}`);
      }
      return;
    }
    toast.show(`(Simulado) Link de redefinição enviado para ${colaborador.email}`);
  };

  const alterarStatusColaborador = async (colaborador) => {
    const novoAtivo = !colaborador.ativo;
    const confirmado = window.confirm(
      novoAtivo
        ? `Reativar ${colaborador.nome}? Ele volta a conseguir logar e aparecer nas listas.`
        : `Desativar ${colaborador.nome}? Ele deixa de conseguir logar e não aparece mais para novas viagens (o histórico dele é mantido).`
    );
    if (!confirmado) return;

    if (onDefinirStatusColaborador) {
      try {
        await onDefinirStatusColaborador(colaborador.id, novoAtivo);
      } catch (e) {
        toast.show(`Erro: ${e.message}`);
      }
      return;
    }
    const atualizado = usuarios.map((u) => u.id === colaborador.id ? { ...u, ativo: novoAtivo } : u);
    USUARIOS = atualizado;
    setUsuarios(atualizado);
    toast.show(novoAtivo ? "Funcionário reativado" : "Funcionário desativado");
  };

  const incluirParticipantes = async (viagemId, usuarioIds) => {
    if (onIncluirParticipante) {
      await onIncluirParticipante(viagemId, usuarioIds);
      setIncluindoParticipante(false);
      return;
    }
    setViagens((vs) => vs.map((v) => {
      if (v.id !== viagemId) return v;
      const novos = usuarioIds.map((usuarioId) => ({ usuarioId, status: "aberto" }));
      return { ...v, participantes: [...v.participantes, ...novos] };
    }));
    setIncluindoParticipante(false);
    toast.show(usuarioIds.length === 1 ? "Funcionário incluído na viagem" : "Funcionários incluídos na viagem");
  };

  const abrirViagem = (viagemId) => {
    setViagemAberta(viagemId);
    if (onMarcarCreditosVistos) {
      onMarcarCreditosVistos(viagemId);
      return;
    }
    setCreditos((cs) => cs.map((c) => c.viagemId === viagemId ? { ...c, notificacaoLida: true } : c));
  };

  const tabs = [
    { id: "viagens", label: "Viagens", Icon: Plane },
    { id: "conciliacao", label: `Conciliação (${aguardando.length})`, Icon: ShieldCheck },
    { id: "equipe", label: "Equipe", Icon: Users },
    { id: "visao", label: "Visão geral", Icon: TrendingUp },
  ];

  const despesasDaViagem = (vid) => despesas.filter((d) => d.viagemId === vid);

  return (
    <Shell user={user} onLogout={toast.logout} tabs={tabs} tab={tab} setTab={setTab}>
      {/* ---------- VIAGENS ---------- */}
      {tab === "viagens" && !viagemAberta && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">Viagens da equipe</h2>
            <button onClick={() => setCriandoViagem(true)}
              className="btn-brand flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold">
              <Plus size={15} /> Nova viagem
            </button>
          </div>
          <div className="space-y-3">
            {viagens.map((v) => {
              const dv = despesasDaViagem(v.id);
              const pend = dv.filter((d) => d.status === "pendente").length;
              const total = dv.filter((d) => d.status !== "recusado").reduce((a, d) => a + d.valor, 0);
              const fechados = v.participantes.filter((p) => p.status === "fechado").length;
              const naoLidos = creditos.filter((c) => c.viagemId === v.id && !c.notificacaoLida).length;
              return (
                <button key={v.id} onClick={() => abrirViagem(v.id)}
                  className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover-accent-border hover:shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-bold text-stone-900">
                        {v.nome}
                        {naoLidos > 0 && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" title={`${naoLidos} confirmação(ões) nova(s)`} />}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {v.destino}</span>
                        <span className="flex items-center gap-1"><CalendarRange size={12} /> {fmtData(v.inicio)} a {fmtData(v.fim)}</span>
                        <span className="flex items-center gap-1"><Users size={12} /> {v.participantes.map((p) => userById(p.usuarioId)?.nome.split(" ")[0]).join(", ")}</span>
                      </p>
                    </div>
                    <ViagemBadge status={v.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                    <span className="flex items-center gap-2 text-xs text-stone-500">
                      {dv.length} despesa{dv.length !== 1 && "s"}
                      {pend > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">{pend} pendente{pend !== 1 && "s"}</span>}
                      {naoLidos > 0 && <span className="rounded-full bg-sky-100 px-2 py-0.5 font-medium text-sky-800">{naoLidos} confirmação{naoLidos !== 1 && "ões"} nova{naoLidos !== 1 && "s"}</span>}
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 font-medium text-stone-600">{fechados}/{v.participantes.length} fechados</span>
                    </span>
                    <span className="font-mono text-sm font-bold tabular-nums text-stone-900">{brl(total)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ---------- DETALHE DA VIAGEM ---------- */}
      {tab === "viagens" && viagemAberta && (() => {
        const v = viagens.find((x) => x.id === viagemAberta);
        const dv = despesasDaViagem(v.id);
        return (
          <>
            <button onClick={() => setViagemAberta(null)}
              className="mb-4 flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              <ChevronLeft size={15} /> Todas as viagens
            </button>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-stone-900">{v.nome}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {v.destino}</span>
                    <span className="flex items-center gap-1"><CalendarRange size={12} /> {fmtData(v.inicio)} a {fmtData(v.fim)}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {v.participantes.map((p) => userById(p.usuarioId)?.nome).join(", ")}</span>
                  </p>
                </div>
                <ViagemBadge status={v.status} />
              </div>
              <p className="mt-3 text-xs text-stone-500">
                O fechamento do acerto é individual — feche o acerto de cada colaborador separadamente, no card dele abaixo.
              </p>
            </div>

            <div className="mb-2 mt-5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Acerto por colaborador</h3>
              <button onClick={() => setIncluindoParticipante(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                <UserPlus size={14} /> Incluir funcionário
              </button>
            </div>
            <div className="space-y-3">
              {v.participantes.map((p) => (
                <PainelParticipante key={p.usuarioId} viagem={v} participante={p}
                  despesas={dv.filter((d) => d.usuarioId === p.usuarioId)}
                  creditos={creditos.filter((c) => c.viagemId === v.id && c.usuarioId === p.usuarioId)}
                  onAbrirDespesa={(d) => setSel(d)}
                  onLancarCredito={() => setLancandoCreditoPara(p.usuarioId)}
                  onFechar={() => fecharParticipante(v.id, p.usuarioId)}
                  onVerRelatorio={() => setRelatorioDe({ viagemId: v.id, usuarioId: p.usuarioId })} />
              ))}
            </div>

            {incluindoParticipante && (
              <ModalIncluirParticipante
                colaboradoresDisponiveis={usuarios.filter((u) =>
                  u.papel === "colaborador" && u.ativo !== false && !v.participantes.some((p) => p.usuarioId === u.id)
                )}
                onFechar={() => setIncluindoParticipante(false)}
                onIncluir={(usuarioIds) => incluirParticipantes(v.id, usuarioIds)} />
            )}
          </>
        );
      })()}

      {/* ---------- CONCILIAÇÃO ---------- */}
      {tab === "conciliacao" && (
        <>
          <div className="mb-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500"><Filter size={13} /> Filtros</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              <select value={fViagem} onChange={(e) => setFViagem(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus-brand">
                <option value="">Todas as viagens</option>
                {viagens.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
              <select value={fColab} onChange={(e) => setFColab(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus-brand">
                <option value="">Todos os colaboradores</option>
                {USUARIOS.filter((u) => u.papel === "colaborador").map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
              <select value={fCat} onChange={(e) => setFCat(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus-brand">
                <option value="">Todas as categorias</option>
                {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <input type="date" value={fDe} onChange={(e) => setFDe(e.target.value)} title="De"
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus-brand" />
              <input type="date" value={fAte} onChange={(e) => setFAte(e.target.value)} title="Até"
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus-brand" />
            </div>
          </div>

          {pendentes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
              <Inbox size={28} className="text-stone-300" />
              <p className="text-sm font-medium text-stone-600">Tudo conciliado por aqui</p>
              <p className="text-xs text-stone-400">Nenhuma despesa pendente com os filtros atuais.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendentes.map((d) => (
                <LinhaDespesa key={d.id} d={d} mostrarColab
                  viagem={viagens.find((v) => v.id === d.viagemId)}
                  onClick={() => setSel(d)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ---------- EQUIPE ---------- */}
      {tab === "equipe" && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">Funcionários</h2>
            <button onClick={() => setCadastrandoColaborador(true)}
              className="btn-brand flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold">
              <UserPlus size={15} /> Novo funcionário
            </button>
          </div>
          <div className="space-y-2">
            {usuarios.filter((u) => u.papel === "colaborador").length === 0 && (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
                Nenhum funcionário cadastrado ainda.
              </div>
            )}
            {usuarios.filter((u) => u.papel === "colaborador")
              .sort((a, b) => Number(b.ativo) - Number(a.ativo))
              .map((u) => (
              <div key={u.id} className={`flex items-center gap-3 rounded-xl border p-3.5 ${u.ativo ? "border-stone-200 bg-white" : "border-stone-200 bg-stone-50"}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${u.ativo ? "bg-stone-100 text-stone-600" : "bg-stone-200 text-stone-400"}`}>
                  {u.nome?.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${u.ativo ? "text-stone-900" : "text-stone-500"}`}>
                    {u.nome} {!u.ativo && <span className="ml-1 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-stone-500">Inativo</span>}
                  </p>
                  <p className="truncate text-xs text-stone-500">{u.email}</p>
                </div>
                {u.ativo && (
                  <button onClick={() => redefinirSenha(u)} title="Enviar link de redefinição de senha"
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50">
                    <Send size={13} /> Redefinir senha
                  </button>
                )}
                <button onClick={() => alterarStatusColaborador(u)}
                  title={u.ativo ? "Desativar funcionário" : "Reativar funcionário"}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                    u.ativo ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}>
                  {u.ativo ? <><UserX size={13} /> Desativar</> : <><UserCheck size={13} /> Reativar</>}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- VISÃO GERAL ---------- */}
      {tab === "visao" && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Gastos do mês (julho/2026)</p>
              <p className="mt-2 font-mono text-3xl font-bold tabular-nums tracking-tight text-stone-900">{brl(totalMes)}</p>
              <p className="mt-1 text-xs text-stone-500">{doMes.length} lançamentos válidos</p>
            </div>
            <button onClick={() => setTab("conciliacao")}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left shadow-sm transition hover:border-amber-300">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Aguardando aprovação</p>
              <p className="mt-2 font-mono text-3xl font-bold tabular-nums tracking-tight text-amber-900">{aguardando.length}</p>
              <p className="mt-1 flex items-center gap-0.5 text-xs font-medium text-amber-800">Ir para conciliação <ChevronRight size={13} /></p>
            </button>
          </div>

          <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-stone-500">Gastos por categoria no mês</h2>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              {porCategoria.map((c) => (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-stone-700"><c.Icon size={15} className="text-stone-400" /> {c.nome}</span>
                    <span className="font-mono tabular-nums text-stone-900">{brl(c.total)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                    <div className="bar-accent h-full rounded-full transition-all" style={{ width: `${(c.total / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ---------- MODAIS ---------- */}
      {sel && (
        <ModalConciliacao despesa={sel} viagem={viagens.find((v) => v.id === sel.viagemId)}
          onFechar={() => setSel(null)}
          onAprovar={(id) => decidir(id, "aprovado")}
          onRecusar={(id, motivo) => decidir(id, "recusado", motivo)} />
      )}
      {criandoViagem && <ModalNovaViagem onFechar={() => setCriandoViagem(false)} onCriar={criarViagem} />}
      {cadastrandoColaborador && <ModalNovoColaborador onFechar={() => setCadastrandoColaborador(false)} onCriar={criarColaborador} />}
      {lancandoCreditoPara && (
        <ModalNovoCredito colaborador={userById(lancandoCreditoPara)}
          onFechar={() => setLancandoCreditoPara(null)}
          onCriar={(dados) => lancarCredito({ ...dados, viagemId: viagemAberta, usuarioId: lancandoCreditoPara })} />
      )}
      {relatorioDe && (
        <RelatorioAcerto viagem={viagens.find((v) => v.id === relatorioDe.viagemId)}
          colaborador={userById(relatorioDe.usuarioId)}
          despesas={despesas.filter((d) => d.viagemId === relatorioDe.viagemId && d.usuarioId === relatorioDe.usuarioId)}
          creditos={creditos.filter((c) => c.viagemId === relatorioDe.viagemId && c.usuarioId === relatorioDe.usuarioId)}
          gestor={user}
          onFechar={() => setRelatorioDe(null)} />
      )}
    </Shell>
  );
}

/* ============================================================
   MODO DEMONSTRAÇÃO — sem Supabase configurado (dados simulados)
   ============================================================ */
function AppDemo() {
  const [user, setUser] = useState(null);
  const [despesas, setDespesas] = useState(DESPESAS_INICIAIS);
  const [viagens, setViagens] = useState(VIAGENS_INICIAIS);
  const [creditos, setCreditos] = useState(CREDITOS_INICIAIS);
  const [usuarios, setUsuarios] = useState(USUARIOS);
  const [toastMsg, setToastMsg] = useState("");

  const show = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2400);
  };

  const addDespesa = (dados) => {
    setDespesas((ds) => [
      { id: `d${Date.now()}`, usuarioId: user.id, status: "pendente", ...dados },
      ...ds,
    ]);
    show("Despesa enviada para aprovação");
  };

  const confirmarCredito = (id, confirmado) => {
    setCreditos((cs) => cs.map((c) => c.id === id ? { ...c, confirmado, confirmadoEm: new Date().toISOString(), notificacaoLida: false } : c));
    show(confirmado ? "Recebimento confirmado" : "Marcado como não recebido");
  };

  const toast = { show, logout: () => setUser(null) };

  if (!user) return <LoginScreen onLogin={setUser} />;
  return (
    <>
      {user.papel === "gestor"
        ? <GestorView user={user} despesas={despesas} setDespesas={setDespesas} viagens={viagens} setViagens={setViagens}
            creditos={creditos} setCreditos={setCreditos} usuarios={usuarios} setUsuarios={setUsuarios} toast={toast} />
        : <ColaboradorView user={user} despesas={despesas} viagens={viagens} creditos={creditos}
            addDespesa={addDespesa} onConfirmarCredito={confirmarCredito} toast={toast} />}
      <Toast msg={toastMsg} />
    </>
  );
}

/* ============================================================
   LOGIN REAL — Supabase Auth (e-mail/senha)
   ============================================================ */
function LoginScreenReal({ onLogin, erro }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    await onLogin(email, senha);
    setEnviando(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src={LOGO_FULL} alt="Telealpha" className="mx-auto mb-3 h-12 w-auto" />
          <p className="text-sm text-stone-500">Acerto e conciliação de despesas por viagem</p>
        </div>
        <form onSubmit={entrar} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">E-mail corporativo</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="username"
            placeholder="voce@telealpha.com.br"
            className="mb-3 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Senha</label>
          <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" required autoComplete="current-password"
            placeholder="••••••••"
            className="mb-5 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />
          {erro && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
          <button type="submit" disabled={enviando}
            className="btn-brand flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold">
            {enviando && <Loader2 size={16} className="animate-spin" />} Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   TROCA DE SENHA OBRIGATÓRIA (primeiro login com senha provisória)
   ============================================================ */
function TelaTrocarSenha({ onTrocar, erro }) {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erroLocal, setErroLocal] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (senha.length < 6) return setErroLocal("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== confirmacao) return setErroLocal("As senhas não conferem.");
    setErroLocal("");
    setEnviando(true);
    await onTrocar(senha);
    setEnviando(false);
  };

  return (
    <div className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-accent">
            <KeyRound size={20} />
          </div>
          <h2 className="text-base font-bold text-stone-900">Defina sua senha</h2>
          <p className="mt-1 text-sm text-stone-500">Este é seu primeiro acesso — troque a senha provisória antes de continuar.</p>
        </div>
        <form onSubmit={enviar}>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Nova senha</label>
          <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" required autoComplete="new-password"
            placeholder="••••••••"
            className="mb-3 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Confirme a nova senha</label>
          <input value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} type="password" required autoComplete="new-password"
            placeholder="••••••••"
            className="mb-5 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus-brand" />
          {(erroLocal || erro) && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroLocal || erro}</p>}
          <button type="submit" disabled={enviando}
            className="btn-brand flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60">
            {enviando ? "Salvando…" : "Salvar e continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   MODO REAL — Supabase configurado (auth + dados do banco)
   ============================================================ */
function AppReal() {
  const [carregando, setCarregando] = useState(true);
  const [erroLogin, setErroLogin] = useState("");
  const [erroDados, setErroDados] = useState("");
  const [erroTrocarSenha, setErroTrocarSenha] = useState("");
  // Detecta o link de recuperação de senha direto na URL, de forma síncrona:
  // o cliente Supabase processa o hash e dispara o evento PASSWORD_RECOVERY
  // muito cedo (na inicialização do módulo) — antes do useEffect abaixo
  // conseguir se inscrever em onAuthStateChange — então depender só do
  // evento perde a corrida boa parte das vezes. Checar a URL aqui garante
  // que a tela de nova senha apareça mesmo se o evento passar despercebido.
  const [modoRecuperacao, setModoRecuperacao] = useState(
    () => window.location.hash.includes("type=recovery") || new URLSearchParams(window.location.search).get("type") === "recovery"
  );
  const [erroRecuperacao, setErroRecuperacao] = useState("");
  const [sessao, setSessao] = useState(undefined); // undefined = ainda não sabemos
  const [perfil, setPerfil] = useState(null);
  const [despesas, setDespesas] = useState([]);
  const [viagens, setViagens] = useState([]);
  const [creditos, setCreditos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [toastMsg, setToastMsg] = useState("");

  const show = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2400);
  };

  // Sessão inicial + mudanças (login/logout/token refresh/recuperação de senha)
  useEffect(() => {
    api.getSession().then(setSessao);
    const sub = api.onAuthStateChange((event, session) => {
      setSessao(session);
      if (event === "PASSWORD_RECOVERY") setModoRecuperacao(true);
    });
    return () => sub.unsubscribe();
  }, []);

  // Perfil (tabela "usuarios") do usuário autenticado
  useEffect(() => {
    if (sessao === undefined) return;
    if (!sessao) { setPerfil(null); setCarregando(false); return; }
    let emAndamento = true;
    api.fetchPerfil(sessao.user.id)
      .then((p) => {
        if (!emAndamento) return;
        if (!p.ativo) {
          setErroDados("Sua conta foi desativada. Fale com o seu gestor.");
          api.signOut();
          return;
        }
        setPerfil(p);
      })
      .catch(() => emAndamento && setErroDados("Perfil não encontrado para este login. Peça ao administrador para verificar o cadastro em 'usuarios'."))
      .finally(() => emAndamento && setCarregando(false));
    return () => { emAndamento = false; };
  }, [sessao]);

  const carregarDados = async () => {
    const [cats, users, vgs, desps, crds] = await Promise.all([
      api.fetchCategorias(), api.fetchUsuarios(), api.fetchViagens(), api.fetchDespesas(), api.fetchCreditos(),
    ]);
    CATEGORIAS = cats.map((c) => ({ ...c, Icon: ICON_MAP[c.icone] || Receipt }));
    USUARIOS = users;
    setUsuarios(users);
    setViagens(vgs);
    setDespesas(desps);
    setCreditos(crds);
  };

  useEffect(() => {
    if (!perfil) return;
    carregarDados().catch(() => setErroDados("Não foi possível carregar os dados. Recarregue a página."));
  }, [perfil]);

  const login = async (email, senha) => {
    setErroLogin("");
    try {
      await api.signIn(email, senha);
    } catch {
      setErroLogin("E-mail ou senha inválidos.");
    }
  };

  const logout = () => api.signOut();

  const addDespesa = async (dados) => {
    try {
      await api.criarDespesa({ ...dados, usuarioId: perfil.id });
      await carregarDados();
      show("Despesa enviada para aprovação");
    } catch (e) {
      show(`Erro ao enviar despesa: ${e.message}`);
    }
  };

  const decidir = async (id, status, motivo) => {
    try {
      await api.decidirDespesa(id, status, motivo, perfil.id);
      await carregarDados();
      show(status === "aprovado" ? "Despesa aprovada" : "Despesa recusada");
    } catch (e) {
      show(`Erro ao registrar decisão: ${e.message}`);
    }
  };

  const criarViagem = async (dados) => {
    try {
      await api.criarViagem({ ...dados, criadaPor: perfil.id });
      await carregarDados();
      show("Viagem criada");
    } catch (e) {
      show(`Erro ao criar viagem: ${e.message}`);
    }
  };

  const lancarCredito = async (dados) => {
    try {
      await api.criarCredito({ ...dados, lancadoPor: perfil.id });
      await carregarDados();
      show("Crédito lançado");
    } catch (e) {
      show(`Erro ao lançar crédito: ${e.message}`);
    }
  };

  const confirmarCredito = async (id, confirmado) => {
    try {
      await api.confirmarCredito(id, confirmado);
      await carregarDados();
      show(confirmado ? "Recebimento confirmado" : "Marcado como não recebido");
    } catch (e) {
      show(`Erro ao confirmar crédito: ${e.message}`);
    }
  };

  const fecharParticipante = async (viagemId, usuarioId) => {
    try {
      await api.fecharAcertoParticipante(viagemId, usuarioId);
      await carregarDados();
      show("Acerto do colaborador fechado — relatório disponível");
    } catch (e) {
      show(`Não foi possível fechar: ${e.message}`);
    }
  };

  const criarColaborador = async (dados) => {
    await api.criarColaborador(dados);
    await carregarDados();
    show("Funcionário cadastrado — ele já pode entrar com o e-mail e a senha definida");
  };

  const redefinirSenha = async (email) => {
    await api.enviarRedefinicaoSenha(email);
    show(`Link de redefinição enviado para ${email}`);
  };

  const definirStatusColaborador = async (usuarioId, ativo) => {
    await api.definirStatusColaborador(usuarioId, ativo);
    await carregarDados();
    show(ativo ? "Funcionário reativado" : "Funcionário desativado");
  };

  const incluirParticipante = async (viagemId, usuarioIds) => {
    await api.adicionarParticipantes(viagemId, usuarioIds);
    await carregarDados();
    show(usuarioIds.length === 1 ? "Funcionário incluído na viagem" : "Funcionários incluídos na viagem");
  };

  const marcarCreditosVistos = async (viagemId) => {
    try {
      await api.marcarCreditosVistos(viagemId);
      await carregarDados();
    } catch {
      // silencioso — é só um indicador de notificação, não vale travar a navegação por isso
    }
  };

  const trocarSenha = async (novaSenha) => {
    setErroTrocarSenha("");
    try {
      await api.trocarSenha(novaSenha);
      setPerfil((p) => ({ ...p, senhaProvisoria: false }));
      show("Senha atualizada");
    } catch (e) {
      setErroTrocarSenha(e.message);
    }
  };

  const definirNovaSenhaRecuperacao = async (novaSenha) => {
    setErroRecuperacao("");
    try {
      await api.trocarSenha(novaSenha);
      setModoRecuperacao(false);
      show("Senha redefinida — você já pode continuar");
    } catch (e) {
      setErroRecuperacao(e.message);
    }
  };

  const toast = { show, logout };

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  if (modoRecuperacao) {
    return <TelaTrocarSenha onTrocar={definirNovaSenhaRecuperacao} erro={erroRecuperacao} />;
  }

  if (!sessao) return <LoginScreenReal onLogin={login} erro={erroLogin} />;

  if (erroDados) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-100 px-4 text-center">
        <XCircle size={28} className="text-red-500" />
        <p className="max-w-sm text-sm text-stone-700">{erroDados}</p>
        <button onClick={logout} className="btn-brand rounded-lg px-4 py-2 text-sm font-semibold">Sair</button>
      </div>
    );
  }

  if (!perfil) return null;

  if (perfil.senhaProvisoria) {
    return <TelaTrocarSenha onTrocar={trocarSenha} erro={erroTrocarSenha} />;
  }

  return (
    <>
      {perfil.papel === "gestor"
        ? <GestorView user={perfil} despesas={despesas} setDespesas={setDespesas} viagens={viagens} setViagens={setViagens}
            creditos={creditos} setCreditos={setCreditos} usuarios={usuarios} setUsuarios={setUsuarios} toast={toast}
            onDecidir={decidir} onCriarViagem={criarViagem} onLancarCredito={lancarCredito}
            onFecharParticipante={fecharParticipante} onCriarColaborador={criarColaborador}
            onRedefinirSenha={redefinirSenha} onDefinirStatusColaborador={definirStatusColaborador}
            onIncluirParticipante={incluirParticipante} onMarcarCreditosVistos={marcarCreditosVistos} />
        : <ColaboradorView user={perfil} despesas={despesas} viagens={viagens} creditos={creditos}
            addDespesa={addDespesa} onConfirmarCredito={confirmarCredito} toast={toast} />}
      <Toast msg={toastMsg} />
    </>
  );
}

/* ============================================================
   APP — escolhe modo real (Supabase configurado) ou demonstração
   ============================================================ */
export default function App() {
  return supabase ? <AppReal /> : <AppDemo />;
}
