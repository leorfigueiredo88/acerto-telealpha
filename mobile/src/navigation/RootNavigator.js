import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { DataProvider } from "../context/DataContext";
import LoginScreen from "../screens/LoginScreen";
import TrocarSenhaScreen from "../screens/TrocarSenhaScreen";
import ColaboradorNavigator from "./ColaboradorNavigator";
import GestorNavigator from "./GestorNavigator";
import { cores, fontes } from "../theme";

export default function RootNavigator() {
  const { sessao, perfil, carregando, erroPerfil, logout } = useAuth();

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.azul} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!sessao ? (
        <LoginScreen />
      ) : erroPerfil ? (
        <View style={styles.centro}>
          <MaterialCommunityIcons name="alert-circle" size={28} color={cores.vermelhoTexto} />
          <Text style={styles.erroTexto}>{erroPerfil}</Text>
          <TouchableOpacity style={styles.botaoSair} onPress={logout}>
            <Text style={styles.botaoSairTexto}>Sair</Text>
          </TouchableOpacity>
        </View>
      ) : !perfil ? null : perfil.senhaProvisoria ? (
        <TrocarSenhaScreen />
      ) : (
        <DataProvider>
          {perfil.papel === "gestor" ? <GestorNavigator /> : <ColaboradorNavigator />}
        </DataProvider>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: cores.fundo, padding: 24 },
  erroTexto: { fontSize: fontes.tamanho.md, color: cores.texto, textAlign: "center", maxWidth: 300 },
  botaoSair: { backgroundColor: cores.navy, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  botaoSairTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.md },
});
