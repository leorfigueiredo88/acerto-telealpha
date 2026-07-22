import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { cores, fontes } from "../../theme";
import LinhaDespesa from "../../components/LinhaDespesa";

export default function HistoricoScreen() {
  const { perfil } = useAuth();
  const { despesas, viagens, recarregar } = useData();
  const [atualizando, setAtualizando] = useState(false);

  const minhas = despesas.filter((d) => d.usuarioId === perfil.id);
  const viagemDe = (d) => viagens.find((v) => v.id === d.viagemId);

  const atualizar = async () => {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  };

  return (
    <View style={styles.tela}>
      <FlatList
        data={minhas}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.conteudo}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => <LinhaDespesa despesa={item} viagem={viagemDe(item)} />}
        ListEmptyComponent={
          <View style={styles.vazioBox}>
            <Text style={styles.vazioTexto}>Nenhuma despesa lançada ainda. Toque em uma viagem no Início para começar.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  vazioBox: { borderWidth: 1, borderStyle: "dashed", borderColor: cores.bordaInput, borderRadius: 16, padding: 40, alignItems: "center" },
  vazioTexto: { fontSize: fontes.tamanho.md, color: cores.textoMuted, textAlign: "center" },
});
