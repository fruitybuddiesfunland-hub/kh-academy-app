import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { PRODUCTS, PURCHASABLE_PRODUCTS, FREE_PRODUCTS } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  LogOut,
  KeyRound,
  CheckCircle2,
  ShoppingBag,
  Gift,
} from "lucide-react";
import { KHLogo } from "@/components/kh-logo";

type Purchase = {
  id: string;
  userId: string;
  productId: string;
  purchasedAt: string;
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) {
    navigate("/");
    return null;
  }

  const purchasedIds = new Set(purchases.map((p) => p.productId));
  const ownedProducts = PURCHASABLE_PRODUCTS.filter((id) => purchasedIds.has(id));
  const notOwned = PURCHASABLE_PRODUCTS.filter((id) => !purchasedIds.has(id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <KHLogo size="md" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              data-testid="btn-change-password"
              onClick={() => navigate("/change-password")}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Change password</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="btn-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Free courses */}
        {FREE_PRODUCTS.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-[hsl(var(--primary))]" />
              <h2 className="text-lg font-bold">Free Resources</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FREE_PRODUCTS.map((productId) => {
                const info = PRODUCTS[productId];
                if (!info) return null;
                return (
                  <div
                    key={productId}
                    className="bg-gradient-to-r from-[hsl(271,91%,65%)]/10 to-[hsl(330,81%,60%)]/10 border border-[hsl(271,91%,65%)]/20 rounded-xl overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-gradient-to-r from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] text-white text-[10px] border-0">
                          {info.badge || "FREE"}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold mb-1">{info.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{info.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {info.highlights.map((h) => (
                          <span key={h} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {h}
                          </span>
                        ))}
                      </div>
                      <Button
                        className="w-full gap-2"
                        onClick={() => navigate(info.coursePath)}
                      >
                        Start Free Course <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My Courses section */}
        <h1 className="text-2xl font-bold mb-1">My Courses</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your purchased courses and resources
        </p>

        {ownedProducts.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl mb-12">
            <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-1">No courses yet</h2>
            <p className="text-sm text-muted-foreground">
              Your purchased courses will appear here. Check your email for login details after purchase.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {ownedProducts.map((productId) => {
              const info = PRODUCTS[productId];
              if (!info) return null;
              return (
                <div
                  key={productId}
                  className="bg-card border border-border rounded-xl overflow-hidden group"
                  data-testid="dashboard-product-card"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={info.image}
                      alt={info.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-500/90 text-white text-[10px] border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        PURCHASED
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-0"
                      >
                        {info.label}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold mb-1">{info.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{info.subtitle}</p>
                    <Button
                      className="w-full gap-2"
                      data-testid="btn-access-course"
                      onClick={() => navigate(info.coursePath)}
                    >
                      Access Course <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upsell: Other products */}
        {notOwned.length > 0 && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold">Level Up Your AI Skills</h2>
                <Badge className="bg-gradient-to-r from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] text-white text-[10px] border-0">
                  NEW
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Continue your AI journey with these advanced toolkits
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {notOwned.map((productId) => {
                const info = PRODUCTS[productId];
                if (!info) return null;
                return (
                  <div
                    key={productId}
                    className="bg-card border border-border/50 rounded-xl overflow-hidden hover:border-border transition-colors"
                    data-testid={`upsell-card-${productId}`}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={info.image}
                        alt={info.title}
                        className="w-full h-36 object-cover opacity-90"
                      />
                      {info.badge && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-[hsl(var(--primary))]/90 text-white text-[10px] border-0">
                            {info.badge}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-bold mb-1">{info.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {info.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {info.highlights.map((h) => (
                          <span
                            key={h}
                            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {h}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold bg-gradient-to-r from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] bg-clip-text text-transparent">
                          {info.price}
                        </span>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          Learn More <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bundle CTA */}
            {notOwned.length >= 2 && (
              <div className="bg-gradient-to-r from-[hsl(271,91%,65%)]/10 to-[hsl(330,81%,60%)]/10 border border-[hsl(271,91%,65%)]/20 rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <img
                    src={PRODUCTS["ultimate-bundle"].image}
                    alt="Ultimate AI Bundle"
                    className="w-full md:w-48 h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <h3 className="text-lg font-bold">Ultimate AI Bundle</h3>
                      <Badge className="bg-gradient-to-r from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] text-white text-[10px] border-0">
                        SAVE 40%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get all 4 products for just $97 — save over $60 and unlock the complete
                      AI mastery path from beginner prompts to full business automation.
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] bg-clip-text text-transparent">
                        $97
                      </span>
                      <span className="text-sm text-muted-foreground line-through">$162</span>
                      <Button size="sm" className="ml-4 gap-1.5">
                        Get the Bundle <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
