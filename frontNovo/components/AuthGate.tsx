"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/stores/auth";

interface AuthGateProps {
  children: React.ReactNode;
  /** Se `true`, redireciona pra /login quando sem token. */
  requireAuth?: boolean;
  /** Se `true`, redireciona pra /captura quando já autenticado. */
  redirectIfAuthenticated?: boolean;
}

export function AuthGate({
  children,
  requireAuth = false,
  redirectIfAuthenticated = false,
}: AuthGateProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!montado) return;
    if (requireAuth && !token) {
      router.replace("/login");
      return;
    }
    if (redirectIfAuthenticated && token) {
      router.replace("/captura");
    }
  }, [montado, token, requireAuth, redirectIfAuthenticated, router]);

  if (!montado) {
    return (
      <div className="min-h-screen grid place-items-center bg-bg">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
      </div>
    );
  }

  if (requireAuth && !token) return null;
  if (redirectIfAuthenticated && token) return null;

  return <>{children}</>;
}
