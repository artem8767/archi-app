"use client";

import { useTranslations } from "next-intl";

export function ReplyToBar({
  label,
  onCancel,
}: {
  label: string;
  onCancel: () => void;
}) {
  const t = useTranslations("common");
  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-archi-700/40 bg-zone-deep/50 px-2.5 py-1.5 text-xs text-zone-fog">
      <span className="min-w-0 truncate">{t("replyingTo", { name: label })}</span>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 rounded border border-zone-edge/70 px-2 py-0.5 text-zone-muted hover:bg-zone-edge/30 hover:text-zone-fog"
      >
        {t("cancel")}
      </button>
    </div>
  );
}
