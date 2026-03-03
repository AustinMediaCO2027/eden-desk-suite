import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAffiliate } from "@/hooks/useAffiliate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Ban, Users, DollarSign, Clock, TrendingUp } from "lucide-react";

const AdminAffiliatesPage = () => {
  const { isAdmin, loading: affiliateLoading } = useAffiliate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [activeAffiliates, setActiveAffiliates] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState({ total: 0, approved: 0, pending: 0, totalCommissions: 0, totalReferrals: 0 });

  const fetchAll = async () => {
    const { data: apps } = await supabase
      .from("affiliates").select("*").eq("status", "pending").order("created_at", { ascending: false });
    setApplications(apps || []);

    const { data: active } = await supabase
      .from("affiliates").select("*").eq("status", "approved").order("created_at", { ascending: false });
    setActiveAffiliates(active || []);

    const { data: pays } = await supabase
      .from("payouts").select("*, affiliates(full_name, email)").order("created_at", { ascending: false });
    setPayouts(pays || []);

    // Summary stats
    const { count: total } = await supabase.from("affiliates").select("*", { count: "exact", head: true });
    const { count: referralCount } = await supabase.from("referrals").select("*", { count: "exact", head: true });
    const { data: commData } = await supabase.from("commissions").select("amount");
    const totalComm = commData?.reduce((s: number, c: any) => s + (c.amount || 0), 0) || 0;

    setSummaryStats({
      total: total || 0,
      approved: active?.length || 0,
      pending: apps?.length || 0,
      totalCommissions: totalComm,
      totalReferrals: referralCount || 0,
    });
  };

  const safeUrl = (url: string | null) => url && url.startsWith("https://") ? url : undefined;

  useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin]);

  const approve = async (id: string) => {
    const { count } = await supabase
      .from("affiliates").select("*", { count: "exact", head: true });
    const code = `EDEN-AFF-${String((count || 0) + 1).padStart(4, "0")}`;

    await supabase.from("affiliates")
      .update({ status: "approved", affiliate_code: code } as any)
      .eq("id", id);
    toast({ title: `Approved with code ${code}` });
    fetchAll();
  };

  const reject = async (id: string) => {
    await supabase.from("affiliates").update({ status: "rejected" } as any).eq("id", id);
    toast({ title: "Application rejected" });
    fetchAll();
  };

  const suspend = async (id: string) => {
    await supabase.from("affiliates").update({ status: "suspended" } as any).eq("id", id);
    toast({ title: "Affiliate suspended" });
    fetchAll();
  };

  const markPaid = async (payout: any) => {
    await supabase.from("payouts")
      .update({ status: "paid", paid_date: new Date().toISOString() } as any)
      .eq("id", payout.id);

    await supabase.from("affiliates")
      .update({
        pending_balance: Math.max(0, (payout.affiliates?.pending_balance || payout.amount) - payout.amount),
        paid_earnings: (payout.affiliates?.paid_earnings || 0) + payout.amount,
      } as any)
      .eq("id", payout.affiliate_id);

    toast({ title: "Payout marked as paid" });
    fetchAll();
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin && !affiliateLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAdmin, affiliateLoading, navigate]);

  // Need to get loading from useAffiliate
  if (!isAdmin) {
    return null;
  }

  const overviewCards = [
    { label: "Total Affiliates", value: summaryStats.total, icon: Users },
    { label: "Approved", value: summaryStats.approved, icon: Check },
    { label: "Pending", value: summaryStats.pending, icon: Clock },
    { label: "Total Referrals", value: summaryStats.totalReferrals, icon: TrendingUp },
    { label: "Commissions Owed", value: `R${summaryStats.totalCommissions.toFixed(2)}`, icon: DollarSign },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Affiliate Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage affiliate applications, active affiliates, and payouts.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {overviewCards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4 border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-lg font-bold">{value}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeAffiliates.length})</TabsTrigger>
          <TabsTrigger value="payouts">Payouts ({payouts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-3 mt-4">
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No pending applications.</p>
          ) : applications.map(app => (
            <Card key={app.id} className="p-4 border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{app.full_name}</p>
                  <p className="text-xs text-muted-foreground">{app.email}</p>
                  <p className="text-xs text-muted-foreground">{app.country} • {app.website || "No website"}</p>
                  <p className="text-xs text-muted-foreground">Method: {app.promotion_method || "—"} • Audience: {app.audience_type || "—"}</p>
                   {(app.instagram_url || app.youtube_url || app.tiktok_url || app.linkedin_url) && (
                     <div className="flex gap-2 mt-1">
                       {safeUrl(app.instagram_url) && <a href={safeUrl(app.instagram_url)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-foreground">IG</a>}
                       {safeUrl(app.youtube_url) && <a href={safeUrl(app.youtube_url)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-foreground">YT</a>}
                       {safeUrl(app.tiktok_url) && <a href={safeUrl(app.tiktok_url)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-foreground">TT</a>}
                       {safeUrl(app.linkedin_url) && <a href={safeUrl(app.linkedin_url)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-foreground">LI</a>}
                     </div>
                  )}
                  {app.audience_size && <p className="text-[10px] text-muted-foreground">Audience: {app.audience_size}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => approve(app.id)} className="gap-1 h-8">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => reject(app.id)} className="gap-1 h-8">
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 mt-4">
          {activeAffiliates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No active affiliates.</p>
          ) : activeAffiliates.map(aff => (
            <Card key={aff.id} className="p-4 border-border">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{aff.full_name}</p>
                    <Badge variant="outline" className="text-[10px]">{aff.affiliate_code}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{aff.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Earnings: R{aff.total_earnings?.toFixed(2)} • Pending: R{aff.pending_balance?.toFixed(2)} • Paid: R{aff.paid_earnings?.toFixed(2)}
                  </p>
                   {(aff.instagram_url || aff.youtube_url || aff.tiktok_url || aff.linkedin_url) && (
                     <div className="flex gap-2">
                       {safeUrl(aff.instagram_url) && <a href={safeUrl(aff.instagram_url)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-foreground">IG</a>}
                       {safeUrl(aff.youtube_url) && <a href={safeUrl(aff.youtube_url)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-foreground">YT</a>}
                       {safeUrl(aff.tiktok_url) && <a href={safeUrl(aff.tiktok_url)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-foreground">TT</a>}
                       {safeUrl(aff.linkedin_url) && <a href={safeUrl(aff.linkedin_url)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-foreground">LI</a>}
                     </div>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => suspend(aff.id)} className="gap-1 h-8 text-destructive">
                  <Ban className="h-3.5 w-3.5" /> Suspend
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="payouts" className="space-y-3 mt-4">
          {payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No payout requests.</p>
          ) : payouts.map((p: any) => (
            <Card key={p.id} className="p-4 border-border">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{p.affiliates?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{p.affiliates?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Amount: R{p.amount?.toFixed(2)} • Requested: {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "paid" ? "default" : "outline"} className="text-[10px]">{p.status}</Badge>
                  {p.status !== "paid" && (
                    <Button size="sm" onClick={() => markPaid(p)} className="h-8 text-xs">Mark Paid</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAffiliatesPage;
