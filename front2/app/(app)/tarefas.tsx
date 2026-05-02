import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { toast } from "sonner-native";

import { extractErrorMessage } from "@/api/error";
import { StatusTarefa, type Tarefa } from "@/api/types";
import { Header } from "@/components/Header";
import { TarefaForm } from "@/components/TarefaForm";
import { Button } from "@/components/ui/Button";
import { useConcluirTarefa, useTarefasPendentes } from "@/hooks/useTarefas";
import { formatarPrazo } from "@/lib/format";

interface Grupo {
  chave: string;
  titulo: string;
  atrasada: boolean;
  tarefas: Tarefa[];
}

const PRIORIDADE_COR: Record<number, string> = {
  1: "#eb5757", // urgente
  2: "#f5a623", // importante
  3: "#8a8f98", // normal
  4: "#62666d", // baixa
};

export default function Tarefas() {
  const { data: pendentes = [], isLoading, refetch, isRefetching } =
    useTarefasPendentes();
  const concluir = useConcluirTarefa();

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Tarefa | null>(null);

  const grupos = useMemo<Grupo[]>(() => {
    const atrasadas = pendentes.filter(
      (t) => t.status === StatusTarefa.Atrasada,
    );
    const ativas = pendentes.filter(
      (t) => t.status !== StatusTarefa.Atrasada,
    );

    const porCategoria = new Map<string, Tarefa[]>();
    for (const t of ativas) {
      if (t.categorias.length === 0) {
        const arr = porCategoria.get("__sem__") ?? [];
        arr.push(t);
        porCategoria.set("__sem__", arr);
      } else {
        for (const c of t.categorias) {
          const arr = porCategoria.get(c.id) ?? [];
          arr.push(t);
          porCategoria.set(c.id, arr);
        }
      }
    }

    const out: Grupo[] = [];
    if (atrasadas.length > 0) {
      out.push({
        chave: "atrasadas",
        titulo: "Atrasadas",
        atrasada: true,
        tarefas: atrasadas,
      });
    }
    for (const [chave, tarefas] of porCategoria) {
      const cat = tarefas[0]?.categorias.find((c) => c.id === chave);
      out.push({
        chave,
        titulo: cat?.nome ?? "Sem categoria",
        atrasada: false,
        tarefas,
      });
    }
    return out;
  }, [pendentes]);

  const onConcluir = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    concluir.mutate(id, {
      onSuccess: () => toast.success("Concluída."),
      onError: (err) =>
        toast.error(extractErrorMessage(err, "Não consegui concluir.")),
    });
  };

  const abrirEdicao = (tarefa: Tarefa) => {
    setEditando(tarefa);
    setFormAberto(true);
  };

  const fechar = () => {
    setFormAberto(false);
    setEditando(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <Header
        icon="list"
        title="Minhas Tarefas"
        badge={`${pendentes.length} ${pendentes.length === 1 ? "pendente" : "pendentes"}`}
        right={
          <Button
            label="Nova"
            onPress={() => {
              setEditando(null);
              setFormAberto(true);
            }}
            fullWidth={false}
            testID="new-task-btn"
          />
        }
      />

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
        ) : pendentes.length === 0 ? (
          <View className="py-16 items-center" testID="tarefas-vazio">
            <Text className="text-text-subtle text-[13px]">
              Tudo em dia. Nada pra fazer agora.
            </Text>
          </View>
        ) : (
          grupos.map((g) => (
            <View
              key={g.chave}
              className={`mb-3 ${
                g.atrasada
                  ? "border border-danger/25 rounded-lg p-2 bg-danger/[0.06]"
                  : ""
              }`}
              testID={`group-${g.chave}`}
            >
              <View className="flex-row items-center gap-2 px-2 py-2">
                {g.atrasada && (
                  <Ionicons name="warning" size={12} color="#eb5757" />
                )}
                <Text
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    g.atrasada ? "text-danger" : "text-text-dim"
                  }`}
                >
                  {g.titulo}
                </Text>
                <View
                  className={`px-1.5 py-0.5 rounded-full border ${
                    g.atrasada
                      ? "bg-danger/15 border-danger/30"
                      : "bg-bg-elev border-border"
                  }`}
                >
                  <Text
                    className={`text-[11px] ${
                      g.atrasada ? "text-danger" : "text-text-dim"
                    }`}
                  >
                    {g.tarefas.length}
                  </Text>
                </View>
              </View>

              <View className="gap-1.5">
                {g.tarefas.map((t) => (
                  <TarefaItem
                    key={t.id + g.chave}
                    tarefa={t}
                    onConcluir={() => onConcluir(t.id)}
                    onEditar={() => abrirEdicao(t)}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TarefaForm
        visible={formAberto}
        onClose={fechar}
        tarefa={editando}
      />
    </SafeAreaView>
  );
}

function TarefaItem({
  tarefa,
  onConcluir,
  onEditar,
}: {
  tarefa: Tarefa;
  onConcluir: () => void;
  onEditar: () => void;
}) {
  return (
    <Pressable
      onPress={onEditar}
      className="bg-bg-elev border border-border rounded-lg px-3 py-3 flex-row items-start gap-3 active:border-border-strong"
      testID={`tarefa-${tarefa.id}`}
    >
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onConcluir();
        }}
        hitSlop={8}
        className="mt-0.5 w-5 h-5 rounded-full border-2 border-border-strong items-center justify-center active:border-accent"
      />

      <View className="flex-1 gap-1">
        <Text className="text-text text-sm font-medium" numberOfLines={2}>
          {tarefa.nome}
        </Text>
        <View className="flex-row items-center gap-2 flex-wrap">
          <View
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: PRIORIDADE_COR[tarefa.prioridade] }}
          />
          {tarefa.dataPrazo && (
            <Text
              className={`text-[11px] ${
                tarefa.status === StatusTarefa.Atrasada
                  ? "text-danger"
                  : "text-text-dim"
              }`}
            >
              {formatarPrazo(tarefa.dataPrazo, tarefa.horarioFinal)}
            </Text>
          )}
          {tarefa.categorias.slice(0, 2).map((c) => (
            <Text key={c.id} className="text-text-subtle text-[11px]">
              · {c.nome}
            </Text>
          ))}
          {tarefa.categorias.length > 2 && (
            <Text className="text-text-subtle text-[11px]">
              +{tarefa.categorias.length - 2}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
