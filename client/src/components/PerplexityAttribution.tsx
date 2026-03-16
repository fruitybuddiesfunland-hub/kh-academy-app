export function PerplexityAttribution() {
  return (
    <footer className="w-full py-4 text-center text-xs text-muted-foreground space-y-2">
      <div className="flex items-center justify-center gap-3">
        <a
          href="https://www.kh-academy.com/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Privacy
        </a>
        <span className="opacity-30">·</span>
        <a
          href="https://www.kh-academy.com/terms.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Terms
        </a>
        <span className="opacity-30">·</span>
        <a
          href="mailto:info@kh-academy.com"
          className="hover:text-foreground transition-colors"
        >
          Contact
        </a>
      </div>
      <div>
        <a
          href="https://www.perplexity.ai/computer"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Created with Perplexity Computer
        </a>
      </div>
    </footer>
  );
}
