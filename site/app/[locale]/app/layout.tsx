import { setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app/app-shell";

export default async function AppGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AppShell>{children}</AppShell>;
}
