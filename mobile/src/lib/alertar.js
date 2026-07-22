import { Alert, Platform } from "react-native";

// Alert.alert é um no-op no react-native-web (não existe diálogo nativo
// no navegador) — isso fazia qualquer confirmação (fechar acerto,
// redefinir senha, desativar funcionário etc.) parecer travada ao testar
// o app mobile pelo preview web do Expo. Este wrapper cai para
// window.alert/confirm nesse caso, mantendo os mesmos botões/onPress.
export function alertar(title, message, buttons) {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  const texto = message ? `${title}\n\n${message}` : title;

  if (!buttons || buttons.length === 0) {
    window.alert(texto);
    return;
  }
  if (buttons.length === 1) {
    window.alert(texto);
    buttons[0].onPress?.();
    return;
  }

  const confirmado = window.confirm(texto);
  const acao = confirmado
    ? buttons.find((b) => b.style !== "cancel")
    : buttons.find((b) => b.style === "cancel");
  acao?.onPress?.();
}
