export const runtime = "edge";

import { redirect } from "@/i18n/routing";

// Página de empresa ocultada — redireciona para a home.
// O conteúdo original segue no histórico do git para quando for reativada.
export default async function EmpresaRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/", locale });
}
