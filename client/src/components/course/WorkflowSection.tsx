import { Lightbulb, ArrowRight, Copy, Check, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./CopyButton";

/* ──────────────────── Helpers ──────────────────── */

function SetupSteps({ title, setup }: { title: string; setup: any }) {
  if (!setup) return null;
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
                {(step.node || step.action || step.label) && (
                  <h4 className="font-semibold text-xs">{step.node || step.action || step.label}</h4>
                )}
                <p className="text-sm text-muted-foreground">
                  {typeof step === "string" ? step : step.detail || step.instruction || step.description || ""}
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
        <SmartObject data={setup} />
      )}
    </div>
  );
}

/** Renders a prompt that might be a string OR { platform, prompt } */
function PromptBlock({ title, prompt }: { title: string; prompt: any }) {
  if (!prompt) return null;
  
  // Handle { platform, prompt } objects
  const platform = typeof prompt === "object" ? prompt.platform : null;
  const text = typeof prompt === "string" ? prompt : prompt.prompt || JSON.stringify(prompt, null, 2);
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        {platform && (
          <Badge variant="secondary" className="text-[10px]">{platform}</Badge>
        )}
      </div>
      <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
        <CopyButton text={text} className="absolute top-8 right-2" />
        {text}
      </div>
    </div>
  );
}

/** Smart renderer for objects — handles tables, nested structures, etc. */
function SmartObject({ data, title }: { data: any; title?: string }) {
  if (!data) return null;
  
  // Table-like data: { columns, rows } or { columns, example_rows }
  if (data.columns && (data.rows || data.example_rows)) {
    const rows = data.rows || data.example_rows;
    return (
      <div>
        {(title || data.title) && <h3 className="font-semibold text-sm mb-3">{title || data.title}</h3>}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card">
                {data.columns.map((col: string, i: number) => (
                  <th key={i} className="text-left p-3 font-semibold border-b border-border text-xs">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, ri: number) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-background" : "bg-card/50"}>
                  {Array.isArray(row) 
                    ? row.map((cell: string, ci: number) => (
                        <td key={ci} className="p-3 text-muted-foreground border-b border-border/50 text-xs">
                          {cell}
                        </td>
                      ))
                    : data.columns.map((col: string, ci: number) => {
                        const key = col.toLowerCase().replace(/\s+/g, "_");
                        const val = row[key] || row[col] || Object.values(row)[ci] || "";
                        return (
                          <td key={ci} className="p-3 text-muted-foreground border-b border-border/50 text-xs">
                            {typeof val === "string" ? val : JSON.stringify(val)}
                          </td>
                        );
                      })
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  // Key-value object — render as structured cards
  return (
    <div>
      {title && <h3 className="font-semibold text-sm mb-3">{title}</h3>}
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]: [string, any]) => {
          const label = key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
          
          if (typeof value === "string" || typeof value === "number") {
            return (
              <div key={key} className="flex gap-3 bg-card border border-border rounded-lg p-3">
                <span className="text-xs font-semibold text-[hsl(var(--primary))] shrink-0 min-w-[120px]">{label}</span>
                <span className="text-sm text-muted-foreground">{String(value)}</span>
              </div>
            );
          }
          
          if (Array.isArray(value)) {
            return (
              <div key={key} className="bg-card border border-border rounded-lg p-3">
                <h4 className="text-xs font-semibold text-[hsl(var(--primary))] mb-2">{label}</h4>
                <SmartArray data={value} />
              </div>
            );
          }
          
          if (typeof value === "object" && value !== null) {
            return (
              <div key={key} className="bg-card border border-border rounded-lg p-3">
                <SmartObject data={value} title={label} />
              </div>
            );
          }
          
          return null;
        })}
      </div>
    </div>
  );
}

/** Smart renderer for arrays */
function SmartArray({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  
  const first = data[0];
  
  // Simple string array
  if (typeof first === "string") {
    return (
      <ul className="space-y-1">
        {data.map((item: string, i: number) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-[hsl(var(--primary))] mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    );
  }
  
  // Rich object array — render each as a mini card
  if (typeof first === "object") {
    return (
      <div className="space-y-2">
        {data.map((item: any, i: number) => (
          <RichItem key={i} item={item} index={i} />
        ))}
      </div>
    );
  }
  
  return null;
}

/** Renders a single rich object item intelligently */
function RichItem({ item, index }: { item: any; index: number }) {
  // Determine the best "title" field
  const titleField = item.name || item.title || item.label || item.scenario || 
                     item.platform || item.move || item.category || item.problem || null;
  // Determine the best "description" field
  const descField = item.description || item.detail || item.instruction || 
                    item.fix || item.goal || item.format || null;
  // Step/number
  const step = item.step || item.number || item.rank || item.touch || item.template_number || null;
  
  // Extract remaining fields
  const skipKeys = new Set(["name", "title", "label", "scenario", "platform", "move", "category", "problem",
                            "description", "detail", "instruction", "fix", "goal", "format",
                            "step", "number", "rank", "touch", "template_number"]);
  const extra = Object.entries(item).filter(([k]) => !skipKeys.has(k));
  
  return (
    <div className="bg-background/50 rounded-lg p-3 border border-border/30">
      <div className="flex gap-3">
        {step && (
          <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0 mt-0.5">{step}</span>
        )}
        <div className="flex-1 min-w-0">
          {titleField && <h4 className="font-semibold text-sm mb-0.5">{titleField}</h4>}
          {descField && <p className="text-sm text-muted-foreground">{descField}</p>}
          
          {/* Render extra fields */}
          {extra.map(([key, value]: [string, any]) => {
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
            
            if (typeof value === "string") {
              // Long strings (like templates/prompts) get a code block
              if (value.length > 100) {
                return (
                  <div key={key} className="mt-2 relative">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                    <div className="bg-background rounded-lg p-3 mt-1 text-xs font-mono text-muted-foreground whitespace-pre-wrap border border-border/50">
                      <CopyButton text={value} className="absolute top-6 right-1" />
                      {value}
                    </div>
                  </div>
                );
              }
              return (
                <p key={key} className="text-xs text-muted-foreground mt-1">
                  <strong>{label}:</strong> {value}
                </p>
              );
            }
            
            if (Array.isArray(value)) {
              if (typeof value[0] === "string") {
                return (
                  <div key={key} className="mt-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                    <ul className="mt-1 space-y-0.5">
                      {value.map((v: string, vi: number) => (
                        <li key={vi} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-emerald-400">✓</span> {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              if (typeof value[0] === "object") {
                return (
                  <div key={key} className="mt-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                    <div className="mt-1 space-y-1">
                      {value.map((v: any, vi: number) => (
                        <RichItem key={vi} item={v} index={vi} />
                      ))}
                    </div>
                  </div>
                );
              }
            }
            
            if (typeof value === "object" && value !== null) {
              // Check if it's a prompt-like object
              if (value.prompt && typeof value.prompt === "string") {
                return (
                  <div key={key} className="mt-2 relative">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                      {value.platform && <Badge variant="secondary" className="text-[8px]">{value.platform}</Badge>}
                    </div>
                    <div className="bg-background rounded-lg p-3 mt-1 text-xs font-mono text-muted-foreground whitespace-pre-wrap border border-border/50">
                      <CopyButton text={value.prompt} className="absolute top-6 right-1" />
                      {value.prompt}
                    </div>
                  </div>
                );
              }
              return (
                <div key={key} className="mt-2">
                  <SmartObject data={value} title={label} />
                </div>
              );
            }
            
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

/** Renders data intelligently based on type */
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
        <SmartArray data={data} />
      </div>
    );
  }
  
  if (typeof data === "object") {
    return <SmartObject data={data} title={title} />;
  }
  
  return null;
}

/* ──────────────────── Main Component ──────────────────── */

export function WorkflowSection({ section }: { section: any }) {
  const skipKeys = new Set([
    "title", "type", "tagline", "metrics", "flow",
    "ai_prompt", "zapier_setup", "n8n_setup", "setup_steps", "customization",
    "pro_tip", "content", "n8n_workflow_json", "prerequisites", "testing_checklist",
    // Known prompt-like keys
    "classifier_prompt", "response_prompt", "request_email_prompt",
    "testimonial_formatter_prompt", "lead_follow_up_prompt", "win_back_prompt",
    "follow_up_ai_prompt",
    // System section keys that we render explicitly
    "problem", "solution", "time_saved", "whats_inside",
  ]);

  /** Download n8n workflow JSON as a file */
  function downloadN8nWorkflow() {
    if (!section.n8n_workflow_json) return;
    const json = typeof section.n8n_workflow_json === "string"
      ? section.n8n_workflow_json
      : JSON.stringify(section.n8n_workflow_json, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = (section.n8n_workflow_json?.name || section.title || "workflow")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

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

      {/* Problem / Solution / Time Saved (system sections) */}
      {(section.problem || section.solution || section.time_saved) && (
        <div className="grid md:grid-cols-3 gap-3">
          {section.problem && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <h3 className="font-semibold text-xs text-red-400 mb-1.5">Problem</h3>
              <p className="text-sm text-muted-foreground">{section.problem}</p>
            </div>
          )}
          {section.solution && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <h3 className="font-semibold text-xs text-emerald-400 mb-1.5">Solution</h3>
              <p className="text-sm text-muted-foreground">{section.solution}</p>
            </div>
          )}
          {section.time_saved && (
            <div className="bg-[hsl(var(--primary))]/5 border border-[hsl(var(--primary))]/20 rounded-xl p-4">
              <h3 className="font-semibold text-xs text-[hsl(var(--primary))] mb-1.5">Time Saved</h3>
              <p className="text-sm text-muted-foreground">{section.time_saved}</p>
            </div>
          )}
        </div>
      )}

      {/* What's Inside */}
      {section.whats_inside && (
        <div>
          <h3 className="font-semibold text-sm mb-2">What's Inside</h3>
          <ul className="space-y-1">
            {section.whats_inside.map((item: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-400">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

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
                  <div className="text-xs font-mono text-[hsl(var(--primary))] mb-1">Step {step.step || i + 1}</div>
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

      {/* Extra data fields rendered smartly */}
      {extraFields.map(([key, value]) => (
        <DataBlock key={key} title={key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} data={value} />
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
        <SmartObject data={section.customization} title="Customization" />
      )}

      {/* Prerequisites */}
      {section.prerequisites && Array.isArray(section.prerequisites) && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Before You Start</h3>
          <ul className="space-y-1.5">
            {section.prerequisites.map((item: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-[hsl(var(--primary))]">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* n8n Workflow Download */}
      {section.n8n_workflow_json && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">n8n Workflow File</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Import directly into n8n — go to Workflows → Import from File
              </p>
            </div>
            <button
              onClick={downloadN8nWorkflow}
              className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download .json
            </button>
          </div>
        </div>
      )}

      {/* Testing Checklist */}
      {section.testing_checklist && Array.isArray(section.testing_checklist) && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Testing Checklist</h3>
          <ul className="space-y-1.5">
            {section.testing_checklist.map((item: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0 mt-0.5">{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
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
