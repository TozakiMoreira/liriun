import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/Header";
import { useTarefasConcluidas } from "@/hooks/useTarefas";
import { formatarData } from "@/lib/format";

type Periodo = "dia" | "semana" | "mes" | "tudo";

function calcularRange(periodo: Periodo): { de?: string; ate?: string } {
  if (periodo === "tudo") return {};
  const agora = new Date();
  const ate = new Date(agora);
  const de = new Date(agora);

  if (periodo === "dia") {
    de.setHours(0, 0, 0, 0);
  } else if (periodo === "semana") {
    de.setDate(de.getDate() - 7);
  } else {
    de.setMonth(de.getMonth() - 1);
  }

  return {
    de: de.toISOString(),
    ate: ate.toISOString(),
  };
}

const FILTROS: { value: Periodo; label: string }[] = [
  { value: "dia", label: "Hoje" },
  { value: "semana", label: "7 dias" },
  { value: "mes", label: "30 dias" },
  { value: "tudo", label: "Tudo" },
];

export default function Concluidas() {
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const range = useMemo(() => calcularRange(periodo), [periodo]);
  const { data: tarefas = [], isLoading, refetch, isRefetching } =
    useTarefasConcluidas(range.de, range.ate);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <Header
        icon="checkmark-circle"
        title="Concluídas"
        badge={`${tarefas.length}`}
      />

      <View className="flex-row gap-1.5 px-4 py-3 border-b border-border">
        {FILTROS.map((f) => {
          const ativo = periodo === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => setPeriodo(f.value)}
              className={`px-2.5 py-1 rounded border ${
                ativo
                  ? "bg-accent/15 border-accent/40"
                  : "bg-bg-elev border-border"
              }`}
            >
              <Text
                className={`text-[13px] ${
                  ativo ? "text-text" : "text-text-dim"
                }`}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor="#5e6ad2"
          />
        }
      >
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#5e6ad2" />
          </View>
        ) : tarefas.length === 0 ? (
          <View className="py-16 items-center">
            <Text className="text-text-subtle text-[13px]">
              Nada por aqui ainda.
            </Text>
          </View>
        ) : (
          tarefas.map((t) => (
            <View
              key={t.id}
              className="bg-bg-elev border border-border rounded-lg px-3 py-3 gap-1"
            >
              <Text className="text-text-dim text-sm" numberOfLines={2}>
                {t.nome}
              </Text>
              <View className="flex-row items-center gap-2 flex-wrap">
                {t.concluidaEm && (
                  <Text className="text-text-subtle text-[11px]">
                    Concluída em {formatarData(t.concluidaEm)}
                  </Text>
                )}
                {t.categorias.slice(0, 2).map((c) => (
                  <Text key={c.id} className="text-text-subtle text-[11px]">
                    · {c.nome}
                  </Text>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
