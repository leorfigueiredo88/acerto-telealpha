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
import { cores, TIPO_CREDITO_CFG, fontes } from "../../theme";

export default function EditarCreditoScreen({ route, navigation }) {
  const { creditoId } = route.params;
  const { creditos, usuarioPorId, editarCredito } = useData();
  const credito = creditos.find((c) => c.id === creditoId);
  const colaborador = usuarioPorId(credito?.usuarioId);

  const [valor, setValor] = useState(credito ? String(credito.valor).replace(".", ",") : "");
  const [descricao, setDescricao] = useState(credito?.descricao || "");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!credito) return null;

  const salvar = async () => {
    const v = parseFloat(String(valor).replace(/\./g, "").replace(",", "."));
    if (!v || v <= 0) return setErro("Informe um valor válido.");
    setErro("");
    setEnviando(true);
    try {
      await editarCredito(credito.id, v, descricao.trim());
      navigation.goBack();
    } catch (e) {
      setErro(`Erro ao salvar: ${e.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.colabBox}>
          <MaterialCommunityIcons name="account" size={14} color={cores.azul} />
          <Text style={styles.colabTexto}>{TIPO_CREDITO_CFG[credito.tipo].label} — {colaborador?.nome}</Text>
        </View>

        {credito.confirmado !== null && (
          <View style={styles.avisoBox}>
            <MaterialCommunityIcons name="alert-outline" size={16} color={cores.amareloTexto} />
            <Text style={styles.avisoTexto}>
              {colaborador?.nome?.split(" ")[0]} já {credito.confirmado ? "confirmou" : "contestou"} este crédito — ao
              salvar, a confirmação é zerada e ele precisa aprovar de novo (reabre o fechamento do acerto, se já
              estiver fechado).
            </Text>
          </View>
        )}

        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput value={valor} onChangeText={setValor} placeholder="0,00" keyboardType="decimal-pad" style={styles.input} />

        <Text style={styles.label}>Descrição (opcional)</Text>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={2}
          style={[styles.input, { height: 64, textAlignVertical: "top" }]}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity onPress={salvar} disabled={enviando} style={[styles.botao, enviando && { opacity: 0.6 }]}>
          {enviando ? (
            <ActivityIndicator color={cores.branco} />
          ) : (
            <>
              <MaterialCommunityIcons name="pencil-outline" size={16} color={cores.branco} />
              <Text style={styles.botaoTexto}>Salvar alteração</Text>
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
    marginBottom: 14,
  },
  colabTexto: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.medio, color: cores.azulEscuro },
  avisoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: cores.amarelo,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  avisoTexto: { flex: 1, fontSize: fontes.tamanho.sm, color: cores.amareloTexto, lineHeight: 18 },
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
  erro: { color: cores.vermelhoTexto, backgroundColor: cores.vermelho, borderRadius: 8, padding: 10, fontSize: fontes.tamanho.md, marginBottom: 12 },
  botao: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 14, marginTop: 4 },
  botaoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.lg },
});
