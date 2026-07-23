import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { cores, fmtData, hoje, fontes } from "../../theme";

export default function NovaViagemScreen({ navigation }) {
  const { perfil } = useAuth();
  const { usuarios, criarViagem } = useData();
  const colaboradores = usuarios.filter((u) => u.papel === "colaborador" && u.ativo);

  const [nome, setNome] = useState("");
  const [destino, setDestino] = useState("");
  const [inicio, setInicio] = useState(hoje());
  const [fim, setFim] = useState(hoje());
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFim, setMostrarFim] = useState(false);
  const [participantes, setParticipantes] = useState([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const toggle = (id) =>
    setParticipantes((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const criar = async () => {
    if (!nome.trim()) return setErro("Dê um nome à viagem.");
    if (!destino.trim()) return setErro("Informe o destino.");
    if (!inicio || !fim) return setErro("Informe o período da viagem.");
    if (fim < inicio) return setErro("A data final não pode ser anterior à inicial.");
    if (participantes.length === 0) return setErro("Inclua ao menos um participante.");
    setErro("");
    setEnviando(true);
    try {
      await criarViagem({ nome: nome.trim(), destino: destino.trim(), inicio, fim, participantes }, perfil.id);
      navigation.goBack();
    } catch (e) {
      setErro(`Erro ao criar viagem: ${e.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.label}>Nome da viagem</Text>
        <TextInput value={nome} onChangeText={setNome} placeholder="Ex.: Visita técnica — Cliente X" style={styles.input} />

        <Text style={styles.label}>Destino</Text>
        <TextInput value={destino} onChangeText={setDestino} placeholder="Cidade/UF" style={styles.input} />

        <View style={styles.linhaDatas}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Início</Text>
            <TouchableOpacity style={styles.campoData} onPress={() => setMostrarInicio(true)}>
              <Text style={styles.dataTexto}>{fmtData(inicio)}</Text>
              <MaterialCommunityIcons name="calendar" size={16} color={cores.textoMuted} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Fim</Text>
            <TouchableOpacity style={styles.campoData} onPress={() => setMostrarFim(true)}>
              <Text style={styles.dataTexto}>{fmtData(fim)}</Text>
              <MaterialCommunityIcons name="calendar" size={16} color={cores.textoMuted} />
            </TouchableOpacity>
          </View>
        </View>
        {mostrarInicio && (
          <DateTimePicker
            value={new Date(`${inicio}T12:00:00`)}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(_, d) => { setMostrarInicio(Platform.OS === "ios"); if (d) setInicio(d.toISOString().slice(0, 10)); }}
          />
        )}
        {mostrarFim && (
          <DateTimePicker
            value={new Date(`${fim}T12:00:00`)}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(_, d) => { setMostrarFim(Platform.OS === "ios"); if (d) setFim(d.toISOString().slice(0, 10)); }}
          />
        )}

        <Text style={styles.label}>Participantes</Text>
        <View style={{ gap: 8, marginBottom: 14 }}>
          {colaboradores.map((c) => {
            const ativo = participantes.includes(c.id);
            return (
              <TouchableOpacity key={c.id} style={[styles.colabItem, ativo && styles.colabItemAtivo]} onPress={() => toggle(c.id)}>
                <MaterialCommunityIcons
                  name={ativo ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={20}
                  color={ativo ? cores.azul : cores.textoFraco}
                />
                <Text style={styles.colabNome}>{c.nome}</Text>
                <Text style={styles.colabEmail} numberOfLines={1}>{c.email}</Text>
              </TouchableOpacity>
            );
          })}
          {colaboradores.length === 0 && <Text style={styles.vazio}>Nenhum colaborador cadastrado ainda.</Text>}
        </View>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity onPress={criar} disabled={enviando} style={[styles.botao, enviando && { opacity: 0.6 }]}>
          {enviando ? <ActivityIndicator color={cores.branco} /> : (
            <>
              <MaterialCommunityIcons name="airplane" size={16} color={cores.branco} />
              <Text style={styles.botaoTexto}>Criar viagem</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 40 },
  label: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginBottom: 4, letterSpacing: 0.3 },
  input: { borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: fontes.tamanho.lg, marginBottom: 14, color: cores.texto, backgroundColor: cores.branco },
  linhaDatas: { flexDirection: "row", gap: 10, marginBottom: 4 },
  campoData: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: cores.branco, marginBottom: 14 },
  dataTexto: { fontSize: fontes.tamanho.md, color: cores.texto },
  colabItem: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: cores.borda, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: cores.branco },
  colabItemAtivo: { borderColor: cores.azulBordaAtiva, backgroundColor: cores.azulSuave },
  colabNome: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.texto },
  colabEmail: { fontSize: fontes.tamanho.sm, color: cores.textoFraco, marginLeft: "auto" },
  vazio: { fontSize: fontes.tamanho.md, color: cores.textoMuted },
  erro: { color: cores.vermelhoTexto, backgroundColor: cores.vermelho, borderRadius: 8, padding: 10, fontSize: fontes.tamanho.md, marginBottom: 12 },
  botao: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 14, marginTop: 4 },
  botaoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.lg },
});
