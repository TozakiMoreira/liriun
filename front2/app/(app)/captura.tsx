import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { Header } from "@/components/Header";
import { TarefaForm } from "@/components/TarefaForm";
import { useAuthStore } from "@/stores/auth";

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Captura() {
  const usuario = useAuthStore((s) => s.usuario);
  const [formAberto, setFormAberto] = useState(false);

  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <Header icon="flash" title="Captura Rápida" />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 32,
          gap: 32,
          alignItems: "center",
        }}
      >
        <View className="items-center gap-2.5 max-w-[440px]">
          <Text
            className="text-[24px] text-text font-semibold tracking-tight text-center"
            testID="jarvis-greeting"
          >
            {saudacao()}
            {primeiroNome ? `, ${primeiroNome}` : ""}
          </Text>
          <Text className="text-text-dim text-base font-medium tracking-tight">
            O que você precisa anotar?
          </Text>
          <Text className="text-text-dim text-[13px] text-center leading-relaxed">
            Escolha como quer criar a tarefa. Manual pra quando você já sabe
            tudo, Jarvis pra quando quer que eu organize pra você.
          </Text>
        </View>

        <View className="w-full gap-3 max-w-[440px]">
          <ModoCard
            icon="create-outline"
            titulo="Manual"
            descricao="Você preenche os campos: nome, categoria, prazo e prioridade. Rápido e sem surpresas."
            onPress={() => setFormAberto(true)}
            testID="mode-manual"
          />
          <ModoCard
            icon="sparkles-outline"
            titulo="Jarvis"
            descricao="Escreve livre e eu organizo: categorizo, defino prazo, prioridade. Você só revisa."
            onPress={() =>
              toast("Modo Jarvis chega em breve. Por ora, usa o Manual.")
            }
            testID="mode-jarvis"
            disabled
          />
        </View>
      </ScrollView>

      <TarefaForm visible={formAberto} onClose={() => setFormAberto(false)} />
    </SafeAreaView>
  );
}

function ModoCard({
  icon,
  titulo,
  descricao,
  onPress,
  testID,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  onPress: () => void;
  testID?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      className={`bg-bg-elev border border-border rounded-lg p-5 gap-3 active:border-border-strong ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="w-9 h-9 rounded-md bg-bg-input border border-border-strong items-center justify-center">
          <Ionicons name={icon} size={18} color="#8a8f98" />
        </View>
        {disabled && (
          <View className="px-2 py-0.5 rounded-full bg-bg-input border border-border">
            <Text className="text-text-subtle text-[10px] tracking-wider">
              EM BREVE
            </Text>
          </View>
        )}
      </View>
      <Text className="text-base font-semibold tracking-tight text-text">
        {titulo}
      </Text>
      <Text className="text-text-dim text-[13px] leading-relaxed">
        {descricao}
      </Text>
    </Pressable>
  );
}
