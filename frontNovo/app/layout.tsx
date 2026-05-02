import type { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Jarvis — Organizador pessoal",
  description: "Captura rápida, IA opcional, suas tarefas no seu jeito.",
};

export const viewport: Viewport = {
  themeColor: "#08090a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
