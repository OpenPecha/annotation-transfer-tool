import { useCallback, useState } from "react";

import { runCollation } from "@/lib/api/pydurma";
import type {
  CollationResponse,
  Language,
  WitnessDraft,
} from "@/app/pydurma/types/collation";

export function useCollation() {
  const [collating, setCollating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CollationResponse | null>(null);

  const collate = useCallback(
    async (
      witnesses: WitnessDraft[],
      language: Language,
      baseWitnessName: string | null,
    ) => {
      setError(null);
      setCollating(true);
      try {
        const formData = new FormData();
        for (const witness of witnesses) {
          if (!witness.file) {
            throw new Error(`Witness "${witness.name}" is missing a file`);
          }
          formData.append("files", witness.file);
          formData.append("names", witness.name);
        }
        formData.append("language", language);
        if (baseWitnessName) {
          formData.append("base_witness_name", baseWitnessName);
        }
        const data = await runCollation(formData);
        setResult(data);
        return data as CollationResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Collation failed";
        setError(message);
        throw err;
      } finally {
        setCollating(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    collating,
    error,
    result,
    collate,
    reset,
    setError,
  };
}
