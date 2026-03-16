import { Badge } from "@/components/ui/badge";

export function IntroSection({ section }: { section: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-3">{section.title}</h1>
        {section.content && (
          <p className="text-muted-foreground leading-relaxed">{section.content}</p>
        )}
      </div>

      {/* Comparison table (small-business intro) */}
      {section.comparison && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-sm text-red-400 mb-3">What most people do</h3>
            <ul className="space-y-2">
              {section.comparison.what_most_people_do?.map((item: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-[hsl(271,91%,65%)]/20 rounded-xl p-5">
            <h3 className="font-semibold text-sm text-emerald-400 mb-3">What this gives you</h3>
            <ul className="space-y-2">
              {section.comparison.what_this_playbook_gives_you?.map((item: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Automation ladder (automation-mastery intro) */}
      {section.automation_ladder && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm mb-2">Your Automation Journey</h3>
          {section.automation_ladder.map((level: any, i: number) => (
            <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
              <Badge className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-0 text-xs shrink-0">
                Level {level.level}
              </Badge>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{level.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{level.description}</span>
              </div>
              {level.status && (
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {level.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Generic items list */}
      {section.items && !section.automation_ladder && (
        <ul className="space-y-2">
          {section.items.map((item: string, i: number) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-[hsl(var(--primary))] mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
