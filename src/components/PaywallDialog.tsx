import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { submitPayFastForm } from "@/lib/payfast";

interface PaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  "Unlimited invoices, quotes & letterheads",
  "AI drafting assistant",
  "PDF download & email sending",
  "Task management",
];

const PaywallDialog = ({ open, onOpenChange }: PaywallDialogProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);

  const trialUsed = (profile as any)?.trial_used === true;

  const handleStartTrial = async () => {
    if (!user || trialUsed) return;
    setActivating(true);
    try {
      const { data, error } = await supabase.functions.invoke("payfast-checkout", {
        body: {
          planName: "Trial",
          planId: "trial",
          amount: "0.00",
          period: "7 days",
          userEmail: user.email,
          userId: user.id,
          companyName: profile?.company_name,
          isTrial: true,
          returnUrl: `${window.location.origin}/dashboard?payment=success&plan=trial`,
          cancelUrl: `${window.location.origin}/dashboard/billing?status=cancelled`,
        },
      });

      if (error) throw error;

      // Redirect to PayFast
      submitPayFastForm(data.paymentUrl, data.params as Record<string, string>);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActivating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border p-0 overflow-hidden max-w-md">
        <div className="h-1 w-full bg-gradient-to-r from-foreground/20 via-foreground to-foreground/20" />
        <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Free Access Used</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            You've used your free access for this feature.
            {!trialUsed
              ? " Start your 7-day trial or subscribe to continue."
              : " Subscribe to a plan to continue creating documents."}
          </p>
          <div className="w-full mt-6 space-y-2.5">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="h-5 w-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-foreground" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {!trialUsed && (
            <Button
              className="w-full mt-6 h-11 text-sm font-medium gap-2"
              onClick={handleStartTrial}
              disabled={activating}
            >
              <Sparkles className="h-4 w-4" />
              {activating ? "Redirecting to PayFast..." : "Start 7-Day Free Trial"}
            </Button>
          )}

          <Link to="/dashboard/billing" className="w-full">
            <Button
              variant={trialUsed ? "default" : "outline"}
              className="w-full mt-2 h-11 text-sm font-medium gap-2"
            >
              View Plans & Subscribe
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <button
            onClick={() => onOpenChange(false)}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallDialog;
