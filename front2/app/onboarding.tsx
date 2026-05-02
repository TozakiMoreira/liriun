import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { categoriasApi } from "@/api/categorias";
import { extractErrorMessage } from "@/api/error";
import { prazosApi } from "@/api/prazos";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/Button";
import { formatarDuracaoDias } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";

interface PrazoLocal {
  nome: string;
  duracaoDias: number | null;
}

const CATEGORIAS_PADRAO = ["Trabalho", "Faculdade", "Casa", "Compras", "Pessoal"];

const PRAZOS_PADRAO: PrazoLocal[] = [
  { nome: "Hoje", duracaoDias: 0 },
  { nome: "Amanhã", duracaoDias: 1 },
  { nome: "Essa semana", duracaoDias: 7 },
  { nome: "Esse mês", duracaoDias: 30 },
  { nome: "Sem prazo", duracaoDias: null },
];

const DURACOES = [
  { label: "Hoje", value: 0 },
  { label: "1 dia", value: 1 },
  { label: "3 dias", value: 3 },
  { label: "7 dias", value: 7 },
  { label: "14 dias", value: 14 },
  { label: "30 dias", value: 30 },
  { label: "Sem prazo", value: null },
];

export default function Onboarding() {
  const router = useRouter();
  const usuario = useAuthStore((s) => s.usuario);

  const [categorias, setCategorias] = useState<string[]>(CATEGORIAS_PADRAO);
  const [prazos, setPrazos] = useState<PrazoLocal[]>(PRAZOS_PADRAO);
  const [novaCat, setNovaCat] = useState("");
  const [novoPrazoNome, setNovoPrazoNome] = useState("");
  const [novoPrazoDur, setNovoPrazoDur] = useState<number | null | undefined>(
    undefined,
  );
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Se usuário já tem categorias/prazos cadastrados, pula direto pra captura.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const [cats, prz] = await Promise.all([
          categoriasApi.listar(),
          prazosApi.listar(),
        ]);
        if (cancelado) return;
        if (cats.length > 0 || prz.length > 0) {
          router.replace("/captura");
          return;
        }
      } catch {
        /* primeiro acesso pode falhar token, segue */
      }
      if (!cancelado) setCarregando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [router]);

  const adicionarCat = () => {
    const n = novaCat.trim();
    if (!n) return;
    if (categorias.some((c) => c.toLowerCase() === n.toLowerCase())) {
      setNovaCat("");
      return;
    }
    setCategorias((prev) => [...prev, n]);
    setNovaCat("");
  };

  const adicionarPrazo = () => {
    const n = novoPrazoNome.trim();
    if (!n || novoPrazoDur === undefined) return;
    if (prazos.some((p) => p.nome.toLowerCase() === n.toLowerCase())) {
      setNovoPrazoNome("");
      setNovoPrazoDur(undefined);
      return;
    }
    setPrazos((prev) => [...prev, { nome: n, duracaoDias: novoPrazoDur }]);
    setNovoPrazoNome("");
    setNovoPrazoDur(undefined);
  };

  const finalizar = async () => {
    if (categorias.length === 0 && prazos.length === 0) {
      setErro("Adiciona pelo menos uma categoria ou prazo antes de continuar.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await Promise.all([
        ...categorias.map((nome) => categoriasApi.criar(nome)),
        ...prazos.map((p) => prazosApi.criar(p.nome, p.duracaoDias)),
      ]);
      toast.success("Tudo pronto.");
      router.replace("/captura");
    } catch (err) {
      setErro(
        extractErrorMessage(err, "Algo falhou ao salvar. Tenta de novo."),
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#5e6ad2" />
      </View>
    );
  }

  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <View className="flex-row items-center gap-2.5">
          <Brand size={28} />
          <View className="ml-auto px-2 py-0.5 rounded-full border border-border">
            <Text className="text-text-dim text-[10px] tracking-wider">
              SETUP INICIAL
            </Text>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-text font-semibold tracking-tight text-2xl leading-tight">
            Vamos deixar tudo do seu jeito{primeiroNome ? `, ${primeiroNome}` : ""}.
          </Text>
          <Text className="text-text-dim text-[13px] leading-relaxed">
            Pra eu organizar suas tarefas sem chutar, preciso que você me diga
            em quais categorias encaixa as coisas do seu dia e quais prazos
            costuma usar. Deixei modelos prontos — edita o que quiser.
          </Text>
        </View>

        <View className="bg-bg-elev border border-border rounded-lg p-4 gap-3">
          <Text className="text-text font-semibold text-sm">Suas categorias</Text>
          <Text className="text-text-dim text-xs">
            Uma tarefa pode ter mais de uma.
          </Text>

          <View className="flex-row flex-wrap gap-1.5">
            {categorias.map((c) => (
              <View
                key={c}
                className="flex-row items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-bg-input border border-border-strong rounded"
              >
                <Text className="text-text text-[13px]">{c}</Text>
                <Pressable
                  onPress={() =>
                    setCategorias((prev) => prev.filter((x) => x !== c))
                  }
                  hitSlop={6}
                >
                  <Ionicons name="close" size={14} color="#62666d" />
                </Pressable>
              </View>
            ))}
          </View>

          <View className="flex-row gap-2">
            <TextInput
              value={novaCat}
              onChangeText={setNovaCat}
              onSubmitEditing={adicionarCat}
              placeholder="Nova categoria"
              placeholderTextColor="#62666d"
              className="flex-1 bg-bg-input border border-border rounded px-3 py-2 text-[13px] text-text"
              style={{ fontSize: 13 }}
              returnKeyType="done"
            />
            <Button
              label="Add"
              onPress={adicionarCat}
              fullWidth={false}
              variant="secondary"
            />
          </View>
        </View>

        <View className="bg-bg-elev border border-border rounded-lg p-4 gap-3">
          <Text className="text-text font-semibold text-sm">Seus prazos</Text>
          <Text className="text-text-dim text-xs">
            Durações nomeadas. Horário final padrão é 23:59.
          </Text>

          <View className="gap-1.5">
            {prazos.map((p) => (
              <View
                key={p.nome}
                className="flex-row items-center gap-3 px-3 py-2 bg-bg-input border border-border rounded"
              >
                <Text className="text-text text-[13px] font-medium flex-1">
                  {p.nome}
                </Text>
                <Text className="text-text-dim text-xs">
                  {formatarDuracaoDias(p.duracaoDias)}
                </Text>
                <Pressable
                  onPress={() =>
                    setPrazos((prev) => prev.filter((x) => x.nome !== p.nome))
                  }
                  hitSlop={6}
                  className="p-0.5"
                >
                  <Ionicons name="close" size={14} color="#62666d" />
                </Pressable>
              </View>
            ))}
          </View>

          <View className="gap-2">
            <TextInput
              value={novoPrazoNome}
              onChangeText={setNovoPrazoNome}
              placeholder="Nome do prazo"
              placeholderTextColor="#62666d"
              className="bg-bg-input border border-border rounded px-3 py-2 text-[13px] text-text"
              style={{ fontSize: 13 }}
            />
            <View className="flex-row flex-wrap gap-1.5">
              {DURACOES.map((d) => {
                const ativa = novoPrazoDur === d.value;
                return (
                  <Pressable
                    key={d.label}
                    onPress={() => setNovoPrazoDur(d.value)}
                    className={`px-2 py-1 rounded border ${
                      ativa
                        ? "bg-accent/15 border-accent/40"
                        : "bg-bg-input border-border"
                    }`}
                  >
                    <Text
                      className={`text-[11px] ${
                        ativa ? "text-text" : "text-text-dim"
                      }`}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Button
              label="Adicionar prazo"
              onPress={adicionarPrazo}
              variant="secondary"
              disabled={!novoPrazoNome.trim() || novoPrazoDur === undefined}
            />
          </View>
        </View>

        {erro && (
          <Text className="text-danger text-xs text-center">{erro}</Text>
        )}

        <View className="flex-row items-center justify-between gap-3">
          <Pressable
            onPress={() => {
              setCategorias([]);
              setPrazos([]);
            }}
          >
            <Text className="text-text-dim text-xs">Limpar tudo</Text>
          </Pressable>
          <View className="flex-1 max-w-[220px]">
            <Button
              label={salvando ? "Salvando..." : "Pronto"}
              onPress={finalizar}
              loading={salvando}
            />
          </View>
        </View>

        <Text className="text-text-subtle text-[11px] text-center tracking-wider">
          Dá pra ajustar tudo isso depois em Ajustes.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
