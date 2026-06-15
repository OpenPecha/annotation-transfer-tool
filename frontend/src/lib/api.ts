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

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/** @deprecated use ApiError */
export class TransferApiError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = "TransferApiError";
  }
}

async function parseApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") {
      return body.detail;
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
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
