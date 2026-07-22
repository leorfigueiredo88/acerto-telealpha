import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import InicioScreen from "../screens/colaborador/InicioScreen";
import HistoricoScreen from "../screens/colaborador/HistoricoScreen";
import { useAppHeaderOptions } from "./AppHeader";
import { cores } from "../theme";

const Tab = createBottomTabNavigator();

const ICONES = { Início: "view-dashboard", Histórico: "history" };

export default function ColaboradorTabs() {
  const headerOptions = useAppHeaderOptions("Painel do Colaborador");

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarActiveTintColor: cores.navy,
        tabBarInactiveTintColor: cores.textoFraco,
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name={ICONES[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Início" component={InicioScreen} />
      <Tab.Screen name="Histórico" component={HistoricoScreen} />
    </Tab.Navigator>
  );
}
