import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { cores, fontes } from "../theme";

export default function TrocarSenhaScreen() {
  const { trocarSenha, erroTrocarSenha } = useAuth();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erroLocal, setErroLocal] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (senha.length < 6) return setErroLocal("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== confirmacao) return setErroLocal("As senhas não conferem.");
    setErroLocal("");
    setEnviando(true);
    await trocarSenha(senha);
    setEnviando(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: cores.fundo, justifyContent: "center", padding: 20 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ backgroundColor: cores.cartao, borderRadius: 18, borderWidth: 1, borderColor: cores.borda, padding: 22 }}>
        <View style={{ alignItems: "center", marginBottom: 18 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: cores.azulClaro, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <MaterialCommunityIcons name="key-variant" size={20} color={cores.azul} />
          </View>
          <Text style={{ fontSize: fontes.tamanho.xl, fontWeight: fontes.peso.extra, color: cores.texto }}>Defina sua senha</Text>
          <Text style={{ fontSize: fontes.tamanho.base, color: cores.textoMuted, marginTop: 4, textAlign: "center" }}>
            Este é seu primeiro acesso — troque a senha provisória antes de continuar.
          </Text>
        </View>

        <Text style={{ fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginBottom: 4, letterSpacing: 0.3 }}>
          Nova senha
        </Text>
        <TextInput
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          placeholder="••••••••"
          style={{ borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: fontes.tamanho.lg, marginBottom: 12, color: cores.texto, backgroundColor: cores.branco }}
        />

        <Text style={{ fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, marginBottom: 4, letterSpacing: 0.3 }}>
          Confirme a nova senha
        </Text>
        <TextInput
          value={confirmacao}
          onChangeText={setConfirmacao}
          secureTextEntry
          placeholder="••••••••"
          style={{ borderWidth: 1, borderColor: cores.bordaInput, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: fontes.tamanho.lg, marginBottom: 16, color: cores.texto, backgroundColor: cores.branco }}
        />

        {(erroLocal || erroTrocarSenha) ? (
          <Text style={{ color: cores.vermelhoTexto, backgroundColor: cores.vermelho, borderRadius: 8, padding: 10, fontSize: fontes.tamanho.md, marginBottom: 12 }}>
            {erroLocal || erroTrocarSenha}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={enviar}
          disabled={enviando}
          style={{ backgroundColor: cores.navy, borderRadius: 10, paddingVertical: 13, alignItems: "center", opacity: enviando ? 0.6 : 1 }}
        >
          {enviando ? <ActivityIndicator color={cores.branco} /> : <Text style={{ color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.lg }}>Salvar e continuar</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
