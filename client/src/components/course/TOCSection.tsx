export function TOCSection({ section }: { section: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-3">{section.title}</h1>
        {section.content && (
          <p className="text-muted-foreground leading-relaxed">{section.content}</p>
        )}
      </div>

      {section.items && (
        <div className="space-y-3">
          {section.items.map((item: any, i: number) => {
            // Format 1: { part, title, chapters[] } (Skills Builder)
            if (item.part && item.chapters) {
              return (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border/50 flex items-center gap-3">
                    <span className="text-xs font-mono bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-2 py-0.5 rounded shrink-0">
                      Part {item.part}
                    </span>
                    <span className="text-sm font-semibold">{item.title}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {item.chapters.map((ch: string, ci: number) => (
                      <div key={ci} className="text-sm text-muted-foreground flex items-start gap-2 pl-2">
                        <span className="text-[hsl(var(--primary))] shrink-0 mt-0.5">→</span>
                        {ch}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Format 2: { part, chapter, title, pages } (Small Business, Automation Mastery)
            if (item.chapter) {
              // Group by part — render as simple row
              return (
                <div key={i} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0 w-6">
                      {item.chapter}
                    </span>
                    <span className="text-sm truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.part && (
                      <span className="text-[10px] text-muted-foreground opacity-60 hidden sm:inline">
                        {item.part}
                      </span>
                    )}
                    {item.pages && (
                      <span className="text-xs text-muted-foreground opacity-60">
                        Pages {item.pages}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Format 3: Simple string or generic object
            return (
              <div key={i} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                <span className="text-xs font-mono text-[hsl(var(--primary))] shrink-0 w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm">
                  {typeof item === "string" ? item : item.title || item.name || JSON.stringify(item)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
