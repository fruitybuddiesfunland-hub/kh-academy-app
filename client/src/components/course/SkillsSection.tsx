import { useState } from "react";
import { Download, ChevronDown, ChevronUp, Copy, Check, Cpu, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function CopySkillButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-2 text-xs"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy Code
        </>
      )}
    </Button>
  );
}

function SkillCard({ skill }: { skill: any }) {
  const [expanded, setExpanded] = useState(false);
  const isClaude = skill.platform === "Claude Skill";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isClaude
                  ? "bg-orange-500/10 text-orange-400"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              {isClaude ? (
                <Cpu className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-base">{skill.name}</h3>
              <Badge
                variant="secondary"
                className={`text-[10px] mt-1 border-0 ${
                  isClaude
                    ? "bg-orange-500/10 text-orange-400"
                    : "bg-blue-500/10 text-blue-400"
                }`}
              >
                {skill.platform}
              </Badge>
            </div>
          </div>
        </div>

        {skill.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {skill.description}
          </p>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="gap-2 text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
        >
          <Download className="w-3.5 h-3.5" />
          {expanded ? "Hide Install Code" : "View Install Code"}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>

      {/* Expandable Code Section */}
      {expanded && (
        <div className="border-t border-border bg-background/50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">
                {isClaude
                  ? "Paste this into Claude /skill-creator"
                  : "Paste this into Gemini Gem instructions"}
              </span>
              <CopySkillButton text={skill.system_prompt} />
            </div>
            <div className="bg-zinc-950 rounded-lg p-4 max-h-80 overflow-y-auto">
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                {skill.system_prompt}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SkillsSection({ section }: { section: any }) {
  const skills = section.skills || [];
  const installOverview = section.install_overview;

  return (
    <div className="space-y-8">
      {/* Section Intro */}
      {section.content && (
        <div className="text-muted-foreground leading-relaxed">
          {section.content}
        </div>
      )}

      {/* Install Instructions */}
      {installOverview && (
        <div className="grid md:grid-cols-2 gap-4">
          {installOverview.claude && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-orange-400" />
                <h4 className="font-semibold text-sm">
                  {installOverview.claude.title}
                </h4>
              </div>
              <ol className="space-y-2">
                {installOverview.claude.steps.map(
                  (step: string, i: number) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground flex gap-2"
                    >
                      <span className="text-[hsl(var(--primary))] font-mono shrink-0">
                        {i + 1}.
                      </span>
                      {step}
                    </li>
                  )
                )}
              </ol>
            </div>
          )}
          {installOverview.gemini && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h4 className="font-semibold text-sm">
                  {installOverview.gemini.title}
                </h4>
              </div>
              <ol className="space-y-2">
                {installOverview.gemini.steps.map(
                  (step: string, i: number) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground flex gap-2"
                    >
                      <span className="text-[hsl(var(--primary))] font-mono shrink-0">
                        {i + 1}.
                      </span>
                      {step}
                    </li>
                  )
                )}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Skill Cards */}
      <div className="space-y-4">
        {skills.map((skill: any, idx: number) => (
          <SkillCard key={idx} skill={skill} />
        ))}
      </div>
    </div>
  );
}
