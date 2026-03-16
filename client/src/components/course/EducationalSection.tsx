import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./CopyButton";

/* ──────────────────── Helpers ──────────────────── */

function ComparisonTable({ table }: { table: any }) {
  if (!table?.columns || !table?.rows) return null;
  return (
    <div>
      {table.title && <h3 className="font-semibold text-sm mb-2">{table.title}</h3>}
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
        <SmartArray data={data} />
      </div>
    );
  }
  if (typeof data === "object") {
    return (
      <div className="mb-4">
        <SmartObject data={data} title={title} />
      </div>
    );
  }
  return null;
}

/** Renders arrays intelligently */
function SmartArray({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  const first = data[0];

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

/** Renders objects as structured content */
function SmartObject({ data, title }: { data: any; title?: string }) {
  if (!data) return null;

  // Table-like: { columns, rows/example_rows }
  if (data.columns && (data.rows || data.example_rows)) {
    return <ComparisonTable table={{ ...data, title }} />;
  }

  return (
    <div>
      {title && <h4 className="font-semibold text-sm mb-2">{title}</h4>}
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]: [string, any]) => {
          if (key === "title") return null; // skip if already shown
          const label = key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

          if (typeof value === "string" || typeof value === "number") {
            return (
              <div key={key} className="flex gap-3 bg-card/50 rounded-lg p-3">
                <span className="text-xs font-semibold text-[hsl(var(--primary))] shrink-0 min-w-[100px]">{label}</span>
                <span className="text-sm text-muted-foreground">{String(value)}</span>
              </div>
            );
          }

          if (Array.isArray(value)) {
            return (
              <div key={key} className="bg-card/50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-[hsl(var(--primary))] mb-2">{label}</h4>
                <SmartArray data={value} />
              </div>
            );
          }

          if (typeof value === "object" && value !== null) {
            return (
              <div key={key} className="bg-card/50 rounded-lg p-3">
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

/** Renders a single rich item */
function RichItem({ item, index }: { item: any; index: number }) {
  const titleField = item.name || item.title || item.label || item.scenario ||
                     item.platform || item.move || item.category || item.problem || null;
  const descField = item.description || item.detail || item.instruction ||
                    item.fix || item.goal || null;
  const step = item.step || item.number || item.rank || item.part || null;

  const skipKeys = new Set(["name", "title", "label", "scenario", "platform", "move", "category", "problem",
                            "description", "detail", "instruction", "fix", "goal",
                            "step", "number", "rank", "part"]);
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

          {extra.map(([key, value]: [string, any]) => {
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

            if (typeof value === "string") {
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
              return (
                <div key={key} className="mt-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                  <div className="mt-1">
                    <SmartArray data={value} />
                  </div>
                </div>
              );
            }

            if (typeof value === "object" && value !== null) {
              // Prompt-like object
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

/* ──────────────────── Main Component ──────────────────── */

export function EducationalSection({ section }: { section: any }) {
  // Known field keys to skip when rendering "extra" data
  const skipKeys = new Set(["title", "type", "content"]);

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
                {(step.title || step.action) && <h4 className="font-semibold text-sm">{step.title || step.action}</h4>}
                {(step.instruction || step.detail || step.description) && (
                  <p className="text-sm text-muted-foreground">{step.instruction || step.detail || step.description}</p>
                )}
                {typeof step === "string" && <p className="text-sm text-muted-foreground">{step}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill MD Anatomy — structured render instead of raw JSON */}
      {section.skill_md_anatomy && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Skill MD Anatomy</h3>
          {typeof section.skill_md_anatomy === "string" ? (
            <div className="relative bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
              <CopyButton text={section.skill_md_anatomy} className="absolute top-2 right-2" />
              {section.skill_md_anatomy}
            </div>
          ) : (
            <div className="space-y-3">
              {section.skill_md_anatomy.description && (
                <p className="text-sm text-muted-foreground">{section.skill_md_anatomy.description}</p>
              )}
              {Object.entries(section.skill_md_anatomy).filter(([k]) => k !== "description").map(([key, value]: [string, any]) => {
                const label = key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
                const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
                return (
                  <div key={key} className="relative">
                    <h4 className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">{label}</h4>
                    <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
                      <CopyButton text={text} className="absolute top-6 right-2" />
                      {text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Easy alternative */}
      {section.easy_alternative && (
        <div className="bg-card border border-emerald-500/20 rounded-xl p-5">
          <h3 className="font-semibold text-sm text-emerald-400 mb-2">
            {section.easy_alternative.title || "Easy Alternative"}
          </h3>
          {section.easy_alternative.description && (
            <p className="text-sm text-muted-foreground mb-3">{section.easy_alternative.description}</p>
          )}
          {typeof section.easy_alternative === "string" ? (
            <p className="text-sm text-muted-foreground">{section.easy_alternative}</p>
          ) : Array.isArray(section.easy_alternative) ? (
            <div className="space-y-2">
              {section.easy_alternative.map((step: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xs font-mono text-emerald-400 shrink-0">{i + 1}</span>
                  <p className="text-sm text-muted-foreground">
                    {typeof step === "string" ? step : step.instruction || step.action || step.description || step.title || JSON.stringify(step)}
                  </p>
                </div>
              ))}
            </div>
          ) : section.easy_alternative.steps ? (
            <div className="space-y-2">
              {section.easy_alternative.steps.map((step: any, i: number) => (
                <div key={i} className="flex gap-3 bg-background/50 rounded-lg p-3">
                  <span className="text-xs font-mono text-emerald-400 shrink-0 mt-0.5">{step.step || i + 1}</span>
                  <div>
                    {(step.action || step.title) && <h4 className="font-semibold text-sm">{step.action || step.title}</h4>}
                    {(step.detail || step.instruction || step.description) && (
                      <p className="text-sm text-muted-foreground">{step.detail || step.instruction || step.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SmartObject data={section.easy_alternative} />
          )}
          {section.easy_alternative.recommendation && (
            <div className="mt-3 flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/5 rounded-lg p-3">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{section.easy_alternative.recommendation}</span>
            </div>
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

      {/* 5-part formula — render structured */}
      {section["5_part_formula"] && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">{section["5_part_formula"].title || "5-Part Formula"}</h3>
          {section["5_part_formula"].parts ? (
            <div className="space-y-2">
              {section["5_part_formula"].parts.map((part: any, i: number) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[hsl(var(--primary))]">{part.part || i + 1}</span>
                    <h4 className="font-semibold text-sm">{part.label}</h4>
                  </div>
                  {part.template && (
                    <div className="relative mt-2">
                      <div className="bg-background rounded-lg p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap border border-border/50">
                        <CopyButton text={part.template} className="absolute top-1 right-1" />
                        {part.template}
                      </div>
                    </div>
                  )}
                  {part.description && <p className="text-sm text-muted-foreground mt-1">{part.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <KeyValueBlock title="" data={section["5_part_formula"]} />
          )}
        </div>
      )}

      {/* Gem power moves — render with full descriptions */}
      {section.gem_power_moves && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Gem Power Moves</h3>
          {section.gem_power_moves.map((move: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                {move.move && <Badge className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-0 text-xs">{move.move}</Badge>}
                <h4 className="font-semibold text-sm">{move.title || move.name}</h4>
              </div>
              {move.description && <p className="text-sm text-muted-foreground">{move.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Platforms (automation-mastery) */}
      {section.platforms && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base">Platforms</h3>
          {section.platforms.map((platform: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-sm mb-1">{platform.name}</h4>
              {platform.tagline && <p className="text-xs text-muted-foreground italic mb-2">{platform.tagline}</p>}
              {(platform.description || platform.what_it_is) && (
                <p className="text-sm text-muted-foreground mb-2">{platform.description || platform.what_it_is}</p>
              )}
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
              {platform.ai_integrations && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">AI Integrations:</p>
                  {Array.isArray(platform.ai_integrations) ? (
                    <ul className="space-y-0.5">
                      {platform.ai_integrations.map((f: string, fi: number) => (
                        <li key={fi} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-[hsl(var(--primary))]">→</span> {f}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">{platform.ai_integrations}</p>
                  )}
                </div>
              )}
              {platform.key_terms && Array.isArray(platform.key_terms) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {platform.key_terms.map((term: any, ti: number) => (
                    <Badge key={ti} variant="secondary" className="text-[10px]">
                      {typeof term === "string" ? term : `${term.term}: ${term.definition}`}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Automation anatomy — structured render */}
      {section.automation_anatomy && (
        <div>
          <h3 className="font-semibold text-base mb-3">Automation Anatomy</h3>
          {typeof section.automation_anatomy === "string" ? (
            <p className="text-sm text-muted-foreground">{section.automation_anatomy}</p>
          ) : (
            <div className="space-y-3">
              {section.automation_anatomy.description && (
                <p className="text-sm text-muted-foreground">{section.automation_anatomy.description}</p>
              )}
              {section.automation_anatomy.parts && (
                <div className="space-y-2">
                  {section.automation_anatomy.parts.map((part: any, i: number) => (
                    <div key={i} className="flex gap-3 bg-card border border-border rounded-lg p-4">
                      <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0 mt-0.5">{part.number || i + 1}</span>
                      <div>
                        <h4 className="font-semibold text-sm">{part.label || part.name}</h4>
                        {part.description && <p className="text-sm text-muted-foreground">{part.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Decision guide — structured render */}
      {section.decision_guide && (
        <div>
          <h3 className="font-semibold text-base mb-3">Decision Guide</h3>
          {typeof section.decision_guide === "object" && !Array.isArray(section.decision_guide) ? (
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(section.decision_guide).map(([key, value]: [string, any]) => {
                const label = key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
                return (
                  <div key={key} className="bg-card border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-xs text-[hsl(var(--primary))] mb-2">{label}</h4>
                    {Array.isArray(value) ? (
                      <ul className="space-y-1">
                        {value.map((item: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-emerald-400">✓</span> {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">{String(value)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <KeyValueBlock title="" data={section.decision_guide} />
          )}
        </div>
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

      {/* Optional but recommended */}
      {section.optional_but_recommended && (
        <KeyValueBlock title="Optional but Recommended" data={section.optional_but_recommended} />
      )}

      {/* Credentials tracker */}
      {section.credentials_tracker && (
        <SmartObject data={section.credentials_tracker} title="Credentials Tracker" />
      )}

      {/* Common issues — structured render with problem/fix */}
      {section.common_issues && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Common Issues</h3>
          {Array.isArray(section.common_issues) ? (
            section.common_issues.map((issue: any, i: number) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                {typeof issue === "string" ? (
                  <p className="text-sm text-muted-foreground">{issue}</p>
                ) : (
                  <div>
                    <h4 className="font-semibold text-sm text-red-400 mb-1">{issue.problem || issue.name || issue.title}</h4>
                    {(issue.fix || issue.solution || issue.description) && (
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-emerald-400">Fix:</strong> {issue.fix || issue.solution || issue.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <KeyValueBlock title="" data={section.common_issues} />
          )}
        </div>
      )}

      {/* Optimization strategies — full render with descriptions */}
      {section.optimization_strategies && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Optimization Strategies</h3>
          {Array.isArray(section.optimization_strategies) ? (
            section.optimization_strategies.map((strat: any, i: number) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  {strat.number && <span className="text-xs font-mono text-[hsl(var(--primary))]">#{strat.number}</span>}
                  <h4 className="font-semibold text-sm">{strat.name || strat.title}</h4>
                </div>
                {strat.description && <p className="text-sm text-muted-foreground">{strat.description}</p>}
              </div>
            ))
          ) : (
            <KeyValueBlock title="" data={section.optimization_strategies} />
          )}
        </div>
      )}

      {/* Emergency checklist — structured render */}
      {section.emergency_checklist && (
        <div>
          <h3 className="font-semibold text-base mb-3">Emergency Checklist</h3>
          <SmartObject data={section.emergency_checklist} />
        </div>
      )}

      {/* Complete journey */}
      {section.complete_journey && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Complete Journey</h3>
          {Array.isArray(section.complete_journey) ? (
            section.complete_journey.map((item: any, i: number) => (
              <div key={i} className="flex gap-3 bg-card border border-border rounded-lg p-4">
                {item.step && <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0 mt-0.5">{item.step}</span>}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{item.product || item.name}</h4>
                    {item.price && <Badge variant="secondary" className="text-[10px]">{item.price}</Badge>}
                    {item.status && (
                      <Badge className={`text-[10px] border-0 ${
                        item.status === "You are here" ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]" :
                        item.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" :
                        "bg-muted text-muted-foreground"
                      }`}>{item.status}</Badge>
                    )}
                  </div>
                  {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                </div>
              </div>
            ))
          ) : (
            <KeyValueBlock title="" data={section.complete_journey} />
          )}
        </div>
      )}

      {/* Industries (small-business) */}
      {section.industries && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base">Industry Quick-Start Guides</h3>
          {section.industries.map((ind: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-sm mb-2">{ind.name || ind.industry}</h4>
              {ind.description && <p className="text-sm text-muted-foreground mb-2">{ind.description}</p>}
              {ind.priority_systems && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Priority Systems:</p>
                  <ul className="space-y-0.5">
                    {ind.priority_systems.map((s: string, si: number) => (
                      <li key={si} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-emerald-400">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ind.key_systems && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Key Systems:</p>
                  <ul className="space-y-0.5">
                    {ind.key_systems.map((s: string, si: number) => (
                      <li key={si} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-emerald-400">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ind.industry_specific_additions && Array.isArray(ind.industry_specific_additions) && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Industry-Specific Additions:</p>
                  <ul className="space-y-0.5">
                    {ind.industry_specific_additions.map((a: string, ai: number) => (
                      <li key={ai} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-[hsl(var(--primary))]">→</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ind.recommended_skill && (
                <p className="text-xs text-muted-foreground mt-1"><strong>Recommended Skill:</strong> {ind.recommended_skill}</p>
              )}
              {ind.quick_start_prompt && (
                <div className="relative mt-2">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Quick Start Prompt:</p>
                  <div className="bg-background rounded-lg p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap border border-border/50">
                    <CopyButton text={ind.quick_start_prompt} className="absolute top-6 right-1" />
                    {ind.quick_start_prompt}
                  </div>
                </div>
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

      {/* Automation ladder */}
      {section.automation_ladder && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Automation Ladder</h3>
          {section.automation_ladder.map((level: any, i: number) => (
            <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
              <Badge className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-0 text-xs shrink-0">
                {level.level || i + 1}
              </Badge>
              <div className="flex-1">
                <span className="text-sm font-medium">{level.name}</span>
                {level.description && (
                  <span className="text-xs text-muted-foreground ml-2">{level.description}</span>
                )}
              </div>
              {level.product && <span className="text-xs text-muted-foreground">{level.product}</span>}
              {level.status && (
                <Badge variant="secondary" className="text-[10px] shrink-0">{level.status}</Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Voice extraction/testing prompts (advanced skills) */}
      {section.voice_extraction_prompt && (
        <div className="relative">
          <h3 className="font-semibold text-sm mb-3">Voice Extraction Prompt</h3>
          <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton text={section.voice_extraction_prompt} className="absolute top-8 right-2" />
            {section.voice_extraction_prompt}
          </div>
        </div>
      )}
      {section.voice_testing_prompt && (
        <div className="relative">
          <h3 className="font-semibold text-sm mb-3">Voice Testing Prompt</h3>
          <div className="bg-background rounded-xl p-4 text-sm font-mono text-muted-foreground whitespace-pre-wrap border border-border">
            <CopyButton text={section.voice_testing_prompt} className="absolute top-8 right-2" />
            {section.voice_testing_prompt}
          </div>
        </div>
      )}

      {/* Why chains work */}
      {section.why_chains_work && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-2">Why Chains Work</h3>
          <p className="text-sm text-muted-foreground">{section.why_chains_work}</p>
        </div>
      )}

      {/* Templates array (advanced — prompt chains with steps) */}
      {section.templates && Array.isArray(section.templates) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base">Templates</h3>
          {section.templates.map((tmpl: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-sm mb-3">{tmpl.name || tmpl.title}</h4>
              {tmpl.steps && Array.isArray(tmpl.steps) && (
                <div className="space-y-2">
                  {tmpl.steps.map((step: any, si: number) => (
                    <div key={si} className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[hsl(var(--primary))]">{step.step || si + 1}</span>
                        {step.label && <span className="text-xs font-semibold">{step.label}</span>}
                      </div>
                      {step.prompt && (
                        <div className="bg-background rounded-lg p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap border border-border/50">
                          <CopyButton text={step.prompt} className="absolute top-6 right-1" />
                          {step.prompt}
                        </div>
                      )}
                      {step.instruction && <p className="text-sm text-muted-foreground">{step.instruction}</p>}
                    </div>
                  ))}
                </div>
              )}
              {tmpl.prompt && typeof tmpl.prompt === "string" && (
                <div className="relative">
                  <div className="bg-background rounded-lg p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap border border-border/50">
                    <CopyButton text={tmpl.prompt} className="absolute top-1 right-1" />
                    {tmpl.prompt}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quality loop (advanced — self-improving) */}
      {section.quality_loop && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Quality Loop</h3>
          {typeof section.quality_loop === "object" && !Array.isArray(section.quality_loop) ? (
            <div className="space-y-2">
              {Object.entries(section.quality_loop).map(([key, value]: [string, any], i: number) => (
                <div key={key} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-[hsl(var(--primary))]">{i + 1}</span>
                    <h4 className="font-semibold text-sm">{value.label || key.replace(/_/g, " ")}</h4>
                  </div>
                  {value.instruction && <p className="text-sm text-muted-foreground">{value.instruction}</p>}
                  {value.prompt && (
                    <div className="relative mt-2">
                      <div className="bg-background rounded-lg p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap border border-border/50">
                        <CopyButton text={value.prompt} className="absolute top-1 right-1" />
                        {value.prompt}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <KeyValueBlock title="" data={section.quality_loop} />
          )}
        </div>
      )}

      {/* More templates (advanced) */}
      {section.more_templates && Array.isArray(section.more_templates) && (
        <div className="space-y-3">
          <h3 className="font-semibold text-base">More Templates</h3>
          {section.more_templates.map((tmpl: any, i: number) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 relative">
              <h4 className="font-semibold text-sm mb-2">{tmpl.name || tmpl.title}</h4>
              {tmpl.prompt && (
                <div className="bg-background rounded-lg p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap border border-border/50">
                  <CopyButton text={tmpl.prompt} className="absolute top-12 right-3" />
                  {tmpl.prompt}
                </div>
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
            <div className="flex-1">
              {(step.node || step.action || step.title) && (
                <h4 className="font-semibold text-xs">{step.node || step.action || step.title}</h4>
              )}
              <p className="text-sm text-muted-foreground">
                {typeof step === "string" ? step : step.detail || step.instruction || step.description || ""}
              </p>
            </div>
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
