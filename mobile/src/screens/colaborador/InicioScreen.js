import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { cores, fmtData, fontes } from "../../theme";
import CardResumo from "../../components/CardResumo";
import LinhaDespesa from "../../components/LinhaDespesa";
import { ParticipanteBadge } from "../../components/Badge";

export default function InicioScreen({ navigation }) {
  const { perfil } = useAuth();
  const { despesas, viagens, recarregar, participanteDe } = useData();
  const [atualizando, setAtualizando] = useState(false);

  const minhas = despesas.filter((d) => d.usuarioId === perfil.id);
  const soma = (s) => minhas.filter((d) => d.status === s).reduce((a, d) => a + d.valor, 0);
  const qtd = (s) => minhas.filter((d) => d.status === s).length;
  const viagemDe = (d) => viagens.find((v) => v.id === d.viagemId);
  const minhasViagens = viagens.filter((v) => participanteDe(v, perfil.id));

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
      <View style={styles.cardsResumo}>
        <CardResumo label="Aprovadas" valor={soma("aprovado")} qtd={qtd("aprovado")} icone="check-circle" corFundo={cores.verde} corIcone={cores.verdeForte} />
        <CardResumo label="Pendentes" valor={soma("pendente")} qtd={qtd("pendente")} icone="clock-outline" corFundo={cores.amarelo} corIcone={cores.amareloForte} />
        <CardResumo label="Pagas" valor={soma("pago")} qtd={qtd("pago")} icone="cash" corFundo={cores.azulBadgeFundo} corIcone={cores.azulForte} />
      </View>

      <Text style={styles.secao}>Minhas viagens</Text>
      {minhasViagens.length === 0 && <Text style={styles.vazio}>Você ainda não foi incluído em nenhuma viagem.</Text>}
      {minhasViagens.map((v) => (
        <Pressable
          key={v.id}
          onPress={() => navigation.navigate("ViagemDetalhe", { viagemId: v.id })}
          style={({ pressed }) => [styles.viagemCard, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.viagemTopo}>
            <Text style={styles.viagemNome}>{v.nome}</Text>
            <ParticipanteBadge status={participanteDe(v, perfil.id).status} />
          </View>
          <View style={styles.viagemMeta}>
            <MaterialCommunityIcons name="map-marker" size={12} color={cores.textoMuted} />
            <Text style={styles.viagemMetaTexto}>{v.destino} · {fmtData(v.inicio)} a {fmtData(v.fim)}</Text>
          </View>
        </Pressable>
      ))}

      <View style={styles.secaoTopo}>
        <Text style={styles.secao}>Últimos lançamentos</Text>
      </View>
      <View style={{ gap: 8 }}>
        {minhas.slice(0, 4).map((d) => (
          <LinhaDespesa key={d.id} despesa={d} viagem={viagemDe(d)} />
        ))}
        {minhas.length === 0 && <Text style={styles.vazio}>Nenhuma despesa lançada ainda.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  cardsResumo: { flexDirection: "row", gap: 10 },
  secaoTopo: { marginTop: 22, marginBottom: 10 },
  secao: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginTop: 22, marginBottom: 10, letterSpacing: 0.3 },
  vazio: { fontSize: fontes.tamanho.md, color: cores.textoMuted },
  viagemCard: { backgroundColor: cores.cartao, borderRadius: 14, borderWidth: 1, borderColor: cores.borda, padding: 14, marginBottom: 8 },
  viagemTopo: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  viagemNome: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.negrito, color: cores.texto, flex: 1 },
  viagemMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  viagemMetaTexto: { fontSize: fontes.tamanho.sm, color: cores.textoMuted },
});
