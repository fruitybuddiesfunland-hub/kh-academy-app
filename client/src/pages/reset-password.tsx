import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { KHLogo } from "@/components/kh-logo";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [, navigate] = useLocation();

  // Extract token from URL path: /#/reset-password/TOKEN
  // Also check query string as fallback: /#/reset-password?token=TOKEN
  const routeParams = useParams<{ token?: string }>();
  const hashSearch = window.location.hash.split("?")[1] || "";
  const queryParams = new URLSearchParams(hashSearch);
  const token = routeParams.token || queryParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/reset-password", { token, newPassword });
      setSuccess(true);
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

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6">
            <KHLogo />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invalid reset link</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(271,91%,65%)] hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mb-6">
            <KHLogo />
          </div>

          {success ? (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold">Password reset</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Your password has been updated. You can now sign in.
              </p>
              <Button
                className="mt-6"
                onClick={() => navigate("/")}
              >
                Go to sign in
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Set new password</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your new password below
              </p>
            </>
          )}
        </div>

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        )}

        {!success && (
          <div className="text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
