import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GestorTabs from "./GestorTabs";
import ViagemDetalheScreen from "../screens/gestor/ViagemDetalheScreen";
import NovaViagemScreen from "../screens/gestor/NovaViagemScreen";
import NovoCreditoScreen from "../screens/gestor/NovoCreditoScreen";
import NovoColaboradorScreen from "../screens/gestor/NovoColaboradorScreen";
import IncluirParticipanteScreen from "../screens/gestor/IncluirParticipanteScreen";
import ConciliarScreen from "../screens/gestor/ConciliarScreen";
import RelatorioScreen from "../screens/gestor/RelatorioScreen";
import { cores } from "../theme";

const Stack = createNativeStackNavigator();

export default function GestorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: cores.cartao }, headerTintColor: cores.navy }}>
      <Stack.Screen name="GestorTabs" component={GestorTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ViagemDetalhe" component={ViagemDetalheScreen} options={{ title: "Detalhe da viagem" }} />
      <Stack.Screen name="Relatorio" component={RelatorioScreen} options={{ title: "Relatório de acerto" }} />
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen name="NovaViagem" component={NovaViagemScreen} options={{ title: "Nova viagem" }} />
        <Stack.Screen name="NovoCredito" component={NovoCreditoScreen} options={{ title: "Lançar crédito" }} />
        <Stack.Screen name="NovoColaborador" component={NovoColaboradorScreen} options={{ title: "Novo funcionário" }} />
        <Stack.Screen name="IncluirParticipante" component={IncluirParticipanteScreen} options={{ title: "Incluir funcionário" }} />
        <Stack.Screen name="Conciliar" component={ConciliarScreen} options={{ title: "Analisar despesa" }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
