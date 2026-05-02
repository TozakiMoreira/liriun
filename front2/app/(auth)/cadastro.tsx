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

export default function Cadastro() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.set);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async () => {
    if (carregando) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await authApi.cadastrar(nome.trim(), email.trim(), senha);
      await setAuth(res.token, {
        id: res.usuarioId,
        nome: res.nome,
        email: res.email,
      });
      toast.success(`Prazer em te conhecer, ${res.nome.split(" ")[0]}.`);
      router.replace("/onboarding");
    } catch (err) {
      setErro(
        extractErrorMessage(err, "Não consegui criar sua conta. Tenta de novo."),
      );
    } finally {
      setCarregando(false);
    }
  };

  const valido =
    nome.trim() !== "" && email.trim() !== "" && senha.length >= 8;

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
              Prazer em te conhecer. Me conta seu nome que eu começo a organizar
              as coisas pra você.
            </Text>
          </View>

          <View className="gap-3.5">
            <Input
              label="Como devo te chamar?"
              value={nome}
              onChangeText={setNome}
              placeholder="Seu primeiro nome"
              autoCapitalize="words"
              autoComplete="given-name"
              testID="signup-nome"
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@exemplo.com"
              hint="Uso só pra identificar sua conta."
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              testID="signup-email"
            />

            <Input
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              placeholder="Mínimo de 8 caracteres"
              secureTextEntry
              autoComplete="new-password"
              testID="signup-senha"
            />

            {erro && (
              <Text className="text-danger text-xs" testID="signup-erro">
                {erro}
              </Text>
            )}

            <Button
              label={carregando ? "Criando..." : "Criar conta"}
              onPress={enviar}
              disabled={!valido}
              loading={carregando}
              testID="signup-submit"
            />
          </View>

          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-text-subtle text-xs">ou</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <View className="flex-row justify-center gap-1.5">
            <Text className="text-text-dim text-[13px]">Já tem conta?</Text>
            <Link href="/login" className="text-text font-medium text-[13px]">
              Entrar
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
