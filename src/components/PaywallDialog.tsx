import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
            You've reached the free usage limit for this feature. Choose a paid plan to continue.
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

          <Link to="/dashboard/billing" className="w-full">
            <Button
              className="w-full mt-6 h-11 text-sm font-medium gap-2"
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
