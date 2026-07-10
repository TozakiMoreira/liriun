import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/components/auth/auth-provider";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: {
      default: `${t("siteName")} — ${t("tagline")}`,
      template: `%s · ${t("siteName")}`,
    },
    description: t("homeDescription"),
    keywords: [
      "voice assistant",
      "task organizer",
      "productivity",
      "personal agenda",
      "AI conversational",
      "Liriun",
    ],
    authors: [{ name: "Pedro Tozaki" }],
    creator: "Pedro Tozaki",
    publisher: "Liriun",
    metadataBase: new URL("https://liriun.com"),
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: {
        "pt-BR": "/",
        en: "/en",
      },
    },
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: `${t("siteName")} — ${t("tagline")}`,
      description: t("homeDescription"),
      url: locale === routing.defaultLocale ? "https://liriun.com" : `https://liriun.com/${locale}`,
      locale: locale === "pt" ? "pt_BR" : "en_US",
      images: [
        {
          url: "/og-image-1200x630.png",
          width: 1200,
          height: 630,
          alt: `${t("siteName")} — ${t("tagline")}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteName"),
      description: t("tagline"),
      images: ["/twitter-card-1200x600.png"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0E1014",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  const htmlLang = locale === "pt" ? "pt-BR" : "en";

  return (
    <html lang={htmlLang} data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('liriun.theme')||'dark';if(t==='system'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}else if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.dataset.theme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
