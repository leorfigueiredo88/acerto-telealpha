import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { cores, fontes } from "../theme";

export function useAppHeaderOptions(subtitulo) {
  const { perfil, logout } = useAuth();
  return {
    headerStyle: { backgroundColor: cores.cartao },
    headerShadowVisible: true,
    headerTitle: () => (
      <View>
        <Text style={styles.titulo}>Telealpha · Acerto</Text>
        <Text style={styles.subtitulo}>{subtitulo}</Text>
      </View>
    ),
    headerRight: () => (
      <TouchableOpacity onPress={logout} style={styles.sairBotao}>
        <MaterialCommunityIcons name="logout" size={18} color={cores.textoMuted} />
      </TouchableOpacity>
    ),
  };
}

const styles = StyleSheet.create({
  titulo: { fontSize: fontes.tamanho.lg, fontWeight: fontes.peso.extra, color: cores.navy },
  subtitulo: { fontSize: fontes.tamanho.xs, color: cores.textoMuted, marginTop: 1 },
  sairBotao: { padding: 8, marginRight: 4, borderRadius: 8 },
});
