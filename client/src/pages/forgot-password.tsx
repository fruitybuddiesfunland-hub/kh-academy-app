import { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("POST", "/api/forgot-password", { email });
      setSent(true);
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(271,91%,65%)] to-[hsl(330,81%,60%)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">KH Academy</span>
          </div>

          {sent ? (
            <>
              <div className="w-12 h-12 rounded-full bg-[hsl(271,91%,65%)]/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-[hsl(271,91%,65%)]" />
              </div>
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                If an account exists for <span className="font-medium text-foreground">{email}</span>, we've sent a password reset link. It expires in 1 hour.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Don't see it? Check your spam folder.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Reset your password</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email and we'll send you a reset link
              </p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
