"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { extractErrorMessage } from "@/lib/api/error";
import { Prioridade, type Tarefa } from "@/lib/api/types";
import { useCategorias } from "@/lib/hooks/useCategorias";
import { usePrazos } from "@/lib/hooks/usePrazos";
import {
  useAtualizarTarefa,
  useCriarTarefa,
} from "@/lib/hooks/useTarefas";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TarefaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  open,
  onOpenChange,
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
  const [prazoId, setPrazoId] = useState<string | null>(null);
  const [dataCustom, setDataCustom] = useState<string>("");
  const [horario, setHorario] = useState<string>("23:59");
  const [usandoCustom, setUsandoCustom] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const editando = !!tarefa;
  const salvando = criar.isPending || atualizar.isPending;

  useEffect(() => {
    if (!open) return;
    if (tarefa) {
      setNome(tarefa.nome);
      setPrioridade(tarefa.prioridade);
      setCategoriaIds(tarefa.categorias.map((c) => c.id));
      setPrazoId(tarefa.prazoId);
      if (tarefa.dataPrazo && !tarefa.prazoId) {
        setUsandoCustom(true);
        setDataCustom(tarefa.dataPrazo.substring(0, 10));
      } else {
        setUsandoCustom(false);
        setDataCustom("");
      }
      if (tarefa.horarioFinal) {
        setHorario(tarefa.horarioFinal.substring(0, 5));
      }
    } else {
      setNome(nomeInicial);
      setPrioridade(Prioridade.Normal);
      setCategoriaIds([]);
      setPrazoId(null);
      setDataCustom("");
      setHorario("23:59");
      setUsandoCustom(false);
    }
    setErro(null);
  }, [open, tarefa, nomeInicial]);

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

    let dataPrazoCustom: string | null = null;
    let horarioFinal: string | null = null;
    if (usandoCustom) {
      if (!dataCustom) {
        setErro("Informa a data ou escolhe outro prazo.");
        return;
      }
      dataPrazoCustom = new Date(dataCustom + "T00:00:00").toISOString();
      if (horario) {
        const [h, m] = horario.split(":");
        horarioFinal = `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
      }
    }

    const payload = {
      nome: nome.trim(),
      prioridade: prioridade as 1 | 2 | 3 | 4,
      categoriaIds,
      prazoId: usandoCustom ? null : prazoId,
      dataPrazoCustom,
      horarioFinal,
    };

    const opts = {
      onSuccess: (msg: string) => {
        toast.success(msg);
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        setErro(
          extractErrorMessage(err, "Não consegui salvar. Tenta de novo."),
        );
      },
    };

    if (editando && tarefa) {
      atualizar.mutate(
        { id: tarefa.id, payload },
        {
          onSuccess: () => opts.onSuccess("Tarefa atualizada."),
          onError: opts.onError,
        },
      );
    } else {
      criar.mutate(payload, {
        onSuccess: () => opts.onSuccess("Anotado."),
        onError: opts.onError,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !salvando && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editando ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="O que precisa ser feito"
              maxLength={200}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Categorias</Label>
            {categorias.length === 0 ? (
              <p className="text-xs text-text-subtle">
                Nenhuma categoria cadastrada. Crie em Configurações.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {categorias.map((cat) => {
                  const ativa = categoriaIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategoria(cat.id)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[13px] border transition-colors",
                        ativa
                          ? "bg-accent/15 border-accent/40 text-text"
                          : "bg-bg-input border-border-strong text-text-dim hover:text-text",
                      )}
                    >
                      {cat.nome}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Prioridade</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRIORIDADES.map((p) => {
                const ativa = prioridade === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPrioridade(p.value)}
                    className={cn(
                      "px-2 py-2 rounded text-[12px] border transition-colors",
                      ativa
                        ? "bg-accent/15 border-accent/40 text-text"
                        : "bg-bg-input border-border-strong text-text-dim hover:text-text",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Prazo</Label>
            <div className="flex flex-wrap gap-1.5">
              <PrazoChip
                ativa={!usandoCustom && prazoId === null}
                label="Sem prazo"
                onClick={() => {
                  setUsandoCustom(false);
                  setPrazoId(null);
                }}
              />
              {prazos.map((p) => (
                <PrazoChip
                  key={p.id}
                  ativa={!usandoCustom && prazoId === p.id}
                  label={p.nome}
                  onClick={() => {
                    setUsandoCustom(false);
                    setPrazoId(p.id);
                  }}
                />
              ))}
              <PrazoChip
                ativa={usandoCustom}
                label="Data específica…"
                onClick={() => {
                  setUsandoCustom(true);
                  setPrazoId(null);
                }}
              />
            </div>

            {usandoCustom && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="dataCustom">Data</Label>
                  <Input
                    id="dataCustom"
                    type="date"
                    value={dataCustom}
                    onChange={(e) => setDataCustom(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="horario">Horário final</Label>
                  <Input
                    id="horario"
                    type="time"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {erro && <p className="text-danger text-xs">{erro}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button onClick={enviar} loading={salvando}>
            {editando ? "Salvar" : "Criar tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PrazoChip({
  ativa,
  label,
  onClick,
}: {
  ativa: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded text-[13px] border transition-colors",
        ativa
          ? "bg-accent/15 border-accent/40 text-text"
          : "bg-bg-input border-border-strong text-text-dim hover:text-text",
      )}
    >
      {label}
    </button>
  );
}
