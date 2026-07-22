import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useData } from "../../context/DataContext";
import { cores, fontes } from "../../theme";
import LinhaDespesa from "../../components/LinhaDespesa";
import SelectModal from "../../components/SelectModal";

export default function ConciliacaoScreen({ navigation }) {
  const { despesas, viagens, recarregar } = useData();
  const [atualizando, setAtualizando] = useState(false);
  const [fViagem, setFViagem] = useState("");

  const pendentes = useMemo(
    () =>
      despesas
        .filter((d) => d.status === "pendente" && (!fViagem || d.viagemId === fViagem))
        .sort((a, b) => a.data.localeCompare(b.data)),
    [despesas, fViagem]
  );

  const atualizar = async () => {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  };

  return (
    <View style={styles.tela}>
      <View style={styles.filtros}>
        <SelectModal
          placeholder="Todas as viagens"
          value={fViagem}
          onChange={setFViagem}
          options={[{ value: "", label: "Todas as viagens" }, ...viagens.map((v) => ({ value: v.id, label: v.nome }))]}
        />
      </View>

      <FlatList
        data={pendentes}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <LinhaDespesa
            despesa={item}
            mostrarColab
            viagem={viagens.find((v) => v.id === item.viagemId)}
            onPress={() => navigation.navigate("Conciliar", { despesaId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.vazioBox}>
            <MaterialCommunityIcons name="inbox" size={28} color={cores.textoFraco} />
            <Text style={styles.vazioTitulo}>Tudo conciliado por aqui</Text>
            <Text style={styles.vazioTexto}>Nenhuma despesa pendente com os filtros atuais.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  filtros: { paddingHorizontal: 16, paddingTop: 14 },
  lista: { padding: 16, paddingTop: 4, paddingBottom: 32, flexGrow: 1 },
  vazioBox: { alignItems: "center", gap: 6, padding: 50 },
  vazioTitulo: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.textoMuted },
  vazioTexto: { fontSize: fontes.tamanho.sm, color: cores.textoFraco, textAlign: "center" },
});
