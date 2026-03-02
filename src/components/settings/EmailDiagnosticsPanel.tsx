import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";

interface DiagnosticsResult {
  sender: string;
  sender_source: string;
  sender_domain: string;
  api_key_configured: boolean;
  secret_misconfigured: boolean;
  secret_misconfigured_hint: string | null;
  domain_status: string;
  domain_message: string;
  last_send_error: string | null;
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "verified") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "not_found") return <XCircle className="h-4 w-4 text-destructive" />;
  return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
};

const EmailDiagnosticsPanel = () => {
  const [result, setResult] = useState<DiagnosticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("email-diagnostics", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      setResult(res.data as DiagnosticsResult);
    } catch (e: any) {
      setError(e.message || "Failed to run diagnostics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Email Diagnostics</h3>
        </div>
        <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          {loading ? "Checking…" : result ? "Re-check" : "Run Check"}
        </Button>
      </div>

      {!result && !error && (
        <p className="text-sm text-muted-foreground">Click "Run Check" to diagnose your email sending configuration.</p>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {/* Sender */}
          <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Sender</p>
            <p className="text-sm font-mono font-medium text-foreground">{result.sender}</p>
            <p className="text-xs text-muted-foreground">Source: {result.sender_source}</p>
          </div>

          {/* Secret misconfiguration warning */}
          {result.secret_misconfigured && (
            <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">{result.secret_misconfigured_hint}</p>
            </div>
          )}

          {/* API Key */}
          <div className="flex items-center gap-2 text-sm">
            {result.api_key_configured
              ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
            <span className={result.api_key_configured ? "text-foreground" : "text-destructive"}>
              Email API key {result.api_key_configured ? "is configured" : "is missing"}
            </span>
          </div>

          {/* Domain */}
          <div className="flex items-start gap-2 text-sm">
            <StatusIcon status={result.domain_status} />
            <span className="text-foreground">{result.domain_message}</span>
          </div>

          {/* Last Send Error */}
          {result.last_send_error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Test Error</p>
              <p className="text-sm text-destructive">{result.last_send_error}</p>
            </div>
          )}

          {!result.last_send_error && result.domain_status === "verified" && result.api_key_configured && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400">Everything looks good — emails should deliver successfully.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailDiagnosticsPanel;
