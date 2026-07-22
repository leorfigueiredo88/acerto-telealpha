import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { cores, brl, fontes } from "../theme";

export default function CardResumo({ label, valor, qtd, icone, corFundo, corIcone }) {
  return (
    <View style={styles.card}>
      <View style={styles.topo}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.iconeWrap, { backgroundColor: corFundo }]}>
          <MaterialCommunityIcons name={icone} size={15} color={corIcone} />
        </View>
      </View>
      <Text style={styles.valor}>{brl(valor)}</Text>
      <Text style={styles.qtd}>{qtd} {qtd === 1 ? "lançamento" : "lançamentos"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
  },
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, letterSpacing: 0.3 },
  iconeWrap: { borderRadius: 8, padding: 6 },
  valor: { marginTop: 8, fontSize: fontes.tamanho.hero, fontWeight: fontes.peso.extra, color: cores.texto },
  qtd: { marginTop: 2, fontSize: fontes.tamanho.base, color: cores.textoMuted },
});
