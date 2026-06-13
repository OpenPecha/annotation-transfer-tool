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
} from "lucide-react";

interface Annotation {
  id: number;
  label: string;
  note: string;
}

export default function App() {
  const [dark, setDark] = useState(false);

  const [sourceText, setSourceText] = useState("");
  const [beforeText, setBeforeText] = useState("");
  const [afterText, setAfterText] = useState("");
  const [activeTab, setActiveTab] = useState<"before" | "after">("before");
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: 1, label: "", note: "" },
  ]);
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const [targetFileName, setTargetFileName] = useState<string | null>(null);
  const [mention, setMention] = useState("");
  const sourceFileInputRef = useRef<HTMLInputElement>(null);
  const targetFileInputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(2);

  const readUploadedFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoad: (text: string, name: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onLoad(text, file.name);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    readUploadedFile(e, (text, name) => {
      setSourceText(text);
      setSourceFileName(name);
    });
  };

  const handleTargetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    readUploadedFile(e, (text, name) => {
      setBeforeText(text);
      setTargetFileName(name);
      setActiveTab("before");
    });
  };

  const handleTransfer = () => { setAfterText(sourceText); setActiveTab("after"); };

  const addAnnotation = () => {
    setAnnotations((prev) => [...prev, { id: nextId.current++, label: "", note: "" }]);
  };
  const removeAnnotation = (id: number) => {
    if (annotations.length === 1) return;
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };
  const updateAnnotation = (id: number, field: "label" | "note", val: string) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
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
                    className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors"
                  >
                    <Upload size={11} /> Upload
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={!sourceText.trim() || !beforeText.trim()}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-accent text-accent-foreground text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    Transfer <ArrowRight size={11} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <textarea
                  className="w-full h-full bg-transparent resize-none text-sm text-foreground px-5 py-3 outline-none placeholder-muted-foreground mono leading-relaxed"
                  placeholder="Paste annotated source text, or upload a file…"
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
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
                      className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors"
                    >
                      <Upload size={11} /> Upload
                    </button>
                  </div>
                )}
              </div>
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
                  onChange={(e) =>
                    activeTab === "before"
                      ? setBeforeText(e.target.value)
                      : setAfterText(e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <aside className="w-60 shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
            <div className="h-10 shrink-0 flex items-center justify-between px-4 border-b border-border">
              <span className="text-xs mono tracking-widest text-muted-foreground uppercase">Annotations</span>
              <button
                onClick={addAnnotation}
                className="flex items-center gap-1 px-2 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors"
              >
                <Plus size={11} /> Add
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-3 flex flex-col gap-2.5">
              {annotations.map((ann, i) => (
                <div key={ann.id} className="border border-border bg-background p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mono shrink-0">
                      #{String(i + 1).padStart(2, "0")}
                    </span>
                    <input
                      type="text"
                      placeholder="Label"
                      value={ann.label}
                      onChange={(e) => updateAnnotation(ann.id, "label", e.target.value)}
                      className="flex-1 bg-transparent text-xs text-foreground placeholder-muted-foreground outline-none mx-2"
                    />
                    <button
                      onClick={() => removeAnnotation(ann.id)}
                      disabled={annotations.length === 1}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-20 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <textarea
                    placeholder="Note…"
                    value={ann.note}
                    onChange={(e) => updateAnnotation(ann.id, "note", e.target.value)}
                    rows={3}
                    className="w-full bg-secondary text-xs text-foreground placeholder-muted-foreground px-2.5 py-2 resize-none outline-none focus:ring-1 focus:ring-accent transition-shadow mono leading-relaxed"
                  />
                </div>
              ))}
            </div>

            <div className="h-8 shrink-0 border-t border-border flex items-center px-4">
              <p className="text-xs text-muted-foreground mono">
                {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
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
