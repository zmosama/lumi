"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useTransition } from "react";
import { locales } from "@/i18n/config";

const languageNames: Record<string, string> = {
  "ar-EG": "العربية (مصر)",
  "ar-SA": "العربية (السعودية)",
  "ar-AE": "العربية (الإمارات)",
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "de-DE": "Deutsch",
  "fr-FR": "Français",
  "es-ES": "Español",
  "tr-TR": "Türkçe",
  "hi-IN": "हिन्दी",
};

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      // Very basic approach to replace the locale prefix in the URL
      const currentPathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
      router.replace(`/${nextLocale}${currentPathWithoutLocale}`);
    });
  }

  return (
    <select
      className="bg-transparent border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      defaultValue={locale}
      disabled={isPending}
      onChange={onSelectChange}
    >
      {locales.map((cur) => (
        <option key={cur} value={cur}>
          {languageNames[cur]}
        </option>
      ))}
    </select>
  );
}
