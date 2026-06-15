import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Upload,
  ArrowRight,
  Sun,
  Moon,
  AtSign,
  Send,
  Loader2,
} from "lucide-react";
import { transferAnnotations, uploadFile } from "@/lib/api";
import {
  parsePatternFile,
  rulesFromPairs,
  type TransferRule,
} from "@/lib/patterns";

export default function App() {
  const [dark, setDark] = useState(false);

  const [sourceText, setSourceText] = useState("");
  const [beforeText, setBeforeText] = useState("");
  const [afterText, setAfterText] = useState("");
  const [activeTab, setActiveTab] = useState<"before" | "after">("before");
  const [rules, setRules] = useState<TransferRule[]>([
    { id: 1, type: "", regex: "" },
  ]);
  const [rulesFileName, setRulesFileName] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const [targetFileName, setTargetFileName] = useState<string | null>(null);
  const [mention, setMention] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [uploadingPanel, setUploadingPanel] = useState<"source" | "target" | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadErrorPanel, setUploadErrorPanel] = useState<"source" | "target" | null>(
    null,
  );
  const [rulesUploading, setRulesUploading] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);
  const targetFileInputRef = useRef<HTMLInputElement>(null);
  const rulesFileInputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(2);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    panel: "source" | "target",
    onLoad: (text: string, name: string) => void,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingPanel(panel);
    setUploadError(null);
    setUploadErrorPanel(null);

    try {
      const { content, filename } = await uploadFile(file);
      onLoad(content, filename);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setUploadError(message);
      setUploadErrorPanel(panel);
    } finally {
      setUploadingPanel(null);
    }
  };

  const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleFileUpload(e, "source", (text, name) => {
      setSourceText(text);
      setSourceFileName(name);
    });
  };

  const handleTargetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleFileUpload(e, "target", (text, name) => {
      setBeforeText(text);
      setTargetFileName(name);
      setActiveTab("before");
    });
  };

  const handleRulesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setRulesUploading(true);
    setRulesError(null);

    try {
      const { content } = await uploadFile(file);
      const pairs = parsePatternFile(content);
      const imported = rulesFromPairs(pairs);
      nextId.current = imported.length + 1;
      setRules(imported);
      setRulesFileName(file.name);
    } catch (err) {
      setRulesError(
        err instanceof Error ? err.message : "Failed to import transfer rules.",
      );
    } finally {
      setRulesUploading(false);
    }
  };

  const handleTransfer = async () => {
    const patterns = rules
      .filter((rule) => rule.type.trim() && rule.regex.trim())
      .map((rule) => [rule.type.trim(), rule.regex.trim()] as [string, string]);

    setTransferring(true);
    setTransferError(null);

    try {
      const response = await transferAnnotations({
        source: sourceText,
        target: beforeText,
        patterns,
        output: "txt",
      });

      const result =
        typeof response.result === "string"
          ? response.result
          : JSON.stringify(response.result, null, 2);

      setAfterText(result);
      setActiveTab("after");
    } catch (err) {
      setTransferError(
        err instanceof Error ? err.message : "Transfer failed. Please try again.",
      );
    } finally {
      setTransferring(false);
    }
  };

  const addRule = () => {
    setRules((prev) => [...prev, { id: nextId.current++, type: "", regex: "" }]);
  };

  const removeRule = (id: number) => {
    if (rules.length === 1) return;
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  const updateRule = (id: number, field: "type" | "regex", val: string) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, [field]: val } : rule)),
    );
    if (rulesError) setRulesError(null);
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">

        <header className="h-11 shrink-0 border-b border-border px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground font-medium mono">
              Annotate
            </span>
          </div>

          <button
            onClick={() => setDark(!dark)}
            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {dark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

            <div className="flex flex-col border-b border-border overflow-hidden" style={{ height: "50%" }}>
              <div className="h-10 shrink-0 flex items-center justify-between px-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs mono tracking-widest text-muted-foreground uppercase">Source</span>
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
                    accept=".txt,.json,.csv,.xml,.md,.yaml,.yml"
                    className="hidden"
                    onChange={handleSourceUpload}
                  />
                  <button
                    onClick={() => sourceFileInputRef.current?.click()}
                    disabled={uploadingPanel === "source"}
                    className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {uploadingPanel === "source" ? (
                      <>
                        <Loader2 size={11} className="animate-spin" /> Uploading
                      </>
                    ) : (
                      <>
                        <Upload size={11} /> Upload
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={
                      !sourceText.trim() ||
                      !beforeText.trim() ||
                      transferring
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-accent text-accent-foreground text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    {transferring ? (
                      <>
                        <Loader2 size={11} className="animate-spin" /> Transferring
                      </>
                    ) : (
                      <>
                        Transfer <ArrowRight size={11} />
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
                  className="w-full h-full bg-transparent resize-none text-sm text-foreground px-5 py-3 outline-none placeholder-muted-foreground mono leading-relaxed"
                  placeholder="Paste annotated source text, or upload a file…"
                  value={sourceText}
                  onChange={(e) => {
                    setSourceText(e.target.value);
                    if (transferError) setTransferError(null);
                    if (uploadErrorPanel === "source") {
                      setUploadError(null);
                      setUploadErrorPanel(null);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="h-10 shrink-0 flex items-center justify-between px-5 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs mono tracking-widest text-muted-foreground uppercase shrink-0">Target</span>
                  {targetFileName && activeTab === "before" && (
                    <span className="text-xs mono text-accent border border-accent/30 px-1.5 py-0.5 leading-none truncate">
                      {targetFileName}
                    </span>
                  )}
                  {(["before", "after"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`h-10 px-3 text-xs capitalize border-b-2 -mb-px transition-colors ${
                        activeTab === tab
                          ? "border-accent text-accent"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {activeTab === "before" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      ref={targetFileInputRef}
                      type="file"
                      accept=".txt,.json,.csv,.xml,.md,.yaml,.yml"
                      className="hidden"
                      onChange={handleTargetUpload}
                    />
                    <button
                      onClick={() => targetFileInputRef.current?.click()}
                      disabled={uploadingPanel === "target"}
                      className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {uploadingPanel === "target" ? (
                        <>
                          <Loader2 size={11} className="animate-spin" /> Uploading
                        </>
                      ) : (
                        <>
                          <Upload size={11} /> Upload
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              {uploadError && uploadErrorPanel === "target" && (
                <div className="shrink-0 px-5 py-2 border-b border-destructive/30 bg-destructive/10 text-xs text-destructive mono">
                  {uploadError}
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <textarea
                  key={activeTab}
                  className="w-full h-full bg-transparent resize-none text-sm text-foreground px-5 py-3 outline-none placeholder-muted-foreground mono leading-relaxed"
                  placeholder={
                    activeTab === "before"
                      ? "Paste plain target text, or upload a file…"
                      : "After state — appears when you transfer."
                  }
                  value={activeTab === "before" ? beforeText : afterText}
                  onChange={(e) => {
                    if (activeTab === "before") {
                      setBeforeText(e.target.value);
                      if (uploadErrorPanel === "target") {
                        setUploadError(null);
                        setUploadErrorPanel(null);
                      }
                    } else {
                      setAfterText(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <aside className="w-60 shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
            <div className="shrink-0 flex flex-col border-b border-border">
              <div className="min-h-10 flex items-center justify-between px-4 py-2 gap-1">
                <div className="min-w-0">
                  <span className="text-xs mono tracking-widest text-muted-foreground uppercase block leading-tight">
                    Transfer rules
                  </span>
                  {rulesFileName && (
                    <span className="text-[10px] mono text-accent truncate block leading-tight mt-0.5">
                      {rulesFileName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    ref={rulesFileInputRef}
                    type="file"
                    accept=".txt,.json,.yaml,.yml"
                    className="hidden"
                    onChange={handleRulesUpload}
                  />
                  <button
                    onClick={() => rulesFileInputRef.current?.click()}
                    disabled={rulesUploading}
                    title="Import rules from pattern file"
                    className="flex items-center gap-1 px-2 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {rulesUploading ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Upload size={11} />
                    )}
                    Import
                  </button>
                  <button
                    onClick={addRule}
                    className="flex items-center gap-1 px-2 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors"
                  >
                    <Plus size={11} /> Add
                  </button>
                </div>
              </div>
              {rulesError && (
                <div className="px-4 pb-2 text-[10px] text-destructive mono leading-snug">
                  {rulesError}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-3 flex flex-col gap-2.5">
              {rules.map((rule, i) => (
                <div key={rule.id} className="border border-border bg-background p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mono shrink-0">
                      #{String(i + 1).padStart(2, "0")}
                    </span>
                    <input
                      type="text"
                      placeholder="Type (e.g. pos)"
                      value={rule.type}
                      onChange={(e) => updateRule(rule.id, "type", e.target.value)}
                      className="flex-1 bg-transparent text-xs text-foreground placeholder-muted-foreground outline-none mx-2"
                    />
                    <button
                      onClick={() => removeRule(rule.id)}
                      disabled={rules.length === 1}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-20 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <textarea
                    placeholder="Regex (e.g. (/.+? ))"
                    value={rule.regex}
                    onChange={(e) => updateRule(rule.id, "regex", e.target.value)}
                    rows={3}
                    className="w-full bg-secondary text-xs text-foreground placeholder-muted-foreground px-2.5 py-2 resize-none outline-none focus:ring-1 focus:ring-accent transition-shadow mono leading-relaxed"
                  />
                </div>
              ))}
            </div>

            <div className="h-8 shrink-0 border-t border-border flex items-center px-4">
              <p className="text-xs text-muted-foreground mono">
                {rules.length} rule{rules.length !== 1 ? "s" : ""}
              </p>
            </div>
          </aside>
        </div>

        <div className="h-9 shrink-0 border-t border-border flex items-center px-4 gap-2 bg-card">
          <AtSign size={12} className="text-accent shrink-0" />
          <input
            type="text"
            value={mention}
            onChange={(e) => setMention(e.target.value)}
            placeholder="mention a collaborator or leave a comment…"
            className="flex-1 bg-transparent text-xs text-foreground placeholder-muted-foreground outline-none mono"
            onKeyDown={(e) => { if (e.key === "Enter") setMention(""); }}
          />
          {mention && (
            <button
              onClick={() => setMention("")}
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <Send size={11} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
