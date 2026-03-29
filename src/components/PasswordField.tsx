"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
};

export function PasswordField({
  value,
  onChange,
  autoComplete = "current-password",
  required,
  minLength,
}: Props) {
  const t = useTranslations("auth");
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm text-zone-muted">{t("password")}</span>
      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className="w-full pda-input pr-[7.25rem] sm:pr-[8rem]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          className="absolute right-1 top-1/2 max-w-[7.5rem] -translate-y-1/2 rounded-md px-2 py-1.5 text-left text-xs font-medium leading-tight text-archi-300 transition hover:bg-zone-edge/60 hover:text-archi-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-archi-500"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? t("hidePassword") : t("showPassword")}
        >
          {visible ? t("hidePassword") : t("showPassword")}
        </button>
      </div>
    </label>
  );
}
