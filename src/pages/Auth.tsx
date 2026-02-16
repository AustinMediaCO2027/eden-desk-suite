import { useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import logoFull from "@/assets/eden_desk_logo_full.png";
import authBg from "@/assets/auth-bg.jpg";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isSignUp = searchParams.get("mode") === "signup";
  const redirectTarget = searchParams.get("redirect");
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(isSignUp ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (user) {
    const dest = redirectTarget === "trial" ? "/dashboard/billing" : "/dashboard";
    return <Navigate to={dest} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "Password reset link sent." });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "Confirm your account to get started." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (result?.error) {
      toast({ title: "Error", description: String(result.error), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-background">
      {/* Left: Full-bleed image panel */}
      <div className="hidden lg:block lg:w-[55%] relative rounded-r-[2rem] overflow-hidden">
        <img src={authBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Right: Form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[380px] space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Link to="/">
              <img
                alt="Eden Desk"
                className="h-14 dark:invert"
                src="/lovable-uploads/e5b36e1a-b25d-4ded-b52c-669db38a1b31.png"
              />
            </Link>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold tracking-tight text-center text-foreground">
            {mode === "forgot" ? "Reset password" : "Join Over 17 000 Businesses"}
          </h1>

          {/* Login / Signup form */}
          {mode !== "forgot" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  {mode === "login" ? "Login" : "Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email or phone number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-[hsl(0,0%,96%)] dark:bg-muted/50 border-0 rounded-lg text-sm placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
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

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch id="remember" />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-sm text-[hsl(210,100%,50%)] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-lg bg-[hsl(210,100%,50%)] hover:bg-[hsl(210,100%,45%)] text-white"
                disabled={loading}
              >
                {loading ? "Please wait..." : mode === "signup" ? "Sign up" : "Sign in"}
              </Button>
            </form>
          )}

          {/* Forgot password form */}
          {mode === "forgot" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-[hsl(0,0%,96%)] dark:bg-muted/50 border-0 rounded-lg text-sm"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-lg bg-[hsl(210,100%,50%)] hover:bg-[hsl(210,100%,45%)] text-white"
                disabled={loading}
              >
                {loading ? "Please wait..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          {/* Google sign-in */}
          {mode !== "forgot" && (
            <Button
              variant="outline"
              className="w-full h-12 gap-3 bg-[hsl(0,0%,20%)] hover:bg-[hsl(0,0%,25%)] border-0 text-white rounded-lg text-sm font-medium"
              onClick={handleGoogleLogin}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Or sign in with Google
            </Button>
          )}

          {/* Toggle mode */}
          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" && (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-[hsl(210,100%,50%)] font-medium hover:underline"
                >
                  Sign up now
                </button>
              </p>
            )}
            {mode === "signup" && (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-[hsl(210,100%,50%)] font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("login")} className="text-[hsl(210,100%,50%)] font-medium hover:underline">
                Back to sign in
              </button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Need help?{" "}
            <a href="mailto:support@edendesk.com" className="hover:underline">
              support@edendesk.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
