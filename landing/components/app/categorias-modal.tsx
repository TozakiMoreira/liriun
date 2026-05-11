"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/app/modal";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { categoriasApi } from "@/lib/api/tarefas";
import { useCategorias } from "@/lib/api/hooks/use-categorias";

export function CategoriasModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { categorias, refresh } = useCategorias();
  const [nova, setNova] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [valorEdit, setValorEdit] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmar, setConfirmar] = useState<{ id: string; nome: string } | null>(null);

  async function criar() {
    const nome = nova.trim();
    if (!nome) return;
    setBusy(true);
    setErro(null);
    try {
      await categoriasApi.criar(nome);
      setNova("");
      await refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setBusy(false);
    }
  }

  async function salvarEdicao(id: string) {
    const nome = valorEdit.trim();
    if (!nome) return;
    setBusy(true);
    setErro(null);
    try {
      await categoriasApi.renomear(id, nome);
      setEditandoId(null);
      await refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao renomear");
    } finally {
      setBusy(false);
    }
  }

  function pedirExclusao(id: string, nome: string) {
    setConfirmar({ id, nome });
  }

  async function excluirConfirmado() {
    if (!confirmar) return;
    setBusy(true);
    setErro(null);
    try {
      await categoriasApi.excluir(confirmar.id);
      await refresh();
      setConfirmar(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao excluir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
    <Modal open={open} onClose={onClose} title="Categorias" size="md">
      <div className="flex flex-col gap-4">
        {/* Criar nova */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nova categoria…"
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void criar();
              }
            }}
            className="flex-1 bg-white/[0.05] border border-border-hi rounded-md px-3 py-2.5 text-sm text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60"
          />
          <Button onClick={() => void criar()} disabled={busy || !nova.trim()}>
            Criar
          </Button>
        </div>

        {erro && <p className="text-sm text-danger">{erro}</p>}

        {/* Lista */}
        <div className="flex flex-col gap-1 max-h-[360px] overflow-y-auto">
          {categorias.length === 0 ? (
            <div className="text-sm text-faint py-6 text-center">Nenhuma categoria ainda.</div>
          ) : (
            categorias.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/[0.04] transition-colors"
              >
                {editandoId === c.id ? (
                  <>
                    <input
                      autoFocus
                      type="text"
                      value={valorEdit}
                      onChange={(e) => setValorEdit(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void salvarEdicao(c.id);
                        if (e.key === "Escape") setEditandoId(null);
                      }}
                      className="flex-1 bg-white/[0.06] border border-violet-500/40 rounded-md px-2 py-1 text-sm text-text focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => void salvarEdicao(c.id)}
                      disabled={busy}
                      className="text-xs font-mono uppercase tracking-[1px] text-violet-300 hover:text-violet-200 px-2"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditandoId(null)}
                      className="text-xs font-mono uppercase tracking-[1px] text-faint hover:text-text px-2"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-text">{c.nome}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoId(c.id);
                        setValorEdit(c.nome);
                      }}
                      className="text-xs font-mono uppercase tracking-[1px] text-muted hover:text-text px-2"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => pedirExclusao(c.id, c.nome)}
                      className="text-xs font-mono uppercase tracking-[1px] text-faint hover:text-danger px-2"
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>

    <ConfirmDialog
      open={confirmar !== null}
      title="Excluir categoria?"
      message={`A categoria "${confirmar?.nome ?? ""}" será removida. Não pode ser desfeito.`}
      confirmLabel="Excluir"
      destructive
      loading={busy}
      onConfirm={() => void excluirConfirmado()}
      onCancel={() => setConfirmar(null)}
    />
    </>
  );
}
