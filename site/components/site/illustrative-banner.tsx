import { useTranslations } from "next-intl";

/**
 * Faixa fixa no topo (não fechável) avisando que o conteúdo do site é
 * ilustrativo enquanto o Liriun está em desenvolvimento. Aparece só nas
 * telas públicas e de auth — nunca nas telas internas do app.
 */
export function IllustrativeBanner() {
  const t = useTranslations("Aviso");
  return (
    <div
      role="note"
      className="w-full text-center px-4 py-2 text-[11.5px] sm:text-xs leading-[1.45]"
      style={{
        background: "linear-gradient(90deg, rgba(156,123,255,0.12), rgba(91,141,239,0.10))",
        borderBottom: "1px solid rgba(156,123,255,0.20)",
        color: "var(--liriun-muted)",
      }}
    >
      <span className="inline-flex items-center gap-1.5 justify-center flex-wrap">
        <span aria-hidden className="text-violet-300">✦</span>
        <span>
          <strong className="text-text font-semibold">{t("bannerTitulo")}</strong>{" "}
          {t("bannerTexto")}
        </span>
      </span>
    </div>
  );
}
