import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./CopyButton";

function renderTemplateContent(template: any): string {
  if (typeof template === "string") return template;
  if (typeof template === "object" && template !== null) {
    // Convert structured template objects to readable text
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

export function TemplateSection({ section }: { section: any }) {
  // Handle sections with items array (starter-kit frameworks)
  const hasItems = section.items && Array.isArray(section.items);

  // Handle sections with a single template object (skills-builder templates)
  const hasTemplate = section.template;

  // Handle master_template (small-business)
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
        <div className="relative">
          <h3 className="font-semibold text-base mb-3">Master Template</h3>
          <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton
              text={renderTemplateContent(section.master_template)}
              className="absolute top-2 right-2"
            />
            {renderTemplateContent(section.master_template)}
          </div>
        </div>
      )}

      {/* Bonus template */}
      {section.bonus_template && (
        <div className="relative">
          <h3 className="font-semibold text-base mb-3">Bonus Template</h3>
          <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton
              text={renderTemplateContent(section.bonus_template)}
              className="absolute top-2 right-2"
            />
            {renderTemplateContent(section.bonus_template)}
          </div>
        </div>
      )}

      {/* Bonus templates array */}
      {section.bonus_templates && Array.isArray(section.bonus_templates) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base">Bonus Templates</h3>
          {section.bonus_templates.map((bt: any, i: number) => {
            const text = typeof bt === "string" ? bt : renderTemplateContent(bt.template || bt);
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
                  {path.platform && <h4 className="font-semibold text-xs mb-1">{path.platform}</h4>}
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
                  <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0">{i + 1}</span>
                  <p className="text-sm text-muted-foreground">
                    {typeof step === "string" ? step : step.instruction || step.description || JSON.stringify(step)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{section.how_to_use_profile}</p>
          )}
        </div>
      )}

      {/* Dashboard template */}
      {section.dashboard_template && (
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

      {/* Cost tracker */}
      {section.cost_tracker && (
        <div className="relative">
          <h3 className="font-semibold text-base mb-3">Cost Tracker</h3>
          <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton
              text={renderTemplateContent(section.cost_tracker)}
              className="absolute top-2 right-2"
            />
            {renderTemplateContent(section.cost_tracker)}
          </div>
        </div>
      )}

      {/* Weekly summary prompt */}
      {section.weekly_summary_prompt && (
        <div className="relative">
          <h3 className="font-semibold text-sm mb-3">Weekly Summary Prompt</h3>
          <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton text={section.weekly_summary_prompt} className="absolute top-2 right-2" />
            {section.weekly_summary_prompt}
          </div>
        </div>
      )}

      {/* Monthly optimization checklist */}
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
          ) : (
            <p className="text-sm text-muted-foreground">{section.monthly_optimization_checklist}</p>
          )}
        </div>
      )}

      {/* Monthly review checklist */}
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
          ) : (
            <p className="text-sm text-muted-foreground">{section.monthly_review_checklist}</p>
          )}
        </div>
      )}

      {/* AI ops dashboard */}
      {section.ai_ops_dashboard && (
        <div className="relative">
          <h3 className="font-semibold text-base mb-3">AI Operations Dashboard</h3>
          <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton
              text={renderTemplateContent(section.ai_ops_dashboard)}
              className="absolute top-2 right-2"
            />
            {renderTemplateContent(section.ai_ops_dashboard)}
          </div>
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
