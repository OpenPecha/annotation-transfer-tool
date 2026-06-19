import { ApiError, parseApiError } from "@/lib/api";

export interface TransferRequest {
  source: string;
  target: string;
  patterns: [string, string][];
  output?: "txt" | "yaml" | "diff";
}

export interface TransferResponse {
  result: string | unknown[];
  output_format: string;
}

export async function transferAnnotations(
  request: TransferRequest,
): Promise<TransferResponse> {
  const response = await fetch("/api/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      output: "txt",
      ...request,
    }),
  });

  if (!response.ok) {
    throw new ApiError(
      await parseApiError(response, `Transfer failed (${response.status})`),
    );
  }

  return response.json();
}
