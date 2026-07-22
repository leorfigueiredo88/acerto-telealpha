import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "../lib/api";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { perfil } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [viagens, setViagens] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [creditos, setCreditos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    const [cats, users, vgs, desps, crds] = await Promise.all([
      api.fetchCategorias(),
      api.fetchUsuarios(),
      api.fetchViagens(),
      api.fetchDespesas(),
      api.fetchCreditos(),
    ]);
    setCategorias(cats);
    setUsuarios(users);
    setViagens(vgs);
    setDespesas(desps);
    setCreditos(crds);
  }, []);

  useEffect(() => {
    if (!perfil) return;
    setCarregando(true);
    recarregar()
      .catch(() => setErro("Não foi possível carregar os dados. Puxe para atualizar."))
      .finally(() => setCarregando(false));
  }, [perfil, recarregar]);

  const categoriaPorId = (id) => categorias.find((c) => c.id === id);
  const usuarioPorId = (id) => usuarios.find((u) => u.id === id);
  const participanteDe = (viagem, usuarioId) => viagem?.participantes.find((p) => p.usuarioId === usuarioId);

  const criarDespesa = async (dados, usuarioId) => {
    await api.criarDespesa({ ...dados, usuarioId });
    await recarregar();
  };

  const decidirDespesa = async (id, status, motivo, aprovadoPor) => {
    await api.decidirDespesa(id, status, motivo, aprovadoPor);
    await recarregar();
  };

  const criarViagem = async (dados, criadaPor) => {
    await api.criarViagem({ ...dados, criadaPor });
    await recarregar();
  };

  const criarCredito = async (dados, lancadoPor) => {
    await api.criarCredito({ ...dados, lancadoPor });
    await recarregar();
  };

  const confirmarCredito = async (id, confirmado) => {
    await api.confirmarCredito(id, confirmado);
    await recarregar();
  };

  const fecharAcertoParticipante = async (viagemId, usuarioId) => {
    await api.fecharAcertoParticipante(viagemId, usuarioId);
    await recarregar();
  };

  const criarColaborador = async (dados) => {
    await api.criarColaborador(dados);
    await recarregar();
  };

  const enviarRedefinicaoSenha = async (email) => {
    await api.enviarRedefinicaoSenha(email);
  };

  const definirStatusColaborador = async (usuarioId, ativo) => {
    await api.definirStatusColaborador(usuarioId, ativo);
    await recarregar();
  };

  const adicionarParticipantes = async (viagemId, usuarioIds) => {
    await api.adicionarParticipantes(viagemId, usuarioIds);
    await recarregar();
  };

  const marcarCreditosVistos = async (viagemId) => {
    try {
      await api.marcarCreditosVistos(viagemId);
      await recarregar();
    } catch {
      // silencioso — é só um indicador de notificação, não vale travar a navegação
    }
  };

  return (
    <DataContext.Provider
      value={{
        categorias,
        usuarios,
        viagens,
        despesas,
        creditos,
        carregando,
        erro,
        recarregar,
        categoriaPorId,
        usuarioPorId,
        participanteDe,
        criarDespesa,
        decidirDespesa,
        criarViagem,
        criarCredito,
        confirmarCredito,
        fecharAcertoParticipante,
        criarColaborador,
        enviarRedefinicaoSenha,
        definirStatusColaborador,
        adicionarParticipantes,
        marcarCreditosVistos,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
