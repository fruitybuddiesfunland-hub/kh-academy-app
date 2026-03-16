import { Lightbulb, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./CopyButton";

function SetupSteps({ title, setup }: { title: string; setup: any }) {
  if (!setup) return null;
  const steps = Array.isArray(setup) ? setup : typeof setup === "object" ? Object.entries(setup).map(([k, v]) => ({ step: k, ...(typeof v === "object" ? v as any : { description: v }) })) : [];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      {Array.isArray(setup) ? (
        <div className="space-y-2">
          {setup.map((step: any, i: number) => (
            <div key={i} className="flex gap-3 bg-card border border-border rounded-lg p-3">
              <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0 mt-0.5">
                {step.step || i + 1}
              </span>
              <div className="flex-1">
                {step.title && <h4 className="font-semibold text-xs">{step.title}</h4>}
                <p className="text-sm text-muted-foreground">
                  {typeof step === "string" ? step : step.action || step.instruction || step.description || step.detail || JSON.stringify(step)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : typeof setup === "string" ? (
        <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
          {setup}
        </div>
      ) : (
        <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
          {JSON.stringify(setup, null, 2)}
        </div>
      )}
    </div>
  );
}

function PromptBlock({ title, prompt }: { title: string; prompt: any }) {
  if (!prompt) return null;
  const text = typeof prompt === "string" ? prompt : JSON.stringify(prompt, null, 2);
  return (
    <div className="relative">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
        <CopyButton text={text} className="absolute top-8 right-2" />
        {text}
      </div>
    </div>
  );
}

function DataBlock({ title, data }: { title: string; data: any }) {
  if (!data) return null;
  if (typeof data === "string") {
    return (
      <div>
        <h3 className="font-semibold text-sm mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{data}</p>
      </div>
    );
  }
  if (Array.isArray(data)) {
    return (
      <div>
        <h3 className="font-semibold text-sm mb-2">{title}</h3>
        <ul className="space-y-1">
          {data.map((item: any, i: number) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-[hsl(var(--primary))] mt-0.5">•</span>
              {typeof item === "string" ? item : item.name || item.title || item.label || item.description || JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  // Object
  return (
    <div className="relative">
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
        <CopyButton text={JSON.stringify(data, null, 2)} className="absolute top-8 right-2" />
        {JSON.stringify(data, null, 2)}
      </div>
    </div>
  );
}

export function WorkflowSection({ section }: { section: any }) {
  const skipKeys = new Set([
    "title", "type", "tagline", "metrics", "flow",
    "ai_prompt", "zapier_setup", "n8n_setup", "setup_steps", "customization",
    "pro_tip", "content",
    // Known prompt-like keys
    "classifier_prompt", "response_prompt", "request_email_prompt",
    "testimonial_formatter_prompt", "lead_follow_up_prompt", "win_back_prompt",
    "follow_up_ai_prompt",
  ]);

  // Gather all extra data fields
  const extraFields = Object.entries(section).filter(
    ([key]) => !skipKeys.has(key)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">{section.title}</h1>
        {section.tagline && (
          <p className="text-muted-foreground leading-relaxed">{section.tagline}</p>
        )}
        {section.content && (
          <p className="text-muted-foreground leading-relaxed mt-2">{section.content}</p>
        )}
      </div>

      {/* Metrics badges */}
      {section.metrics && (
        <div className="flex flex-wrap gap-3">
          {section.metrics.time_saved && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">
              Saves {section.metrics.time_saved}
            </Badge>
          )}
          {section.metrics.difficulty && (
            <Badge variant="secondary" className="text-xs">
              {section.metrics.difficulty}
            </Badge>
          )}
          {section.metrics.tools_needed && (
            <Badge variant="secondary" className="text-xs">
              {section.metrics.tools_needed} tools
            </Badge>
          )}
          {section.metrics.frequency && (
            <Badge variant="secondary" className="text-xs">
              {section.metrics.frequency}
            </Badge>
          )}
        </div>
      )}

      {/* Flow visualization */}
      {section.flow && Array.isArray(section.flow) && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Workflow Flow</h3>
          <div className="flex flex-wrap items-center gap-2">
            {section.flow.map((step: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-card border border-border rounded-lg px-4 py-3 text-center">
                  <div className="text-xs font-mono text-[hsl(var(--primary))] mb-1">{step.step || step.label || `Step ${i + 1}`}</div>
                  <div className="text-sm font-medium">{step.label || step.name}</div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">{step.description}</div>
                  )}
                </div>
                {i < section.flow.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extra data fields (stats, matrices, etc.) */}
      {extraFields.map(([key, value]) => (
        <DataBlock key={key} title={key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} data={value} />
      ))}

      {/* AI Prompt */}
      <PromptBlock title="AI Prompt" prompt={section.ai_prompt} />

      {/* Other prompt variants */}
      <PromptBlock title="Classifier Prompt" prompt={section.classifier_prompt} />
      <PromptBlock title="Response Prompt" prompt={section.response_prompt} />
      <PromptBlock title="Request Email Prompt" prompt={section.request_email_prompt} />
      <PromptBlock title="Testimonial Formatter" prompt={section.testimonial_formatter_prompt} />
      <PromptBlock title="Lead Follow-Up Prompt" prompt={section.lead_follow_up_prompt} />
      <PromptBlock title="Win-Back Prompt" prompt={section.win_back_prompt} />
      <PromptBlock title="Follow-Up AI Prompt" prompt={section.follow_up_ai_prompt} />

      {/* Zapier Setup */}
      <SetupSteps title="Zapier Setup" setup={section.zapier_setup} />

      {/* n8n Setup */}
      <SetupSteps title="n8n Setup" setup={section.n8n_setup} />

      {/* Generic setup steps */}
      <SetupSteps title="Setup Steps" setup={section.setup_steps} />

      {/* Customization */}
      {section.customization && (
        <DataBlock title="Customization" data={section.customization} />
      )}

      {/* Pro tip */}
      {section.pro_tip && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-[hsl(var(--primary))]/5 rounded-lg p-3">
          <Lightbulb className="w-3.5 h-3.5 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
          <span><strong>Pro tip:</strong> {section.pro_tip}</span>
        </div>
      )}
    </div>
  );
}
