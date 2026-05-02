"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriasApi } from "@/lib/api/categorias";
import { extractErrorMessage } from "@/lib/api/error";
import { prazosApi } from "@/lib/api/prazos";
import { formatarDuracaoDias } from "@/lib/format";
import { cn } from "@/lib/utils";
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
  { label: "Hoje (0d)", value: "0" },
  { label: "1 dia", value: "1" },
  { label: "2 dias", value: "2" },
  { label: "3 dias", value: "3" },
  { label: "7 dias", value: "7" },
  { label: "14 dias", value: "14" },
  { label: "30 dias", value: "30" },
  { label: "Sem prazo", value: "null" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const usuario = useAuthStore((s) => s.usuario);
  const token = useAuthStore((s) => s.token);

  const [categorias, setCategorias] = useState<string[]>(CATEGORIAS_PADRAO);
  const [prazos, setPrazos] = useState<PrazoLocal[]>(PRAZOS_PADRAO);
  const [novaCat, setNovaCat] = useState("");
  const [novoPrazoNome, setNovoPrazoNome] = useState("");
  const [novoPrazoDur, setNovoPrazoDur] = useState<string>("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
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
  }, [token, router]);

  const adicionarCat = (e?: React.FormEvent) => {
    e?.preventDefault();
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
    if (!n || !novoPrazoDur) return;
    if (prazos.some((p) => p.nome.toLowerCase() === n.toLowerCase())) {
      setNovoPrazoNome("");
      setNovoPrazoDur("");
      return;
    }
    const dur =
      novoPrazoDur === "null" ? null : parseInt(novoPrazoDur, 10);
    setPrazos((prev) => [...prev, { nome: n, duracaoDias: dur }]);
    setNovoPrazoNome("");
    setNovoPrazoDur("");
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
      <div className="min-h-screen grid place-items-center bg-bg">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
      </div>
    );
  }

  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  return (
    <main className="min-h-screen px-4 sm:px-6 pt-10 sm:pt-16 pb-24 sm:pb-32 bg-bg bg-accent-glow">
      <div className="max-w-[560px] mx-auto flex flex-col gap-8">
        <div className="flex items-center gap-2.5">
          <Brand size={28} />
          <div className="ml-auto text-[11px] text-text-dim border border-border rounded-full px-2 py-0.5 tracking-wider">
            CONFIGURAÇÃO INICIAL
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-3">
            Vamos deixar tudo do seu jeito
            {primeiroNome ? `, ${primeiroNome}` : ""}.
          </h1>
          <p className="text-text-dim leading-relaxed">
            Pra eu organizar suas tarefas sem chutar, preciso que você me diga{" "}
            <strong className="text-text font-medium">em quais categorias</strong>{" "}
            encaixa as coisas do seu dia e{" "}
            <strong className="text-text font-medium">quais prazos</strong>{" "}
            costuma usar. Deixei modelos prontos pra começar — edita o que quiser.
          </p>
        </div>

        <section className="card-elev p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold">Suas categorias</h2>
            <p className="text-xs text-text-dim">
              Uma tarefa pode ter mais de uma. Vai que é lembrete da faculdade e
              compra ao mesmo tempo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <div
                key={cat}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-bg-input border border-border-strong rounded text-[13px]"
              >
                {cat}
                <button
                  type="button"
                  onClick={() =>
                    setCategorias((prev) => prev.filter((c) => c !== cat))
                  }
                  className="text-text-subtle hover:text-danger rounded p-0.5"
                  aria-label="Remover"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={adicionarCat} className="flex gap-2">
            <Input
              value={novaCat}
              onChange={(e) => setNovaCat(e.target.value)}
              placeholder="Nova categoria (ex: Academia, Projetos)"
              className="flex-1"
            />
            <Button
              type="submit"
              variant="secondary"
              size="md"
              disabled={!novaCat.trim()}
            >
              Adicionar
            </Button>
          </form>
        </section>

        <section className="card-elev p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold">Seus prazos</h2>
            <p className="text-xs text-text-dim">
              Durações nomeadas que eu vou usar. Horário final padrão é 23:59.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            {prazos.map((p) => (
              <div
                key={p.nome}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2.5 bg-bg-input border border-border rounded"
              >
                <span className="text-[13px] font-medium">{p.nome}</span>
                <span className="text-xs text-text-dim">
                  {formatarDuracaoDias(p.duracaoDias)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPrazos((prev) => prev.filter((x) => x.nome !== p.nome))
                  }
                  className="text-text-subtle hover:text-danger rounded p-1"
                  aria-label="Remover"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2">
            <Input
              value={novoPrazoNome}
              onChange={(e) => setNovoPrazoNome(e.target.value)}
              placeholder="Nome do prazo"
            />
            <Select value={novoPrazoDur} onValueChange={setNovoPrazoDur}>
              <SelectTrigger>
                <SelectValue placeholder="Duração" />
              </SelectTrigger>
              <SelectContent>
                {DURACOES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="md"
              onClick={adicionarPrazo}
              disabled={!novoPrazoNome.trim() || !novoPrazoDur}
            >
              Adicionar
            </Button>
          </div>
        </section>

        {erro && (
          <p className="text-danger text-xs text-center">{erro}</p>
        )}

        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              setCategorias([]);
              setPrazos([]);
            }}
            className={cn(
              "text-xs text-text-dim hover:text-text bg-transparent py-1.5",
            )}
          >
            Começar do zero (limpar tudo)
          </button>
          <Button onClick={finalizar} loading={salvando} size="lg">
            {salvando ? "Salvando..." : "Pronto, pode começar"}
          </Button>
        </div>

        <div className="text-center text-text-subtle text-[11px] tracking-wider">
          Você pode ajustar tudo isso depois em Configurações.
        </div>
      </div>
    </main>
  );
}
