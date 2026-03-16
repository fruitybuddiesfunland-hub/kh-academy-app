import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KHLogo } from "@/components/kh-logo";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, changePassword } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Not logged in — redirect to login
  if (!user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      navigate("/dashboard");
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
          <div className="mb-6">
            <KHLogo />
          </div>
          <h1 className="text-2xl font-bold" data-testid="change-pw-title">
            Change your password
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Please set a new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="change-pw-form">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <PasswordInput
              id="currentPassword"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              data-testid="input-current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput
              id="newPassword"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              data-testid="input-new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              data-testid="input-confirm-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" data-testid="change-pw-error">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading} data-testid="btn-update-password">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground"
            data-testid="link-skip"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
