import { APP_BRAND_NAME } from "@/lib/brand";

type Props = {
  className?: string;
  /** `hero` — більший за сусідній перекладений текст у заголовку; `inline` — трохи більший за основний абзац. */
  variant?: "default" | "hero" | "inline";
};

/**
 * Латинський напис ARCHI — не перекладається при зміні мови інтерфейсу
 * та при автоматичному перекладі сторінки (Google Translate).
 */
export function BrandName({ className = "", variant = "default" }: Props) {
  const v =
    variant === "hero"
      ? "inline-block align-baseline text-[1.24em] font-semibold tracking-[0.02em] sm:text-[1.2em]"
      : variant === "inline"
        ? "font-semibold text-[1.08em] text-archi-200"
        : "";
  return (
    <span
      lang="en"
      translate="no"
      className={`notranslate ${v} ${className}`.trim()}
      data-notranslate-brand
    >
      {APP_BRAND_NAME}
    </span>
  );
}
