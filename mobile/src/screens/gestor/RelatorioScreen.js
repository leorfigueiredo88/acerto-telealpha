import { Share, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { cores, fmtData, brl, STATUS_CFG, TIPO_CREDITO_CFG, fontes } from "../../theme";

export default function RelatorioScreen({ route }) {
  const { viagemId, usuarioId } = route.params;
  const { perfil } = useAuth();
  const { viagens, despesas, creditos, categoriaPorId, usuarioPorId } = useData();

  const viagem = viagens.find((v) => v.id === viagemId);
  const colaborador = usuarioPorId(usuarioId);
  const dv = despesas.filter((d) => d.viagemId === viagemId && d.usuarioId === usuarioId);
  const validas = dv.filter((d) => d.status !== "recusado");
  const totalDespesas = validas.reduce((a, d) => a + d.valor, 0);
  const meusCreditos = creditos.filter((c) => c.viagemId === viagemId && c.usuarioId === usuarioId);
  const totalCreditos = meusCreditos.filter((c) => c.confirmado === true).reduce((a, c) => a + c.valor, 0);
  const saldo = totalDespesas - totalCreditos;

  if (!viagem || !colaborador) return null;

  const compartilhar = () => {
    const linhas = [
      `RELATÓRIO DE ACERTO — ${viagem.nome}`,
      `${viagem.destino} · ${fmtData(viagem.inicio)} a ${fmtData(viagem.fim)}`,
      `Colaborador: ${colaborador.nome}`,
      `Gestor: ${perfil.nome}`,
      "",
      "Despesas:",
      ...dv.map(
        (d) => `- ${fmtData(d.data)} · ${categoriaPorId(d.categoriaId)?.nome} · ${d.descricao} · ${brl(d.valor)} (${STATUS_CFG[d.status].label})`
      ),
      "",
      "Créditos:",
      ...meusCreditos.map(
        (c) => `- ${TIPO_CREDITO_CFG[c.tipo].label}${c.descricao ? " — " + c.descricao : ""} · ${brl(c.valor)} (${c.confirmado ? "confirmado" : "não recebido"})`
      ),
      "",
      `Total de despesas: ${brl(totalDespesas)}`,
      `Total de créditos confirmados: ${brl(totalCreditos)}`,
      saldo >= 0 ? `Saldo a reembolsar: ${brl(saldo)}` : `Saldo a descontar: ${brl(Math.abs(saldo))}`,
    ];
    Share.share({ message: linhas.join("\n") });
  };

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <TouchableOpacity style={styles.botaoCompartilhar} onPress={compartilhar}>
        <MaterialCommunityIcons name="share-variant" size={16} color={cores.branco} />
        <Text style={styles.botaoCompartilharTexto}>Compartilhar relatório</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.titulo}>{viagem.nome}</Text>
        <Text style={styles.subtitulo}>{viagem.destino} · {fmtData(viagem.inicio)} a {fmtData(viagem.fim)}</Text>
        <Text style={styles.subtitulo}>Colaborador: {colaborador.nome}</Text>
        <Text style={styles.subtitulo}>Gestor responsável: {perfil.nome}</Text>

        <Text style={styles.secao}>Despesas do acerto</Text>
        {dv.length === 0 && <Text style={styles.vazio}>Nenhuma despesa lançada.</Text>}
        {dv.map((d) => (
          <View key={d.id} style={styles.linha}>
            <View style={{ flex: 1 }}>
              <Text style={styles.linhaTitulo} numberOfLines={1}>{d.descricao}</Text>
              <Text style={styles.linhaMeta}>
                {fmtData(d.data)} · {categoriaPorId(d.categoriaId)?.nome} · {STATUS_CFG[d.status].label}
              </Text>
            </View>
            <Text style={[styles.linhaValor, d.status === "recusado" && styles.riscado]}>{brl(d.valor)}</Text>
          </View>
        ))}
        <View style={styles.totalLinha}>
          <Text style={styles.totalLabel}>Total de despesas</Text>
          <Text style={styles.totalValor}>{brl(totalDespesas)}</Text>
        </View>

        <Text style={styles.secao}>Diárias e créditos</Text>
        {meusCreditos.length === 0 && <Text style={styles.vazio}>Nenhum crédito lançado.</Text>}
        {meusCreditos.map((c) => (
          <View key={c.id} style={styles.linha}>
            <View style={{ flex: 1 }}>
              <Text style={styles.linhaTitulo}>{TIPO_CREDITO_CFG[c.tipo].label}{c.descricao ? ` — ${c.descricao}` : ""}</Text>
              <Text style={styles.linhaMeta}>{c.confirmado ? "Confirmado pelo colaborador" : "Não recebido"}</Text>
            </View>
            <Text style={styles.linhaValor}>{brl(c.valor)}</Text>
          </View>
        ))}
        <View style={styles.totalLinha}>
          <Text style={styles.totalLabel}>Total de créditos confirmados</Text>
          <Text style={styles.totalValor}>{brl(totalCreditos)}</Text>
        </View>

        <View style={styles.saldoBox}>
          <Text style={styles.saldoLabel}>{saldo >= 0 ? "Saldo a reembolsar" : "Saldo a descontar"}</Text>
          <Text style={styles.saldoValor}>{brl(Math.abs(saldo))}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  botaoCompartilhar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.azul, borderRadius: 10, paddingVertical: 13, marginBottom: 14 },
  botaoCompartilharTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.md },
  card: { backgroundColor: cores.cartao, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, padding: 18 },
  titulo: { fontSize: fontes.tamanho.xxl, fontWeight: fontes.peso.extra, color: cores.navy },
  subtitulo: { fontSize: fontes.tamanho.base, color: cores.textoMuted, marginTop: 2 },
  secao: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.navy, marginTop: 18, marginBottom: 8, letterSpacing: 0.3 },
  vazio: { fontSize: fontes.tamanho.base, color: cores.textoMuted },
  linha: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: cores.fundo },
  linhaTitulo: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.medio, color: cores.texto },
  linhaMeta: { fontSize: fontes.tamanho.xs, color: cores.textoMuted, marginTop: 1 },
  linhaValor: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.negrito, color: cores.texto },
  riscado: { textDecorationLine: "line-through", color: cores.textoFraco },
  totalLinha: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 2, borderTopColor: cores.navy, marginTop: 8, paddingTop: 10 },
  totalLabel: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.extra, textTransform: "uppercase", color: cores.navy },
  totalValor: { fontSize: fontes.tamanho.xl, fontWeight: fontes.peso.extra, color: cores.navy },
  saldoBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: cores.navy, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginTop: 18 },
  saldoLabel: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.branco },
  saldoValor: { fontSize: fontes.tamanho.xxl, fontWeight: fontes.peso.extra, color: cores.branco },
});
