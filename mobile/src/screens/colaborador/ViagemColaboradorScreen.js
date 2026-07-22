import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { cores, fmtData, brl, fontes } from "../../theme";
import { alertar } from "../../lib/alertar";
import { ParticipanteBadge } from "../../components/Badge";
import LinhaDespesa from "../../components/LinhaDespesa";
import LinhaCredito from "../../components/LinhaCredito";

export default function ViagemColaboradorScreen({ route, navigation }) {
  const { viagemId } = route.params;
  const { perfil } = useAuth();
  const { viagens, despesas, creditos, participanteDe, confirmarCredito } = useData();

  const v = viagens.find((x) => x.id === viagemId);
  if (!v) return null;

  const meuParticipante = participanteDe(v, perfil.id);
  const minhas = despesas.filter((d) => d.viagemId === v.id && d.usuarioId === perfil.id);
  const meusCreditos = creditos.filter((c) => c.viagemId === v.id && c.usuarioId === perfil.id);
  const totalDespesas = minhas.filter((d) => d.status === "aprovado" || d.status === "pago").reduce((a, d) => a + d.valor, 0);
  const totalCreditos = meusCreditos.filter((c) => c.confirmado === true).reduce((a, c) => a + c.valor, 0);

  const onConfirmar = async (id, confirmado) => {
    try {
      await confirmarCredito(id, confirmado);
    } catch (e) {
      alertar("Erro", e.message);
    }
  };

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
            </View>
          </View>
          <ParticipanteBadge status={meuParticipante.status} />
        </View>

        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Despesas aprovadas</Text>
            <Text style={styles.statValor}>{brl(totalDespesas)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Créditos confirmados</Text>
            <Text style={styles.statValor}>{brl(totalCreditos)}</Text>
          </View>
        </View>

        {meuParticipante.status === "aberto" ? (
          <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate("NovaDespesa", { viagemId: v.id })}>
            <MaterialCommunityIcons name="plus" size={16} color={cores.branco} />
            <Text style={styles.botaoTexto}>Nova despesa nesta viagem</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.avisoTexto}>Seu acerto desta viagem já foi fechado pelo gestor — não é mais possível lançar despesas.</Text>
        )}
      </View>

      <View style={styles.secaoTopoLinha}>
        <MaterialCommunityIcons name="wallet-outline" size={14} color={cores.textoMuted} />
        <Text style={styles.secaoTexto}>Diárias e créditos</Text>
      </View>
      <View style={{ gap: 8 }}>
        {meusCreditos.length === 0 && <Text style={styles.vazio}>Nenhum crédito lançado pelo gestor nesta viagem ainda.</Text>}
        {meusCreditos.map((c) => (
          <LinhaCredito key={c.id} credito={c} onConfirmar={onConfirmar} />
        ))}
      </View>

      <Text style={styles.secao}>Minhas despesas nesta viagem</Text>
      <View style={{ gap: 8 }}>
        {minhas.length === 0 && <Text style={styles.vazio}>Nenhuma despesa lançada nesta viagem ainda.</Text>}
        {minhas.map((d) => (
          <LinhaDespesa key={d.id} despesa={d} />
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
  stats: { flexDirection: "row", gap: 8, marginTop: 14 },
  statBox: { flex: 1, backgroundColor: cores.fundo, borderRadius: 12, padding: 10 },
  statLabel: { fontSize: fontes.tamanho.xs, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted },
  statValor: { fontSize: fontes.tamanho.xl, fontWeight: fontes.peso.extra, color: cores.texto, marginTop: 2 },
  botao: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 13, marginTop: 14 },
  botaoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.md },
  avisoTexto: { marginTop: 12, fontSize: fontes.tamanho.base, color: cores.textoMuted },
  secao: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginTop: 22, marginBottom: 10, letterSpacing: 0.3 },
  secaoTopoLinha: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 22, marginBottom: 10 },
  secaoTexto: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, letterSpacing: 0.3 },
  vazio: { fontSize: fontes.tamanho.md, color: cores.textoMuted, textAlign: "center", padding: 20 },
});
