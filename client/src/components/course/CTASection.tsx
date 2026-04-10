import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CTASection({ section }: { section: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-primary/8 border border-primary/15 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">{section.title}</h2>
        </div>

        {section.content && (
          <p className="text-muted-foreground leading-relaxed mb-4">{section.content}</p>
        )}

        {section.items && (
          <div className="space-y-3">
            {section.items.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  {typeof item === "string" ? item : item.name || item.title || item.description || JSON.stringify(item)}
                </span>
              </div>
            ))}
          </div>
        )}

        {section.purchase_url && (
          <a
            href={section.purchase_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors"
          >
            View Products & Pricing
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {section.upcoming_product && (
          <div className="mt-4 bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{section.upcoming_product.name || "Coming Soon"}</h3>
              <Badge className="bg-primary text-white text-[10px] border-0">
                NEXT
              </Badge>
            </div>
            {section.upcoming_product.description && (
              <p className="text-xs text-muted-foreground">{section.upcoming_product.description}</p>
            )}
          </div>
        )}

        {section.contact && (
          <p className="text-xs text-muted-foreground mt-4">
            Contact: {typeof section.contact === "string" ? section.contact : section.contact.email || JSON.stringify(section.contact)}
          </p>
        )}
      </div>
    </div>
  );
}
