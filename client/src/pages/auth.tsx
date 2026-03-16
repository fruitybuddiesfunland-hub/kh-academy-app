import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { PRODUCTS, PRODUCT_ORDER } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { KHLogo } from "@/components/kh-logo";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const [, navigate] = useLocation();

  if (user) {
    if (user.mustChangePassword) {
      navigate("/change-password");
    } else {
      navigate("/dashboard");
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      const jsonMatch = msg.match(/\d+:\s*(.+)/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          setError(parsed.message || msg);
        } catch {
          setError(msg);
        }
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show 4 purchasable products (not the bundle) for upsell
  const upsellProducts = PRODUCT_ORDER.filter((id) => id !== "ultimate-bundle").map(
    (id) => PRODUCTS[id]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left: Login form */}
        <div className="lg:w-[440px] lg:min-w-[440px] flex flex-col justify-center px-6 py-12 lg:px-12 lg:border-r border-border/50">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-8">
              <div className="mb-6">
                <KHLogo size="md" />
              </div>
              <h1 className="text-2xl font-bold" data-testid="auth-title">
                Access your courses
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in with the credentials from your purchase email
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  data-testid="input-password"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" data-testid="auth-error">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-testid="auth-submit"
              >
                {loading ? "Please wait..." : "Sign in"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              <Link
                href="/forgot-password"
                className="text-[hsl(var(--primary))] hover:underline"
              >
                Forgot your password?
              </Link>
            </p>

            <div className="mt-8 p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Demo credentials</p>
              <p className="text-xs font-mono text-muted-foreground">
                demo@khacademy.com / Welcome123
              </p>
            </div>
          </div>
        </div>

        {/* Right: Product showcase */}
        <div className="flex-1 bg-card/30 overflow-y-auto">
          <div className="px-6 lg:px-10 py-12 max-w-3xl">
            {/* Hero pitch */}
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))] mb-2">
                KH Academy Toolkits
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold mb-3">
                Master AI with{" "}
                <span className="bg-gradient-to-r from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] bg-clip-text text-transparent">
                  battle-tested tools
                </span>
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Premium prompt toolkits, automation templates, and hands-on courses to 10x your
                productivity with Claude, Gemini, and more.
              </p>
            </div>

            {/* Product cards */}
            <div className="space-y-4">
              {upsellProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 bg-card border border-border/50 rounded-xl p-4 hover:border-border transition-colors"
                  data-testid={`promo-card-${product.id}`}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-28 h-20 lg:w-36 lg:h-24 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{product.title}</h3>
                      {product.badge && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 shrink-0 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-0"
                        >
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold bg-gradient-to-r from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] bg-clip-text text-transparent">
                        {product.price}
                      </span>
                      <div className="flex gap-2">
                        {product.highlights.slice(0, 2).map((h) => (
                          <span
                            key={h}
                            className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bundle CTA */}
            <div className="mt-6 bg-gradient-to-r from-[hsl(271,91%,65%)]/10 to-[hsl(330,81%,60%)]/10 border border-[hsl(271,91%,65%)]/20 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <img
                  src={PRODUCTS["ultimate-bundle"].image}
                  alt="Ultimate AI Bundle"
                  className="w-24 h-16 rounded-lg object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">Ultimate AI Bundle</h3>
                    <Badge className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] text-white border-0">
                      SAVE 40%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Get all 4 products for just $97 — save over $60 and unlock the complete
                    AI mastery path.
                  </p>
                  <span className="text-lg font-bold bg-gradient-to-r from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] bg-clip-text text-transparent">
                    $97
                  </span>
                  <span className="text-xs text-muted-foreground line-through ml-2">$162</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6 text-center">
              Visit{" "}
              <span className="text-[hsl(var(--primary))]">khacademy.com</span>{" "}
              to purchase · Instant access after payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
