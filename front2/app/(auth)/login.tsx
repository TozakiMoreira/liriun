import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { authApi } from "@/api/auth";
import { extractErrorMessage } from "@/api/error";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/auth";

export default function Login() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.set);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async () => {
    if (carregando) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await authApi.login(email.trim(), senha);
      await setAuth(res.token, {
        id: res.usuarioId,
        nome: res.nome,
        email: res.email,
      });
      toast.success(`Bem-vindo de volta, ${res.nome.split(" ")[0]}.`);
      router.replace("/captura");
    } catch (err) {
      setErro(extractErrorMessage(err, "Não consegui entrar. Confere os dados."));
    } finally {
      setCarregando(false);
    }
  };

  const valido = email.trim() !== "" && senha !== "";

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            gap: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center gap-3">
            <Brand size={36} />
            <Text className="text-text-dim text-center leading-relaxed max-w-[320px]">
              Bem-vindo de volta. Entra com suas credenciais que eu cuido do
              resto.
            </Text>
          </View>

          <View className="gap-3.5">
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              testID="login-email"
            />

            <Input
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="current-password"
              testID="login-senha"
            />

            {erro && (
              <Text className="text-danger text-xs" testID="login-erro">
                {erro}
              </Text>
            )}

            <Button
              label={carregando ? "Entrando..." : "Entrar"}
              onPress={enviar}
              disabled={!valido}
              loading={carregando}
              testID="login-submit"
            />
          </View>

          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-text-subtle text-xs">ou</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <View className="flex-row justify-center gap-1.5">
            <Text className="text-text-dim text-[13px]">Primeira vez?</Text>
            <Link href="/cadastro" className="text-text font-medium text-[13px]">
              Criar conta
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="absolute bottom-6 left-0 right-0 items-center">
        <Text className="text-text-subtle text-[11px] tracking-wider">
          JARVIS • v0.1 BETA
        </Text>
      </View>
    </SafeAreaView>
  );
}
