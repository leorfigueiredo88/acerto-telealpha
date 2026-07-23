import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useData } from "../../context/DataContext";
import { cores, fmtData, fontes } from "../../theme";
import { alertar } from "../../lib/alertar";
import { ViagemBadge } from "../../components/Badge";
import PainelParticipante from "../../components/PainelParticipante";

export default function ViagemDetalheScreen({ route, navigation }) {
  const { viagemId } = route.params;
  const { viagens, usuarios, marcarCreditosVistos, atualizarDataFimViagem } = useData();
  const [editandoFim, setEditandoFim] = useState(false);
  const [novaFim, setNovaFim] = useState(null);
  const [salvandoFim, setSalvandoFim] = useState(false);

  useEffect(() => {
    marcarCreditosVistos(viagemId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viagemId]);

  const v = viagens.find((x) => x.id === viagemId);
  if (!v) return null;

  const salvarNovaFim = async (data) => {
    setSalvandoFim(true);
    try {
      await atualizarDataFimViagem(v.id, data);
      setEditandoFim(false);
    } catch (e) {
      alertar("Não foi possível salvar", e.message);
    } finally {
      setSalvandoFim(false);
    }
  };

  const nomes = v.participantes.map((p) => usuarios.find((u) => u.id === p.usuarioId)?.nome).filter(Boolean).join(", ");

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <View style={styles.card}>
        <View style={styles.topo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nome}>{v.nome}</Text>
            <View style={styles.metaLinha}>
              <MaterialCommunityIcons name="map-marker" size={12} color={cores.textoMuted} />
              <Text style={styles.metaTexto}>{v.destino}</Text>
            </View>
            <View style={styles.metaLinha}>
              <MaterialCommunityIcons name="calendar-range" size={12} color={cores.textoMuted} />
              <Text style={styles.metaTexto}>{fmtData(v.inicio)} a {fmtData(v.fim)}</Text>
              <TouchableOpacity
                onPress={() => { setNovaFim(v.fim); setEditandoFim(true); }}
                style={styles.botaoEditarFim}
                disabled={salvandoFim}
              >
                <MaterialCommunityIcons name="pencil-outline" size={12} color={cores.azul} />
              </TouchableOpacity>
            </View>
            {editandoFim && (
              <View style={styles.editorFim}>
                <DateTimePicker
                  value={new Date(`${novaFim}T12:00:00`)}
                  mode="date"
                  minimumDate={new Date(`${v.inicio}T12:00:00`)}
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, d) => {
                    if (Platform.OS === "android") {
                      setEditandoFim(false);
                      if (event.type === "set" && d) salvarNovaFim(d.toISOString().slice(0, 10));
                      return;
                    }
                    if (d) setNovaFim(d.toISOString().slice(0, 10));
                  }}
                />
                {Platform.OS === "ios" && (
                  <View style={styles.editorFimAcoes}>
                    <TouchableOpacity onPress={() => setEditandoFim(false)} style={styles.botaoCancelarFim}>
                      <Text style={styles.botaoCancelarFimTexto}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => salvarNovaFim(novaFim)} disabled={salvandoFim} style={styles.botaoSalvarFim}>
                      <Text style={styles.botaoSalvarFimTexto}>{salvandoFim ? "Salvando…" : "Salvar nova data"}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            {!!nomes && (
              <View style={styles.metaLinha}>
                <MaterialCommunityIcons name="account-group" size={12} color={cores.textoMuted} />
                <Text style={styles.metaTexto}>{nomes}</Text>
              </View>
            )}
          </View>
          <ViagemBadge status={v.status} />
        </View>
        <Text style={styles.avisoTexto}>
          O fechamento do acerto é individual — feche o acerto de cada colaborador separadamente, no card dele abaixo.
        </Text>
      </View>

      <View style={styles.secaoTopo}>
        <Text style={styles.secao}>Acerto por colaborador</Text>
        <TouchableOpacity
          style={styles.linkIncluir}
          onPress={() => navigation.navigate("IncluirParticipante", { viagemId: v.id })}
        >
          <MaterialCommunityIcons name="account-plus" size={13} color={cores.azul} />
          <Text style={styles.linkIncluirTexto}>Incluir funcionário</Text>
        </TouchableOpacity>
      </View>
      <View style={{ gap: 10 }}>
        {v.participantes.map((p) => (
          <PainelParticipante
            key={p.usuarioId}
            viagem={v}
            participante={p}
            onAbrirDespesa={(d) => navigation.navigate("Conciliar", { despesaId: d.id })}
            onLancarCredito={() => navigation.navigate("NovoCredito", { viagemId: v.id, usuarioId: p.usuarioId })}
            onVerRelatorio={() => navigation.navigate("Relatorio", { viagemId: v.id, usuarioId: p.usuarioId })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: cores.cartao, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, padding: 16 },
  topo: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  nome: { fontSize: fontes.tamanho.xl, fontWeight: fontes.peso.extra, color: cores.texto },
  metaLinha: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaTexto: { fontSize: fontes.tamanho.sm, color: cores.textoMuted },
  avisoTexto: { marginTop: 10, fontSize: fontes.tamanho.sm, color: cores.textoMuted },
  secaoTopo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 10 },
  secao: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, letterSpacing: 0.3 },
  linkIncluir: { flexDirection: "row", alignItems: "center", gap: 4 },
  linkIncluirTexto: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.medio, color: cores.azul },
  botaoEditarFim: { padding: 2 },
  editorFim: { marginTop: 6 },
  editorFimAcoes: { flexDirection: "row", gap: 8, marginTop: 8 },
  botaoCancelarFim: { flex: 1, alignItems: "center", borderWidth: 1, borderColor: cores.borda, borderRadius: 10, paddingVertical: 10 },
  botaoCancelarFimTexto: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.medio, color: cores.textoMuted },
  botaoSalvarFim: { flex: 1, alignItems: "center", backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 10 },
  botaoSalvarFimTexto: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.negrito, color: cores.branco },
});
