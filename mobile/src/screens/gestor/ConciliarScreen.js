import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { cores, fmtData, brl, ICON_POR_NOME, fontes } from "../../theme";
import { alertar } from "../../lib/alertar";

export default function ConciliarScreen({ route, navigation }) {
  const { despesaId } = route.params;
  const { perfil } = useAuth();
  const { despesas, viagens, categoriaPorId, usuarioPorId, decidirDespesa } = useData();
  const [recusando, setRecusando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const despesa = despesas.find((d) => d.id === despesaId);
  if (!despesa) {
    return (
      <View style={styles.tela}>
        <Text style={styles.vazio}>Esta despesa já foi conciliada.</Text>
      </View>
    );
  }

  const viagem = viagens.find((v) => v.id === despesa.viagemId);
  const colab = usuarioPorId(despesa.usuarioId);
  const cat = categoriaPorId(despesa.categoriaId);

  const decidir = async (status, motivoRecusa) => {
    setEnviando(true);
    try {
      await decidirDespesa(despesa.id, status, motivoRecusa, perfil.id);
      navigation.goBack();
    } catch (e) {
      alertar("Erro", e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <View style={styles.reciboBox}>
        <MaterialCommunityIcons name={ICON_POR_NOME[cat?.icone] || "receipt"} size={30} color={cores.textoFraco} />
        <Text style={styles.reciboEstab}>{despesa.estabelecimento || "Estabelecimento não informado"}</Text>
        <Text style={styles.reciboValor}>{brl(despesa.valor)}</Text>
      </View>

      <View style={styles.infoBox}>
        <InfoLinha label="Viagem" valor={viagem?.nome} />
        <InfoLinha label="Colaborador" valor={colab?.nome} />
        <InfoLinha label="Categoria" valor={cat?.nome} />
        <InfoLinha label="Data" valor={fmtData(despesa.data)} />
        <InfoLinha label="Valor" valor={brl(despesa.valor)} destaque />
        <View style={styles.divisor} />
        <Text style={styles.infoLabel}>Justificativa</Text>
        <Text style={styles.justificativa}>{despesa.descricao}</Text>
      </View>

      {!recusando ? (
        <View style={styles.linhaBotoes}>
          <TouchableOpacity style={styles.botaoRecusar} disabled={enviando} onPress={() => setRecusando(true)}>
            <MaterialCommunityIcons name="close-circle" size={16} color={cores.vermelhoTexto} />
            <Text style={styles.botaoRecusarTexto}>Recusar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoAprovar} disabled={enviando} onPress={() => decidir("aprovado")}>
            {enviando ? <ActivityIndicator color={cores.branco} /> : (
              <>
                <MaterialCommunityIcons name="check-circle" size={16} color={cores.branco} />
                <Text style={styles.botaoAprovarTexto}>Aprovar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.label}>Motivo da recusa</Text>
          <TextInput
            value={motivo}
            onChangeText={setMotivo}
            multiline
            numberOfLines={3}
            autoFocus
            placeholder="Explique o motivo para o colaborador corrigir o lançamento"
            style={styles.textarea}
          />
          <View style={styles.linhaBotoes}>
            <TouchableOpacity style={styles.botaoVoltar} onPress={() => setRecusando(false)}>
              <Text style={styles.botaoVoltarTexto}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botaoConfirmarRecusa, !motivo.trim() && { opacity: 0.4 }]}
              disabled={!motivo.trim() || enviando}
              onPress={() => decidir("recusado", motivo.trim())}
            >
              {enviando ? <ActivityIndicator color={cores.branco} /> : <Text style={styles.botaoAprovarTexto}>Confirmar recusa</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function InfoLinha({ label, valor, destaque }) {
  return (
    <View style={styles.infoLinha}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValor, destaque && styles.infoValorDestaque]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 40 },
  vazio: { padding: 30, textAlign: "center", color: cores.textoMuted },
  reciboBox: { alignItems: "center", gap: 4, backgroundColor: cores.cartao, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, padding: 20, marginBottom: 14 },
  reciboEstab: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.negrito, color: cores.texto, textAlign: "center" },
  reciboValor: { fontSize: fontes.tamanho.titulo, fontWeight: fontes.peso.extra, color: cores.texto, marginTop: 2 },
  infoBox: { backgroundColor: cores.fundo, borderRadius: 14, padding: 14, gap: 8 },
  infoLinha: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoLabel: { fontSize: fontes.tamanho.base, color: cores.textoMuted },
  infoValor: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.texto, maxWidth: "60%", textAlign: "right" },
  infoValorDestaque: { fontWeight: fontes.peso.extra },
  divisor: { height: 1, backgroundColor: cores.borda, marginVertical: 4 },
  justificativa: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.texto, marginTop: 2 },
  label: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginTop: 16, marginBottom: 4, letterSpacing: 0.3 },
  textarea: { borderWidth: 1, borderColor: cores.vermelhoBorda, borderRadius: 10, padding: 12, fontSize: fontes.tamanho.lg, minHeight: 80, textAlignVertical: "top", backgroundColor: cores.branco },
  linhaBotoes: { flexDirection: "row", gap: 10, marginTop: 16 },
  botaoRecusar: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: cores.vermelhoBorda, borderRadius: 10, paddingVertical: 13 },
  botaoRecusarTexto: { color: cores.vermelhoTexto, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.md },
  botaoAprovar: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 13 },
  botaoAprovarTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.md },
  botaoVoltar: { flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 10, paddingVertical: 13 },
  botaoVoltarTexto: { color: cores.textoMuted, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.md },
  botaoConfirmarRecusa: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: cores.vermelhoForte, borderRadius: 10, paddingVertical: 13 },
});
