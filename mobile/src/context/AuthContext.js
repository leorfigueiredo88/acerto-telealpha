import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(undefined); // undefined = ainda não sabemos
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroLogin, setErroLogin] = useState("");
  const [erroPerfil, setErroPerfil] = useState("");
  const [erroTrocarSenha, setErroTrocarSenha] = useState("");

  useEffect(() => {
    api.getSession().then(setSessao);
    const sub = api.onAuthStateChange(setSessao);
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (sessao === undefined) return;
    if (!sessao) {
      setPerfil(null);
      setCarregando(false);
      return;
    }
    let emAndamento = true;
    setCarregando(true);
    api
      .fetchPerfil(sessao.user.id)
      .then((p) => {
        if (!emAndamento) return;
        if (!p.ativo) {
          setErroPerfil("Sua conta foi desativada. Fale com o seu gestor.");
          api.signOut();
          return;
        }
        setPerfil(p);
      })
      .catch(
        () =>
          emAndamento &&
          setErroPerfil(
            "Perfil não encontrado para este login. Peça ao administrador para verificar o cadastro em 'usuarios'."
          )
      )
      .finally(() => emAndamento && setCarregando(false));
    return () => {
      emAndamento = false;
    };
  }, [sessao]);

  const login = async (email, senha) => {
    setErroLogin("");
    try {
      await api.signIn(email, senha);
    } catch {
      setErroLogin("E-mail ou senha inválidos.");
    }
  };

  const logout = () => api.signOut();

  const trocarSenha = async (novaSenha) => {
    setErroTrocarSenha("");
    try {
      await api.trocarSenha(novaSenha);
      setPerfil((p) => ({ ...p, senhaProvisoria: false }));
    } catch (e) {
      setErroTrocarSenha(e.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{ sessao, perfil, carregando, erroLogin, erroPerfil, erroTrocarSenha, login, logout, trocarSenha }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
