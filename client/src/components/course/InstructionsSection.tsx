export function InstructionsSection({ section }: { section: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-3">{section.title}</h1>
        {section.content && (
          <p className="text-muted-foreground leading-relaxed">{section.content}</p>
        )}
      </div>

      {section.items && (
        <div className="space-y-4">
          {section.items.map((item: any, i: number) => (
            <div key={i} className="flex gap-4 bg-card border border-border rounded-xl p-5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-white font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                {typeof item === "string" ? (
                  <p className="text-sm text-muted-foreground">{item}</p>
                ) : (
                  <>
                    {item.title && <h3 className="font-semibold text-sm mb-1">{item.title}</h3>}
                    {item.instruction && (
                      <p className="text-sm text-muted-foreground">{item.instruction}</p>
                    )}
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
