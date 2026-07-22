import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useData } from "../context/DataContext";
import { cores, brl, fmtData, ICON_POR_NOME, fontes } from "../theme";
import { StatusBadge } from "./Badge";

export default function LinhaDespesa({ despesa, viagem, mostrarColab, onPress }) {
  const { categoriaPorId, usuarioPorId } = useData();
  const cat = categoriaPorId(despesa.categoriaId);
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper onPress={onPress} style={({ pressed }) => [styles.linha, pressed && onPress && { opacity: 0.6 }]}>
      <View style={styles.iconeWrap}>
        <MaterialCommunityIcons name={ICON_POR_NOME[cat?.icone] || "receipt"} size={18} color={cores.textoMuted} />
      </View>
      <View style={styles.corpo}>
        <Text numberOfLines={1} style={styles.descricao}>{despesa.descricao}</Text>
        <Text numberOfLines={1} style={styles.meta}>
          {mostrarColab ? `${usuarioPorId(despesa.usuarioId)?.nome} · ` : ""}
          {cat?.nome} · {fmtData(despesa.data)}
          {viagem ? ` · ${viagem.nome}` : ""}
        </Text>
        {despesa.status === "recusado" && despesa.motivoRecusa && (
          <View style={styles.motivoBox}>
            <Text style={styles.motivoTexto}>Motivo: {despesa.motivoRecusa}</Text>
          </View>
        )}
      </View>
      <View style={styles.direita}>
        <Text style={styles.valor}>{brl(despesa.valor)}</Text>
        <StatusBadge status={despesa.status} />
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: cores.cartao,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
  },
  iconeWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: cores.fundo,
    alignItems: "center",
    justifyContent: "center",
  },
  corpo: { flex: 1, minWidth: 0 },
  descricao: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.texto },
  meta: { fontSize: fontes.tamanho.sm, color: cores.textoMuted, marginTop: 2 },
  motivoBox: { marginTop: 6, backgroundColor: cores.vermelho, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  motivoTexto: { fontSize: fontes.tamanho.sm, color: cores.vermelhoTexto },
  direita: { alignItems: "flex-end", gap: 4 },
  valor: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.extra, color: cores.texto, fontVariant: ["tabular-nums"] },
});
