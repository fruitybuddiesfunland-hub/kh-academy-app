import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { KHLogo } from "@/components/kh-logo";
import {
  Users,
  ShoppingCart,
  BarChart3,
  Plus,
  Trash2,
  LogOut,
  Package,
  Shield,
} from "lucide-react";

const PRODUCT_NAMES: Record<string, string> = {
  "quick-start": "AI Quick Start",
  "starter-kit": "AI Starter Kit",
  "skills-builder": "AI Skills Builder",
  "small-business": "AI for Small Business",
  "automation-mastery": "AI Automation Mastery",
  "ultimate-bundle": "Ultimate AI Bundle",
};

const PRODUCT_PRICES: Record<string, string> = {
  "quick-start": "Free",
  "starter-kit": "$29",
  "skills-builder": "$39",
  "small-business": "$59",
  "automation-mastery": "$79",
  "ultimate-bundle": "$119",
};

const GRANTABLE_PRODUCTS = [
  "quick-start",
  "starter-kit",
  "skills-builder",
  "small-business",
  "automation-mastery",
  "ultimate-bundle",
];

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  purchases: string[];
};

type Stats = {
  totalUsers: number;
  totalPurchases: number;
  productCounts: Record<string, number>;
};

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // New user form
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newProducts, setNewProducts] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Grant product dialog
  const [grantUserId, setGrantUserId] = useState<string | null>(null);
  const [grantProductId, setGrantProductId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        apiRequest("GET", "/api/admin/stats"),
        apiRequest("GET", "/api/admin/users"),
      ]);
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
    } catch (err: any) {
      if (err.message?.includes("403") || err.message?.includes("401")) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate, fetchData]);

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) return;
    try {
      await apiRequest("POST", "/api/admin/users", {
        email: newEmail,
        password: newPassword,
        name: newName || null,
        products: newProducts,
      });
      toast({ title: "User created", description: `${newEmail} has been provisioned.` });
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewProducts([]);
      setCreateDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create user", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Delete user ${email}? This will also remove all their purchases.`)) return;
    try {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
      toast({ title: "User deleted", description: `${email} has been removed.` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete user", variant: "destructive" });
    }
  };

  const handleGrantProduct = async (userId: string) => {
    if (!grantProductId) return;
    try {
      await apiRequest("POST", `/api/admin/users/${userId}/purchases`, {
        productId: grantProductId,
      });
      toast({ title: "Access granted", description: `Product access has been added.` });
      setGrantUserId(null);
      setGrantProductId("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to grant access", variant: "destructive" });
    }
  };

  if (!user?.isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  const nonAdminUsers = users.filter((u) => !u.isAdmin);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KHLogo size="sm" />
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm">Admin Panel</h1>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-xs">
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="purchases" className="gap-1.5">
              <ShoppingCart className="w-4 h-4" />
              Purchases
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalUsers ?? 0}</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Total Purchases</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalPurchases ?? 0}</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Products Sold</span>
                </div>
                <p className="text-3xl font-bold">
                  {Object.keys(stats?.productCounts ?? {}).length}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-4">Product Breakdown</h3>
              <div className="space-y-3">
                {GRANTABLE_PRODUCTS.map((pid) => {
                  const count = stats?.productCounts[pid] || 0;
                  const maxCount = Math.max(
                    ...Object.values(stats?.productCounts ?? { _: 1 }),
                    1
                  );
                  return (
                    <div key={pid} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-40 shrink-0 truncate">
                        {PRODUCT_NAMES[pid]}
                      </span>
                      <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">
                Users ({nonAdminUsers.length})
              </h2>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="text"
                        placeholder="Temporary password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Name (optional)</Label>
                      <Input
                        placeholder="Full name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grant Products</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {GRANTABLE_PRODUCTS.map((pid) => (
                          <label key={pid} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={newProducts.includes(pid)}
                              onCheckedChange={(checked) => {
                                setNewProducts((prev) =>
                                  checked
                                    ? [...prev, pid]
                                    : prev.filter((p) => p !== pid)
                                );
                              }}
                            />
                            {PRODUCT_NAMES[pid]}
                            <span className="text-muted-foreground text-xs">
                              ({PRODUCT_PRICES[pid]})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleCreateUser} className="w-full">
                      Create User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        User
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        Products
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        Joined
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonAdminUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          No users yet. Create one to get started.
                        </td>
                      </tr>
                    ) : (
                      nonAdminUsers.map((u) => (
                        <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-sm">{u.email}</p>
                              {u.name && (
                                <p className="text-xs text-muted-foreground">{u.name}</p>
                              )}
                              {u.mustChangePassword && (
                                <Badge variant="outline" className="text-[10px] mt-1">
                                  Must change password
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {u.purchases.length === 0 ? (
                                <span className="text-xs text-muted-foreground">None</span>
                              ) : (
                                u.purchases.map((pid) => (
                                  <Badge key={pid} variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {PRODUCT_NAMES[pid] || pid}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Dialog
                                open={grantUserId === u.id}
                                onOpenChange={(open) => {
                                  setGrantUserId(open ? u.id : null);
                                  if (!open) setGrantProductId("");
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                                    <Plus className="w-3.5 h-3.5" />
                                    Grant
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Grant Product Access</DialogTitle>
                                  </DialogHeader>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Grant access to <strong>{u.email}</strong>
                                  </p>
                                  <div className="space-y-2">
                                    {GRANTABLE_PRODUCTS.filter(
                                      (pid) => !u.purchases.includes(pid)
                                    ).map((pid) => (
                                      <label
                                        key={pid}
                                        className={`flex items-center gap-2 text-sm p-2 rounded-lg cursor-pointer border transition-colors ${
                                          grantProductId === pid
                                            ? "border-primary bg-primary/5"
                                            : "border-border/50 hover:bg-muted/30"
                                        }`}
                                        onClick={() => setGrantProductId(pid)}
                                      >
                                        <input
                                          type="radio"
                                          name="grantProduct"
                                          checked={grantProductId === pid}
                                          onChange={() => setGrantProductId(pid)}
                                          className="sr-only"
                                        />
                                        <span className="flex-1">{PRODUCT_NAMES[pid]}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {PRODUCT_PRICES[pid]}
                                        </span>
                                      </label>
                                    ))}
                                    {GRANTABLE_PRODUCTS.filter(
                                      (pid) => !u.purchases.includes(pid)
                                    ).length === 0 && (
                                      <p className="text-sm text-muted-foreground py-2">
                                        This user already has all products.
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    onClick={() => handleGrantProduct(u.id)}
                                    disabled={!grantProductId}
                                    className="w-full mt-2"
                                  >
                                    Grant Access
                                  </Button>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-destructive hover:text-destructive gap-1"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases">
            <h2 className="font-semibold mb-4">
              All Purchases ({stats?.totalPurchases ?? 0})
            </h2>
            <PurchasesTable onRefresh={fetchData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PurchasesTable({ onRefresh }: { onRefresh: () => void }) {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    apiRequest("GET", "/api/admin/purchases")
      .then((res) => res.json())
      .then(setPurchases)
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = async (id: string, email: string, product: string) => {
    if (!confirm(`Revoke ${PRODUCT_NAMES[product] || product} access from ${email}?`)) return;
    try {
      await apiRequest("DELETE", `/api/admin/purchases/${id}`);
      setPurchases((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Access revoked" });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                User
              </th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Product
              </th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Date
              </th>
              <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No purchases yet.
                </td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="text-sm">{p.userEmail}</p>
                    {p.userName && (
                      <p className="text-xs text-muted-foreground">{p.userName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">
                      {PRODUCT_NAMES[p.productId] || p.productId}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(p.purchasedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive gap-1"
                      onClick={() => handleRevoke(p.id, p.userEmail, p.productId)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
