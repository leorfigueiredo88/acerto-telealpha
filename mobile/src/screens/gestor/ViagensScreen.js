import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useData } from "../../context/DataContext";
import { cores, fmtData, brl, fontes } from "../../theme";
import { ViagemBadge } from "../../components/Badge";

export default function ViagensScreen({ navigation }) {
  const { viagens, despesas, usuarios, creditos, recarregar } = useData();
  const [atualizando, setAtualizando] = useState(false);

  const despesasDaViagem = (id) => despesas.filter((d) => d.viagemId === id);

  const atualizar = async () => {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  };

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <Text style={styles.tituloTopo}>Viagens da equipe</Text>
        <TouchableOpacity style={styles.botaoNovo} onPress={() => navigation.navigate("NovaViagem")}>
          <MaterialCommunityIcons name="plus" size={15} color={cores.branco} />
          <Text style={styles.botaoNovoTexto}>Nova viagem</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={viagens}
        keyExtractor={(v) => v.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma viagem cadastrada ainda.</Text>}
        renderItem={({ item: v }) => {
          const dv = despesasDaViagem(v.id);
          const pend = dv.filter((d) => d.status === "pendente").length;
          const total = dv.filter((d) => d.status !== "recusado").reduce((a, d) => a + d.valor, 0);
          const fechados = v.participantes.filter((p) => p.status === "fechado").length;
          const nomes = v.participantes.map((p) => usuarios.find((u) => u.id === p.usuarioId)?.nome?.split(" ")[0]).filter(Boolean).join(", ");
          const naoLidos = creditos.filter((c) => c.viagemId === v.id && !c.notificacaoLida).length;
          return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ViagemDetalhe", { viagemId: v.id })}>
              <View style={styles.cardTopo}>
                <View style={styles.cardNomeLinha}>
                  <Text style={styles.cardNome} numberOfLines={1}>{v.nome}</Text>
                  {naoLidos > 0 && <View style={styles.pontoNovo} />}
                </View>
                <ViagemBadge status={v.status} />
              </View>
              <View style={styles.metaLinha}>
                <MaterialCommunityIcons name="map-marker" size={12} color={cores.textoMuted} />
                <Text style={styles.metaTexto}>{v.destino}</Text>
                <MaterialCommunityIcons name="calendar-range" size={12} color={cores.textoMuted} style={{ marginLeft: 8 }} />
                <Text style={styles.metaTexto}>{fmtData(v.inicio)} a {fmtData(v.fim)}</Text>
              </View>
              {!!nomes && (
                <View style={styles.metaLinha}>
                  <MaterialCommunityIcons name="account-group" size={12} color={cores.textoMuted} />
                  <Text style={styles.metaTexto} numberOfLines={1}>{nomes}</Text>
                </View>
              )}
              <View style={styles.rodape}>
                <Text style={styles.rodapeTexto}>
                  {dv.length} despesa{dv.length !== 1 ? "s" : ""}
                  {pend > 0 ? `  ·  ${pend} pendente${pend !== 1 ? "s" : ""}` : ""}
                  {naoLidos > 0 ? `  ·  ${naoLidos} confirmação${naoLidos !== 1 ? "ões" : ""} nova${naoLidos !== 1 ? "s" : ""}` : ""}
                  {"  ·  "}{fechados}/{v.participantes.length} fechados
                </Text>
                <Text style={styles.rodapeValor}>{brl(total)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  tituloTopo: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, letterSpacing: 0.3 },
  botaoNovo: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: cores.navy, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  botaoNovoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.base },
  lista: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  vazio: { fontSize: fontes.tamanho.md, color: cores.textoMuted, textAlign: "center", marginTop: 40 },
  card: { backgroundColor: cores.cartao, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, padding: 14 },
  cardTopo: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  cardNomeLinha: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, minWidth: 0 },
  cardNome: { fontSize: fontes.tamanho.lg, fontWeight: fontes.peso.negrito, color: cores.texto, flexShrink: 1 },
  pontoNovo: { width: 7, height: 7, borderRadius: 4, backgroundColor: cores.azul },
  metaLinha: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaTexto: { fontSize: fontes.tamanho.sm, color: cores.textoMuted },
  rodape: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: cores.fundo },
  rodapeTexto: { fontSize: fontes.tamanho.sm, color: cores.textoMuted },
  rodapeValor: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.extra, color: cores.texto },
});
