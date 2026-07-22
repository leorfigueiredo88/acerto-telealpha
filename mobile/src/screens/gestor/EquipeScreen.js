import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useData } from "../../context/DataContext";
import { cores, fontes } from "../../theme";
import { alertar } from "../../lib/alertar";

export default function EquipeScreen({ navigation }) {
  const { usuarios, recarregar, enviarRedefinicaoSenha, definirStatusColaborador } = useData();
  const [atualizando, setAtualizando] = useState(false);

  const colaboradores = usuarios
    .filter((u) => u.papel === "colaborador")
    .sort((a, b) => Number(b.ativo) - Number(a.ativo));

  const atualizar = async () => {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  };

  const confirmarRedefinicao = (u) => {
    alertar(
      "Redefinir senha",
      `Enviar link de redefinição de senha para ${u.nome} (${u.email})?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: async () => {
            try {
              await enviarRedefinicaoSenha(u.email);
              alertar("Link enviado", `Um e-mail de redefinição foi enviado para ${u.email}.`);
            } catch (e) {
              alertar("Erro ao enviar", e.message);
            }
          },
        },
      ]
    );
  };

  const confirmarStatus = (u) => {
    const novoAtivo = !u.ativo;
    alertar(
      novoAtivo ? "Reativar funcionário" : "Desativar funcionário",
      novoAtivo
        ? `Reativar ${u.nome}? Ele volta a conseguir logar e aparecer nas listas.`
        : `Desativar ${u.nome}? Ele deixa de conseguir logar e não aparece mais para novas viagens (o histórico dele é mantido).`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: novoAtivo ? "Reativar" : "Desativar",
          style: novoAtivo ? "default" : "destructive",
          onPress: async () => {
            try {
              await definirStatusColaborador(u.id, novoAtivo);
            } catch (e) {
              alertar("Erro", e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <Text style={styles.tituloTopo}>Funcionários</Text>
        <TouchableOpacity style={styles.botaoNovo} onPress={() => navigation.navigate("NovoColaborador")}>
          <MaterialCommunityIcons name="account-plus" size={15} color={cores.branco} />
          <Text style={styles.botaoNovoTexto}>Novo funcionário</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={colaboradores}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum funcionário cadastrado ainda.</Text>}
        renderItem={({ item: u }) => (
          <View style={[styles.card, !u.ativo && styles.cardInativo]}>
            <View style={[styles.avatar, !u.ativo && styles.avatarInativo]}>
              <Text style={[styles.avatarTexto, !u.ativo && styles.avatarTextoInativo]}>{u.nome?.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.nomeLinha}>
                <Text style={[styles.nome, !u.ativo && styles.nomeInativo]} numberOfLines={1}>{u.nome}</Text>
                {!u.ativo && (
                  <View style={styles.badgeInativo}>
                    <Text style={styles.badgeInativoTexto}>Inativo</Text>
                  </View>
                )}
              </View>
              <Text style={styles.email} numberOfLines={1}>{u.email}</Text>
              <View style={styles.acoes}>
                {u.ativo && (
                  <TouchableOpacity onPress={() => confirmarRedefinicao(u)} style={styles.botaoAcao}>
                    <MaterialCommunityIcons name="email-fast-outline" size={12} color={cores.textoMuted} />
                    <Text style={styles.botaoAcaoTexto}>Redefinir senha</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => confirmarStatus(u)}
                  style={[styles.botaoAcao, u.ativo ? styles.botaoDesativar : styles.botaoReativar]}
                >
                  <MaterialCommunityIcons name={u.ativo ? "account-off-outline" : "account-check-outline"} size={12} color={u.ativo ? cores.vermelhoForte : cores.verdeForte} />
                  <Text style={[styles.botaoAcaoTexto, { color: u.ativo ? cores.vermelhoForte : cores.verdeForte }]}>{u.ativo ? "Desativar" : "Reativar"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  tituloTopo: { fontSize: fontes.tamanho.base, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted, letterSpacing: 0.3 },
  botaoNovo: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: cores.navy, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  botaoNovoTexto: { color: cores.branco, fontWeight: fontes.peso.negrito, fontSize: fontes.tamanho.base },
  lista: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  vazio: { fontSize: fontes.tamanho.md, color: cores.textoMuted, textAlign: "center", marginTop: 40 },
  card: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: cores.cartao, borderRadius: 14, borderWidth: 1, borderColor: cores.borda, padding: 14 },
  cardInativo: { backgroundColor: cores.fundoAlt },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: cores.fundo, alignItems: "center", justifyContent: "center" },
  avatarInativo: { backgroundColor: cores.borda },
  avatarTexto: { fontSize: fontes.tamanho.xl, fontWeight: fontes.peso.extra, color: cores.textoMuted },
  avatarTextoInativo: { color: cores.textoFraco },
  nomeLinha: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  nome: { fontSize: fontes.tamanho.md, fontWeight: fontes.peso.medio, color: cores.texto },
  nomeInativo: { color: cores.textoMuted },
  badgeInativo: { backgroundColor: cores.borda, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  badgeInativoTexto: { fontSize: fontes.tamanho.xxs, fontWeight: fontes.peso.negrito, textTransform: "uppercase", color: cores.textoMuted },
  email: { fontSize: fontes.tamanho.sm, color: cores.textoMuted, marginTop: 1 },
  acoes: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  botaoAcao: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: cores.borda, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  botaoAcaoTexto: { fontSize: fontes.tamanho.sm, fontWeight: fontes.peso.medio, color: cores.textoMuted },
  botaoDesativar: { borderColor: cores.vermelhoBorda },
  botaoReativar: { borderColor: cores.verdeBorda },
});
