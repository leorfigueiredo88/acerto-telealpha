import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ViagensScreen from "../screens/gestor/ViagensScreen";
import ConciliacaoScreen from "../screens/gestor/ConciliacaoScreen";
import EquipeScreen from "../screens/gestor/EquipeScreen";
import VisaoGeralScreen from "../screens/gestor/VisaoGeralScreen";
import { useAppHeaderOptions } from "./AppHeader";
import { useData } from "../context/DataContext";
import { cores } from "../theme";

const Tab = createBottomTabNavigator();

const ICONES = { Viagens: "airplane", "Conciliação": "shield-check", Equipe: "account-group", "Visão geral": "trending-up" };

export default function GestorTabs() {
  const headerOptions = useAppHeaderOptions("Painel do Gestor");
  const { despesas } = useData();
  const pendentes = despesas.filter((d) => d.status === "pendente").length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarActiveTintColor: cores.navy,
        tabBarInactiveTintColor: cores.textoFraco,
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name={ICONES[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Viagens" component={ViagensScreen} />
      <Tab.Screen
        name="Conciliação"
        component={ConciliacaoScreen}
        options={{ tabBarBadge: pendentes > 0 ? pendentes : undefined }}
      />
      <Tab.Screen name="Equipe" component={EquipeScreen} />
      <Tab.Screen name="Visão geral" component={VisaoGeralScreen} />
    </Tab.Navigator>
  );
}
