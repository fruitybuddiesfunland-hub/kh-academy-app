import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./CopyButton";

function ComparisonTable({ table }: { table: any }) {
  if (!table?.columns || !table?.rows) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-card">
            {table.columns.map((col: string, i: number) => (
              <th key={i} className="text-left p-3 font-semibold border-b border-border">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row: string[], ri: number) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-background" : "bg-card/50"}>
              {row.map((cell: string, ci: number) => (
                <td key={ci} className="p-3 text-muted-foreground border-b border-border/50">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyValueBlock({ title, data }: { title: string; data: any }) {
  if (!data) return null;
  if (typeof data === "string") {
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">{title}</h4>
        <div className="bg-background rounded-lg p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap">
          {data}
        </div>
      </div>
    );
  }
  if (Array.isArray(data)) {
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">{title}</h4>
        <ul className="space-y-1">
          {data.map((item: any, i: number) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-[hsl(var(--primary))] mt-0.5">•</span>
              {typeof item === "string" ? item : item.name || item.title || item.label || JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
}

export function EducationalSection({ section }: { section: any }) {
  // Known field keys to skip when rendering "extra" data
  const skipKeys = new Set(["title", "type", "content"]);

  // Gather all extra data fields for dynamic rendering
  const extraFields = Object.entries(section).filter(
    ([key]) => !skipKeys.has(key)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-3">{section.title}</h1>
        {section.content && (
          <p className="text-muted-foreground leading-relaxed">{section.content}</p>
        )}
      </div>

      {/* Callout */}
      {section.callout && (
        <div className="bg-gradient-to-r from-[hsl(271,91%,65%)]/10 to-[hsl(330,81%,60%)]/10 border border-[hsl(271,91%,65%)]/20 rounded-xl p-5">
          <p className="text-sm italic leading-relaxed">"{section.callout}"</p>
        </div>
      )}

      {/* Comparison table */}
      {section.comparison_table && <ComparisonTable table={section.comparison_table} />}

      {/* Items / features list */}
      {section.items && section.items.length > 0 && (
        <div className="space-y-2">
          {section.items.map((item: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              {typeof item === "string" ? (
                <p className="text-sm text-muted-foreground">{item}</p>
              ) : (
                <div>
                  {/* Handle overview items: { category, count, pages } */}
                  {item.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.category}</span>
                      <div className="flex items-center gap-3">
                        {item.count && <span className="text-xs text-muted-foreground">{item.count} prompts</span>}
                        {item.pages && <span className="text-xs text-muted-foreground opacity-60">Pages {item.pages}</span>}
                      </div>
                    </div>
                  )}
                  {/* Handle TOC items: { part, chapter, title, pages } */}
                  {item.chapter && !item.category && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0">{item.chapter}</span>
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      {item.pages && <span className="text-xs text-muted-foreground opacity-60">Pages {item.pages}</span>}
                    </div>
                  )}
                  {/* Handle TOC with parts array: { part, title, chapters[] } */}
                  {item.part && item.chapters && (
                    <div>
                      <h4 className="font-semibold text-sm text-[hsl(var(--primary))] mb-2">Part {item.part}: {item.title}</h4>
                      <ul className="space-y-1 pl-4">
                        {item.chapters.map((ch: string, ci: number) => (
                          <li key={ci} className="text-xs text-muted-foreground">• {ch}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Handle platform items: { platform, builder, features[] } */}
                  {item.platform && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{item.platform}</h4>
                        {item.builder && <span className="text-xs text-muted-foreground">by {item.builder}</span>}
                      </div>
                      {item.features && (
                        <ul className="space-y-1">
                          {item.features.map((f: string, fi: number) => (
                            <li key={fi} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-emerald-400">✓</span> {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {/* Handle step items: { step, instruction, title } */}
                  {item.step && !item.category && !item.platform && (
                    <div className="flex gap-3">
                      <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0 mt-0.5">{item.step}</span>
                      <div>
                        {item.title && <h4 className="font-semibold text-sm">{item.title}</h4>}
                        {item.instruction && <p className="text-sm text-muted-foreground">{item.instruction}</p>}
                      </div>
                    </div>
                  )}
                  {/* Generic fallback: name/title + description + features */}
                  {!item.category && !item.chapter && !item.part && !item.platform && !item.step && (
                    <div>
                      {item.name && <h4 className="font-semibold text-sm mb-1">{item.name}</h4>}
                      {item.title && !item.name && <h4 className="font-semibold text-sm mb-1">{item.title}</h4>}
                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      {item.features && (
                        <ul className="mt-2 space-y-1">
                          {item.features.map((f: string, fi: number) => (
                            <li key={fi} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-emerald-400">✓</span> {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Levels */}
      {section.levels && (
        <div className="space-y-3">
          {section.levels.map((level: any, i: number) => (
            <div key={i} className="flex gap-4 bg-card border border-border rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] flex items-center justify-center shrink-0 text-white font-bold text-xs">
                {level.level || i + 1}
              </div>
              <div className="flex-1">
                {level.name && <h4 className="font-semibold text-sm">{level.name}</h4>}
                {level.description && <p className="text-sm text-muted-foreground">{level.description}</p>}
                {level.example && (
                  <div className="mt-2 bg-background rounded-lg p-3 text-xs font-mono text-muted-foreground">
                    {level.example}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How to build steps */}
      {section.how_to_build && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">How to Build</h3>
          {(Array.isArray(section.how_to_build) ? section.how_to_build : [section.how_to_build]).map((step: any, i: number) => (
            <div key={i} className="flex gap-3 bg-card border border-border rounded-lg p-4">
              <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0 mt-0.5">
                {step.step || i + 1}
              </span>
              <div className="flex-1">
                {step.title && <h4 className="font-semibold text-sm">{step.title}</h4>}
                {step.instruction && <p className="text-sm text-muted-foreground">{step.instruction}</p>}
                {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
                {typeof step === "string" && <p className="text-sm text-muted-foreground">{step}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill MD Anatomy / code examples */}
      {section.skill_md_anatomy && (
        <div>
          <h3 className="font-semibold text-base mb-3">Skill MD Anatomy</h3>
          <div className="relative bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton text={typeof section.skill_md_anatomy === "string" ? section.skill_md_anatomy : JSON.stringify(section.skill_md_anatomy, null, 2)} className="absolute top-2 right-2" />
            {typeof section.skill_md_anatomy === "string"
              ? section.skill_md_anatomy
              : JSON.stringify(section.skill_md_anatomy, null, 2)}
          </div>
        </div>
      )}

      {/* Easy alternative */}
      {section.easy_alternative && (
        <div className="bg-card border border-emerald-500/20 rounded-xl p-5">
          <h3 className="font-semibold text-sm text-emerald-400 mb-3">Easy Alternative</h3>
          {typeof section.easy_alternative === "string" ? (
            <p className="text-sm text-muted-foreground">{section.easy_alternative}</p>
          ) : Array.isArray(section.easy_alternative) ? (
            <div className="space-y-2">
              {section.easy_alternative.map((step: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xs font-mono text-emerald-400 shrink-0">{i + 1}</span>
                  <p className="text-sm text-muted-foreground">
                    {typeof step === "string" ? step : step.instruction || step.description || step.title || JSON.stringify(step)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{JSON.stringify(section.easy_alternative)}</p>
          )}
        </div>
      )}

      {/* Projects vs Skills */}
      {section.projects_vs_skills && <ComparisonTable table={section.projects_vs_skills} />}

      {/* Gem features */}
      {section.gem_features && (
        <KeyValueBlock title="Gem Features" data={section.gem_features} />
      )}

      {/* Real examples */}
      {section.real_examples && (
        <KeyValueBlock title="Real Examples" data={section.real_examples} />
      )}

      {/* 5-part formula */}
      {section["5_part_formula"] && (
        <KeyValueBlock title="5-Part Formula" data={section["5_part_formula"]} />
      )}

      {/* Gem power moves */}
      {section.gem_power_moves && (
        <KeyValueBlock title="Gem Power Moves" data={section.gem_power_moves} />
      )}

      {/* Platforms (automation-mastery) */}
      {section.platforms && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base">Platforms</h3>
          {section.platforms.map((platform: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-sm mb-2">{platform.name}</h4>
              {platform.description && <p className="text-sm text-muted-foreground mb-2">{platform.description}</p>}
              {platform.best_for && (
                <p className="text-xs text-muted-foreground"><strong>Best for:</strong> {platform.best_for}</p>
              )}
              {platform.pricing && (
                <p className="text-xs text-muted-foreground"><strong>Pricing:</strong> {platform.pricing}</p>
              )}
              {platform.features && (
                <ul className="mt-2 space-y-1">
                  {platform.features.map((f: string, fi: number) => (
                    <li key={fi} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Automation anatomy */}
      {section.automation_anatomy && (
        <div>
          <h3 className="font-semibold text-base mb-3">Automation Anatomy</h3>
          {typeof section.automation_anatomy === "string" ? (
            <p className="text-sm text-muted-foreground">{section.automation_anatomy}</p>
          ) : (
            <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
              {JSON.stringify(section.automation_anatomy, null, 2)}
            </div>
          )}
        </div>
      )}

      {/* Decision guide */}
      {section.decision_guide && (
        <KeyValueBlock title="Decision Guide" data={section.decision_guide} />
      )}

      {/* Setup sections (zapier, n8n) */}
      {section.zapier_setup && (
        <div>
          <h3 className="font-semibold text-base mb-3">Zapier Setup</h3>
          {renderSetupBlock(section.zapier_setup)}
        </div>
      )}
      {section.n8n_setup && (
        <div>
          <h3 className="font-semibold text-base mb-3">n8n Setup</h3>
          {renderSetupBlock(section.n8n_setup)}
        </div>
      )}

      {/* Pre-flight checklist */}
      {section.pre_flight_checklist && (
        <KeyValueBlock title="Pre-Flight Checklist" data={section.pre_flight_checklist} />
      )}

      {/* Credentials tracker */}
      {section.credentials_tracker && (
        <div>
          <h3 className="font-semibold text-base mb-3">Credentials Tracker</h3>
          <div className="relative bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton text={typeof section.credentials_tracker === "string" ? section.credentials_tracker : JSON.stringify(section.credentials_tracker, null, 2)} className="absolute top-2 right-2" />
            {typeof section.credentials_tracker === "string"
              ? section.credentials_tracker
              : JSON.stringify(section.credentials_tracker, null, 2)}
          </div>
        </div>
      )}

      {/* Common issues */}
      {section.common_issues && (
        <KeyValueBlock title="Common Issues" data={section.common_issues} />
      )}

      {/* Optimization strategies */}
      {section.optimization_strategies && (
        <KeyValueBlock title="Optimization Strategies" data={section.optimization_strategies} />
      )}

      {/* Emergency checklist */}
      {section.emergency_checklist && (
        <KeyValueBlock title="Emergency Checklist" data={section.emergency_checklist} />
      )}

      {/* Complete journey */}
      {section.complete_journey && (
        <KeyValueBlock title="Complete Journey" data={section.complete_journey} />
      )}

      {/* Industries (small-business) */}
      {section.industries && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base">Industry Quick-Start Guides</h3>
          {section.industries.map((ind: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-sm mb-2">{ind.name || ind.industry}</h4>
              {ind.description && <p className="text-sm text-muted-foreground mb-2">{ind.description}</p>}
              {ind.key_systems && (
                <ul className="space-y-1">
                  {ind.key_systems.map((s: string, si: number) => (
                    <li key={si} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-400">✓</span> {s}
                    </li>
                  ))}
                </ul>
              )}
              {ind.quick_wins && (
                <ul className="mt-2 space-y-1">
                  {ind.quick_wins.map((w: string, wi: number) => (
                    <li key={wi} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-[hsl(var(--primary))]">→</span> {w}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Automation ladder (in educational context) */}
      {section.automation_ladder && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Automation Ladder</h3>
          {section.automation_ladder.map((level: any, i: number) => (
            <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
              <Badge className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-0 text-xs shrink-0">
                {level.level || i + 1}
              </Badge>
              <span className="text-sm">{level.name}</span>
              {level.description && (
                <span className="text-xs text-muted-foreground">{level.description}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Note */}
      {section.note && (
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground italic">{section.note}</p>
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

function renderSetupBlock(setup: any) {
  if (typeof setup === "string") {
    return (
      <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
        {setup}
      </div>
    );
  }
  if (Array.isArray(setup)) {
    return (
      <div className="space-y-2">
        {setup.map((step: any, i: number) => (
          <div key={i} className="flex gap-3 bg-card border border-border rounded-lg p-3">
            <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0">{step.step || i + 1}</span>
            <p className="text-sm text-muted-foreground">
              {typeof step === "string" ? step : step.action || step.instruction || step.description || JSON.stringify(step)}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
      {JSON.stringify(setup, null, 2)}
    </div>
  );
}
