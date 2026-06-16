import { ArrowRight, Loader2, Upload } from "lucide-react";

import { ResizablePanel } from "@/app/components/ui/resizable";
import type { AppLabels } from "@/app/i18n";
import type { PanelLayout, UploadPanel } from "@/app/types";

interface SourcePanelProps {
  labels: AppLabels;
  panelLayout: PanelLayout;
  sourceText: string;
  beforeText: string;
  sourceFileName: string | null;
  transferring: boolean;
  transferError: string | null;
  uploadingPanel: UploadPanel | null;
  uploadError: string | null;
  uploadErrorPanel: UploadPanel | null;
  sourceFileInputRef: React.RefObject<HTMLInputElement | null>;
  onSourceUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTransfer: () => void;
  onSourceTextChange: (value: string) => void;
  onClearTransferError: () => void;
  onClearUploadError: () => void;
}

export function SourcePanel({
  labels,
  panelLayout,
  sourceText,
  beforeText,
  sourceFileName,
  transferring,
  transferError,
  uploadingPanel,
  uploadError,
  uploadErrorPanel,
  sourceFileInputRef,
  onSourceUpload,
  onTransfer,
  onSourceTextChange,
  onClearTransferError,
  onClearUploadError,
}: SourcePanelProps) {
  return (
    <ResizablePanel
      defaultSize={50}
      minSize={15}
      className={`flex flex-col min-h-0 overflow-hidden ${
        panelLayout === "vertical" ? "border-b" : "border-r"
      } border-border`}
    >
      <div className="h-10 shrink-0 flex items-center justify-between px-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs mono tracking-widest text-muted-foreground uppercase">
            {labels.source}
          </span>
          {sourceFileName && (
            <span className="text-xs mono text-accent border border-accent/30 px-1.5 py-0.5 leading-none">
              {sourceFileName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={sourceFileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={onSourceUpload}
          />
          <button
            onClick={() => sourceFileInputRef.current?.click()}
            disabled={uploadingPanel === "source"}
            className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {uploadingPanel === "source" ? (
              <>
                <Loader2 size={11} className="animate-spin" />{" "}
                {labels.uploading}
              </>
            ) : (
              <>
                <Upload size={11} /> {labels.upload}
              </>
            )}
          </button>
          <button
            onClick={onTransfer}
            disabled={!sourceText.trim() || !beforeText.trim() || transferring}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-accent text-accent-foreground text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {transferring ? (
              <>
                <Loader2 size={11} className="animate-spin" />{" "}
                {labels.transferring}
              </>
            ) : (
              <>
                {labels.transfer} <ArrowRight size={11} />
              </>
            )}
          </button>
        </div>
      </div>
      {(transferError || (uploadError && uploadErrorPanel === "source")) && (
        <div className="shrink-0 px-5 py-2 border-b border-destructive/30 bg-destructive/10 text-xs text-destructive mono">
          {transferError ?? uploadError}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <textarea
          className="w-full h-full bg-transparent resize-none text-sm text-foreground px-5 py-3 outline-none placeholder:opacity-30 placeholder:text-muted-foreground mono leading-relaxed text-foreground"
          placeholder={labels.sourcePlaceholder}
          value={sourceText}
          onChange={(e) => {
            onSourceTextChange(e.target.value);
            if (transferError) onClearTransferError();
            if (uploadErrorPanel === "source") onClearUploadError();
          }}
        />
      </div>
    </ResizablePanel>
  );
}
