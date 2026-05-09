import { redirect } from "@/i18n/routing";

export default async function AppRootRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/app/falar", locale });
}
