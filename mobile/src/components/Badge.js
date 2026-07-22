import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { STATUS_CFG, VIAGEM_CFG, PARTICIPANTE_CFG, fontes } from "../theme";

export function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status];
  const icone = { pendente: "clock-outline", aprovado: "check-circle", recusado: "close-circle", pago: "cash" }[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.fundo, borderColor: cfg.borda }]}>
      <MaterialCommunityIcons name={icone} size={12} color={cfg.cor} />
      <Text style={[styles.texto, { color: cfg.cor }]}>{cfg.label}</Text>
    </View>
  );
}

export function ViagemBadge({ status }) {
  const cfg = VIAGEM_CFG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.fundo, borderColor: cfg.borda }]}>
      <MaterialCommunityIcons name={status === "fechada" ? "lock" : "airplane"} size={11} color={cfg.cor} />
      <Text style={[styles.texto, { color: cfg.cor }]}>{cfg.label}</Text>
    </View>
  );
}

export function ParticipanteBadge({ status }) {
  const cfg = PARTICIPANTE_CFG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.fundo, borderColor: cfg.borda }]}>
      <MaterialCommunityIcons name={status === "fechado" ? "lock" : "clock-outline"} size={11} color={cfg.cor} />
      <Text style={[styles.texto, { color: cfg.cor }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  texto: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.medio },
});
