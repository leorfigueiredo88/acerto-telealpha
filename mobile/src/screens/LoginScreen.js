import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { cores, fontes } from "../theme";

export default function LoginScreen() {
  const { login, erroLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  const entrar = async () => {
    setEnviando(true);
    await login(email.trim(), senha);
    setEnviando(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.cabecalho}>
        <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitulo}>Acerto e conciliação de despesas por viagem</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>E-mail corporativo</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="voce@telealpha.com.br"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
        />
        <Text style={styles.label}>Senha</Text>
        <TextInput
          value={senha}
          onChangeText={setSenha}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="password"
          style={styles.input}
        />

        {erroLogin ? <Text style={styles.erro}>{erroLogin}</Text> : null}

        <TouchableOpacity
          onPress={entrar}
          disabled={enviando || !email || !senha}
          style={[styles.botao, (enviando || !email || !senha) && { opacity: 0.5 }]}
        >
          {enviando ? <ActivityIndicator color={cores.branco} /> : <Text style={styles.botaoTexto}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, justifyContent: "center", padding: 20 },
  cabecalho: { alignItems: "center", marginBottom: 28 },
  logo: { width: 220, height: 56, marginBottom: 10 },
  subtitulo: { color: cores.textoMuted, fontSize: fontes.tamanho.md },
  card: { backgroundColor: cores.cartao, borderRadius: 18, borderWidth: 1, borderColor: cores.borda, padding: 20 },
  label: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginBottom: 4, letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderColor: cores.bordaInput,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fontes.tamanho.lg,
    marginBottom: 14,
    color: cores.texto,
  },
  erro: { color: cores.vermelhoTexto, backgroundColor: cores.vermelho, borderRadius: 8, padding: 10, fontSize: fontes.tamanho.md, marginBottom: 12 },
  botao: { backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 13, alignItems: "center" },
  botaoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.lg },
});
