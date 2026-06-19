import { useEffect, useState } from "react";

import { fetchOptions } from "@/lib/api/pydurma";
import type { OptionItem } from "@/app/pydurma/types/collation";

const FALLBACK_LANGUAGES: OptionItem[] = [
  { id: "bo", label: "Tibetan" },
  { id: "generic", label: "Generic / English" },
];

const FALLBACK_FORMATS: OptionItem[] = [
  { id: "txt", label: "Plain text" },
  { id: "md", label: "Markdown" },
  { id: "csv", label: "CSV" },
  { id: "docx", label: "DOCX" },
  { id: "hfml", label: "HFML" },
];

export function useOptions() {
  const [languages, setLanguages] = useState<OptionItem[]>(FALLBACK_LANGUAGES);
  const [exportFormats, setExportFormats] =
    useState<OptionItem[]>(FALLBACK_FORMATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchOptions()
      .then((options) => {
        if (cancelled) return;
        setLanguages(options.languages);
        setExportFormats(options.export_formats);
      })
      .catch(() => {
        // keep fallbacks when API is unavailable
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { languages, exportFormats, loading };
}
