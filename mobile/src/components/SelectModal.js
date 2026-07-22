import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { cores, fontes } from "../theme";

export default function SelectModal({ label, placeholder, value, options, onChange, getLabel = (o) => o.label, getKey = (o) => o.value }) {
  const [aberto, setAberto] = useState(false);
  const selecionado = options.find((o) => o.value === value);

  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.campo} onPress={() => setAberto(true)}>
        <Text style={selecionado ? styles.valorTexto : styles.placeholder} numberOfLines={1}>
          {selecionado ? getLabel(selecionado) : placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color={cores.textoMuted} />
      </Pressable>

      <Modal visible={aberto} animationType="slide" transparent onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.fundo} onPress={() => setAberto(false)}>
          <Pressable style={styles.folha} onPress={() => {}}>
            <View style={styles.folhaTopo}>
              <Text style={styles.folhaTitulo}>{label || placeholder}</Text>
              <Pressable onPress={() => setAberto(false)}>
                <MaterialCommunityIcons name="close" size={20} color={cores.textoMuted} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={getKey}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.opcao, item.value === value && styles.opcaoAtiva]}
                  onPress={() => {
                    onChange(item.value);
                    setAberto(false);
                  }}
                >
                  <Text style={[styles.opcaoTexto, item.value === value && { color: cores.azul, fontWeight: fontes.peso.negrito }]}>
                    {getLabel(item)}
                  </Text>
                  {item.value === value && <MaterialCommunityIcons name="check" size={18} color={cores.azul} />}
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.vazio}>Nenhuma opção disponível.</Text>}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginBottom: 4, letterSpacing: 0.3 },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: cores.bordaInput,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: cores.branco,
  },
  valorTexto: { fontSize: fontes.tamanho.lg, color: cores.texto, flex: 1 },
  placeholder: { fontSize: fontes.tamanho.lg, color: cores.textoFraco, flex: 1 },
  fundo: { flex: 1, backgroundColor: "rgba(28,25,23,0.5)", justifyContent: "flex-end" },
  folha: { backgroundColor: cores.branco, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 24, maxHeight: "70%" },
  folhaTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  folhaTitulo: { fontSize: fontes.tamanho.xl, fontWeight: fontes.peso.negrito, color: cores.texto },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.fundo,
  },
  opcaoAtiva: { backgroundColor: cores.azulClaro },
  opcaoTexto: { fontSize: fontes.tamanho.lg, color: cores.texto },
  vazio: { padding: 20, textAlign: "center", color: cores.textoMuted, fontSize: fontes.tamanho.md },
});
