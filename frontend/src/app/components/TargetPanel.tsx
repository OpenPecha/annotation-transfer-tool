import { Download, Loader2, Upload } from "lucide-react";

import { ResizablePanel } from "@/app/components/ui/resizable";
import type { AppLabels } from "@/app/i18n";
import type { ActiveTab, UploadPanel } from "@/app/types";

interface TargetPanelProps {
  labels: AppLabels;
  activeTab: ActiveTab;
  beforeText: string;
  afterText: string;
  targetFileName: string | null;
  uploadingPanel: UploadPanel | null;
  uploadError: string | null;
  uploadErrorPanel: UploadPanel | null;
  targetFileInputRef: React.RefObject<HTMLInputElement | null>;
  onTabChange: (tab: ActiveTab) => void;
  onTargetUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadAfter: () => void;
  onBeforeTextChange: (value: string) => void;
  onAfterTextChange: (value: string) => void;
  onClearUploadError: () => void;
}

export function TargetPanel({
  labels,
  activeTab,
  beforeText,
  afterText,
  targetFileName,
  uploadingPanel,
  uploadError,
  uploadErrorPanel,
  targetFileInputRef,
  onTabChange,
  onTargetUpload,
  onDownloadAfter,
  onBeforeTextChange,
  onAfterTextChange,
  onClearUploadError,
}: TargetPanelProps) {
  return (
    <ResizablePanel
      defaultSize={50}
      minSize={15}
      className="flex flex-col min-h-0 overflow-hidden"
    >
      <div className="h-10 shrink-0 flex items-center justify-between px-5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs mono tracking-widest text-muted-foreground uppercase shrink-0">
            {labels.target}
          </span>
          {targetFileName && activeTab === "before" && (
            <span className="text-xs mono text-accent border border-accent/30 px-1.5 py-0.5 leading-none truncate">
              {targetFileName}
            </span>
          )}
          {(["before", "after"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`h-10 px-3 text-xs capitalize border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels[tab]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === "before" ? (
            <>
              <input
                ref={targetFileInputRef}
                type="file"
                accept=".txt"
                className="hidden"
                onChange={onTargetUpload}
              />
              <button
                onClick={() => targetFileInputRef.current?.click()}
                disabled={uploadingPanel === "target"}
                className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {uploadingPanel === "target" ? (
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
            </>
          ) : (
            <button
              onClick={onDownloadAfter}
              disabled={!afterText.trim()}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download size={11} /> {labels.download}
            </button>
          )}
        </div>
      </div>
      {uploadError && uploadErrorPanel === "target" && (
        <div className="shrink-0 px-5 py-2 border-b border-destructive/30 bg-destructive/10 text-xs text-destructive mono">
          {uploadError}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <textarea
          key={activeTab}
          className="w-full h-full bg-transparent resize-none text-sm text-foreground px-5 py-3 outline-none placeholder:text-muted-foreground/25 mono leading-relaxed"
          placeholder={
            activeTab === "before"
              ? labels.targetBeforePlaceholder
              : labels.targetAfterPlaceholder
          }
          value={activeTab === "before" ? beforeText : afterText}
          onChange={(e) => {
            if (activeTab === "before") {
              onBeforeTextChange(e.target.value);
              if (uploadErrorPanel === "target") onClearUploadError();
            } else {
              onAfterTextChange(e.target.value);
            }
          }}
        />
      </div>
    </ResizablePanel>
  );
}
