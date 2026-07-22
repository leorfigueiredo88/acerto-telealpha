import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useData } from "../context/DataContext";
import { cores, brl, fontes } from "../theme";
import { alertar } from "../lib/alertar";
import { ParticipanteBadge } from "./Badge";
import LinhaDespesa from "./LinhaDespesa";
import LinhaCredito from "./LinhaCredito";

export default function PainelParticipante({ viagem, participante, onAbrirDespesa, onLancarCredito, onVerRelatorio }) {
  const { despesas, creditos, usuarioPorId, fecharAcertoParticipante } = useData();
  const [fechando, setFechando] = useState(false);

  const colab = usuarioPorId(participante.usuarioId);
  const minhas = despesas.filter((d) => d.viagemId === viagem.id && d.usuarioId === participante.usuarioId);
  const meusCreditos = creditos.filter((c) => c.viagemId === viagem.id && c.usuarioId === participante.usuarioId);
  const pend = minhas.filter((d) => d.status === "pendente").length;
  const totalDespesas = minhas.filter((d) => d.status === "aprovado" || d.status === "pago").reduce((a, d) => a + d.valor, 0);
  const naoConfirmados = meusCreditos.filter((c) => c.confirmado !== true).length;
  const totalCreditos = meusCreditos.filter((c) => c.confirmado === true).reduce((a, c) => a + c.valor, 0);
  const saldo = totalDespesas - totalCreditos;
  const podeFechar = participante.status === "aberto" && pend === 0 && naoConfirmados === 0;

  const confirmarFechamento = () => {
    alertar("Fechar acerto", `Fechar o acerto de ${colab?.nome}? Essa ação não pode ser desfeita.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Fechar acerto",
        style: "destructive",
        onPress: async () => {
          setFechando(true);
          try {
            await fecharAcertoParticipante(viagem.id, participante.usuarioId);
          } catch (e) {
            alertar("Não foi possível fechar", e.message);
          } finally {
            setFechando(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topo}>
        <Text style={styles.nome}>{colab?.nome}</Text>
        <ParticipanteBadge status={participante.status} />
      </View>

      <View style={styles.stats}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Despesas</Text>
          <Text style={styles.statValor}>{brl(totalDespesas)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Créditos</Text>
          <Text style={styles.statValor}>{brl(totalCreditos)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Saldo</Text>
          <Text style={styles.statValor}>{brl(saldo)}</Text>
        </View>
      </View>

      {minhas.length > 0 && (
        <View style={{ gap: 6, marginTop: 12 }}>
          {minhas.map((d) => (
            <LinhaDespesa key={d.id} despesa={d} onPress={d.status === "pendente" ? () => onAbrirDespesa(d) : undefined} />
          ))}
        </View>
      )}

      <View style={styles.creditosTopo}>
        <View style={styles.creditosTitulo}>
          <MaterialCommunityIcons name="wallet-outline" size={13} color={cores.textoMuted} />
          <Text style={styles.creditosTexto}>Créditos</Text>
        </View>
        {participante.status === "aberto" && (
          <TouchableOpacity onPress={onLancarCredito} style={styles.linkLancar}>
            <MaterialCommunityIcons name="plus" size={13} color={cores.azul} />
            <Text style={styles.linkLancarTexto}>Lançar crédito</Text>
          </TouchableOpacity>
        )}
      </View>
      {meusCreditos.length > 0 && (
        <View style={{ gap: 6, marginTop: 6 }}>
          {meusCreditos.map((c) => <LinhaCredito key={c.id} credito={c} />)}
        </View>
      )}

      <View style={{ marginTop: 12 }}>
        {participante.status === "aberto" ? (
          <>
            <TouchableOpacity
              style={[styles.botao, !podeFechar && { opacity: 0.4 }]}
              disabled={!podeFechar || fechando}
              onPress={confirmarFechamento}
            >
              <MaterialCommunityIcons name="lock" size={15} color={cores.branco} />
              <Text style={styles.botaoTexto}>Fechar acerto de {colab?.nome?.split(" ")[0]}</Text>
            </TouchableOpacity>
            {!podeFechar && (
              <Text style={styles.avisoTexto}>
                {pend > 0 && `${pend} despesa${pend !== 1 ? "s" : ""} pendente${pend !== 1 ? "s" : ""}`}
                {pend > 0 && naoConfirmados > 0 && " · "}
                {naoConfirmados > 0 && `${naoConfirmados} crédito${naoConfirmados !== 1 ? "s" : ""} não confirmado${naoConfirmados !== 1 ? "s" : ""}`}
              </Text>
            )}
          </>
        ) : (
          <TouchableOpacity style={styles.botaoAccent} onPress={onVerRelatorio}>
            <MaterialCommunityIcons name="file-document" size={15} color={cores.branco} />
            <Text style={styles.botaoTexto}>Ver relatório do acerto</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: cores.cartao, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, padding: 14 },
  topo: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  nome: { fontSize: fontes.tamanho.lg, fontWeight: fontes.peso.negrito, color: cores.texto },
  stats: { flexDirection: "row", gap: 8, marginTop: 10 },
  statBox: { flex: 1, backgroundColor: cores.fundo, borderRadius: 10, padding: 8 },
  statLabel: { fontSize: fontes.tamanho.xs, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted },
  statValor: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.extra, color: cores.texto, marginTop: 2 },
  creditosTopo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  creditosTitulo: { flexDirection: "row", alignItems: "center", gap: 5 },
  creditosTexto: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, letterSpacing: 0.3 },
  linkLancar: { flexDirection: "row", alignItems: "center", gap: 3 },
  linkLancarTexto: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.medio, color: cores.azul },
  botao: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 12 },
  botaoAccent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.azul, borderRadius: 10, paddingVertical: 12 },
  botaoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.md },
  avisoTexto: { marginTop: 6, fontSize: fontes.tamanho.sm, color: cores.amareloTexto, textAlign: "center" },
});
