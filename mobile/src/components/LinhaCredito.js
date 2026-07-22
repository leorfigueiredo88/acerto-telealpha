import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { cores, brl, TIPO_CREDITO_CFG, fontes } from "../theme";

export default function LinhaCredito({ credito, onConfirmar }) {
  const cfg = TIPO_CREDITO_CFG[credito.tipo];

  return (
    <View style={styles.linha}>
      <View style={styles.iconeWrap}>
        <MaterialCommunityIcons name="hand-coin" size={18} color={cores.textoMuted} />
      </View>
      <View style={styles.corpo}>
        <View style={styles.tituloLinha}>
          <Text style={styles.titulo}>{cfg.label}{credito.descricao ? ` — ${credito.descricao}` : ""}</Text>
          {!onConfirmar && !credito.notificacaoLida && (
            <View style={styles.badgeNovo}>
              <Text style={styles.badgeNovoTexto}>Novo</Text>
            </View>
          )}
        </View>
        {credito.confirmado === true && <Text style={styles.statusOk}>Confirmado</Text>}
        {credito.confirmado === false && <Text style={styles.statusContestado}>Marcado como não recebido</Text>}
        {credito.confirmado === null && <Text style={styles.statusPendente}>Aguardando confirmação</Text>}
      </View>
      <Text style={styles.valor}>{brl(credito.valor)}</Text>
      {onConfirmar && credito.confirmado !== true && (
        <View style={styles.acoes}>
          <Pressable
            onPress={() => onConfirmar(credito.id, true)}
            style={[styles.botaoIcone, credito.confirmado === true && styles.botaoOkAtivo]}
          >
            <MaterialCommunityIcons name="check-decagram" size={16} color={credito.confirmado === true ? cores.verdeForte : cores.textoFraco} />
          </Pressable>
          <Pressable
            onPress={() => onConfirmar(credito.id, false)}
            style={[styles.botaoIcone, credito.confirmado === false && styles.botaoAlertaAtivo]}
          >
            <MaterialCommunityIcons name="alert-decagram" size={16} color={credito.confirmado === false ? cores.vermelhoTexto : cores.textoFraco} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: cores.cartao,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 12,
  },
  iconeWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: cores.fundo,
    alignItems: "center",
    justifyContent: "center",
  },
  corpo: { flex: 1, minWidth: 0 },
  tituloLinha: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  titulo: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.texto },
  badgeNovo: { backgroundColor: cores.azul, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  badgeNovoTexto: { fontSize: fontes.tamanho.xxs, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.branco },
  statusOk: { fontSize: fontes.tamanho.sm, color: cores.verdeForte, marginTop: 2 },
  statusContestado: { fontSize: fontes.tamanho.sm, color: cores.vermelhoTexto, marginTop: 2 },
  statusPendente: { fontSize: fontes.tamanho.sm, color: cores.textoMuted, marginTop: 2 },
  valor: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.extra, color: cores.texto },
  acoes: { flexDirection: "row", gap: 4 },
  botaoIcone: { borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: 6 },
  botaoOkAtivo: { borderColor: cores.verdeBorda, backgroundColor: cores.verde },
  botaoAlertaAtivo: { borderColor: cores.vermelhoBorda, backgroundColor: cores.vermelho },
});
