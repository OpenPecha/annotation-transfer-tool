export interface TxtFileResult {
  content: string;
  filename: string;
}

export async function readTxtFile(file: File): Promise<TxtFileResult> {
  if (!file.name.toLowerCase().endsWith(".txt")) {
    throw new Error("Only .txt files are supported");
  }

  const content = await file.text();
  return { content, filename: file.name };
}

export function downloadTxtFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  link.click();

  URL.revokeObjectURL(url);
}
