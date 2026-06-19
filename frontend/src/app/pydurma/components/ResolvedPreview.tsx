interface ResolvedPreviewProps {
  suggestedVulgate: string
  resolvedVulgate: string
  unresolvedCount: number
}

export function ResolvedPreview({
  suggestedVulgate,
  resolvedVulgate,
  unresolvedCount,
}: ResolvedPreviewProps) {
  return (
    <div className="flex flex-col min-h-0 h-full border border-border rounded bg-card">
      <div className="px-4 py-2 border-b border-border bg-muted/40">
        <h2 className="text-sm font-medium">Resolved preview</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {unresolvedCount > 0
            ? 'Showing draft with unconfirmed defaults where needed.'
            : 'All variant choices confirmed.'}
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">
            Auto vulgate (proposal)
          </h3>
          <pre className="mono text-sm whitespace-pre-wrap break-all text-muted-foreground">
            {suggestedVulgate}
          </pre>
        </div>
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">
            Your resolved text
          </h3>
          <pre className="mono text-sm whitespace-pre-wrap break-all">{resolvedVulgate}</pre>
        </div>
      </div>
    </div>
  )
}
