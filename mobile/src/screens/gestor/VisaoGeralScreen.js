import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useData } from "../../context/DataContext";
import { cores, brl, ICON_POR_NOME, fontes } from "../../theme";

export default function VisaoGeralScreen({ navigation }) {
  const { despesas, categorias, recarregar } = useData();
  const [atualizando, setAtualizando] = useState(false);

  const mesAtual = new Date().toISOString().slice(0, 7);
  const doMes = despesas.filter((d) => d.data.startsWith(mesAtual) && d.status !== "recusado");
  const totalMes = doMes.reduce((a, d) => a + d.valor, 0);
  const aguardando = despesas.filter((d) => d.status === "pendente");

  const porCategoria = useMemo(
    () =>
      categorias
        .map((c) => ({ ...c, total: doMes.filter((d) => d.categoriaId === c.id).reduce((a, d) => a + d.valor, 0) }))
        .sort((a, b) => b.total - a.total),
    [categorias, doMes]
  );
  const maxCat = Math.max(...porCategoria.map((c) => c.total), 1);

  const atualizar = async () => {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  };

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
    >
      <View style={styles.linhaCards}>
        <View style={styles.cardMes}>
          <Text style={styles.cardMesLabel}>Gastos do mês</Text>
          <Text style={styles.cardMesValor}>{brl(totalMes)}</Text>
          <Text style={styles.cardMesSub}>{doMes.length} lançamentos válidos</Text>
        </View>
        <TouchableOpacity style={styles.cardPendente} onPress={() => navigation.navigate("Conciliação")}>
          <Text style={styles.cardPendenteLabel}>Aguardando aprovação</Text>
          <Text style={styles.cardPendenteValor}>{aguardando.length}</Text>
          <View style={styles.cardPendenteLink}>
            <Text style={styles.cardPendenteLinkTexto}>Ir para conciliação</Text>
            <MaterialCommunityIcons name="chevron-right" size={13} color={cores.amareloTexto} />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.secao}>Gastos por categoria no mês</Text>
      <View style={styles.card}>
        {porCategoria.map((c) => (
          <View key={c.id} style={{ marginBottom: 14 }}>
            <View style={styles.catTopo}>
              <View style={styles.catNomeLinha}>
                <MaterialCommunityIcons name={ICON_POR_NOME[c.icone] || "receipt"} size={15} color={cores.textoMuted} />
                <Text style={styles.catNome}>{c.nome}</Text>
              </View>
              <Text style={styles.catValor}>{brl(c.total)}</Text>
            </View>
            <View style={styles.barraFundo}>
              <View style={[styles.barraPreenchida, { width: `${(c.total / maxCat) * 100}%` }]} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  linhaCards: { flexDirection: "row", gap: 10 },
  cardMes: { flex: 1, backgroundColor: cores.cartao, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, padding: 16 },
  cardMesLabel: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted },
  cardMesValor: { fontSize: fontes.tamanho.hero, fontWeight: fontes.peso.extra, color: cores.texto, marginTop: 6 },
  cardMesSub: { fontSize: fontes.tamanho.sm, color: cores.textoMuted, marginTop: 2 },
  cardPendente: { flex: 1, backgroundColor: cores.amarelo, borderRadius: 16, borderWidth: 1, borderColor: cores.amareloBorda, padding: 16 },
  cardPendenteLabel: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.amareloTexto },
  cardPendenteValor: { fontSize: fontes.tamanho.hero, fontWeight: fontes.peso.extra, color: cores.amareloTexto, marginTop: 6 },
  cardPendenteLink: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 4 },
  cardPendenteLinkTexto: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.medio, color: cores.amareloTexto },
  secao: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginTop: 22, marginBottom: 10, letterSpacing: 0.3 },
  card: { backgroundColor: cores.cartao, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, padding: 16 },
  catTopo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  catNomeLinha: { flexDirection: "row", alignItems: "center", gap: 6 },
  catNome: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.texto },
  catValor: { fontSize: fontes.tamanho.md, color: cores.texto },
  barraFundo: { height: 8, borderRadius: 999, backgroundColor: cores.fundo, overflow: "hidden" },
  barraPreenchida: { height: "100%", borderRadius: 999, backgroundColor: cores.azul },
});
