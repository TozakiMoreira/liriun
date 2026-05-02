import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { extractErrorMessage } from "@/api/error";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import {
  useCategorias,
  useCriarCategoria,
  useRemoverCategoria,
} from "@/hooks/useCategorias";
import {
  useCriarPrazo,
  usePrazos,
  useRemoverPrazo,
} from "@/hooks/usePrazos";
import { formatarDuracaoDias } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";

type Aba = "categorias" | "prazos";

export default function Configuracoes() {
  const [aba, setAba] = useState<Aba>("categorias");
  const usuario = useAuthStore((s) => s.usuario);
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();

  const sair = () => {
    Alert.alert("Sair", "Tem certeza que quer sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await clear();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <Header icon="settings" title="Configurações" />

      <View className="flex-row gap-1.5 px-4 py-3 border-b border-border">
        {(["categorias", "prazos"] as const).map((a) => {
          const ativa = aba === a;
          return (
            <Pressable
              key={a}
              onPress={() => setAba(a)}
              className={`px-3 py-1.5 rounded border ${
                ativa
                  ? "bg-accent/15 border-accent/40"
                  : "bg-bg-elev border-border"
              }`}
            >
              <Text
                className={`text-[13px] capitalize ${
                  ativa ? "text-text" : "text-text-dim"
                }`}
              >
                {a}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {aba === "categorias" ? <AbaCategorias /> : <AbaPrazos />}

      <View className="border-t border-border px-4 py-3 flex-row items-center gap-3">
        <View className="w-7 h-7 rounded-full bg-violet items-center justify-center">
          <Text className="text-white text-[11px] font-semibold">
            {usuario?.nome?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-text text-[13px] font-medium">
            {usuario?.nome}
          </Text>
          <Text className="text-text-subtle text-[11px]">{usuario?.email}</Text>
        </View>
        <Pressable
          onPress={sair}
          hitSlop={8}
          className="px-3 py-1.5 rounded border border-border bg-bg-elev"
        >
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="log-out-outline" size={14} color="#8a8f98" />
            <Text className="text-text-dim text-[12px]">Sair</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function AbaCategorias() {
  const { data: categorias = [], isLoading } = useCategorias();
  const criar = useCriarCategoria();
  const remover = useRemoverCategoria();
  const [nome, setNome] = useState("");

  const adicionar = () => {
    const n = nome.trim();
    if (!n) return;
    criar.mutate(n, {
      onSuccess: () => {
        setNome("");
        toast.success("Categoria criada.");
      },
      onError: (err) =>
        toast.error(extractErrorMessage(err, "Não consegui criar.")),
    });
  };

  const confirmarRemover = (id: string, nome: string) => {
    Alert.alert("Remover categoria", `Remover "${nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () =>
          remover.mutate(id, {
            onSuccess: () => toast.success("Removida."),
            onError: (err) =>
              toast.error(extractErrorMessage(err, "Não consegui remover.")),
          }),
      },
    ]);
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View className="flex-row gap-2">
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Nova categoria"
          placeholderTextColor="#62666d"
          className="flex-1 bg-bg-elev border border-border rounded px-3 py-2 text-sm text-text"
          style={{ fontSize: 14 }}
          onSubmitEditing={adicionar}
          returnKeyType="done"
        />
        <Button
          label="Add"
          onPress={adicionar}
          loading={criar.isPending}
          fullWidth={false}
          variant="secondary"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#5e6ad2" />
      ) : (
        categorias.map((c) => (
          <View
            key={c.id}
            className="flex-row items-center bg-bg-elev border border-border rounded px-3 py-2.5"
          >
            <Text className="text-text text-[13px] flex-1">{c.nome}</Text>
            <Pressable
              onPress={() => confirmarRemover(c.id, c.nome)}
              hitSlop={8}
              className="p-1"
            >
              <Ionicons name="trash-outline" size={16} color="#8a8f98" />
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function AbaPrazos() {
  const { data: prazos = [], isLoading } = usePrazos();
  const criar = useCriarPrazo();
  const remover = useRemoverPrazo();
  const [nome, setNome] = useState("");
  const [duracao, setDuracao] = useState<number | null | undefined>(undefined);

  const adicionar = () => {
    const n = nome.trim();
    if (!n || duracao === undefined) return;
    criar.mutate(
      { nome: n, duracaoDias: duracao },
      {
        onSuccess: () => {
          setNome("");
          setDuracao(undefined);
          toast.success("Prazo criado.");
        },
        onError: (err) =>
          toast.error(extractErrorMessage(err, "Não consegui criar.")),
      },
    );
  };

  const confirmarRemover = (id: string, nome: string) => {
    Alert.alert("Remover prazo", `Remover "${nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () =>
          remover.mutate(id, {
            onSuccess: () => toast.success("Removido."),
            onError: (err) =>
              toast.error(extractErrorMessage(err, "Não consegui remover.")),
          }),
      },
    ]);
  };

  const opcoes: { label: string; value: number | null }[] = [
    { label: "Hoje (0d)", value: 0 },
    { label: "1 dia", value: 1 },
    { label: "3 dias", value: 3 },
    { label: "7 dias", value: 7 },
    { label: "14 dias", value: 14 },
    { label: "30 dias", value: 30 },
    { label: "Sem prazo", value: null },
  ];

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View className="gap-2">
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Nome do prazo"
          placeholderTextColor="#62666d"
          className="bg-bg-elev border border-border rounded px-3 py-2 text-sm text-text"
          style={{ fontSize: 14 }}
        />
        <View className="flex-row flex-wrap gap-1.5">
          {opcoes.map((o) => {
            const ativa = duracao === o.value;
            return (
              <Pressable
                key={o.label}
                onPress={() => setDuracao(o.value)}
                className={`px-2.5 py-1 rounded border ${
                  ativa
                    ? "bg-accent/15 border-accent/40"
                    : "bg-bg-elev border-border"
                }`}
              >
                <Text
                  className={`text-[12px] ${
                    ativa ? "text-text" : "text-text-dim"
                  }`}
                >
                  {o.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Button
          label="Adicionar prazo"
          onPress={adicionar}
          loading={criar.isPending}
          disabled={!nome.trim() || duracao === undefined}
          variant="secondary"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#5e6ad2" />
      ) : (
        prazos.map((p) => (
          <View
            key={p.id}
            className="flex-row items-center bg-bg-elev border border-border rounded px-3 py-2.5"
          >
            <View className="flex-1">
              <Text className="text-text text-[13px]">{p.nome}</Text>
              <Text className="text-text-subtle text-[11px]">
                {formatarDuracaoDias(p.duracaoDias)}
              </Text>
            </View>
            <Pressable
              onPress={() => confirmarRemover(p.id, p.nome)}
              hitSlop={8}
              className="p-1"
            >
              <Ionicons name="trash-outline" size={16} color="#8a8f98" />
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}
