import { PromptCard } from "./PromptCard";

export function PromptsSection({ section }: { section: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{section.title}</h1>
        {section.content && (
          <p className="text-muted-foreground text-sm">{section.content}</p>
        )}
        {section.items && (
          <p className="text-muted-foreground text-sm mt-1">
            {section.items.length} prompt{section.items.length !== 1 ? "s" : ""} in this section
          </p>
        )}
      </div>

      {section.items?.map((prompt: any, i: number) => (
        <PromptCard key={i} prompt={prompt} />
      ))}
    </div>
  );
}
