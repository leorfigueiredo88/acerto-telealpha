import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ColaboradorTabs from "./ColaboradorTabs";
import ViagemColaboradorScreen from "../screens/colaborador/ViagemColaboradorScreen";
import NovaDespesaScreen from "../screens/colaborador/NovaDespesaScreen";
import { cores } from "../theme";

const Stack = createNativeStackNavigator();

export default function ColaboradorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: cores.cartao }, headerTintColor: cores.navy }}>
      <Stack.Screen name="ColaboradorTabs" component={ColaboradorTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ViagemDetalhe" component={ViagemColaboradorScreen} options={{ title: "Minha viagem" }} />
      <Stack.Screen
        name="NovaDespesa"
        component={NovaDespesaScreen}
        options={{ title: "Nova despesa", presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
