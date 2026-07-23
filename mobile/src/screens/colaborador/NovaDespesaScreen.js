import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { cores, fmtData, hoje, fontes } from "../../theme";
import { alertar } from "../../lib/alertar";
import SelectModal from "../../components/SelectModal";

export default function NovaDespesaScreen({ route, navigation }) {
  const { viagemId } = route.params;
  const { perfil } = useAuth();
  const { viagens, categorias, criarDespesa } = useData();

  const viagem = viagens.find((v) => v.id === viagemId);

  const [foto, setFoto] = useState(null);
  const [ocrEstado, setOcrEstado] = useState("vazio"); // vazio | lendo | lido
  const [valor, setValor] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [data, setData] = useState(hoje());
  const [mostrarData, setMostrarData] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [estabelecimento, setEstabelecimento] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const capturarRecibo = async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      alertar("Permissão necessária", "Autorize o acesso à câmera para fotografar o comprovante.");
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (resultado.canceled) return;

    setFoto(resultado.assets[0].uri);
    setOcrEstado("lendo");
    setTimeout(() => {
      const alimentacao = categorias.find((c) => c.icone === "utensils") ?? categorias[0];
      setValor("54,90");
      setCategoriaId(alimentacao?.id ?? "");
      setEstabelecimento("Restaurante Sabor Real");
      setDescricao("Almoço de negócios com o cliente");
      setOcrEstado("lido");
    }, 1400);
  };

  const enviar = async () => {
    const v = parseFloat(String(valor).replace(/\./g, "").replace(",", "."));
    if (!v || v <= 0) return setErro("Informe um valor válido.");
    if (!categoriaId) return setErro("Selecione a categoria.");
    if (!data) return setErro("Informe a data da despesa.");
    if (!descricao.trim()) return setErro("Descreva a despesa para facilitar a aprovação.");
    setErro("");
    setEnviando(true);
    try {
      await criarDespesa(
        { viagemId, valor: v, categoriaId: Number(categoriaId), data, descricao: descricao.trim(), estabelecimento },
        perfil.id
      );
      alertar("Despesa enviada", "Sua despesa foi enviada para aprovação.");
      navigation.goBack();
    } catch (e) {
      setErro(`Erro ao enviar: ${e.message}`);
    } finally {
      setEnviando(false);
    }
  };

  if (!viagem) return null;

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.viagemBox}>
          <MaterialCommunityIcons name="airplane" size={14} color={cores.azul} />
          <Text style={styles.viagemTexto}>{viagem.nome} — {viagem.destino}</Text>
        </View>

        <TouchableOpacity onPress={ocrEstado === "lendo" ? undefined : capturarRecibo} style={styles.fotoBox}>
          {foto && ocrEstado === "lido" ? (
            <Image source={{ uri: foto }} style={styles.fotoPreview} />
          ) : ocrEstado === "lendo" ? (
            <>
              <ActivityIndicator color={cores.azul} />
              <Text style={styles.fotoTextoAtivo}>Lendo comprovante…</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="camera" size={26} color={cores.textoFraco} />
              <Text style={styles.fotoTitulo}>Fotografar recibo</Text>
              <Text style={styles.fotoSub}>Os dados serão lidos automaticamente (OCR)</Text>
            </>
          )}
          {ocrEstado === "lido" && (
            <Text style={styles.fotoTextoLido}>
              <MaterialCommunityIcons name="line-scan" size={13} color={cores.azul} /> Dados lidos — confira antes de enviar
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput value={valor} onChangeText={setValor} placeholder="0,00" keyboardType="decimal-pad" style={styles.input} />

        <Text style={styles.label}>Data da despesa</Text>
        <TouchableOpacity style={styles.campoData} onPress={() => setMostrarData(true)}>
          <Text style={styles.valorTexto}>{fmtData(data)}</Text>
          <MaterialCommunityIcons name="calendar" size={18} color={cores.textoMuted} />
        </TouchableOpacity>
        {mostrarData && (
          <DateTimePicker
            value={new Date(`${data}T12:00:00`)}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(_, selecionada) => {
              setMostrarData(Platform.OS === "ios");
              if (selecionada) setData(selecionada.toISOString().slice(0, 10));
            }}
          />
        )}

        <SelectModal
          label="Categoria"
          placeholder="Selecione…"
          value={categoriaId}
          onChange={setCategoriaId}
          options={categorias.map((c) => ({ value: c.id, label: c.nome }))}
        />

        <Text style={styles.label}>Descrição / justificativa</Text>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex.: abastecimento para visita ao cliente X"
          multiline
          numberOfLines={3}
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity onPress={enviar} disabled={enviando} style={[styles.botao, enviando && { opacity: 0.6 }]}>
          {enviando ? (
            <ActivityIndicator color={cores.branco} />
          ) : (
            <>
              <MaterialCommunityIcons name="plus" size={16} color={cores.branco} />
              <Text style={styles.botaoTexto}>Enviar para aprovação</Text>
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
  viagemBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: cores.azulClaro,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  viagemTexto: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.medio, color: cores.azulEscuro, flexShrink: 1 },
  label: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginBottom: 4, letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderColor: cores.bordaInput,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fontes.tamanho.lg,
    marginBottom: 14,
    color: cores.texto,
    backgroundColor: cores.branco,
  },
  campoData: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: cores.bordaInput,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: cores.branco,
    marginBottom: 14,
  },
  valorTexto: { fontSize: fontes.tamanho.lg, color: cores.texto },
  fotoBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: cores.bordaInput,
    borderRadius: 14,
    paddingVertical: 26,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
    backgroundColor: cores.fundoAlt,
    overflow: "hidden",
  },
  fotoTitulo: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.texto },
  fotoSub: { fontSize: fontes.tamanho.sm, color: cores.textoFraco },
  fotoTextoAtivo: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.azul },
  fotoTextoLido: { fontSize: fontes.tamanho.sm, color: cores.azul, marginTop: 4 },
  fotoPreview: { width: "100%", height: 160, borderRadius: 10 },
  erro: { color: cores.vermelhoTexto, backgroundColor: cores.vermelho, borderRadius: 8, padding: 10, fontSize: fontes.tamanho.md, marginBottom: 12 },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: cores.navy,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 4,
  },
  botaoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.lg },
});
