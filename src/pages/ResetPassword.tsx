import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check hash for type=recovery (in case event already fired)
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your password has been reset successfully." });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-[380px] space-y-6 text-center">
          <Link to="/">
            <img
              alt="Eden Desk"
              className="h-14 mx-auto"
              src="/lovable-uploads/3206295e-c9e5-4ce4-88bf-4d1a6264de00.png"
            />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Invalid or Expired Link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is no longer valid. Please request a new one.
          </p>
          <Link to="/auth">
            <Button className="w-full">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[380px] space-y-8">
        <div className="flex justify-center">
          <Link to="/">
            <img
              alt="Eden Desk"
              className="h-14"
              src="/lovable-uploads/3206295e-c9e5-4ce4-88bf-4d1a6264de00.png"
            />
          </Link>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-center text-foreground">
          Set New Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 bg-[hsl(0,0%,96%)] dark:bg-muted/50 border-0 rounded-lg text-sm pr-10 placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-sm font-medium text-foreground">
              Confirm Password
            </Label>
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 bg-[hsl(0,0%,96%)] dark:bg-muted/50 border-0 rounded-lg text-sm placeholder:text-muted-foreground/60"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-lg bg-[hsl(210,100%,50%)] hover:bg-[hsl(210,100%,45%)] text-white"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Need help?{" "}
          <a href="mailto:support@edendesk.com" className="hover:underline">
            support@edendesk.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
