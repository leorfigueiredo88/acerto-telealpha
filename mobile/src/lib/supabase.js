import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY em mobile/.env.local (veja .env.example)."
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Cliente "descartável", sem persistir sessão: usado só para o gestor
// cadastrar um novo funcionário (supabase.auth.signUp) sem substituir a
// sessão logada atual — se usássemos o cliente principal, o signUp trocaria
// o usuário autenticado no app para o funcionário recém-criado.
export const supabaseSemSessao = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    // storageKey própria: evita o aviso "Multiple GoTrueClient instances"
    // por dividir a mesma chave do cliente principal no mesmo contexto JS.
    storageKey: "sb-auxiliar-sem-sessao",
  },
});
