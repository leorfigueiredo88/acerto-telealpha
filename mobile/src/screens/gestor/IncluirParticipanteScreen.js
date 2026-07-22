import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useData } from "../../context/DataContext";
import { cores, fontes } from "../../theme";

export default function IncluirParticipanteScreen({ route, navigation }) {
  const { viagemId } = route.params;
  const { viagens, usuarios, adicionarParticipantes } = useData();
  const [selecionados, setSelecionados] = useState([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const viagem = viagens.find((v) => v.id === viagemId);
  const colaboradoresDisponiveis = usuarios.filter(
    (u) => u.papel === "colaborador" && u.ativo && !viagem?.participantes.some((p) => p.usuarioId === u.id)
  );

  const toggle = (id) =>
    setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const incluir = async () => {
    if (selecionados.length === 0) return setErro("Selecione ao menos um funcionário.");
    setErro("");
    setEnviando(true);
    try {
      await adicionarParticipantes(viagemId, selecionados);
      navigation.goBack();
    } catch (e) {
      setErro(`Erro ao incluir: ${e.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      {colaboradoresDisponiveis.length === 0 ? (
        <Text style={styles.vazio}>Todos os funcionários ativos já participam desta viagem.</Text>
      ) : (
        <View style={{ gap: 8, marginBottom: 14 }}>
          {colaboradoresDisponiveis.map((c) => {
            const ativo = selecionados.includes(c.id);
            return (
              <TouchableOpacity key={c.id} style={[styles.item, ativo && styles.itemAtivo]} onPress={() => toggle(c.id)}>
                <MaterialCommunityIcons
                  name={ativo ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={20}
                  color={ativo ? cores.azul : cores.textoFraco}
                />
                <Text style={styles.nome}>{c.nome}</Text>
                <Text style={styles.email} numberOfLines={1}>{c.email}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      {colaboradoresDisponiveis.length > 0 && (
        <TouchableOpacity onPress={incluir} disabled={enviando} style={[styles.botao, enviando && { opacity: 0.6 }]}>
          {enviando ? (
            <ActivityIndicator color={cores.branco} />
          ) : (
            <>
              <MaterialCommunityIcons name="account-plus" size={16} color={cores.branco} />
              <Text style={styles.botaoTexto}>Incluir na viagem</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 40 },
  vazio: { fontSize: fontes.tamanho.md, color: cores.textoMuted, textAlign: "center", padding: 20 },
  item: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: cores.borda, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: cores.branco },
  itemAtivo: { borderColor: cores.azulBordaAtiva, backgroundColor: cores.azulSuave },
  nome: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.texto },
  email: { fontSize: fontes.tamanho.sm, color: cores.textoFraco, marginLeft: "auto" },
  erro: { color: cores.vermelhoTexto, backgroundColor: cores.vermelho, borderRadius: 8, padding: 10, fontSize: fontes.tamanho.md, marginBottom: 12 },
  botao: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 14, marginTop: 4 },
  botaoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.lg },
});
