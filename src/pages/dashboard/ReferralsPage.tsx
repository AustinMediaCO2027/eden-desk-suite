import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAffiliate } from "@/hooks/useAffiliate";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, Users, DollarSign, TrendingUp, MousePointer,
  CreditCard, Wallet, ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ReferralsPage = () => {
  const { user } = useAuth();
  const { affiliate, loading, updatePayoutSettings, requestPayout, fetchAffiliate } = useAffiliate();
  const { toast } = useToast();
  const [clickCount, setClickCount] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [payoutForm, setPayoutForm] = useState({
    paypal_email: "", bank_name: "", bank_account_holder: "",
    bank_account_number: "", bank_branch_code: "", bank_country: "South Africa",
  });

  const refCode = affiliate?.affiliate_code || (user?.id?.slice(0, 8).toUpperCase() || "");
  const refLink = `https://eden-desk.com/?ref=${refCode}`;

  useEffect(() => {
    if (!affiliate) return;
    const load = async () => {
      const { count: clicks } = await supabase
        .from("affiliate_clicks" as any).select("*", { count: "exact", head: true })
        .eq("affiliate_id", affiliate.id);
      setClickCount(clicks || 0);

      const { data: refs } = await supabase
        .from("referrals" as any).select("*").eq("affiliate_id", affiliate.id);
      setReferralCount(refs?.length || 0);
      setActiveCount(refs?.filter((r: any) => r.is_active)?.length || 0);

      const { data: comms } = await supabase
        .from("commissions" as any).select("*").eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false }).limit(20);
      setCommissions(comms || []);

      setPaymentMethod(affiliate.payment_method || "paypal");
      setPayoutForm({
        paypal_email: affiliate.paypal_email || "",
        bank_name: affiliate.bank_name || "",
        bank_account_holder: affiliate.bank_account_holder || "",
        bank_account_number: affiliate.bank_account_number || "",
        bank_branch_code: affiliate.bank_branch_code || "",
        bank_country: affiliate.bank_country || "South Africa",
      });
    };
    load();
  }, [affiliate]);

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
    toast({ title: "Referral link copied!" });
  };

  const handleSavePayout = async () => {
    await updatePayoutSettings({ payment_method: paymentMethod, ...payoutForm });
    toast({ title: "Payout settings saved" });
  };

  const handleRequestPayout = async () => {
    const result = await requestPayout(affiliate?.pending_balance || 0);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Payout requested successfully" });
      fetchAffiliate();
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>;

  const isApproved = affiliate?.status === "approved";

  const stats = isApproved ? [
    { label: "Total Clicks", value: clickCount, icon: MousePointer },
    { label: "Signups", value: referralCount, icon: Users },
    { label: "Active Subscribers", value: activeCount, icon: TrendingUp },
    { label: "Monthly Earnings", value: `R${(affiliate?.total_earnings || 0).toFixed(2)}`, icon: DollarSign },
    { label: "Pending Payout", value: `R${(affiliate?.pending_balance || 0).toFixed(2)}`, icon: Wallet },
    { label: "Paid Earnings", value: `R${(affiliate?.paid_earnings || 0).toFixed(2)}`, icon: CreditCard },
  ] : [
    { label: "Total Referrals", value: 0, icon: Users },
    { label: "Active Subscribers", value: 0, icon: TrendingUp },
    { label: "Monthly Commission", value: "R0.00", icon: DollarSign },
    { label: "Lifetime Earnings", value: "R0.00", icon: Wallet },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Referrals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share your link and earn recurring commissions on every paying subscriber you refer.
        </p>
      </div>

      {/* Referral Link */}
      <Card className="p-5 border-border bg-card">
        <Label className="text-xs font-medium text-muted-foreground mb-2 block">Your Referral Link</Label>
        <div className="flex gap-2">
          <Input value={refLink} readOnly className="text-sm bg-muted/50 font-mono" />
          <Button size="sm" onClick={copyLink} className="shrink-0 gap-1.5">
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
        </div>
        {!isApproved && affiliate?.status !== "pending" && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground">
              Want higher-tier benefits?{" "}
              <Link to="/affiliate" className="text-foreground font-medium hover:underline inline-flex items-center gap-1">
                Apply as an official affiliate <ExternalLink className="h-3 w-3" />
              </Link>
            </p>
          </div>
        )}
        {affiliate?.status === "pending" && (
          <Badge variant="outline" className="mt-3 text-xs">Application pending review</Badge>
        )}
      </Card>

      {/* Stats */}
      <div className={`grid gap-3 ${isApproved ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2"}`}>
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4 border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-lg font-bold">{value}</p>
          </Card>
        ))}
      </div>

      {/* Commission History (approved only) */}
      {isApproved && (
        <Card className="border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Commission History</h2>
          </div>
          {commissions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No commissions yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {commissions.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-xs font-medium">{c.plan} plan</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={c.status === "paid" ? "default" : "outline"} className="text-[10px]">
                      {c.status}
                    </Badge>
                    <span className="text-sm font-semibold">R{c.amount?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Payout Settings (approved only) */}
      {isApproved && (
        <Card className="p-5 border-border bg-card space-y-4">
          <h2 className="text-sm font-semibold">Payout Settings</h2>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="bank">Bank Transfer (EFT)</SelectItem>
            </SelectContent>
          </Select>

          {paymentMethod === "paypal" ? (
            <div>
              <Label className="text-xs">PayPal Email</Label>
              <Input value={payoutForm.paypal_email} onChange={e => setPayoutForm(p => ({ ...p, paypal_email: e.target.value }))} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "bank_name", label: "Bank Name" },
                { key: "bank_account_holder", label: "Account Holder" },
                { key: "bank_account_number", label: "Account Number" },
                { key: "bank_branch_code", label: "Branch Code" },
                { key: "bank_country", label: "Country" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label className="text-xs">{label}</Label>
                  <Input
                    value={(payoutForm as any)[key]}
                    onChange={e => setPayoutForm(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSavePayout}>Save Settings</Button>
            <Button
              size="sm" variant="outline"
              onClick={handleRequestPayout}
              disabled={(affiliate?.pending_balance || 0) < 500}
            >
              Request Payout (min R500)
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReferralsPage;
