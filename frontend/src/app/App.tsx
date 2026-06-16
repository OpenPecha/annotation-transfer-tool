import { useState, useRef } from "react";
import {
  ResizableHandle,
  ResizablePanelGroup,
} from "@/app/components/ui/resizable";
import { AppHeader } from "@/app/components/AppHeader";
import { SourcePanel } from "@/app/components/SourcePanel";
import { TargetPanel } from "@/app/components/TargetPanel";
import { TransferRulesPanel } from "@/app/components/TransferRulesPanel";
import { translations } from "@/app/i18n";
import type { ActiveTab, Language, PanelLayout } from "@/app/types";
import { transferAnnotations } from "@/lib/api";
import { downloadTxtFile, readTxtFile } from "@/lib/files";
import {
  parsePatternFile,
  rulesFromPairs,
  type TransferRule,
} from "@/lib/patterns";

export default function App() {
  const [dark, setDark] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [panelLayout, setPanelLayout] = useState<PanelLayout>("vertical");
  const labels = translations[language];

  const [sourceText, setSourceText] = useState("");
  const [beforeText, setBeforeText] = useState("");
  const [afterText, setAfterText] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("before");
  const [rules, setRules] = useState<TransferRule[]>([
    { id: 1, type: "", regex: "" },
  ]);
  const [rulesFileName, setRulesFileName] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const [targetFileName, setTargetFileName] = useState<string | null>(null);
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
      const { content, filename } = await readTxtFile(file);
      onLoad(content, filename);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : labels.uploadFailed;
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
      const { content } = await readTxtFile(file);
      const pairs = parsePatternFile(content);
      const imported = rulesFromPairs(pairs);
      nextId.current = imported.length + 1;
      setRules(imported);
      setRulesFileName(file.name);
    } catch (err) {
      setRulesError(
        err instanceof Error ? err.message : labels.rulesImportFailed,
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
        err instanceof Error ? err.message : labels.transferFailed,
      );
    } finally {
      setTransferring(false);
    }
  };

  const addRule = () => {
    setRules((prev) => [...prev, { id: nextId.current++, type: "", regex: "" }]);
    if (rulesFileName) setRulesFileName(null);
  };

  const removeRule = (id: number) => {
    if (rules.length === 1) return;
    setRules((prev) => prev.filter((rule) => rule.id !== id));
    if (rulesFileName) setRulesFileName(null);
  };

  const updateRule = (id: number, field: "type" | "regex", val: string) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, [field]: val } : rule)),
    );
    if (rulesError) setRulesError(null);
    if (rulesFileName) setRulesFileName(null);
  };

  const hasWork =
    Boolean(sourceText.trim()) ||
    Boolean(beforeText.trim()) ||
    Boolean(afterText.trim()) ||
    rules.some((rule) => rule.type.trim() || rule.regex.trim()) ||
    Boolean(sourceFileName) ||
    Boolean(targetFileName) ||
    Boolean(rulesFileName);

  const handleReset = () => {
    if (transferring) return;

    setSourceText("");
    setBeforeText("");
    setAfterText("");
    setActiveTab("before");

    setSourceFileName(null);
    setTargetFileName(null);
    setRulesFileName(null);

    setRules([{ id: 1, type: "", regex: "" }]);
    nextId.current = 2;

    setTransferError(null);
    setUploadError(null);
    setUploadErrorPanel(null);
    setRulesError(null);
    setUploadingPanel(null);
    setRulesUploading(false);

    if (sourceFileInputRef.current) sourceFileInputRef.current.value = "";
    if (targetFileInputRef.current) targetFileInputRef.current.value = "";
    if (rulesFileInputRef.current) rulesFileInputRef.current.value = "";
  };

  const handleDownloadAfter = () => {
    if (!afterText.trim()) return;

    const baseName = targetFileName?.replace(/\.txt$/i, "") ?? "transfer-result";
    downloadTxtFile(afterText, `${baseName}-annotated.txt`);
  };

  const handleSourceTextChange = (value: string) => {
    setSourceText(value);
    if (!value.trim()) setSourceFileName(null);
  };

  const handleBeforeTextChange = (value: string) => {
    setBeforeText(value);
    if (!value.trim()) setTargetFileName(null);
  };

  const clearUploadError = () => {
    setUploadError(null);
    setUploadErrorPanel(null);
  };

  const toggleLayout = () => {
    setPanelLayout((layout) =>
      layout === "vertical" ? "horizontal" : "vertical",
    );
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
        <AppHeader
          dark={dark}
          language={language}
          labels={labels}
          panelLayout={panelLayout}
          transferring={transferring}
          hasWork={hasWork}
          onReset={handleReset}
          onToggleDark={() => setDark(!dark)}
          onToggleLayout={toggleLayout}
          onLanguageChange={setLanguage}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <ResizablePanelGroup
            key={panelLayout}
            direction={panelLayout}
            className="flex-1 min-w-0"
          >
            <SourcePanel
              labels={labels}
              panelLayout={panelLayout}
              sourceText={sourceText}
              beforeText={beforeText}
              sourceFileName={sourceFileName}
              transferring={transferring}
              transferError={transferError}
              uploadingPanel={uploadingPanel}
              uploadError={uploadError}
              uploadErrorPanel={uploadErrorPanel}
              sourceFileInputRef={sourceFileInputRef}
              onSourceUpload={handleSourceUpload}
              onTransfer={handleTransfer}
              onSourceTextChange={handleSourceTextChange}
              onClearTransferError={() => setTransferError(null)}
              onClearUploadError={clearUploadError}
            />

            <ResizableHandle withHandle />

            <TargetPanel
              labels={labels}
              activeTab={activeTab}
              beforeText={beforeText}
              afterText={afterText}
              targetFileName={targetFileName}
              uploadingPanel={uploadingPanel}
              uploadError={uploadError}
              uploadErrorPanel={uploadErrorPanel}
              targetFileInputRef={targetFileInputRef}
              onTabChange={setActiveTab}
              onTargetUpload={handleTargetUpload}
              onDownloadAfter={handleDownloadAfter}
              onBeforeTextChange={handleBeforeTextChange}
              onAfterTextChange={setAfterText}
              onClearUploadError={clearUploadError}
            />
          </ResizablePanelGroup>

          <TransferRulesPanel
            labels={labels}
            rules={rules}
            rulesFileName={rulesFileName}
            rulesUploading={rulesUploading}
            rulesError={rulesError}
            rulesFileInputRef={rulesFileInputRef}
            onRulesUpload={handleRulesUpload}
            onAddRule={addRule}
            onRemoveRule={removeRule}
            onUpdateRule={updateRule}
          />
        </div>

        <div className="h-9 shrink-0 border-t border-border flex items-center px-4 bg-card">
          <p className="text-xs text-muted-foreground mono">
            {labels.footer}
          </p>
        </div>

      </div>
    </div>
  );
}
