import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./CopyButton";

function renderTemplateContent(template: any): string {
  if (typeof template === "string") return template;
  if (typeof template === "object" && template !== null) {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(template)) {
      const label = key.replace(/_/g, " ").toUpperCase();
      if (typeof value === "string") {
        parts.push(`[${label}]\n${value}`);
      } else if (Array.isArray(value)) {
        parts.push(`[${label}]\n${value.map((v: any) => typeof v === "string" ? `• ${v}` : `• ${JSON.stringify(v)}`).join("\n")}`);
      } else if (typeof value === "object" && value !== null) {
        parts.push(`[${label}]\n${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join("\n")}`);
      }
    }
    return parts.join("\n\n");
  }
  return JSON.stringify(template, null, 2);
}

/** Table renderer for { columns, rows/example_rows } */
function TableBlock({ data, title }: { data: any; title?: string }) {
  const cols = data.columns;
  const rows = data.rows || data.example_rows;
  if (!cols || !rows) return null;

  return (
    <div>
      {title && <h3 className="font-semibold text-base mb-3">{title}</h3>}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-card">
              {cols.map((col: string, i: number) => (
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
                  : cols.map((_: string, ci: number) => {
                      const val = Object.values(row)[ci] || "";
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

/** Smart object renderer */
function SmartObject({ data, title }: { data: any; title?: string }) {
  if (!data) return null;

  // Table-like
  if (data.columns && (data.rows || data.example_rows)) {
    return <TableBlock data={data} title={title} />;
  }

  return (
    <div>
      {title && <h4 className="font-semibold text-sm mb-2">{title}</h4>}
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]: [string, any]) => {
          const label = key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

          if (typeof value === "string" || typeof value === "number") {
            return (
              <div key={key} className="flex gap-3 bg-background/50 rounded-lg p-3">
                <span className="text-xs font-semibold text-[hsl(var(--primary))] shrink-0 min-w-[100px]">{label}</span>
                <span className="text-sm text-muted-foreground">{String(value)}</span>
              </div>
            );
          }

          if (Array.isArray(value)) {
            if (typeof value[0] === "string") {
              return (
                <div key={key} className="bg-background/50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-[hsl(var(--primary))] mb-1">{label}</h4>
                  <ul className="space-y-0.5">
                    {value.map((v: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-emerald-400">✓</span> {v}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            if (typeof value[0] === "object") {
              return (
                <div key={key} className="bg-background/50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-[hsl(var(--primary))] mb-2">{label}</h4>
                  <div className="space-y-1">
                    {value.map((item: any, i: number) => {
                      const t = item.name || item.title || item.label || item.action || "";
                      const d = item.description || item.detail || item.instruction || "";
                      return (
                        <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                          <span className="text-[hsl(var(--primary))] shrink-0">{item.step || i + 1}.</span>
                          <div>
                            {t && <strong>{t}</strong>}
                            {t && d && " — "}
                            {d}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          }

          if (typeof value === "object" && value !== null) {
            return (
              <div key={key} className="bg-background/50 rounded-lg p-3">
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

/** Renders a prompt that might be string or { platform, prompt } */
function PromptBlock({ title, prompt }: { title: string; prompt: any }) {
  if (!prompt) return null;
  const platform = typeof prompt === "object" ? prompt.platform : null;
  const text = typeof prompt === "string" ? prompt : prompt.prompt || JSON.stringify(prompt, null, 2);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        {platform && <Badge variant="secondary" className="text-[10px]">{platform}</Badge>}
      </div>
      <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
        <CopyButton text={text} className="absolute top-8 right-2" />
        {text}
      </div>
    </div>
  );
}

export function TemplateSection({ section }: { section: any }) {
  const hasItems = section.items && Array.isArray(section.items);
  const hasTemplate = section.template;
  const hasMasterTemplate = section.master_template;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{section.title}</h1>
        {section.content && (
          <p className="text-muted-foreground leading-relaxed mb-2">{section.content}</p>
        )}
        {section.description && (
          <p className="text-muted-foreground text-sm mb-2">{section.description}</p>
        )}
        {section.when_to_use && (
          <p className="text-xs text-muted-foreground"><strong>When to use:</strong> {section.when_to_use}</p>
        )}
      </div>

      {/* Works on platforms */}
      {section.works_on && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Works on:</span>
          {(Array.isArray(section.works_on) ? section.works_on : [section.works_on]).map((p: string) => (
            <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
          ))}
        </div>
      )}

      {/* Single template object */}
      {hasTemplate && (
        <div className="relative">
          <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton
              text={renderTemplateContent(section.template)}
              className="absolute top-2 right-2"
            />
            {renderTemplateContent(section.template)}
          </div>
        </div>
      )}

      {/* Master template */}
      {hasMasterTemplate && (
        <div>
          <h3 className="font-semibold text-base mb-3">Master Template</h3>
          {section.master_template.fields ? (
            <SmartObject data={section.master_template.fields} title={section.master_template.label} />
          ) : (
            <div className="relative">
              <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
                <CopyButton
                  text={renderTemplateContent(section.master_template)}
                  className="absolute top-2 right-2"
                />
                {renderTemplateContent(section.master_template)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bonus template */}
      {section.bonus_template && (
        <div>
          <h3 className="font-semibold text-base mb-3">
            {section.bonus_template.title || "Bonus Template"}
          </h3>
          {section.bonus_template.description && (
            <p className="text-sm text-muted-foreground mb-3">{section.bonus_template.description}</p>
          )}
          {(section.bonus_template.prompt || section.bonus_template.template) && (
            <div className="relative">
              <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
                <CopyButton
                  text={section.bonus_template.prompt || renderTemplateContent(section.bonus_template.template)}
                  className="absolute top-2 right-2"
                />
                {section.bonus_template.prompt || renderTemplateContent(section.bonus_template.template)}
              </div>
            </div>
          )}
          {section.bonus_template.pro_tip && (
            <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-[hsl(var(--primary))]/5 rounded-lg p-3">
              <Lightbulb className="w-3.5 h-3.5 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
              <span><strong>Pro tip:</strong> {section.bonus_template.pro_tip}</span>
            </div>
          )}
        </div>
      )}

      {/* Bonus templates array */}
      {section.bonus_templates && Array.isArray(section.bonus_templates) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base">Bonus Templates</h3>
          {section.bonus_templates.map((bt: any, i: number) => {
            const text = typeof bt === "string" ? bt : bt.prompt || renderTemplateContent(bt.template || bt);
            return (
              <div key={i} className="relative">
                {bt.name && <h4 className="font-semibold text-sm mb-2">{bt.name}</h4>}
                <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
                  <CopyButton text={text} className="absolute top-2 right-2" />
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Items array (frameworks, templates list) */}
      {hasItems && section.items.map((item: any, i: number) => {
        const templateText = item.prompt || item.template || item.content || "";
        return (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                {item.number && (
                  <span className="text-xs font-mono text-[hsl(var(--primary))] mr-2">#{item.number}</span>
                )}
                <h3 className="font-semibold text-base inline">{item.name}</h3>
              </div>
              {templateText && <CopyButton text={templateText} className="shrink-0" />}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
            )}
            {item.category && (
              <Badge variant="secondary" className="text-[10px] mb-3 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-0">
                {item.category}
              </Badge>
            )}
            {templateText && (
              <div className="bg-background rounded-lg p-4 mb-3 text-sm leading-relaxed font-mono text-muted-foreground whitespace-pre-wrap">
                {templateText}
              </div>
            )}
            {item.best_on && (
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Best on:</span>
                {item.best_on.map((p: string) => (
                  <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                ))}
              </div>
            )}
            {item.pro_tip && (
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-[hsl(var(--primary))]/5 rounded-lg p-3">
                <Lightbulb className="w-3.5 h-3.5 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                <span><strong>Pro tip:</strong> {item.pro_tip}</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Installation paths */}
      {section.installation_paths && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Installation Paths</h3>
          {(Array.isArray(section.installation_paths) ? section.installation_paths : [section.installation_paths]).map((path: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 mb-2">
              {typeof path === "string" ? (
                <p className="text-sm text-muted-foreground">{path}</p>
              ) : (
                <div>
                  {(path.platform || path.path) && <h4 className="font-semibold text-xs mb-1">{path.platform || path.path}</h4>}
                  {path.steps && (
                    <ol className="space-y-1">
                      {path.steps.map((s: string, si: number) => (
                        <li key={si} className="text-xs text-muted-foreground">
                          {si + 1}. {s}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* First task prompt */}
      {section.first_task_prompt && (
        <div className="relative">
          <h3 className="font-semibold text-sm mb-3">Your First Task</h3>
          <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton text={section.first_task_prompt} className="absolute top-2 right-2" />
            {section.first_task_prompt}
          </div>
        </div>
      )}

      {/* Common support scenarios */}
      {section.common_support_scenarios && (
        <div>
          <h3 className="font-semibold text-base mb-3">Common Support Scenarios</h3>
          {section.common_support_scenarios.map((scenario: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 mb-2">
              {typeof scenario === "string" ? (
                <p className="text-sm text-muted-foreground">{scenario}</p>
              ) : (
                <div>
                  {scenario.scenario && <h4 className="font-semibold text-sm mb-1">{scenario.scenario}</h4>}
                  {scenario.prompt && (
                    <div className="relative mt-2">
                      <div className="bg-background rounded-lg p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                        <CopyButton text={scenario.prompt} className="absolute top-1 right-1" />
                        {scenario.prompt}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* How to use profile */}
      {section.how_to_use_profile && (
        <div>
          <h3 className="font-semibold text-sm mb-3">How to Use Your Profile</h3>
          {Array.isArray(section.how_to_use_profile) ? (
            <div className="space-y-2">
              {section.how_to_use_profile.map((step: any, i: number) => (
                <div key={i} className="flex gap-3 bg-card border border-border rounded-lg p-3">
                  <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0">{step.step || i + 1}</span>
                  <div className="flex-1">
                    {step.platform && <h4 className="font-semibold text-xs text-[hsl(var(--primary))]">{step.platform}</h4>}
                    <p className="text-sm text-muted-foreground">
                      {typeof step === "string" ? step : step.instruction || step.description || JSON.stringify(step)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{section.how_to_use_profile}</p>
          )}
        </div>
      )}

      {/* Dashboard template — render as table if table-like */}
      {section.dashboard_template && (
        <div>
          {section.dashboard_template.columns ? (
            <TableBlock data={section.dashboard_template} title="Dashboard Template" />
          ) : (
            <div className="relative">
              <h3 className="font-semibold text-base mb-3">Dashboard Template</h3>
              <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
                <CopyButton
                  text={renderTemplateContent(section.dashboard_template)}
                  className="absolute top-2 right-2"
                />
                {renderTemplateContent(section.dashboard_template)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cost tracker — render structured */}
      {section.cost_tracker && (
        <SmartObject data={section.cost_tracker} title="Cost Tracker" />
      )}

      {/* Weekly summary prompt — handle { platform, prompt } */}
      {section.weekly_summary_prompt && (
        <PromptBlock title="Weekly Summary Prompt" prompt={section.weekly_summary_prompt} />
      )}

      {/* Monthly optimization checklist — handle object */}
      {section.monthly_optimization_checklist && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Monthly Optimization Checklist</h3>
          {Array.isArray(section.monthly_optimization_checklist) ? (
            <ul className="space-y-1">
              {section.monthly_optimization_checklist.map((item: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-[hsl(var(--primary))]">☐</span> {item}
                </li>
              ))}
            </ul>
          ) : typeof section.monthly_optimization_checklist === "object" ? (
            <SmartObject data={section.monthly_optimization_checklist} />
          ) : (
            <p className="text-sm text-muted-foreground">{section.monthly_optimization_checklist}</p>
          )}
        </div>
      )}

      {/* Monthly review checklist — handle object */}
      {section.monthly_review_checklist && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Monthly Review Checklist</h3>
          {Array.isArray(section.monthly_review_checklist) ? (
            <ul className="space-y-1">
              {section.monthly_review_checklist.map((item: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-[hsl(var(--primary))]">☐</span> {item}
                </li>
              ))}
            </ul>
          ) : typeof section.monthly_review_checklist === "object" ? (
            <SmartObject data={section.monthly_review_checklist} />
          ) : (
            <p className="text-sm text-muted-foreground">{section.monthly_review_checklist}</p>
          )}
        </div>
      )}

      {/* AI ops dashboard */}
      {section.ai_ops_dashboard && (
        <SmartObject data={section.ai_ops_dashboard} title="AI Operations Dashboard" />
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
