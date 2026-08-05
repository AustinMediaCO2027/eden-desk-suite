import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SignInPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
}

export const SignInPromptDialog = ({ open, onOpenChange, action = "continue" }: SignInPromptDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a free account to {action}</DialogTitle>
          <DialogDescription>
            Sign in or create your free Eden Desk account to save, download and send your documents.
            It only takes a few seconds.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep browsing
          </Button>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Log in
          </Button>
          <Button onClick={() => navigate("/auth?mode=signup")}>Sign up free</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Gate any action behind authentication. Guests get a sign-in prompt instead.
 */
export const useAuthGate = (action?: string) => {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const requireAuth = useCallback(
    (fn: () => void) => {
      if (!user && !loading) {
        setOpen(true);
        return;
      }
      fn();
    },
    [user, loading]
  );

  const gateDialog = <SignInPromptDialog open={open} onOpenChange={setOpen} action={action} />;

  return { isGuest: !user && !loading, requireAuth, gateDialog, promptSignIn: () => setOpen(true) };
};
