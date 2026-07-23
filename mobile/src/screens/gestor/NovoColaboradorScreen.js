import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useData } from "../../context/DataContext";
import { cores, fontes } from "../../theme";

function gerarSenhaProvisoria() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function NovoColaboradorScreen({ navigation }) {
  const { criarColaborador } = useData();
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
      await criarColaborador({ nome: nome.trim(), email: email.trim(), senha });
      navigation.goBack();
    } catch (e) {
      setErro(`Erro ao cadastrar: ${e.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.label}>Nome</Text>
        <TextInput value={nome} onChangeText={setNome} placeholder="Nome completo" style={styles.input} />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="nome@empresa.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>Senha provisória</Text>
        <View style={styles.senhaLinha}>
          <TextInput value={senha} onChangeText={setSenha} style={[styles.input, styles.senhaInput]} />
          <TouchableOpacity onPress={() => setSenha(gerarSenhaProvisoria())} style={styles.botaoGerar}>
            <MaterialCommunityIcons name="refresh" size={18} color={cores.textoMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.aviso}>Anote e compartilhe com o funcionário — não é possível ver essa senha de novo depois de cadastrar.</Text>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity onPress={criar} disabled={enviando} style={[styles.botao, enviando && { opacity: 0.6 }]}>
          {enviando ? (
            <ActivityIndicator color={cores.branco} />
          ) : (
            <>
              <MaterialCommunityIcons name="account-plus" size={16} color={cores.branco} />
              <Text style={styles.botaoTexto}>Cadastrar funcionário</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 40 },
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
    backgroundColor: cores.branco,
  },
  senhaLinha: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  senhaInput: { flex: 1, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  botaoGerar: { borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: cores.branco },
  aviso: { fontSize: fontes.tamanho.sm, color: cores.textoFraco, marginTop: -8, marginBottom: 14 },
  erro: { color: cores.vermelhoTexto, backgroundColor: cores.vermelho, borderRadius: 8, padding: 10, fontSize: fontes.tamanho.md, marginBottom: 12 },
  botao: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 14, marginTop: 4 },
  botaoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.lg },
});
