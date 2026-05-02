"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/api/error";
import { useAuthStore } from "@/stores/auth";

export default function CadastroPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.set);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (carregando) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await authApi.cadastrar(nome.trim(), email.trim(), senha);
      setAuth(res.token, {
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
    <main className="min-h-screen grid place-items-center px-6 py-12 bg-bg bg-accent-glow">
      <div className="w-full max-w-[380px] flex flex-col gap-8">
        <div className="flex justify-center">
          <Brand size={36} />
        </div>

        <p className="text-center text-text-dim leading-relaxed -mt-3">
          Prazer em te conhecer. Me conta seu nome que eu começo a organizar as
          coisas pra você.
        </p>

        <form onSubmit={enviar} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Como devo te chamar?</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu primeiro nome"
              autoComplete="given-name"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              autoComplete="email"
              required
            />
            <p className="text-[11px] text-text-subtle -mt-0.5">
              Uso só pra identificar sua conta.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 8 caracteres"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {erro && <p className="text-danger text-xs">{erro}</p>}

          <Button
            type="submit"
            disabled={!valido || carregando}
            loading={carregando}
            className="mt-1"
          >
            Criar conta
          </Button>
        </form>

        <div className="flex items-center gap-3 text-text-subtle text-xs">
          <span className="flex-1 h-px bg-border" />
          ou
          <span className="flex-1 h-px bg-border" />
        </div>

        <p className="text-center text-[13px] text-text-dim">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-text font-medium border-b border-border-strong hover:border-accent pb-px"
          >
            Entrar
          </Link>
        </p>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-text-subtle text-[11px] tracking-wider">
        JARVIS • v0.1 BETA
      </div>
    </main>
  );
}
