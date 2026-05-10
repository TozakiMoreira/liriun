export const runtime = "edge";

import { redirect } from "@/i18n/routing";

export default async function SobreRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/empresa", locale });
}
