import { parseApiError } from "@/lib/api";
import type {
  OptionItem,
  RowSelectionState,
  SelectionsMap,
} from "@/app/pydurma/types/collation";

export interface OptionsResponse {
  languages: OptionItem[];
  export_formats: OptionItem[];
}

export async function fetchOptions(): Promise<OptionsResponse> {
  const response = await fetch("/api/options");
  if (!response.ok) {
    throw new Error(
      await parseApiError(response, "Failed to load options"),
    );
  }
  return response.json();
}

export async function runCollation(formData: FormData) {
  const response = await fetch("/api/collation", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(
      await parseApiError(response, "Collation failed"),
    );
  }
  return response.json();
}

export async function exportCollation(
  jobId: string,
  format: string,
  selections?: Record<string, unknown>,
) {
  const response = await fetch(`/api/export/${jobId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format, selections }),
  });
  if (!response.ok) {
    throw new Error(
      await parseApiError(response, "Export failed"),
    );
  }
  return response;
}

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

export async function updateSelections(
  jobId: string,
  selections: SelectionsMap,
): Promise<void> {
  const response = await fetch(`/api/collation/${jobId}/selections`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selections: toApiSelections(selections) }),
  });
  if (!response.ok) {
    throw new Error(
      await parseApiError(response, "Failed to save selections"),
    );
  }
}

export function parseContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/filename="([^"]+)"/);
  return match?.[1] ?? null;
}
