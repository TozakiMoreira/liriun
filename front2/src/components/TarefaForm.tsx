import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { toast } from "sonner-native";

import { extractErrorMessage } from "@/api/error";
import { Prioridade, type Tarefa } from "@/api/types";
import { useCategorias } from "@/hooks/useCategorias";
import { usePrazos } from "@/hooks/usePrazos";
import { useAtualizarTarefa, useCriarTarefa } from "@/hooks/useTarefas";

import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Sheet } from "./Sheet";

interface TarefaFormProps {
  visible: boolean;
  onClose: () => void;
  tarefa?: Tarefa | null;
  nomeInicial?: string;
}

const PRIORIDADES = [
  { value: Prioridade.Urgente, label: "Urgente" },
  { value: Prioridade.Importante, label: "Importante" },
  { value: Prioridade.Normal, label: "Normal" },
  { value: Prioridade.Baixa, label: "Baixa" },
] as const;

export function TarefaForm({
  visible,
  onClose,
  tarefa,
  nomeInicial = "",
}: TarefaFormProps) {
  const { data: categorias = [] } = useCategorias();
  const { data: prazos = [] } = usePrazos();
  const criar = useCriarTarefa();
  const atualizar = useAtualizarTarefa();

  const [nome, setNome] = useState("");
  const [prioridade, setPrioridade] = useState<number>(Prioridade.Normal);
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [prazoEscolha, setPrazoEscolha] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const editando = !!tarefa;
  const salvando = criar.isPending || atualizar.isPending;

  useEffect(() => {
    if (!visible) return;
    if (tarefa) {
      setNome(tarefa.nome);
      setPrioridade(tarefa.prioridade);
      setCategoriaIds(tarefa.categorias.map((c) => c.id));
      setPrazoEscolha(tarefa.prazoId);
    } else {
      setNome(nomeInicial);
      setPrioridade(Prioridade.Normal);
      setCategoriaIds([]);
      setPrazoEscolha(null);
    }
    setErro(null);
  }, [visible, tarefa, nomeInicial]);

  const toggleCategoria = (id: string) => {
    setCategoriaIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const enviar = () => {
    if (!nome.trim()) {
      setErro("Coloca um nome pra tarefa.");
      return;
    }

    const payload = {
      nome: nome.trim(),
      prioridade: prioridade as 1 | 2 | 3 | 4,
      categoriaIds,
      prazoId: prazoEscolha,
      dataPrazoCustom: null,
      horarioFinal: null,
    };

    const onSuccess = (msg: string) => {
      toast.success(msg);
      onClose();
    };

    const onError = (err: unknown) => {
      setErro(extractErrorMessage(err, "Não consegui salvar. Tenta de novo."));
    };

    if (editando && tarefa) {
      atualizar.mutate(
        { id: tarefa.id, payload },
        {
          onSuccess: () => onSuccess("Tarefa atualizada."),
          onError,
        },
      );
    } else {
      criar.mutate(payload, {
        onSuccess: () => onSuccess("Anotado."),
        onError,
      });
    }
  };

  return (
    <Sheet visible={visible} onClose={salvando ? () => {} : onClose}>
      <View className="flex-row items-center justify-between border-b border-border px-5 py-3.5">
        <Text className="text-text font-semibold text-sm">
          {editando ? "Editar tarefa" : "Nova tarefa"}
        </Text>
        <Pressable onPress={onClose} disabled={salvando} hitSlop={8}>
          <Ionicons name="close" size={20} color="#8a8f98" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Input
          label="Nome"
          value={nome}
          onChangeText={setNome}
          placeholder="O que precisa ser feito"
          maxLength={200}
          testID="tarefa-form-nome"
        />

        <View className="gap-1.5">
          <Text className="text-xs font-medium text-text-dim">Categorias</Text>
          {categorias.length === 0 ? (
            <Text className="text-text-subtle text-xs">
              Nenhuma categoria cadastrada. Crie em Ajustes.
            </Text>
          ) : (
            <View className="flex-row flex-wrap gap-1.5">
              {categorias.map((cat) => {
                const ativa = categoriaIds.includes(cat.id);
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => toggleCategoria(cat.id)}
                    className={`px-2.5 py-1 rounded border ${
                      ativa
                        ? "bg-accent/15 border-accent/40"
                        : "bg-bg-input border-border-strong"
                    }`}
                  >
                    <Text
                      className={`text-[13px] ${
                        ativa ? "text-text" : "text-text-dim"
                      }`}
                    >
                      {cat.nome}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View className="gap-1.5">
          <Text className="text-xs font-medium text-text-dim">Prioridade</Text>
          <View className="flex-row gap-1.5">
            {PRIORIDADES.map((p) => {
              const ativa = prioridade === p.value;
              return (
                <Pressable
                  key={p.value}
                  onPress={() => setPrioridade(p.value)}
                  className={`flex-1 px-2 py-2 rounded border items-center ${
                    ativa
                      ? "bg-accent/15 border-accent/40"
                      : "bg-bg-input border-border-strong"
                  }`}
                >
                  <Text
                    className={`text-[12px] ${
                      ativa ? "text-text" : "text-text-dim"
                    }`}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-1.5">
          <Text className="text-xs font-medium text-text-dim">Prazo</Text>
          <View className="flex-row flex-wrap gap-1.5">
            <Pressable
              onPress={() => setPrazoEscolha(null)}
              className={`px-2.5 py-1 rounded border ${
                prazoEscolha === null
                  ? "bg-accent/15 border-accent/40"
                  : "bg-bg-input border-border-strong"
              }`}
            >
              <Text
                className={`text-[13px] ${
                  prazoEscolha === null ? "text-text" : "text-text-dim"
                }`}
              >
                Sem prazo
              </Text>
            </Pressable>
            {prazos.map((p) => {
              const ativa = prazoEscolha === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPrazoEscolha(p.id)}
                  className={`px-2.5 py-1 rounded border ${
                    ativa
                      ? "bg-accent/15 border-accent/40"
                      : "bg-bg-input border-border-strong"
                  }`}
                >
                  <Text
                    className={`text-[13px] ${
                      ativa ? "text-text" : "text-text-dim"
                    }`}
                  >
                    {p.nome}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {erro && (
          <Text className="text-danger text-xs" testID="tarefa-form-erro">
            {erro}
          </Text>
        )}
      </ScrollView>

      <View className="flex-row gap-2 px-5 py-3 border-t border-border">
        <Button
          label="Cancelar"
          variant="secondary"
          onPress={onClose}
          disabled={salvando}
          fullWidth={false}
          haptic={false}
        />
        <View className="flex-1">
          <Button
            label={salvando ? "Salvando..." : editando ? "Salvar" : "Criar"}
            onPress={enviar}
            loading={salvando}
            testID="tarefa-form-salvar"
          />
        </View>
      </View>
    </Sheet>
  );
}
