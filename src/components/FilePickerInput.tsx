"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

function truncateName(name: string, max: number) {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1)}…`;
}

type Props = {
  accept: string;
  multiple?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

/**
 * Hides the native file control (OS/browser locale) and shows translated
 * "Browse" + status text from `common` messages.
 */
export function FilePickerInput({
  accept,
  multiple,
  onChange,
  className,
}: Props) {
  const t = useTranslations("common");
  const reactId = useId();
  const inputId = `file-${reactId.replace(/:/g, "")}`;
  const [summary, setSummary] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) {
      setSummary(null);
    } else if (files.length === 1) {
      setSummary(t("filePickerSingle", { name: truncateName(files[0].name, 52) }));
    } else {
      setSummary(t("filePickerMultiple", { count: files.length }));
    }
    onChange(e);
  }

  return (
    <div className={className ?? "mt-1 flex flex-wrap items-center gap-2 gap-y-1"}>
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={handleChange}
      />
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer rounded-lg border border-zone-edge bg-zone-deep px-3 py-2 text-sm font-medium text-zone-fog transition-colors hover:border-archi-700/45 hover:bg-zone-edge/40"
      >
        {t("filePickerBrowse")}
      </label>
      <span className="min-w-0 flex-1 text-sm text-zone-muted">
        {summary ?? t("filePickerEmpty")}
      </span>
    </div>
  );
}
