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

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.set);

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
      const res = await authApi.login(email.trim(), senha);
      setAuth(res.token, {
        id: res.usuarioId,
        nome: res.nome,
        email: res.email,
      });
      toast.success(`Bem-vindo de volta, ${res.nome.split(" ")[0]}.`);
      router.replace("/captura");
    } catch (err) {
      setErro(extractErrorMessage(err, "Não consegui entrar. Confere os dados."));
    } finally {
      setCarregando(false);
    }
  };

  const valido = email.trim() !== "" && senha !== "";

  return (
    <main className="min-h-screen grid place-items-center px-6 py-12 bg-bg bg-accent-glow">
      <div className="w-full max-w-[380px] flex flex-col gap-8">
        <div className="flex justify-center">
          <Brand size={36} />
        </div>

        <p className="text-center text-text-dim leading-relaxed -mt-3">
          Bem-vindo de volta. Entra com suas credenciais que eu cuido do resto.
        </p>

        <form onSubmit={enviar} className="flex flex-col gap-3.5">
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
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
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
            Entrar
          </Button>
        </form>

        <div className="flex items-center gap-3 text-text-subtle text-xs">
          <span className="flex-1 h-px bg-border" />
          ou
          <span className="flex-1 h-px bg-border" />
        </div>

        <p className="text-center text-[13px] text-text-dim">
          Primeira vez por aqui?{" "}
          <Link
            href="/cadastro"
            className="text-text font-medium border-b border-border-strong hover:border-accent pb-px"
          >
            Criar conta
          </Link>
        </p>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-text-subtle text-[11px] tracking-wider">
        JARVIS • v0.1 BETA
      </div>
    </main>
  );
}
