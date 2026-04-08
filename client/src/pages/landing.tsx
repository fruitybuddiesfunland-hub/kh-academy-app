import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Sparkles, BookOpen, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" data-testid="logo">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">KH Academy</span>
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button variant="default" data-testid="nav-dashboard">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" data-testid="nav-login">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button data-testid="nav-signup">Sign up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-card mb-8 text-sm text-muted-foreground">
          <Zap className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
          <span>Practical AI skills for professionals</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
          Master AI tools{" "}
          <span className="bg-primary bg-clip-text text-transparent">
            that matter
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          Curated prompt libraries, battle-tested frameworks, and hands-on courses
          to 10x your productivity with AI.
        </p>
      </section>

      {/* Product Card */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl overflow-hidden" data-testid="product-card">
          <div className="h-48 bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-[hsl(var(--primary))]" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-medium">
                STARTER KIT
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">AI Starter Kit</h3>
            <p className="text-sm text-muted-foreground mb-4">
              50 ready-to-use prompts across 7 categories, plus 4 advanced prompting frameworks.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black">$29</span>
              <Link href={user ? "/dashboard" : "/signup"}>
                <Button className="gap-2" data-testid="cta-get-started">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "50 Prompts", desc: "Battle-tested across 7 professional categories" },
              { icon: Zap, title: "4 Frameworks", desc: "MEGA Prompt, Chain-of-Thought, Expert Panel & more" },
              { icon: Sparkles, title: "Copy & Use", desc: "One-click copy, optimized for ChatGPT, Claude & Gemini" },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))]/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
