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
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { cores, TIPO_CREDITO_CFG, fontes } from "../../theme";

export default function NovoCreditoScreen({ route, navigation }) {
  const { viagemId, usuarioId } = route.params;
  const { perfil } = useAuth();
  const { usuarioPorId, criarCredito } = useData();
  const colaborador = usuarioPorId(usuarioId);

  const [tipo, setTipo] = useState("diaria");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const criar = async () => {
    const v = parseFloat(String(valor).replace(/\./g, "").replace(",", "."));
    if (!v || v <= 0) return setErro("Informe um valor válido.");
    setErro("");
    setEnviando(true);
    try {
      await criarCredito({ viagemId, usuarioId, tipo, valor: v, descricao: descricao.trim() }, perfil.id);
      navigation.goBack();
    } catch (e) {
      setErro(`Erro ao lançar crédito: ${e.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.colabBox}>
          <MaterialCommunityIcons name="account" size={14} color={cores.azul} />
          <Text style={styles.colabTexto}>Para {colaborador?.nome}</Text>
        </View>

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.tipoLinha}>
          {Object.entries(TIPO_CREDITO_CFG).map(([valorTipo, cfg]) => (
            <TouchableOpacity
              key={valorTipo}
              onPress={() => setTipo(valorTipo)}
              style={[styles.tipoBotao, tipo === valorTipo && styles.tipoBotaoAtivo]}
            >
              <Text style={[styles.tipoTexto, tipo === valorTipo && styles.tipoTextoAtivo]}>{cfg.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput value={valor} onChangeText={setValor} placeholder="0,00" keyboardType="decimal-pad" style={styles.input} />

        <Text style={styles.label}>Descrição (opcional)</Text>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex.: Diárias de 08 a 12/07"
          multiline
          numberOfLines={2}
          style={[styles.input, { height: 64, textAlignVertical: "top" }]}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity onPress={criar} disabled={enviando} style={[styles.botao, enviando && { opacity: 0.6 }]}>
          {enviando ? (
            <ActivityIndicator color={cores.branco} />
          ) : (
            <>
              <MaterialCommunityIcons name="hand-coin" size={16} color={cores.branco} />
              <Text style={styles.botaoTexto}>Lançar crédito</Text>
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
  colabBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: cores.azulClaro,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  colabTexto: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.medio, color: cores.azulEscuro },
  label: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginBottom: 4, letterSpacing: 0.3 },
  tipoLinha: { flexDirection: "row", gap: 8, marginBottom: 14 },
  tipoBotao: { flex: 1, borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 10, paddingVertical: 11, alignItems: "center" },
  tipoBotaoAtivo: { borderColor: cores.azulBordaAtiva, backgroundColor: cores.azulSuave },
  tipoTexto: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.textoMuted },
  tipoTextoAtivo: { color: cores.navy },
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
  erro: { color: cores.vermelhoTexto, backgroundColor: cores.vermelho, borderRadius: 8, padding: 10, fontSize: fontes.tamanho.md, marginBottom: 12 },
  botao: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 14, marginTop: 4 },
  botaoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.lg },
});
