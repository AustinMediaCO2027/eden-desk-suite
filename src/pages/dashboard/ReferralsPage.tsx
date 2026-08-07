import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAffiliate } from "@/hooks/useAffiliate";
import { useCurrency } from "@/hooks/useCurrency";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, Users, DollarSign, TrendingUp, MousePointer,
  CreditCard, Wallet, ExternalLink, Instagram, Youtube, Linkedin
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ReferralsPage = () => {
  const { user } = useAuth();
  const { affiliate, loading, updatePayoutSettings, requestPayout, fetchAffiliate } = useAffiliate();
  const { convert } = useCurrency();
  const { toast } = useToast();
  const [clickCount, setClickCount] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [payoutForm, setPayoutForm] = useState({
    paypal_email: "", bank_name: "", bank_account_holder: "",
    bank_account_number: "", bank_branch_code: "", bank_country: "South Africa",
  });
  const [socialForm, setSocialForm] = useState({
    instagram_url: "", youtube_url: "", tiktok_url: "", linkedin_url: "", audience_size: "",
  });

  const refCode = affiliate?.affiliate_code || (user?.id?.slice(0, 8).toUpperCase() || "");
  const refLink = `https://eden-desk.com/?ref=${refCode}`;

  useEffect(() => {
    if (!affiliate) return;
    const load = async () => {
      const { count: clicks } = await supabase
        .from("affiliate_clicks").select("*", { count: "exact", head: true })
        .eq("affiliate_id", affiliate.id);
      setClickCount(clicks || 0);

      const { data: refs } = await supabase
        .from("referrals").select("*").eq("affiliate_id", affiliate.id);
      setReferralCount(refs?.length || 0);
      setActiveCount(refs?.filter((r: any) => r.is_active)?.length || 0);
      setReferrals(refs || []);

      const { data: comms } = await supabase
        .from("commissions").select("*").eq("affiliate_id", affiliate.id)
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
      setSocialForm({
        instagram_url: (affiliate as any).instagram_url || "",
        youtube_url: (affiliate as any).youtube_url || "",
        tiktok_url: (affiliate as any).tiktok_url || "",
        linkedin_url: (affiliate as any).linkedin_url || "",
        audience_size: (affiliate as any).audience_size || "",
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

  const handleSaveSocial = async () => {
    if (!affiliate) return;
    await supabase.from("affiliates").update(socialForm as any).eq("id", affiliate.id);
    toast({ title: "Social profiles saved" });
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
    { label: "Total Earnings", value: convert(affiliate?.total_earnings || 0), icon: DollarSign },
    { label: "Pending Payout", value: convert(affiliate?.pending_balance || 0), icon: Wallet },
    { label: "Paid Earnings", value: convert(affiliate?.paid_earnings || 0), icon: CreditCard },
  ] : [
    { label: "Total Referrals", value: 0, icon: Users },
    { label: "Active Subscribers", value: 0, icon: TrendingUp },
    { label: "Monthly Commission", value: convert(0), icon: DollarSign },
    { label: "Lifetime Earnings", value: convert(0), icon: Wallet },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Referrals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Earn 25% on Silver and 30% on Premium for the first 3 billing cycles per subscriber.
          </p>
        </div>
        {isApproved && (
          <Badge className="bg-foreground text-background text-[10px]">Approved Affiliate</Badge>
        )}
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

      {/* Referred Subscribers (approved only) */}
      {isApproved && referrals.length > 0 && (
        <Card className="border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Referred Subscribers</h2>
          </div>
          <div className="divide-y divide-border">
            {referrals.map((r: any) => {
              const commsPaid = r.commissions_paid || 0;
              const remaining = Math.max(0, 3 - commsPaid);
              const expiryDate = r.commission_expiry_date ? new Date(r.commission_expiry_date) : null;
              const isExpired = expiryDate ? expiryDate < new Date() : false;
              return (
                <div key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium">
                      {r.subscription_plan || "Free"} plan
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Signed up {new Date(r.created_at).toLocaleDateString()}
                      {r.subscription_start_date && ` • Started ${new Date(r.subscription_start_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={r.is_active ? "default" : "outline"} className="text-[10px]">
                      {r.is_active ? "Active" : "Cancelled"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {isExpired || commsPaid >= 3 ? "Complete (3/3)" : `${commsPaid}/3 months paid`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

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
                    <span className="text-sm font-semibold">{convert(c.amount || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Social Media Profiles (approved only) */}
      {isApproved && (
        <Card className="p-5 border-border bg-card space-y-4">
          <h2 className="text-sm font-semibold">Social Media Profiles</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Instagram URL</Label>
              <Input value={socialForm.instagram_url} onChange={e => setSocialForm(p => ({ ...p, instagram_url: e.target.value }))} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <Label className="text-xs">YouTube Channel</Label>
              <Input value={socialForm.youtube_url} onChange={e => setSocialForm(p => ({ ...p, youtube_url: e.target.value }))} placeholder="https://youtube.com/..." />
            </div>
            <div>
              <Label className="text-xs">TikTok Profile</Label>
              <Input value={socialForm.tiktok_url} onChange={e => setSocialForm(p => ({ ...p, tiktok_url: e.target.value }))} placeholder="https://tiktok.com/@..." />
            </div>
            <div>
              <Label className="text-xs">LinkedIn Profile</Label>
              <Input value={socialForm.linkedin_url} onChange={e => setSocialForm(p => ({ ...p, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <Label className="text-xs">Audience Size</Label>
              <Input value={socialForm.audience_size} onChange={e => setSocialForm(p => ({ ...p, audience_size: e.target.value }))} placeholder="e.g. 10k followers" />
            </div>
          </div>
          <Button size="sm" onClick={handleSaveSocial}>Save Social Profiles</Button>
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
              {`Request Payout (min ${convert(500)})`}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReferralsPage;
