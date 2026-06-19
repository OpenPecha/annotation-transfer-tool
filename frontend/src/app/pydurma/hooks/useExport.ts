import { useCallback, useState } from "react";

import {
  exportCollation,
  parseContentDisposition,
} from "@/lib/api/pydurma";
import { downloadBlob } from "@/lib/files";
import type {
  OutputFormat,
  RowSelectionState,
  SelectionsMap,
} from "@/app/pydurma/types/collation";

function toApiSelections(
  selections: SelectionsMap,
): Record<string, RowSelectionState> {
  return Object.fromEntries(
    Object.entries(selections).map(([key, state]) => [
      key,
      { selection: state.selection, confirmed: state.confirmed },
    ]),
  );
}

export function useExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(
    async (jobId: string, format: OutputFormat, selections: SelectionsMap) => {
      setExporting(true);
      setError(null);
      try {
        const response = await exportCollation(
          jobId,
          format,
          toApiSelections(selections),
        );
        const blob = await response.blob();
        const filename =
          parseContentDisposition(
            response.headers.get("Content-Disposition"),
          ) ?? `collation.${format}`;
        downloadBlob(blob, filename);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Export failed";
        setError(message);
        throw err;
      } finally {
        setExporting(false);
      }
    },
    [],
  );

  return { download, exporting, error };
}
