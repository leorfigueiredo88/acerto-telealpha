// Cliente Supabase — preencha as variáveis em .env.local
// (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY, obtidas em
//  Project Settings > API no painel do Supabase)
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

// Cliente "descartável", sem persistir sessão: usado só para o gestor
// cadastrar um novo funcionário (supabase.auth.signUp) sem substituir a
// sessão logada atual — se usássemos o cliente principal, o signUp trocaria
// o usuário autenticado no navegador para o funcionário recém-criado.
export const supabaseSemSessao = url && anonKey
  ? createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        // storageKey própria: evita o aviso "Multiple GoTrueClient instances"
        // por dividir a mesma chave do cliente principal no mesmo contexto JS.
        storageKey: "sb-auxiliar-sem-sessao",
      },
    })
  : null;

// Enquanto supabase === null, o App roda com os dados simulados.
// Exemplo de uso real:
//   const { data } = await supabase
//     .from("vw_acerto_viagem").select("*").eq("viagem_id", id);
