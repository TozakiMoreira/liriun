"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/stores/auth";

export default function Index() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!montado) return;
    router.replace(token ? "/captura" : "/login");
  }, [montado, token, router]);

  return (
    <div className="min-h-screen grid place-items-center bg-bg">
      <Loader2 className="h-5 w-5 animate-spin text-accent" />
    </div>
  );
}
