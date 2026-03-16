import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./CopyButton";

export function PromptCard({ prompt }: { prompt: any }) {
  const promptText = prompt.prompt || prompt.template || "";

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          {prompt.number && (
            <span className="text-xs font-mono text-[hsl(var(--primary))]">#{prompt.number}</span>
          )}
          <h3 className="font-semibold text-base">{prompt.name}</h3>
        </div>
        {promptText && <CopyButton text={promptText} className="shrink-0" />}
      </div>

      {prompt.category && (
        <Badge variant="secondary" className="text-[10px] mb-3 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-0">
          {prompt.category}
        </Badge>
      )}

      {prompt.description && (
        <p className="text-sm text-muted-foreground mb-3">{prompt.description}</p>
      )}

      {promptText && (
        <div className="bg-background rounded-lg p-4 mb-3 text-sm leading-relaxed font-mono text-muted-foreground whitespace-pre-wrap">
          {promptText}
        </div>
      )}

      {prompt.best_on && prompt.best_on.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">Best on:</span>
          {prompt.best_on.map((platform: string) => (
            <Badge key={platform} variant="secondary" className="text-xs">
              {platform}
            </Badge>
          ))}
        </div>
      )}

      {(prompt.tip || prompt.pro_tip) && (
        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-[hsl(var(--primary))]/5 rounded-lg p-3">
          <Lightbulb className="w-3.5 h-3.5 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
          <span><strong>Pro tip:</strong> {prompt.tip || prompt.pro_tip}</span>
        </div>
      )}
    </div>
  );
}
